-- ============================================================
-- SPANDAN 2026 — Registration System Schema (v2)
-- ============================================================
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).
-- This is additive: it does not touch your existing `registrations` table,
-- so nothing already collected is lost. The new flow writes to the tables
-- below instead. You can migrate/retire the old table once you've
-- verified the new flow end-to-end.
--
-- WHY A NEW SCHEMA:
-- The old `registrations` table stored one pass + one flat list of events
-- per row, with no support for: multiple passes per checkout, a real
-- shopping cart, team rosters, or a unique per-pass Delegate ID. The
-- tables below cover all of that.
-- ============================================================


-- ----------------------------------------------------------------
-- 1. ID COUNTERS — one row per Delegate ID prefix (e.g. "DT1", "CP").
--    This is what makes ID generation ATOMIC and race-condition-safe:
--    two people checking out at the exact same second cannot get the
--    same number, because the increment happens inside a single
--    database transaction (see the function below).
-- ----------------------------------------------------------------
create table if not exists id_counters (
  prefix text primary key,
  next_value integer not null default 1
);

-- ----------------------------------------------------------------
-- 2. generate_delegate_id(prefix, digits) — atomically reserves the
--    next number for a prefix and returns the zero-padded ID string.
--    e.g. generate_delegate_id('DT1', 4) -> 'DT10019'
--         generate_delegate_id('CP', 5)  -> 'CP00001'
-- ----------------------------------------------------------------
create or replace function generate_delegate_id(p_prefix text, p_digits int)
returns text
language plpgsql
security definer
as $$
declare
  v_next integer;
begin
  insert into id_counters (prefix, next_value)
  values (p_prefix, 1)
  on conflict (prefix) do update
    set next_value = id_counters.next_value + 1
  returning next_value into v_next;

  return p_prefix || lpad(v_next::text, p_digits, '0');
end;
$$;

-- Anyone signed in can call this (it only ever creates an ID, nothing else)
grant execute on function generate_delegate_id(text, int) to authenticated;


-- ----------------------------------------------------------------
-- 3. PURCHASES — one row per checkout. A checkout can contain a
--    Delegate Tier and/or one or more Club Passes (pass_codes array),
--    and/or standalone events (if the user already owns a qualifying
--    pass from an earlier purchase and is just adding more events).
--    delegate_id is only set when this checkout included a pass.
-- ----------------------------------------------------------------
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  delegate_id text unique,                 -- null if this checkout was events-only
  pass_type text,                          -- 'tier' | 'club' | null
  pass_codes text[] not null default '{}', -- e.g. {'tier-one'} or {'cult-pass','sports-pass'}
  full_name text not null,
  email text not null,
  phone text not null,
  college text not null,
  year_of_study text,
  id_card_url text,
  payment_screenshot_url text,
  base_amount numeric not null default 0,   -- pass cost
  events_amount numeric not null default 0, -- sum of event fees in this checkout
  total_amount numeric not null default 0,
  payment_status text not null default 'PENDING_VERIFICATION'
    check (payment_status in ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create index if not exists idx_purchases_user_id on purchases(user_id);
create index if not exists idx_purchases_status on purchases(payment_status);

-- ----------------------------------------------------------------
-- 4. EVENT_REGISTRATIONS — line items: which events were bought in
--    a given purchase/checkout. One row per event (or sub-event,
--    e.g. "Tennis: Mixed Doubles").
-- ----------------------------------------------------------------
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references purchases(id) on delete cascade not null,
  event_id text not null,
  event_title text not null,
  sub_event text,
  price numeric not null default 0,       -- 0 if waived by a Lit/Quiz/Premium pass
  is_team_event boolean not null default false,
  team_size integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_regs_purchase_id on event_registrations(purchase_id);

-- ----------------------------------------------------------------
-- 5. TEAM_MEMBERS — roster for team events. `delegate_id` is the ID
--    the leader typed in for that member; `verified` is set true by
--    the app the moment it confirms that ID exists in `purchases`.
-- ----------------------------------------------------------------
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  event_registration_id uuid references event_registrations(id) on delete cascade not null,
  full_name text not null,
  whatsapp_number text not null,
  delegate_id text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_team_members_event_reg on team_members(event_registration_id);


-- ----------------------------------------------------------------
-- 6. ROW LEVEL SECURITY — users can only see/insert their own data.
-- ----------------------------------------------------------------
alter table purchases enable row level security;
alter table event_registrations enable row level security;
alter table team_members enable row level security;

drop policy if exists "select own purchases" on purchases;
create policy "select own purchases" on purchases
  for select using (auth.uid() = user_id);

drop policy if exists "insert own purchases" on purchases;
create policy "insert own purchases" on purchases
  for insert with check (auth.uid() = user_id);

drop policy if exists "select own event registrations" on event_registrations;
create policy "select own event registrations" on event_registrations
  for select using (
    exists (select 1 from purchases where purchases.id = event_registrations.purchase_id and purchases.user_id = auth.uid())
  );

drop policy if exists "insert own event registrations" on event_registrations;
create policy "insert own event registrations" on event_registrations
  for insert with check (
    exists (select 1 from purchases where purchases.id = event_registrations.purchase_id and purchases.user_id = auth.uid())
  );

drop policy if exists "select own team members" on team_members;
create policy "select own team members" on team_members
  for select using (
    exists (
      select 1 from event_registrations er
      join purchases p on p.id = er.purchase_id
      where er.id = team_members.event_registration_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "insert own team members" on team_members;
create policy "insert own team members" on team_members
  for insert with check (
    exists (
      select 1 from event_registrations er
      join purchases p on p.id = er.purchase_id
      where er.id = team_members.event_registration_id and p.user_id = auth.uid()
    )
  );

-- RLS policies only take effect once the underlying privilege already
-- exists — they restrict WHICH rows a grant applies to, they don't
-- grant access themselves. Without these, every insert/select above
-- is rejected before the policy is even evaluated.
grant usage on schema public to authenticated, anon;
grant select, insert on purchases to authenticated;
grant select, insert on event_registrations to authenticated;
grant select, insert on team_members to authenticated;
grant select on id_counters to authenticated;


-- ----------------------------------------------------------------
-- 7. VERIFY A DELEGATE ID (used by the team-registration form to
--    confirm a member's ID is real before letting the leader submit).
--    Returns the name on file for that ID, or nothing if not found.
--    SECURITY DEFINER so it can check across all users' purchases
--    without exposing the full purchases table to the client.
-- ----------------------------------------------------------------
create or replace function verify_delegate_id(p_delegate_id text)
returns table(full_name text, college text)
language plpgsql
security definer
as $$
begin
  return query
    select p.full_name, p.college
    from purchases p
    where p.delegate_id = p_delegate_id
      and p.payment_status = 'APPROVED';
end;
$$;

grant execute on function verify_delegate_id(text) to authenticated;


-- ----------------------------------------------------------------
-- 8. ADMIN ACCESS — mirrors the existing get_admin_registrations
--    pattern already used by AdminDashboard.jsx. Set your passcode
--    once via: select set_config('app.admin_passcode', 'yourpasscode', false);
--    …or simpler: just hardcode it below and re-run this block.
-- ----------------------------------------------------------------
create or replace function get_admin_purchases(admin_key text)
returns setof purchases
language plpgsql
security definer
as $$
begin
  -- ⚠️ Replace 'CHANGE_ME' with your real admin passcode before running.
  if admin_key is distinct from 'CHANGE_ME' then
    raise exception 'Unauthorized';
  end if;
  return query select * from purchases order by created_at desc;
end;
$$;

create or replace function get_admin_event_registrations(admin_key text)
returns setof event_registrations
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'CHANGE_ME' then
    raise exception 'Unauthorized';
  end if;
  return query select * from event_registrations order by created_at desc;
end;
$$;

create or replace function get_admin_team_members(admin_key text)
returns setof team_members
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'CHANGE_ME' then
    raise exception 'Unauthorized';
  end if;
  return query select * from team_members order by created_at desc;
end;
$$;

create or replace function admin_update_purchase_status(admin_key text, p_id uuid, p_status text)
returns void
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'CHANGE_ME' then
    raise exception 'Unauthorized';
  end if;
  if p_status not in ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED') then
    raise exception 'Invalid status';
  end if;
  update purchases set payment_status = p_status where id = p_id;
end;
$$;

-- ============================================================
-- End of migration. After running this:
-- 1. Replace 'CHANGE_ME' above with your real admin passcode
--    (find/replace all 4 occurrences), then re-run just those
--    4 CREATE OR REPLACE FUNCTION blocks.
-- 2. Confirm the "payment-screenshots" storage bucket still
--    exists (Storage → it's reused for ID cards + receipts,
--    same as before — no change needed there).
-- ============================================================
