// api/send-notification.js
//
// POST { type, to, data }
// Auth: Authorization: Bearer <caller's Supabase access token>
//
// Thin wrapper around the Resend REST API (no SDK dependency needed).
// Every call site in the app treats failures here as non-fatal —
// a flaky email should never block someone's registration.

import { getCallerFromRequest, setCors } from "./_supabaseAdmin.js";

const TEMPLATES = {
  pass_purchase: ({ fullName, delegateId, amount }) => ({
    subject: `Spandan 2026 — Pass Registration Received (${delegateId || ""})`,
    html: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>We've received your Spandan 2026 pass registration.</p>
      <p><b>Delegate ID:</b> ${escapeHtml(delegateId || "—")}<br/>
      <b>Amount:</b> ₹${amount ?? 0}<br/>
      <b>Status:</b> Pending Verification</p>
      <p>You'll get another email as soon as the committee verifies your payment.</p>
      <p>— Team Spandan 2026, JIPMER</p>`,
  }),
  event_registration: ({ fullName, events, amount }) => ({
    subject: `Spandan 2026 — Event Registration Received`,
    html: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Your registration for <b>${escapeHtml(events)}</b> has been received.</p>
      <p><b>Amount:</b> ₹${amount ?? 0}<br/><b>Status:</b> Pending Verification</p>
      <p>— Team Spandan 2026, JIPMER</p>`,
  }),
  status_change: ({ fullName, delegateId, status }) => ({
    subject: `Spandan 2026 — Your Registration is now ${status}`,
    html: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Your registration${delegateId ? ` (Delegate ID <b>${escapeHtml(delegateId)}</b>)` : ""} has been updated to: <b>${escapeHtml(status)}</b>.</p>
      <p>— Team Spandan 2026, JIPMER</p>`,
  }),
  group_invite: ({ fullName, groupCode, delegateId, leaderName }) => ({
    subject: `Spandan 2026 — ${leaderName} added you to a group`,
    html: `<p>Hi ${escapeHtml(fullName || "there")},</p>
      <p><b>${escapeHtml(leaderName)}</b> added you to Group <b>${escapeHtml(groupCode)}</b> for Spandan 2026.</p>
      <p>Your Delegate ID: <b>${escapeHtml(delegateId)}</b></p>
      <p>Check your inbox for a separate email to set your password, or sign in with Google using this same email address.</p>
      <p>— Team Spandan 2026, JIPMER</p>`,
  }),
};

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const caller = await getCallerFromRequest(req);
    if (!caller) return res.status(401).json({ error: "Not authenticated" });

    const { type, to, data } = req.body || {};
    const build = TEMPLATES[type];
    if (!build || !to) return res.status(400).json({ error: "Invalid 'type' or missing 'to'" });

    const { subject, html } = build(data || {});
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Spandan 2026 <onboarding@resend.dev>";
    if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY not configured on the server" });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      throw new Error(`Resend error: ${errText}`);
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("send-notification error:", err);
    return res.status(500).json({ error: err.message || "Failed to send email" });
  }
}
