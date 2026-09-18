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
 * Kept for any other call site that still needs a single provision
 * call — the main Group Registration flow now goes through
 * submitGroupPurchase() below instead, which does provisioning AND
 * the database writes as one atomic operation.
 */
export async function provisionGroupMember({ email, fullName, groupId }) {
  return callApi("/api/provision-group-member", { email, fullName, groupId });
}

/**
 * Runs an ENTIRE group purchase (member account provisioning + every
 * purchase row) as a single atomic server-side operation — either
 * everything is saved, or nothing is. Throws on failure; the caller's
 * form state is left untouched so the person can just retry (member
 * accounts that were already provisioned are found, not re-created).
 * Returns { groupId, groupCode, leaderDelegateId, members }.
 */
export async function submitGroupPurchase(payload) {
  return callApi("/api/submit-group-purchase", payload);
}

/**
 * Resolves (and, if needed, updates in place) the CALLER's own single
 * persistent Delegate ID for a new pass/tier purchase about to be
 * made. Returns { delegate_id, changed, previous_delegate_id }.
 * `changed` is true when this call actually updated the ID that's
 * printed on every one of the caller's existing purchase rows (e.g.
 * their pass combination now maps to a different prefix) — callers
 * should fire a delegate_id_updated notification in that case.
 */
export async function resolveMyDelegateId(newPassCodes) {
  const { data, error } = await supabase.rpc("resolve_my_delegate_id", { p_new_pass_codes: newPassCodes });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row || { delegate_id: null, changed: false, previous_delegate_id: null };
}

/**
 * Server-side authoritative recomputation of a purchase's base/events/
 * total amount from the live price catalog — called right after a
 * checkout finishes writing its rows, so the number that ends up
 * permanently stored was never trusted from the browser. Non-fatal on
 * failure (logged only) since the insert itself already succeeded;
 * worst case the displayed total is briefly stale until the next
 * admin/profile refresh.
 */
export async function recomputePurchaseAmount(purchaseId) {
  try {
    const { error } = await supabase.rpc("recompute_purchase_amount", { p_purchase_id: purchaseId });
    if (error) console.warn("recomputePurchaseAmount failed (non-blocking):", error.message);
  } catch (err) {
    console.warn("recomputePurchaseAmount failed (non-blocking):", err.message);
  }
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
