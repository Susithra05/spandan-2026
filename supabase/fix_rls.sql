-- ============================================================
-- SPANDAN 2026 — RLS Fix (run this after migration.sql)
-- ============================================================
-- Root cause: migration.sql created RLS *policies* on the new
-- tables, but never explicitly GRANTed the underlying INSERT/
-- SELECT privilege to the `authenticated` role. In Postgres,
-- privileges and RLS policies are two separate layers — a role
-- needs the base GRANT *first*; RLS then further restricts which
-- rows that grant applies to. Without the grant, every insert is
-- rejected before your policy is even evaluated, which Supabase
-- surfaces as: "new row violates row-level security policy".
-- ============================================================

grant usage on schema public to authenticated, anon;

grant select, insert on purchases to authenticated;
grant select, insert on event_registrations to authenticated;
grant select, insert on team_members to authenticated;
grant select on id_counters to authenticated;

-- ============================================================
-- DIAGNOSTIC — run this after the grants above to confirm both
-- layers are actually in place. You should see 3 rows for
-- privileges (purchases/event_registrations/team_members, each
-- with INSERT and SELECT) and 6 rows for policies (2 per table).
-- If either result is empty/short, that layer didn't get applied
-- — re-run the block above, or re-run migration.sql's policy
-- section (section 6) if policies are missing.
-- ============================================================

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('purchases', 'event_registrations', 'team_members')
  and grantee = 'authenticated'
order by table_name, privilege_type;

select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('purchases', 'event_registrations', 'team_members')
order by tablename, policyname;
