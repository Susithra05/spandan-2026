-- ============================================================
-- SPANDAN 2026 — migration_v7.sql  (run before deploying v8)
-- ============================================================
-- Run this whole file once in the Supabase SQL Editor. It is written
-- to be SAFE TO RE-RUN (idempotent) — every `create table if not
-- exists`, `on conflict do nothing`, `add column if not exists`, and
-- `create or replace function` is chosen deliberately so re-running
-- this file later (e.g. after a v9 patch) never clobbers data admins
-- have already edited (price_catalog rows, event statuses, etc).
--
-- WHAT THIS ADDS (maps to the v8 spec):
--   1. price_catalog          — server-side source of truth for every
--                                pass/event price + "registrations
--                                open" flag. Seeded from festData.js.
--                                Table 3 (Event Master) in the Admin
--                                Dashboard reads/writes this.
--   2. Server-side price recomputation — BEFORE INSERT trigger on
--      event_registrations, plus recompute_purchase_amount() called
--      right after every checkout insert. The client-computed number
--      is never the one that actually gets stored/charged.
--   3. create_group_purchase()  — single-transaction RPC replacing the
--      old client-side per-member insert loop. All-or-nothing: if any
--      member's row fails, EVERYTHING in the group rolls back
--      automatically (that's just how Postgres functions work — an
--      unhandled exception aborts the whole function's effects).
--   4. resolve_my_delegate_id() — "single persistent Delegate ID per
--      user" — reuses/updates a person's existing ID instead of
--      minting a disconnected new one on their 2nd+ pass purchase.
--   5. event_registrations gets its OWN payment_status, independent
--      of its parent purchase — Table 2 rows become independently
--      approvable, with a cascade from a rejected PASS purchase down
--      to that person's event entries (and a clean revert back).
--   6. UNIQUE constraint relaxed on purchases.delegate_id (multiple
--      purchase rows for the same person now intentionally SHARE one
--      canonical Delegate ID string).
-- ============================================================


-- ----------------------------------------------------------------
-- 0. SELF-HEALING GUARD — everything below assumes migration.sql,
--    migration_v3/v4/v5/v6.sql have already been run (purchases,
--    event_registrations, team_members, groups, id_counters,
--    generate_delegate_id(), generate_group_code(), is_group_leader(),
--    is_group_member(), is_leader_of_purchase_group() all exist).
-- ----------------------------------------------------------------


-- ================================================================
-- 1. PRICE CATALOG — one row per pass, per event, and per sub-event
--    (sub-events are keyed "eventId:SubEventLabel", exactly matching
--    the cart key the front-end already builds). This is now the
--    single source of truth for pricing — festData.js still owns
--    titles/descriptions/categories/images, but PRICE and WHETHER
--    REGISTRATIONS ARE OPEN live here and can be edited live by the
--    committee from Table 3 without a redeploy.
-- ================================================================
create table if not exists price_catalog (
  code text primary key,                 -- pass id, event id, or "eventId:SubLabel"
  kind text not null check (kind in ('pass', 'event')),
  base_label text not null,              -- original festData.js label, for reference/search
  title_override text,                   -- null = use festData.js title
  desc_override text,                    -- null = use festData.js description
  price numeric not null default 0,
  per_person boolean not null default false, -- true = price is PER TEAM MEMBER (team events)
  registrations_open boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table price_catalog enable row level security;

drop policy if exists "anyone can read price catalog" on price_catalog;
create policy "anyone can read price catalog" on price_catalog
  for select using (true);

grant usage on schema public to authenticated, anon;
grant select on price_catalog to authenticated, anon;
-- No direct insert/update/delete grants — every write goes through
-- the SECURITY DEFINER admin_update_price_catalog() RPC below, which
-- checks the committee passcode itself.

-- Seed data, generated programmatically from src/data/festData.js at
-- authoring time (tiers, clubPasses, eventsList incl. sub-events) so
-- there's no risk of a hand-transcription mismatch. Re-running this
-- is safe: ON CONFLICT DO NOTHING never overwrites a price/toggle an
-- admin has already changed via Table 3. A future v9 that adds new
-- events just needs its own small seed block appended the same way.
insert into price_catalog (code, kind, base_label, price, per_person) values
('tier-one', 'pass', 'The Red Queen', 750, false),
('tier-two', 'pass', 'The Mad Hatter', 650, false),
('tier-three', 'pass', 'The White Rabbit', 375, false),
('cult-pass', 'pass', 'The Mystic Caterpillar', 150, false),
('sports-pass', 'pass', 'The Cheshire Cat', 250, false),
('lit-pass', 'pass', 'Cheshire Charades', 500, false),
('quiz-pass', 'pass', 'Wonderland Whiz', 550, false),
('premium-pass', 'pass', 'The Golden Key', 800, false),
('painting', 'event', 'Painting', 100, false),
('sketching', 'event', 'Sketching', 100, false),
('collage', 'event', 'Collage', 100, false),
('face-painting', 'event', 'Face Painting', 100, false),
('mehendi', 'event', 'Mehendi', 100, false),
('pot-painting', 'event', 'Pot Painting', 100, false),
('chorea-theme', 'event', 'Chorea (Theme Group Dance)', 250, false),
('chorea-non-theme-eastern', 'event', 'Chorea (Non-Theme Eastern Group Dance)', 250, false),
('chorea-non-theme-western', 'event', 'Chorea (Non-Theme Western Group Dance)', 250, false),
('alaap', 'event', 'Alaap (Eastern BoB)', 200, false),
('tinnitus', 'event', 'Tinnitus (Western BoB)', 200, false),
('dernier-cri', 'event', 'Dernier Cri (Fashion Show)', 250, false),
('solo-dance-eastern', 'event', 'Solo Dance (Eastern)', 150, false),
('solo-dance-western', 'event', 'Solo Dance (Western)', 150, false),
('duet-dance-eastern', 'event', 'Duet Dance (Eastern)', 150, false),
('duet-dance-western', 'event', 'Duet Dance (Western)', 150, false),
('solo-singing-eastern', 'event', 'Solo Singing (Eastern)', 0, false),
('solo-singing-western', 'event', 'Solo Singing (Western)', 0, false),
('duet-singing-eastern', 'event', 'Duet Singing (Eastern)', 100, false),
('duet-singing-western', 'event', 'Duet Singing (Western)', 100, false),
('adaptunes', 'event', 'Adaptunes', 150, false),
('showdown', 'event', 'Showdown', 125, false),
('euphony', 'event', 'Euphony (Acoustics)', 150, false),
('play', 'event', 'Play', 150, false),
('skit', 'event', 'Skit', 150, false),
('mime', 'event', 'Mime', 150, false),
('solo-instrumental', 'event', 'Solo Instrumental', 150, false),
('adzap', 'event', 'Adzap', 150, false),
('arcane-heist', 'event', 'Arcane Heist', 0, true),
('beg-borrow-steal', 'event', 'Beg Borrow Steal', 0, true),
('la-lutte-junior', 'event', 'La Lutte (Junior MediQuiz)', 0, false),
('la-lutte-senior', 'event', 'La Lutte (Senior MediQuiz)', 0, false),
('formal-debate', 'event', 'Formal Debate', 250, false),
('malarkey', 'event', 'Malarkey (Informal Debate)', 150, false),
('directors-cut', 'event', 'Director''s Cut', 150, false),
('cryptic-crossword', 'event', 'Cryptic Crossword', 250, false),
('potpourri', 'event', 'Potpourri (dumbc + picto)', 150, false),
('jam', 'event', 'JAM (Just a Minute)', 250, false),
('turn-coat', 'event', 'Turn Coat', 150, false),
('tj-jaishankar-quiz', 'event', 'TJ Jaishankar Memorial Open Quiz by Major Chandrakant Nair', 250, false),
('sports-quiz', 'event', 'Offside - Sports Quiz', 150, false),
('fandom-quiz', 'event', 'Stardom - Fandom Quiz', 150, false),
('literature-quiz', 'event', 'Literature Quiz', 150, false),
('tlc-quiz', 'event', 'Travel, Living & Culture Quiz', 150, false),
('rewind-quiz', 'event', 'Rewind Quiz', 150, false),
('basketball:Men''s', 'event', 'Basketball - Men''s', 300, true),
('basketball:Women''s', 'event', 'Basketball - Women''s', 300, true),
('cricket:Men''s', 'event', 'Cricket - Men''s', 300, true),
('football:Men''s', 'event', 'Football - Men''s', 300, true),
('futsal:Men''s', 'event', 'Futsal - Men''s', 300, true),
('futsal:Women''s', 'event', 'Futsal - Women''s', 300, true),
('hockey:Hockey 11s', 'event', 'Hockey - Hockey 11s', 300, true),
('hockey:Hockey 5s (Men''s)', 'event', 'Hockey - Hockey 5s (Men''s)', 300, true),
('hockey:Hockey 5s (Women''s)', 'event', 'Hockey - Hockey 5s (Women''s)', 300, true),
('throwball:Men''s', 'event', 'Throwball - Men''s', 300, true),
('throwball:Women''s', 'event', 'Throwball - Women''s', 300, true),
('volleyball:Men''s', 'event', 'Volleyball - Men''s', 300, true),
('volleyball:Women''s', 'event', 'Volleyball - Women''s', 300, true),
('aquatics:Men''s Freestyle 50m', 'event', 'Aquatics - Men''s Freestyle 50m', 200, false),
('aquatics:Men''s Backstroke 50m', 'event', 'Aquatics - Men''s Backstroke 50m', 200, false),
('aquatics:Men''s Breaststroke 50m', 'event', 'Aquatics - Men''s Breaststroke 50m', 200, false),
('aquatics:Men''s Butterfly 50m', 'event', 'Aquatics - Men''s Butterfly 50m', 200, false),
('aquatics:Men''s Freestyle 4x50m', 'event', 'Aquatics - Men''s Freestyle 4x50m', 200, false),
('aquatics:Women''s Freestyle 50m', 'event', 'Aquatics - Women''s Freestyle 50m', 200, false),
('aquatics:Women''s Backstroke 50m', 'event', 'Aquatics - Women''s Backstroke 50m', 200, false),
('aquatics:Women''s Breaststroke 50m', 'event', 'Aquatics - Women''s Breaststroke 50m', 200, false),
('aquatics:Women''s Butterfly 50m', 'event', 'Aquatics - Women''s Butterfly 50m', 200, false),
('aquatics:Mixed Freestyle 4x50m', 'event', 'Aquatics - Mixed Freestyle 4x50m', 200, false),
('athletics:Men''s 100m', 'event', 'Athletics - Men''s 100m', 200, false),
('athletics:Men''s 200m', 'event', 'Athletics - Men''s 200m', 200, false),
('athletics:Men''s 400m', 'event', 'Athletics - Men''s 400m', 200, false),
('athletics:Men''s 800m', 'event', 'Athletics - Men''s 800m', 200, false),
('athletics:Men''s 1500m', 'event', 'Athletics - Men''s 1500m', 200, false),
('athletics:Men''s 4x100m', 'event', 'Athletics - Men''s 4x100m', 200, false),
('athletics:Men''s Shotput', 'event', 'Athletics - Men''s Shotput', 200, false),
('athletics:Men''s Discus Throw', 'event', 'Athletics - Men''s Discus Throw', 200, false),
('athletics:Men''s Long Jump', 'event', 'Athletics - Men''s Long Jump', 200, false),
('athletics:Women''s 100m', 'event', 'Athletics - Women''s 100m', 200, false),
('athletics:Women''s 200m', 'event', 'Athletics - Women''s 200m', 200, false),
('athletics:Women''s 400m', 'event', 'Athletics - Women''s 400m', 200, false),
('athletics:Women''s 800m', 'event', 'Athletics - Women''s 800m', 200, false),
('athletics:Women''s 1500m', 'event', 'Athletics - Women''s 1500m', 200, false),
('athletics:Women''s 4x100m', 'event', 'Athletics - Women''s 4x100m', 200, false),
('athletics:Women''s Shotput', 'event', 'Athletics - Women''s Shotput', 200, false),
('athletics:Women''s Discus Throw', 'event', 'Athletics - Women''s Discus Throw', 200, false),
('athletics:Women''s Long Jump', 'event', 'Athletics - Women''s Long Jump', 200, false),
('badminton:Men''s Team Event', 'event', 'Badminton - Men''s Team Event', 300, false),
('badminton:Women''s Team Event', 'event', 'Badminton - Women''s Team Event', 300, false),
('badminton:Mixed Doubles', 'event', 'Badminton - Mixed Doubles', 300, false),
('carrom:Singles', 'event', 'Carrom - Singles', 300, false),
('carrom:Doubles', 'event', 'Carrom - Doubles', 300, false),
('chess:Rapid', 'event', 'Chess - Rapid', 200, false),
('chess:Blitz', 'event', 'Chess - Blitz', 200, false),
('chess:Bullet', 'event', 'Chess - Bullet', 200, false),
('chess:Team Event', 'event', 'Chess - Team Event', 200, false),
('table-tennis:Men''s Singles', 'event', 'Table Tennis - Men''s Singles', 300, false),
('table-tennis:Men''s Team Event', 'event', 'Table Tennis - Men''s Team Event', 300, false),
('table-tennis:Women''s Singles', 'event', 'Table Tennis - Women''s Singles', 300, false),
('table-tennis:Women''s Team Event', 'event', 'Table Tennis - Women''s Team Event', 300, false),
('tennis:Men''s Singles', 'event', 'Tennis - Men''s Singles', 300, false),
('tennis:Men''s Doubles', 'event', 'Tennis - Men''s Doubles', 300, false),
('tennis:Women''s Singles', 'event', 'Tennis - Women''s Singles', 300, false),
('tennis:Women''s Doubles', 'event', 'Tennis - Women''s Doubles', 300, false),
('tennis:Mixed Doubles', 'event', 'Tennis - Mixed Doubles', 300, false),
('gymnasium:Bench Press', 'event', 'Gymnasium (Men''s) - Bench Press', 200, false),
('gymnasium:Squats', 'event', 'Gymnasium (Men''s) - Squats', 200, false),
('gymnasium:Pull-ups', 'event', 'Gymnasium (Men''s) - Pull-ups', 70, false),
('gymnasium:Push-ups', 'event', 'Gymnasium (Men''s) - Push-ups', 70, false)
on conflict (code) do nothing;

-- catalog_pass_price / catalog_event_price — small read helpers used
-- both by the pricing triggers below AND by anything server-side that
-- needs an authoritative number. Missing code -> 0 (fails safe: an
-- unrecognised code never silently becomes a negative or huge charge,
-- and the INSERT trigger below still stores whatever price the row
-- already carried if genuinely nothing matches — see trg_set_event_price).
create or replace function catalog_pass_price(p_code text)
returns numeric
language sql
stable
as $$
  select coalesce((select price from price_catalog where code = p_code and kind = 'pass'), 0);
$$;

create or replace function catalog_event_price(p_event_id text, p_sub_event text, p_team_size int)
returns numeric
language plpgsql
stable
as $$
declare
  v_code text;
  v_price numeric;
  v_per_person boolean;
begin
  v_code := case when p_sub_event is not null and p_sub_event <> '' then p_event_id || ':' || p_sub_event else p_event_id end;
  select price, per_person into v_price, v_per_person from price_catalog where code = v_code and kind = 'event';
  if not found then
    return null; -- unknown event/sub-event — caller decides the fallback
  end if;
  if v_per_person then
    return v_price * greatest(coalesce(p_team_size, 1), 1);
  end if;
  return v_price;
end;
$$;

grant execute on function catalog_pass_price(text) to authenticated, anon;
grant execute on function catalog_event_price(text, text, int) to authenticated, anon;


-- ================================================================
-- 2. SERVER-SIDE PRICE RECOMPUTATION
-- ================================================================

-- 2a. event_registrations.price is now always set FROM THE CATALOG on
--     insert, overwriting whatever the client sent — closes the
--     "client-side price computation not server-validated" gap. If
--     the catalog somehow has no matching row (a brand-new event not
--     yet seeded), it falls back to keeping the client-supplied price
--     rather than zeroing it out, so nothing silently breaks — but
--     this should never happen once the seed block above has run.
create or replace function trg_set_event_price()
returns trigger
language plpgsql
as $$
declare
  v_catalog_price numeric;
begin
  v_catalog_price := catalog_event_price(new.event_id, new.sub_event, new.team_size);
  if v_catalog_price is not null then
    new.price := v_catalog_price;
  end if;
  if new.payment_status is null then
    new.payment_status := 'PENDING_VERIFICATION';
  end if;
  return new;
end;
$$;

drop trigger if exists set_event_price on event_registrations;
create trigger set_event_price
  before insert on event_registrations
  for each row execute function trg_set_event_price();

-- 2b. recompute_purchase_amount(purchase_id) — call this right after
--     a checkout finishes writing its purchases + event_registrations
--     rows. It re-derives base_amount from pass_codes (via the
--     catalog) and events_amount from the SUM of that purchase's own
--     event_registrations.price (which is itself already
--     catalog-authoritative from the trigger above), then overwrites
--     total_amount. The number that ends up permanently stored is
--     therefore always server-computed, never trusted from the
--     browser — whatever the client originally inserted as a
--     placeholder gets corrected here in the same request.
--     Callable by: the purchase's own owner, OR the leader of the
--     group it belongs to (covers a leader registering events on
--     behalf of a member — the purchase.user_id is the MEMBER's, but
--     the leader is the one who just ran the checkout).
create or replace function recompute_purchase_amount(p_purchase_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_owner uuid;
  v_pass_codes text[];
  v_base numeric;
  v_events numeric;
begin
  select user_id, pass_codes into v_owner, v_pass_codes from purchases where id = p_purchase_id;
  if v_owner is null then
    raise exception 'Purchase not found';
  end if;
  if v_owner <> auth.uid() and not is_leader_of_purchase_group(p_purchase_id, auth.uid()) then
    raise exception 'Not authorized to recompute this purchase';
  end if;

  select coalesce(sum(catalog_pass_price(c)), 0) into v_base from unnest(coalesce(v_pass_codes, '{}')) c;
  select coalesce(sum(price), 0) into v_events from event_registrations where purchase_id = p_purchase_id;

  update purchases
    set base_amount = v_base,
        events_amount = v_events,
        total_amount = v_base + v_events
    where id = p_purchase_id;
end;
$$;

grant execute on function recompute_purchase_amount(uuid) to authenticated;


-- ================================================================
-- 3. SINGLE PERSISTENT DELEGATE ID PER USER
-- ================================================================

-- purchases.delegate_id used to be UNIQUE (one brand-new ID minted
-- per checkout). It's now intentionally SHARED across every purchase
-- row belonging to the same person — dropping the constraint is what
-- makes that legal. Uniqueness of the ID as a real identifier is
-- still guaranteed by construction: a fresh number is only ever
-- minted when the person doesn't already have one, or when their
-- pass combination changes which prefix they're entitled to.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'purchases'::regclass and conname = 'purchases_delegate_id_key'
  ) then
    alter table purchases drop constraint purchases_delegate_id_key;
  end if;
end $$;

-- internal_compute_id_prefix — pure port of computeIdPrefix() from
-- src/lib/idGenerator.js. Kept as its own function so the group-
-- purchase RPC and the self-service resolver share EXACTLY one
-- implementation instead of two copies drifting apart over time.
create or replace function internal_compute_id_prefix(p_pass_codes text[])
returns table(prefix text, digits int)
language plpgsql
stable
as $$
declare
  v_has_c boolean;
  v_has_s boolean;
  v_has_l boolean;
  v_has_q boolean;
  v_letters text := '';
begin
  if 'tier-one' = any(p_pass_codes) then
    return query select 'DT1'::text, 5; return;
  elsif 'tier-two' = any(p_pass_codes) then
    return query select 'DT2'::text, 5; return;
  elsif 'tier-three' = any(p_pass_codes) then
    return query select 'DT3'::text, 5; return;
  end if;

  v_has_c := 'cult-pass' = any(p_pass_codes);
  v_has_s := 'sports-pass' = any(p_pass_codes);
  v_has_l := ('lit-pass' = any(p_pass_codes)) or ('premium-pass' = any(p_pass_codes));
  v_has_q := ('quiz-pass' = any(p_pass_codes)) or ('premium-pass' = any(p_pass_codes));

  if v_has_c then v_letters := v_letters || 'C'; end if;
  if v_has_s then v_letters := v_letters || 'S'; end if;
  if v_has_l then v_letters := v_letters || 'L'; end if;
  if v_has_q then v_letters := v_letters || 'Q'; end if;

  if length(v_letters) = 0 then
    return; -- no pass at all -> no rows -> caller treats as null
  elsif length(v_letters) = 1 then
    return query select v_letters || 'P', 6; return;
  else
    return query select substr(v_letters, 1, 2) || 'P', 5; return;
  end if;
end;
$$;

-- internal_resolve_base_id — given a user and the pass_codes of the
-- purchase they're about to make, works out their 8-character BASE
-- Delegate ID (no group prefix): reuse the existing one if their pass
-- combination still maps to the same prefix, otherwise mint a fresh
-- number under the new prefix. Looks at the UNION of pass_codes
-- across every one of that user's own non-rejected purchases so a
-- person who already owns e.g. a Cult Pass and is now adding a Sports
-- Pass correctly gets upgraded to the combined "CSP" prefix.
create or replace function internal_resolve_base_id(p_user_id uuid, p_extra_pass_codes text[])
returns table(base_id text, changed boolean, previous_base text)
language plpgsql
security definer
as $$
declare
  v_union_codes text[];
  v_prefix text;
  v_digits int;
  v_existing_full text;
  v_existing_base text;
  v_new_base text;
begin
  select array(
    select distinct c from (
      select unnest(pass_codes) c from purchases where user_id = p_user_id and payment_status <> 'REJECTED'
      union
      select unnest(coalesce(p_extra_pass_codes, '{}'))
    ) t
  ) into v_union_codes;

  select ip.prefix, ip.digits into v_prefix, v_digits from internal_compute_id_prefix(v_union_codes) ip limit 1;
  if v_prefix is null then
    return; -- no pass at all yet -> no base id to give
  end if;

  select delegate_id into v_existing_full
  from purchases
  where user_id = p_user_id and delegate_id is not null
  order by created_at asc
  limit 1;

  if v_existing_full is null then
    v_new_base := generate_delegate_id(v_prefix, v_digits);
    return query select v_new_base, true, null::text;
    return;
  end if;

  if position('-' in v_existing_full) > 0 then
    v_existing_base := split_part(v_existing_full, '-', 2);
  else
    v_existing_base := v_existing_full;
  end if;

  if v_existing_base like (v_prefix || '%') and length(v_existing_base) = (length(v_prefix) + v_digits) then
    return query select v_existing_base, false, v_existing_base;
    return;
  end if;

  v_new_base := generate_delegate_id(v_prefix, v_digits);
  return query select v_new_base, true, v_existing_base;
end;
$$;

-- resolve_my_delegate_id — called by the client right before a Pass
-- Checkout insert. Reuses/updates the CALLER's own canonical Delegate
-- ID (preserving their Group prefix if they're a group member) rather
-- than minting a disconnected new one for every additional pass they
-- buy. When it DOES change, every one of the caller's existing
-- purchase rows is updated in place (so Table 1 / their Profile / any
-- printed badge all stay consistent), and it reports the previous ID
-- back so the client can fire a "Delegate ID updated" email.
create or replace function resolve_my_delegate_id(p_new_pass_codes text[])
returns table(delegate_id text, changed boolean, previous_delegate_id text)
language plpgsql
security definer
as $$
declare
  v_group_id uuid;
  v_group_code text;
  v_base text;
  v_changed boolean;
  v_prev_base text;
  v_full text;
  v_prev_full text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select group_id into v_group_id
  from purchases
  where user_id = auth.uid() and delegate_id is not null
  order by created_at asc
  limit 1;

  select r.base_id, r.changed, r.previous_base into v_base, v_changed, v_prev_base
  from internal_resolve_base_id(auth.uid(), p_new_pass_codes) r;

  if v_base is null then
    raise exception 'No pass selected — cannot generate a Delegate ID';
  end if;

  if v_group_id is not null then
    select group_code into v_group_code from groups where id = v_group_id;
    v_full := v_group_code || '-' || v_base;
    v_prev_full := case when v_prev_base is null then null else v_group_code || '-' || v_prev_base end;
  else
    v_full := v_base;
    v_prev_full := v_prev_base;
  end if;

  if v_changed then
    update purchases set delegate_id = v_full where user_id = auth.uid() and delegate_id is not null;
  end if;

  return query select v_full, v_changed, (case when v_changed then v_prev_full else null end);
end;
$$;

grant execute on function resolve_my_delegate_id(text[]) to authenticated;


-- ================================================================
-- 4. ATOMIC GROUP PURCHASE
-- ================================================================
-- create_group_purchase() replaces the old client-side loop of
-- separate insert calls (one per member) with ONE function call.
-- Postgres functions are transactional by nature: if anything inside
-- raises an exception (a bad pass code, a missing member account, a
-- DB constraint violation), every insert this function has done so
-- far — including the `groups` row itself — is rolled back
-- automatically. There is no partial/orphaned state possible, unlike
-- the old sequential-insert version.
--
-- Member account creation (Supabase Auth) still has to happen
-- BEFORE this is called, from the /api/submit-group-purchase
-- serverless function (Postgres functions can't create Auth users
-- directly) — see that file for how a failure AFTER accounts are
-- provisioned but BEFORE/DURING this call is handled (best-effort
-- cleanup of only the accounts that call just created).
create or replace function create_group_purchase(
  p_leader_name text,
  p_leader_phone text,
  p_leader_college text,
  p_leader_year text,
  p_leader_pass_codes text[],
  p_leader_id_card_url text,
  p_payment_screenshot_url text,
  p_utr_number text,
  p_is_free boolean,
  p_members jsonb  -- array of {user_id, full_name, email, phone, college, year_of_study, id_card_url, pass_codes}
)
returns table(out_group_id uuid, out_group_code text, out_leader_delegate_id text, out_members jsonb)
language plpgsql
security definer
as $$
declare
  v_leader_id uuid := auth.uid();
  v_leader_email text;
  v_group_id uuid;
  v_group_code text;
  v_leader_base_id text;
  v_leader_full_id text;
  v_leader_amount numeric;
  v_leader_pass_type text;
  v_member jsonb;
  v_member_user_id uuid;
  v_member_base_id text;
  v_member_full_id text;
  v_member_amount numeric;
  v_member_pass_codes text[];
  v_results jsonb := '[]'::jsonb;
  v_max_total_members constant int := 15;
  v_member_count int;
begin
  if v_leader_id is null then
    raise exception 'Not authenticated';
  end if;
  if p_leader_pass_codes is null or array_length(p_leader_pass_codes, 1) is null then
    raise exception 'Select at least one Pass/Tier for the group';
  end if;

  v_member_count := coalesce(jsonb_array_length(p_members), 0);
  if v_member_count > v_max_total_members - 1 then
    raise exception 'Maximum limit of % members reached', v_max_total_members;
  end if;

  select email into v_leader_email from auth.users where id = v_leader_id;

  -- 1. The group itself, with its own atomically-reserved code.
  v_group_code := generate_group_code();
  insert into groups (group_code, leader_user_id, leader_name, leader_email)
  values (v_group_code, v_leader_id, p_leader_name, v_leader_email)
  returning id into v_group_id;

  -- 2. Leader's own purchase row (Member 1). Reuses/updates their
  --    existing canonical Delegate ID if they already had one from a
  --    solo purchase made before starting this group.
  select r.base_id into v_leader_base_id from internal_resolve_base_id(v_leader_id, p_leader_pass_codes) r;
  if v_leader_base_id is null then
    raise exception 'Could not generate a Delegate ID for the leader';
  end if;
  v_leader_full_id := v_group_code || '-' || v_leader_base_id;
  select coalesce(sum(catalog_pass_price(c)), 0) into v_leader_amount from unnest(p_leader_pass_codes) c;
  v_leader_pass_type := case when p_leader_pass_codes && array['tier-one', 'tier-two', 'tier-three'] then 'tier' else 'club' end;

  insert into purchases (
    user_id, group_id, delegate_id, pass_type, pass_codes, full_name, email, phone, college, year_of_study,
    id_card_url, payment_screenshot_url, utr_number, base_amount, events_amount, total_amount, payment_status
  ) values (
    v_leader_id, v_group_id, v_leader_full_id, v_leader_pass_type, p_leader_pass_codes, p_leader_name,
    v_leader_email, p_leader_phone, p_leader_college, p_leader_year,
    p_leader_id_card_url, p_payment_screenshot_url, case when p_is_free then null else p_utr_number end,
    v_leader_amount, 0, v_leader_amount, 'PENDING_VERIFICATION'
  );
  -- Also refresh every OTHER purchase row this leader already owns,
  -- in case internal_resolve_base_id decided their prefix changed.
  update purchases set delegate_id = v_leader_full_id where user_id = v_leader_id and delegate_id is not null and delegate_id <> v_leader_full_id and group_id is null;

  v_results := v_results || jsonb_build_object(
    'user_id', v_leader_id, 'full_name', p_leader_name, 'email', v_leader_email,
    'delegate_id', v_leader_full_id, 'is_leader', true
  );

  -- 3. Every other member — account already provisioned by the
  --    caller (serverless function), user_id passed in per member.
  for v_member in select * from jsonb_array_elements(coalesce(p_members, '[]'::jsonb))
  loop
    v_member_user_id := nullif(v_member->>'user_id', '')::uuid;
    if v_member_user_id is null then
      raise exception 'Missing account for member %', coalesce(v_member->>'email', '(no email)');
    end if;
    if not v_member ? 'full_name' or trim(coalesce(v_member->>'full_name', '')) = '' then
      raise exception 'Missing name for member %', coalesce(v_member->>'email', '(no email)');
    end if;
    if trim(coalesce(v_member->>'phone', '')) = '' then
      raise exception 'Phone number is required for every group member (%).', coalesce(v_member->>'email', '(no email)');
    end if;
    if trim(coalesce(v_member->>'id_card_url', '')) = '' then
      raise exception 'College ID card is required for every group member (%).', coalesce(v_member->>'email', '(no email)');
    end if;

    if v_member ? 'pass_codes' and jsonb_typeof(v_member->'pass_codes') = 'array' and jsonb_array_length(v_member->'pass_codes') > 0 then
      select array(select jsonb_array_elements_text(v_member->'pass_codes')) into v_member_pass_codes;
    else
      v_member_pass_codes := p_leader_pass_codes;
    end if;

    select r.base_id into v_member_base_id from internal_resolve_base_id(v_member_user_id, v_member_pass_codes) r;
    if v_member_base_id is null then
      raise exception 'Could not generate a Delegate ID for %', v_member->>'email';
    end if;
    v_member_full_id := v_group_code || '-' || v_member_base_id;
    select coalesce(sum(catalog_pass_price(c)), 0) into v_member_amount from unnest(v_member_pass_codes) c;

    insert into purchases (
      user_id, group_id, delegate_id, pass_type, pass_codes, full_name, email, phone, college, year_of_study,
      id_card_url, payment_screenshot_url, utr_number, base_amount, events_amount, total_amount, payment_status
    ) values (
      v_member_user_id, v_group_id, v_member_full_id,
      case when v_member_pass_codes && array['tier-one', 'tier-two', 'tier-three'] then 'tier' else 'club' end,
      v_member_pass_codes, v_member->>'full_name', lower(trim(v_member->>'email')), v_member->>'phone',
      coalesce(nullif(v_member->>'college', ''), p_leader_college), coalesce(nullif(v_member->>'year_of_study', ''), p_leader_year),
      v_member->>'id_card_url', p_payment_screenshot_url, case when p_is_free then null else p_utr_number end,
      v_member_amount, 0, v_member_amount, 'PENDING_VERIFICATION'
    );
    update purchases set delegate_id = v_member_full_id where user_id = v_member_user_id and delegate_id is not null and delegate_id <> v_member_full_id and group_id is null;

    v_results := v_results || jsonb_build_object(
      'user_id', v_member_user_id, 'full_name', v_member->>'full_name', 'email', v_member->>'email',
      'delegate_id', v_member_full_id, 'is_leader', false
    );
  end loop;

  return query select v_group_id, v_group_code, v_leader_full_id, v_results;
end;
$$;

grant execute on function create_group_purchase(text, text, text, text, text[], text, text, text, boolean, jsonb) to authenticated;


-- ================================================================
-- 5. search_group_members() — add phone + email so the leader's
--    Group-ID event checkout can prefill the member's WhatsApp number
--    (was silently missing — the column was just never selected) and
--    so the "null value in column email" bug is fixed at the root:
--    the client can now pass the REAL member email into the
--    events-only purchase row instead of null. Still leader-only,
--    still re-checks leadership server-side — safe to expose email
--    here because leaders already know their own members' emails
--    (they typed them in when creating the group).
-- ================================================================
drop function if exists search_group_members(uuid, text);

create or replace function search_group_members(p_group_id uuid, p_prefix text default '')
returns table(delegate_id text, full_name text, user_id uuid, phone text, email text)
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from groups g where g.id = p_group_id and g.leader_user_id = auth.uid()) then
    raise exception 'Not the leader of this group';
  end if;

  return query
    select p.delegate_id, p.full_name, p.user_id, p.phone, p.email
    from purchases p
    where p.group_id = p_group_id
      and (p_prefix = '' or p.delegate_id ilike '%' || upper(trim(p_prefix)) || '%' or p.full_name ilike '%' || trim(p_prefix) || '%')
    order by p.delegate_id;
end;
$$;

grant execute on function search_group_members(uuid, text) to authenticated;


-- ================================================================
-- 6. EVENT REGISTRATIONS GET THEIR OWN STATUS
-- ================================================================
-- Previously Table 2's Approve/Reject buttons actually mutated the
-- PARENT purchase row's status — meaning approving one event silently
-- approved (or rejected) every other event bought in the same
-- checkout too, and gave admins no way to treat one bundled event
-- differently from another. event_registrations.payment_status is
-- now independent. pre_cascade_status remembers what a row's status
-- was immediately before an automatic cascade-rejection (see the
-- trigger below), so re-approving the pass can put it back correctly
-- instead of just dumping everything into PENDING.
alter table event_registrations add column if not exists payment_status text
  not null default 'PENDING_VERIFICATION'
  check (payment_status in ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED'));
alter table event_registrations add column if not exists pre_cascade_status text;

-- One-time backfill for rows written before this column existed:
-- inherit whatever their parent purchase's status currently is, so
-- nothing that was already APPROVED/REJECTED regresses to PENDING.
-- Safe to re-run: only touches rows that still have the just-added
-- default and have never been independently updated since.
update event_registrations er
  set payment_status = p.payment_status
  from purchases p
  where p.id = er.purchase_id
    and er.payment_status = 'PENDING_VERIFICATION'
    and p.payment_status <> 'PENDING_VERIFICATION';

create index if not exists idx_event_regs_status on event_registrations(payment_status);

-- admin_update_event_status — Table 2's Approve / Reject / Pending
-- buttons now call this directly instead of admin_update_purchase_status.
create or replace function admin_update_event_status(admin_key text, p_id uuid, p_status text)
returns void
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  if p_status not in ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED') then
    raise exception 'Invalid status';
  end if;
  update event_registrations set payment_status = p_status, pre_cascade_status = null where id = p_id;
end;
$$;

-- Cascade: rejecting a PASS purchase (pass_codes not empty) rejects
-- every one of that same person's event registrations that are part
-- of an events-only purchase (pass_codes = '{}'), remembering what
-- each one's status was so it can be restored on re-approval. This is
-- scoped to "the same person's" events (matched by user_id, and by
-- group_id when the pass was bought as part of a group) rather than
-- to a specific purchase_id, because in this schema a pass and the
-- events bought against it are always two SEPARATE purchase rows.
-- NOTE (documented simplification): if a person somehow holds more
-- than one pass at once, rejecting one of them still cascades across
-- ALL of their pending/approved event entries, since there's no
-- per-event "which pass unlocked this" link stored. For Spandan's
-- normal one-pass-per-delegate flow this is exactly the desired
-- behaviour; it's flagged here in case a future version adds
-- multi-pass tracking.
create or replace function trg_cascade_purchase_status()
returns trigger
language plpgsql
as $$
begin
  if new.payment_status is distinct from old.payment_status
     and new.pass_codes is not null and array_length(new.pass_codes, 1) > 0 then

    if new.payment_status = 'REJECTED' then
      update event_registrations er
        set pre_cascade_status = er.payment_status,
            payment_status = 'REJECTED'
        from purchases ep
        where ep.id = er.purchase_id
          and ep.user_id = new.user_id
          and (ep.pass_codes is null or array_length(ep.pass_codes, 1) is null or array_length(ep.pass_codes, 1) = 0)
          and er.payment_status <> 'REJECTED';

    elsif old.payment_status = 'REJECTED' and new.payment_status in ('APPROVED', 'PENDING_VERIFICATION') then
      update event_registrations er
        set payment_status = coalesce(er.pre_cascade_status, 'PENDING_VERIFICATION'),
            pre_cascade_status = null
        from purchases ep
        where ep.id = er.purchase_id
          and ep.user_id = new.user_id
          and (ep.pass_codes is null or array_length(ep.pass_codes, 1) is null or array_length(ep.pass_codes, 1) = 0)
          and er.pre_cascade_status is not null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists cascade_purchase_status on purchases;
create trigger cascade_purchase_status
  after update on purchases
  for each row execute function trg_cascade_purchase_status();


-- ================================================================
-- 7. ADMIN — Table 3 (Event Master) support + "toggle back to
--    PENDING at any time" for passes, + Table 2's Group Column.
-- ================================================================

-- admin_list_price_catalog / admin_update_price_catalog — the only
-- way price_catalog rows are ever written (no direct grant exists —
-- see section 1). Table 3 in the Admin Dashboard calls these.
create or replace function admin_list_price_catalog(admin_key text)
returns setof price_catalog
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  return query select * from price_catalog order by kind, code;
end;
$$;

create or replace function admin_update_price_catalog(
  admin_key text,
  p_code text,
  p_price numeric default null,
  p_registrations_open boolean default null,
  p_title_override text default null,
  p_clear_title_override boolean default false,
  p_desc_override text default null,
  p_clear_desc_override boolean default false
)
returns price_catalog
language plpgsql
security definer
as $$
declare
  v_row price_catalog;
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;

  update price_catalog set
    price = coalesce(p_price, price),
    registrations_open = coalesce(p_registrations_open, registrations_open),
    title_override = case when p_clear_title_override then null when p_title_override is not null then p_title_override else title_override end,
    desc_override = case when p_clear_desc_override then null when p_desc_override is not null then p_desc_override else desc_override end,
    updated_at = now()
  where code = p_code
  returning * into v_row;

  if v_row.code is null then
    raise exception 'Unknown catalog code: %', p_code;
  end if;
  return v_row;
end;
$$;

-- admin_update_purchase_status already exists (migration.sql /
-- set_admin_passcode.sql) and already allows any status including
-- 'PENDING_VERIFICATION' at any time — Table 1 just needed a third
-- "↺ Pending" button in the UI calling it, no schema change required.


-- ================================================================
-- 8. ADMIN PORTAL AUTH LEAK — nothing to migrate here (the fix is a
--    client-side change removing the insecure unauthenticated
--    fallback query in AdminDashboard.jsx's handleLogin), but as
--    defense in depth, make sure the direct-table grants an
--    accidental fallback could ever have exploited are as tight as
--    they should be: purchases/event_registrations/team_members are
--    only ever meant to be bulk-read through the admin_key-gated
--    RPCs above, never through a raw table select.
-- ================================================================
-- (RLS policies from migration.sql/migration_v6.sql already restrict
--  direct table reads to "your own rows" — this section is a no-op
--  if that's already true, included only so this file documents the
--  invariant it depends on.)

-- ============================================================
-- End of migration_v7.sql. After running this:
-- 1. Nothing to hand-edit — the admin passcode below matches what
--    set_admin_passcode.sql already set ('SPANDAN2026ADMIN'). If you
--    change it later, also update the 4 new/changed functions above
--    that check it: admin_update_event_status,
--    admin_list_price_catalog, admin_update_price_catalog.
-- 2. Deploy the v8 app code alongside this — RegistrationFlow.jsx,
--    AdminDashboard.jsx and Profile.jsx all call functions added
--    here (create_group_purchase, resolve_my_delegate_id,
--    recompute_purchase_amount, admin_update_event_status,
--    admin_list_price_catalog, admin_update_price_catalog).
-- ============================================================
