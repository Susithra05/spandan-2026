// src/lib/serverApi.js
//
// Talks to the /api serverless functions (see /api/_supabaseAdmin.js
// for what lives server-side and why). These are relative paths, so
// they work automatically once deployed on Vercel. For local dev you
// need `vercel dev` (not plain `vite dev`) so the /api routes exist.

import { supabase } from "./supabase";

async function callApi(path, body) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request to ${path} failed (${res.status})`);
  return json;
}

/**
 * Finds or creates a Supabase Auth account for a group member's email.
 * Throws on failure — a group purchase can't proceed if a member's
 * account can't be provisioned, so callers should surface this error.
 */
export async function provisionGroupMember({ email, fullName, groupId }) {
  return callApi("/api/provision-group-member", { email, fullName, groupId });
}

/**
 * Fire-and-forget transactional email. Failures are logged but never
 * thrown — a flaky email provider should never block a registration
 * that otherwise succeeded in the database.
 */
export async function sendNotification(type, to, data) {
  if (!to) return;
  try {
    await callApi("/api/send-notification", { type, to, data });
  } catch (err) {
    console.warn("Email notification failed (non-blocking):", err.message);
  }
}
