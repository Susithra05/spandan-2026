-- ============================================================
-- SPANDAN 2026 — Migration v6
-- ============================================================
-- Run this in the Supabase SQL Editor AFTER migration_v5.sql.
-- Covers, in order (NOTE: this order matters — each section only
-- references columns/tables created by an EARLIER section, since
-- CREATE POLICY statements are validated against real columns
-- immediately, unlike function bodies):
--   1. GROUP CODE GENERATOR — atomic "G001", "G002"... sequence,
--      used alongside the existing generate_delegate_id() to build
--      full Group Delegate IDs like "G001-SP000001" client-side
--      (see src/lib/idGenerator.js).
--   2. GROUPS TABLE — bare table only, no RLS yet (its policies need
--      purchases.group_id, added in the next section).
--   3. purchases.group_id + team_members.email — the new columns
--      everything else in this file depends on.
--   4. GROUPS RLS — now safe to add, purchases.group_id exists.
--   5. IDENTITY-AWARE verify_delegate_id() — replaces the v5 version.
--      Instead of just confirming an ID exists, it now also tells the
--      caller (a) whether the ID belongs to THEM (auth.uid()), and
--      (b) whether it belongs to a specific email they supply — used
--      for individual self-registration and team-mate email
--      verification respectively. Never returns the actual email, so
--      no address is ever leaked to a client that doesn't already
--      know it.
--   6. search_delegate_ids() — lightweight prefix autosuggest (name +
--      ID only) for the team-mate "type to search" dropdown.
--   7. search_group_members() — leader-only: lists the members of
--      their own group, for the Group ID delegate dropdown.
--   8. LEADER RLS — Group Leaders can INSERT/SELECT purchases and
--      event_registrations belonging to their own group's members
--      (needed for group pass purchases and delegated event
--      registration), on top of the existing "own row" policies.
--   9. PROFILE EDITING — column-scoped UPDATE grants (only the safe,
--      editable fields) + RLS, for both self-edits and leader edits
--      of group members.
--   10. VERIFICATION-RESET TRIGGERS — editing an APPROVED purchase's
--      identity fields (or an event registration's participant info)
--      automatically drops payment_status back to
--      PENDING_VERIFICATION until the committee re-checks it. Admin
--      status-change updates (which don't touch these fields) are
--      unaffected.
--   11. ADMIN — get_admin_groups(), mirroring the existing
--      get_admin_* functions from migration.sql.
--
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS /
-- CREATE OR REPLACE / DROP POLICY IF EXISTS), and Postgres runs a
-- pasted multi-statement script as one implicit transaction, so an
-- earlier failed attempt left nothing partially applied.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. GROUP CODE GENERATOR
-- ----------------------------------------------------------------
create or replace function generate_group_code()
returns text
language plpgsql
security definer
as $$
declare
  v_next integer;
begin
  insert into id_counters (prefix, next_value)
  values ('GROUP', 1)
  on conflict (prefix) do update
    set next_value = id_counters.next_value + 1
  returning next_value into v_next;

  return 'G' || lpad(v_next::text, 3, '0');
end;
$$;

grant execute on function generate_group_code() to authenticated;

-- ----------------------------------------------------------------
-- 2. GROUPS TABLE (bare table only — RLS comes in section 4, AFTER
--    purchases.group_id exists in section 3)
-- ----------------------------------------------------------------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  group_code text unique not null,
  leader_user_id uuid references auth.users(id) not null,
  leader_name text,
  leader_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_groups_leader on groups(leader_user_id);

-- ----------------------------------------------------------------
-- 3. purchases.group_id + team_members.email — added BEFORE any RLS
--    policy references them (that's the bug in the first version of
--    this file: the groups policy below used to sit before this).
--
--    SELF-HEALING: if an earlier troubleshooting attempt already
--    added group_id as the wrong type (e.g. text instead of uuid —
--    this happens if something like "Debug with Assistant" suggested
--    a quick fix, or it was added by hand), "add column if not
--    exists" below would silently do nothing and leave it wrong.
--    So instead: ensure the column exists in SOME form, then force
--    it to uuid regardless of its current type. Safe to run even if
--    it's already correct (uuid -> text -> uuid round-trips fine),
--    and safe even if it already has rows (nullif handles stray
--    empty strings; any real data would already have been valid
--    delegate/group UUIDs, since nothing in this app writes anything
--    else there).
-- ----------------------------------------------------------------
alter table purchases add column if not exists group_id text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'purchases'
      and column_name = 'group_id' and data_type <> 'uuid'
  ) then
    alter table purchases alter column group_id type uuid using nullif(group_id::text, '')::uuid;
  end if;
end $$;

create index if not exists idx_purchases_group_id on purchases(group_id);

-- The FK constraint needs the groups table above to exist, which it
-- now does (section 2) — add it only if missing, since a from-scratch
-- run already got it for free as part of the original "references
-- groups(id)" column definition, but the self-healing path above
-- doesn't carry a constraint over from a differently-typed column.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'purchases' and constraint_name = 'purchases_group_id_fkey'
  ) then
    alter table purchases add constraint purchases_group_id_fkey foreign key (group_id) references groups(id);
  end if;
end $$;

alter table team_members
  add column if not exists email text;

-- ----------------------------------------------------------------
-- 3b. ANTI-RECURSION HELPERS — every "is this person the leader/a
--    member of this group" check anywhere below goes through one of
--    these instead of an inline subquery. Reason: a plain subquery
--    inside a purchases policy that touches groups, combined with a
--    groups policy that touches purchases back, creates a genuine
--    circular dependency — Postgres has to expand each table's
--    RLS-augmented query to evaluate the other's, forever, and errors
--    with "infinite recursion detected in policy for relation ...".
--    SECURITY DEFINER functions break the cycle: the query inside
--    them runs with the function owner's privileges, bypassing RLS
--    on the table it touches, instead of re-triggering that table's
--    policies. Defined here (before section 4 uses the first one) so
--    CREATE POLICY — which validates function calls immediately,
--    unlike plpgsql function bodies — never hits a "does not exist".
-- ----------------------------------------------------------------
create or replace function is_group_leader(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from groups g where g.id = p_group_id and g.leader_user_id = p_user_id);
$$;

create or replace function is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from purchases p where p.group_id = p_group_id and p.user_id = p_user_id);
$$;

create or replace function is_leader_of_purchase_group(p_purchase_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from purchases p
    join groups g on g.id = p.group_id
    where p.id = p_purchase_id and g.leader_user_id = p_user_id
  );
$$;

grant execute on function is_group_leader(uuid, uuid) to authenticated;
grant execute on function is_group_member(uuid, uuid) to authenticated;
grant execute on function is_leader_of_purchase_group(uuid, uuid) to authenticated;

-- ----------------------------------------------------------------
-- 4. GROUPS RLS — safe now, purchases.group_id exists.
-- ----------------------------------------------------------------
alter table groups enable row level security;

drop policy if exists "select groups you belong to" on groups;
create policy "select groups you belong to" on groups
  for select using (
    leader_user_id = auth.uid()
    or is_group_member(id, auth.uid())
  );

drop policy if exists "leader can create own group" on groups;
create policy "leader can create own group" on groups
  for insert with check (leader_user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert on groups to authenticated;

-- ----------------------------------------------------------------
-- 5. IDENTITY-AWARE verify_delegate_id()
--    p_expected_email is optional — pass it for team-mate checks
--    (where you're confirming an ID against a specific email the
--    leader/teammate typed in). Omit it for plain self-lookups.
--    is_self is true only when the ID's owner is the CURRENTLY
--    LOGGED-IN caller — this is what individual event registration
--    now checks instead of mere existence.
-- ----------------------------------------------------------------
drop function if exists verify_delegate_id(text);

create or replace function verify_delegate_id(p_delegate_id text, p_expected_email text default null)
returns table(
  full_name text,
  college text,
  phone text,
  pass_codes text[],
  is_self boolean,
  email_match boolean,
  is_group_member boolean
)
language plpgsql
security definer
as $$
begin
  return query
    select
      p.full_name,
      p.college,
      p.phone,
      p.pass_codes,
      (p.user_id = auth.uid()) as is_self,
      (p_expected_email is not null and lower(p.email) = lower(trim(p_expected_email))) as email_match,
      (p.group_id is not null) as is_group_member
    from purchases p
    where p.delegate_id = upper(trim(p_delegate_id))
      and p.payment_status in ('APPROVED', 'PENDING_VERIFICATION')
    order by p.created_at desc
    limit 1;
end;
$$;

grant execute on function verify_delegate_id(text, text) to authenticated;

-- ----------------------------------------------------------------
-- 6. search_delegate_ids() — team-mate autosuggest. Deliberately
--    returns only name + ID (no email/phone) since this is reachable
--    for any Delegate ID, not just the caller's own or their group's.
--    Server-side floor of 2 characters — mirrors the client-side gate
--    but can't be bypassed by calling the RPC directly.
-- ----------------------------------------------------------------
create or replace function search_delegate_ids(p_prefix text, p_limit int default 8)
returns table(delegate_id text, full_name text)
language plpgsql
security definer
as $$
begin
  if p_prefix is null or length(trim(p_prefix)) < 2 then
    raise exception 'Prefix must be at least 2 characters';
  end if;

  return query
    select p.delegate_id, p.full_name
    from purchases p
    where p.delegate_id ilike upper(trim(p_prefix)) || '%'
      and p.payment_status in ('APPROVED', 'PENDING_VERIFICATION')
    order by p.delegate_id
    limit least(greatest(p_limit, 1), 20);
end;
$$;

grant execute on function search_delegate_ids(text, int) to authenticated;

-- ----------------------------------------------------------------
-- 7. search_group_members() — leader-only. Returns only members of
--    a group the CALLER actually leads (checked server-side, not
--    trusted from the client), for the Group ID delegate dropdown.
-- ----------------------------------------------------------------
create or replace function search_group_members(p_group_id uuid, p_prefix text default '')
returns table(delegate_id text, full_name text, user_id uuid)
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from groups g where g.id = p_group_id and g.leader_user_id = auth.uid()) then
    raise exception 'Not the leader of this group';
  end if;

  return query
    select p.delegate_id, p.full_name, p.user_id
    from purchases p
    where p.group_id = p_group_id
      and (p_prefix = '' or p.delegate_id ilike '%' || upper(trim(p_prefix)) || '%' or p.full_name ilike '%' || trim(p_prefix) || '%')
    order by p.delegate_id;
end;
$$;

grant execute on function search_group_members(uuid, text) to authenticated;

-- ----------------------------------------------------------------
-- 8. LEADER RLS — additive policies alongside the existing "own row"
--    ones from migration.sql (Postgres OR's multiple permissive
--    policies together for the same command).
-- ----------------------------------------------------------------
drop policy if exists "leader insert group member purchases" on purchases;
create policy "leader insert group member purchases" on purchases
  for insert with check (group_id is not null and is_group_leader(group_id, auth.uid()));

drop policy if exists "leader select group member purchases" on purchases;
create policy "leader select group member purchases" on purchases
  for select using (group_id is not null and is_group_leader(group_id, auth.uid()));

drop policy if exists "leader insert group event registrations" on event_registrations;
create policy "leader insert group event registrations" on event_registrations
  for insert with check (is_leader_of_purchase_group(purchase_id, auth.uid()));

drop policy if exists "leader select group event registrations" on event_registrations;
create policy "leader select group event registrations" on event_registrations
  for select using (is_leader_of_purchase_group(purchase_id, auth.uid()));

-- ----------------------------------------------------------------
-- 9. PROFILE EDITING — column-scoped grants so the client can only
--    ever touch the safe identity fields, never payment_status,
--    delegate_id, amounts, etc., no matter what it sends.
-- ----------------------------------------------------------------
drop policy if exists "update own purchases" on purchases;
create policy "update own purchases" on purchases
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "leader update group member purchases" on purchases;
create policy "leader update group member purchases" on purchases
  for update
  using (is_group_leader(group_id, auth.uid()))
  with check (is_group_leader(group_id, auth.uid()));

grant update (full_name, phone, college, year_of_study) on purchases to authenticated;

drop policy if exists "update own event registrations" on event_registrations;
create policy "update own event registrations" on event_registrations
  for update
  using (exists (select 1 from purchases where purchases.id = event_registrations.purchase_id and purchases.user_id = auth.uid()))
  with check (exists (select 1 from purchases where purchases.id = event_registrations.purchase_id and purchases.user_id = auth.uid()));

drop policy if exists "leader update group event registrations" on event_registrations;
create policy "leader update group event registrations" on event_registrations
  for update
  using (is_leader_of_purchase_group(purchase_id, auth.uid()))
  with check (is_leader_of_purchase_group(purchase_id, auth.uid()));

grant update (participant_name, participant_whatsapp) on event_registrations to authenticated;

-- ----------------------------------------------------------------
-- 10. VERIFICATION-RESET TRIGGERS
-- ----------------------------------------------------------------
create or replace function reset_verification_on_purchase_edit()
returns trigger
language plpgsql
as $$
begin
  if OLD.payment_status = 'APPROVED'
     and NEW.payment_status = OLD.payment_status
     and (
       OLD.full_name is distinct from NEW.full_name
       or OLD.phone is distinct from NEW.phone
       or OLD.college is distinct from NEW.college
       or OLD.year_of_study is distinct from NEW.year_of_study
     )
  then
    NEW.payment_status := 'PENDING_VERIFICATION';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_reset_verification_purchase on purchases;
create trigger trg_reset_verification_purchase
  before update on purchases
  for each row execute function reset_verification_on_purchase_edit();

-- Editing a registration's participant details resets the PARENT
-- purchase back to pending too (the parent's own row didn't change,
-- so the trigger above alone wouldn't catch this).
create or replace function reset_verification_on_event_reg_edit()
returns trigger
language plpgsql
security definer
as $$
begin
  if (OLD.participant_name is distinct from NEW.participant_name
      or OLD.participant_whatsapp is distinct from NEW.participant_whatsapp) then
    update purchases
      set payment_status = 'PENDING_VERIFICATION'
      where id = NEW.purchase_id and payment_status = 'APPROVED';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_reset_verification_event_reg on event_registrations;
create trigger trg_reset_verification_event_reg
  before update on event_registrations
  for each row execute function reset_verification_on_event_reg_edit();

-- ----------------------------------------------------------------
-- 11. ADMIN — list all groups (mirrors get_admin_purchases() etc.
--     from migration.sql; uses the SAME admin passcode you already
--     set there — no second passcode to manage). If you haven't
--     replaced 'CHANGE_ME' with your real passcode yet, do that here
--     AND in migration.sql so they match.
-- ----------------------------------------------------------------
create or replace function get_admin_groups(admin_key text)
returns setof groups
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'CHANGE_ME' then
    raise exception 'Unauthorized';
  end if;
  return query select * from groups order by created_at desc;
end;
$$;

-- ============================================================
-- End of migration v6. After running this:
-- 1. Existing 7-character Delegate IDs from before this update stay
--    valid as-is (nothing renames or re-issues old IDs) — only NEW
--    IDs generated from now on are 8 characters (or 13 for group
--    members). Both lengths are accepted everywhere IDs are checked.
-- 2. No changes needed to the "payment-screenshots" storage bucket
--    or its policies (fix_storage_rls.sql still applies as-is).
-- 3. get_admin_groups() re-uses the SAME passcode you already set in
--    migration.sql's admin functions — replace 'CHANGE_ME' in BOTH
--    files with your real passcode so they match.
-- ============================================================
