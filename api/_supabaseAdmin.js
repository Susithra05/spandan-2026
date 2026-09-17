// api/_supabaseAdmin.js
//
// Shared by every /api function. Holds the ONLY place in this codebase
// that touches the Supabase service role key — this file must never be
// imported by anything that ships to the browser (it isn't; everything
// under /api/ only ever runs on Vercel's server).
//
// Required Vercel environment variables (Project → Settings →
// Environment Variables):
//   SUPABASE_URL               — same value as VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  — Project Settings → API → service_role
//                                 (⚠️ secret — never prefix with VITE_,
//                                 that would ship it to the browser)
//   RESEND_API_KEY             — from resend.com (used by send-notification.js)
//   RESEND_FROM                — optional, e.g. "Spandan 2026 <noreply@yourdomain>"

import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Server misconfigured: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in Vercel env vars.");
  }
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

// The client sends the logged-in user's Supabase access token (from
// supabase.auth.getSession()) in the Authorization header. We verify
// it against Supabase Auth itself — this is what stops a random
// visitor from calling these endpoints and creating accounts/emails
// as if they were a group leader.
export async function getCallerFromRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Paginates through auth.users to find someone by email. Supabase's
// admin SDK doesn't expose a direct "get user by email" call, so this
// walks listUsers() a page at a time. Fine at college-fest scale
// (thousands of users, called only during group-purchase provisioning).
export async function findUserByEmail(admin, email) {
  const target = email.trim().toLowerCase();
  const perPage = 200;
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;
    if (data.users.length < perPage) return null;
  }
  return null;
}
