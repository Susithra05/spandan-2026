-- ============================================================
-- SPANDAN 2026 — Storage RLS Fix
-- ============================================================
-- The table grants (fix_rls.sql) are confirmed working. This is a
-- separate, second layer: Supabase Storage keeps its own RLS
-- policies on storage.objects, scoped per bucket. The existing
-- policy on "payment-screenshots" was written for the old flow's
-- upload paths and is rejecting the new app's paths
-- (id_cards/... and receipts/...).
-- ============================================================

-- Run this first to see what's currently configured on the bucket —
-- paste the output back if you want a second pair of eyes on it.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects';


-- The actual fix: a permissive INSERT + SELECT policy scoped to just
-- this bucket, that doesn't care about folder/path naming at all.
-- This is additive — Postgres OR's multiple permissive policies
-- together, so it works alongside whatever's already there without
-- needing to figure out/remove the old one.

drop policy if exists "spandan_upload_payment_screenshots" on storage.objects;
create policy "spandan_upload_payment_screenshots"
on storage.objects for insert
to authenticated
with check (bucket_id = 'payment-screenshots');

drop policy if exists "spandan_read_payment_screenshots" on storage.objects;
create policy "spandan_read_payment_screenshots"
on storage.objects for select
to public
using (bucket_id = 'payment-screenshots');

-- Diagnostic — confirm both new policies exist afterward:
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like 'spandan_%';
