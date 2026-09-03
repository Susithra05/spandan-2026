-- ============================================================
-- SPANDAN 2026 — Migration v3
-- ============================================================
-- Supports the new sequential flow: Passes and Events are now
-- bought in two SEPARATE checkouts (two separate `purchases` rows
-- per user — one with pass_codes set, one events-only with
-- pass_codes = '{}'). Each event registration now carries its own
-- verified Delegate ID + participant contact info directly, so the
-- Admin "Event Registrations Master" table doesn't need to jump
-- between two different purchases rows to show who registered.
-- ============================================================

alter table event_registrations
  add column if not exists delegate_id text,
  add column if not exists participant_name text,
  add column if not exists participant_whatsapp text;

create index if not exists idx_event_regs_delegate_id on event_registrations(delegate_id);

-- No RLS/grant changes needed — event_registrations already has
-- insert/select policies and grants from migration.sql + fix_rls.sql
-- that cover these new columns automatically (policies are per-row,
-- not per-column).
