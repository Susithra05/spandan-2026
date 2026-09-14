-- ============================================================
-- SPANDAN 2026 — Migration v5
-- ============================================================
-- Two changes, both from the same v6 update round:
--
-- 1. UTR / UPI TRANSACTION REFERENCE NUMBER
--    Every checkout (Pass Checkout and Event Checkout) now collects
--    a compulsory 12-digit UTR number so the committee can cross-
--    check submitted payments against the college's bank/UPI
--    statement. Stored on both `purchases` (one per checkout) and
--    `event_registrations` (denormalized copy per line item, so the
--    Admin "Event Registrations Master" table can show it directly
--    without a join).
--
-- 2. IMMEDIATE PASS UNLOCKING
--    Events now unlock the moment a pass/tier purchase is SUBMITTED
--    (payment_status = 'PENDING_VERIFICATION'), not only once a
--    committee member approves it. REJECTED still locks events back
--    up. The client-side gating in App.jsx already queries for
--    ('APPROVED', 'PENDING_VERIFICATION') — this updates the
--    verify_delegate_id() function so server-side teammate ID
--    validation (used in the team-registration flow) applies the
--    exact same rule, instead of only recognising APPROVED delegates.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. UTR NUMBER COLUMNS
-- ----------------------------------------------------------------
alter table purchases
  add column if not exists utr_number text;

alter table event_registrations
  add column if not exists utr_number text;

-- No RLS/grant changes needed — both tables already have insert/
-- select policies and grants from migration.sql + fix_rls.sql that
-- cover these new columns automatically (policies are per-row, not
-- per-column).

-- ----------------------------------------------------------------
-- 2. verify_delegate_id() — now also accepts PENDING_VERIFICATION,
--    matching the immediate-unlock rule. Postgres won't let you
--    change a function's return type with CREATE OR REPLACE, but the
--    return shape here is unchanged from migration_v4.sql, so a
--    plain replace is enough (no drop needed).
-- ----------------------------------------------------------------
create or replace function verify_delegate_id(p_delegate_id text)
returns table(full_name text, college text, pass_codes text[])
language plpgsql
security definer
as $$
begin
  return query
    select p.full_name, p.college, p.pass_codes
    from purchases p
    where p.delegate_id = p_delegate_id
      and p.payment_status in ('APPROVED', 'PENDING_VERIFICATION');
end;
$$;

grant execute on function verify_delegate_id(text) to authenticated;
