# Spandan 2026 — v8 setup notes

## 1. Run the migration
In the Supabase SQL Editor, run `supabase/migration_v7.sql` in full
(after v3–v6 have already been applied, same as before). It's written
to be safe to re-run and won't overwrite anything an admin has already
edited via Table 3.

## 2. Check Vercel environment variables
No new secrets are required, but confirm these are all set on the
Vercel project (Settings → Environment Variables), since the new
`/api/submit-group-purchase` function needs the anon key server-side
too (previously only the browser build used it):

- `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_ANON_KEY` — **make sure this is available to
  Serverless Functions, not just the frontend build.** In Vercel's
  env var settings, each variable can be scoped to
  Production/Preview/Development — as long as it's not restricted to
  "Build time only", a Node serverless function can read it via
  `process.env`.
- `RESEND_API_KEY`, `RESEND_FROM`

## 3. Deploy
Redeploy as usual — `vercel.json` (new) fixes the password-reset
404-on-refresh issue by rewriting all non-`/api` paths to
`index.html`.

## 4. What changed in this version
See the comment block at the top of `supabase/migration_v7.sql` and
the inline comments throughout the changed files for the reasoning
behind each fix — they're written to double as documentation for
future sessions.

Known gaps intentionally NOT addressed in this pass (carried over,
still open):
- `utr_number` has no uniqueness/replay protection (legitimate group
  purchases share one UTR across every member's row, so a naive
  UNIQUE constraint would break that — needs a smarter per-transaction
  check, not a blanket column constraint).
- Payment screenshots / ID cards are still stored as public URLs
  (anyone with the link can view them) rather than behind
  signed/expiring URLs.
- The pass-rejection → event cascade (Section 5.2) assumes one active
  pass per delegate, which is true for Spandan's normal flow but
  isn't dependency-tracked per-event if someone ever holds two passes
  at once.
