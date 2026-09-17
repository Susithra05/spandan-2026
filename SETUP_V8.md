# Spandan 2026 — v8 Setup Guide

This covers everything new in v8: brochure/footer/payment-modal fixes,
Delegate ID identity verification, Group Registration, profile editing,
and transactional emails. Follow these steps **in order**.

## 1. Run the SQL migration

In the Supabase SQL Editor, run `supabase/migration_v6.sql` (after
`migration_v5.sql`, which should already be applied from v7).

Before running it, **also** go back and make sure you replaced every
`'CHANGE_ME'` in `supabase/migration.sql`'s four `get_admin_*` /
`admin_update_purchase_status` functions with your real admin
passcode — `migration_v6.sql` adds a fifth admin function
(`get_admin_groups`) that reuses the **same** passcode, so if you
haven't set it yet, set it now and re-run those five function
definitions together.

Nothing in this migration touches your existing data — old 7-character
Delegate IDs from before v8 stay valid forever; only *new* IDs
generated from now on are 8 characters (13 for group members).

## 2. Deploy the two new serverless functions

`api/provision-group-member.js` and `api/send-notification.js` are
plain Vercel serverless functions — Vercel picks them up automatically
on your next deploy, no config needed. They just need environment
variables set first:

In **Vercel → your project → Settings → Environment Variables**, add:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secret — never prefix with `VITE_`) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM` | Optional. A sender you've verified in Resend, e.g. `Spandan 2026 <noreply@jipmerspandan.site>`. Leave unset to use Resend's shared test sender while you're setting things up. |

`.env.example` in the repo root lists all of these for reference.

## 3. One Supabase Auth setting to check

For a Group Leader's teammates to be able to "Sign in with Google"
using the *same* email their account was auto-created with, your
Supabase project needs **Authentication → Settings → "Allow manual
linking of accounts"** (or your dashboard's equivalent wording)
enabled — otherwise Supabase treats an email/password identity and a
Google identity on the same address as two separate accounts. This is
a one-time dashboard toggle, not a code change.

## 4. What each open item now does

- **Brochure / Footer** — done, no setup needed.
- **Payment modal** — UPI ID + copy button + merchant name, Review
  Details step, and free-checkout bypass — done, no setup needed.
- **Delegate ID format** — new IDs are 8 chars (individual) or 13
  chars `G0XX-XXXXXXXX` (group). Enforced both client-side (regex +
  maxLength) and is otherwise just longer numeric suffixes from the
  same counters as before.
- **Identity verification** — registering yourself now checks the ID
  is actually *yours* (not just that it exists), with an autocomplete
  dropdown of your own IDs. Editing an autofilled name/phone away from
  what's on record blocks submission until you re-validate.
- **Group Registration** — new "👑 Group Registration" tab. Buying a
  pass there makes you a leader, generates a Group Code, and — for
  every teammate email you add — calls
  `/api/provision-group-member` to find-or-create their Supabase
  account before writing their purchase row.
- **Group delegation** — once you lead a group, the Events checkout
  screen shows an "Individual ID / Group ID" toggle; in Group ID mode
  you get a live autosuggest of just your own group's members.
- **Team-mate verification** — each team roster row now also asks for
  the team-mate's email, checked server-side against their Delegate
  ID (never exposes the actual email back to the browser), plus a
  type-to-search autosuggest.
- **Profile editing** — your own Profile page now has an "Edit" link
  on your identity fields, and (if you lead a group) an editable
  roster for every member. Editing anything on an already-`APPROVED`
  row automatically flips it back to `PENDING_VERIFICATION` — this
  happens in a database trigger, not in the app, so it can't be
  bypassed.
- **Emails** — pass purchase, event registration, group-member
  invites, and admin approve/reject all fire a Resend email via
  `/api/send-notification`. Every call site treats a failed email as
  non-fatal (logged to console, registration still succeeds) — the
  Admin Dashboard's approve/reject buttons specifically need the
  person operating it to have an active Spandan login in that browser
  tab (any account) for the "status changed" email to actually send,
  since the endpoint authenticates via Supabase session token.

## 5. Verified before delivery

- `npm run build` — full production build succeeds.
- Every changed/added file passed an `esbuild --bundle` check (catches
  missing imports/exports, not just syntax).
