// api/submit-group-purchase.js
//
// POST {
//   leader: { fullName, phone, college, yearOfStudy, passCodes, idCardUrl },
//   paymentScreenshotUrl, utrNumber, isFree,
//   members: [{ email, fullName, phone, college, yearOfStudy, idCardUrl, passCodes }]
// }
// Auth: Authorization: Bearer <caller's Supabase access token>
//
// Replaces the old client-side sequential loop (one provision call +
// one insert per member) with a single atomic operation:
//   1. Provision (find-or-create) every member's Supabase Auth
//      account. Idempotent — safe to retry the whole request if step
//      2 below fails, since re-running this just finds the
//      already-existing accounts instead of erroring.
//   2. Call the create_group_purchase() Postgres function ONCE, with
//      every member's resolved user_id — this does the group row +
//      every purchase row in a single DB transaction. If it throws
//      for ANY reason (bad data, a constraint violation, a mid-way
//      failure), NONE of the database rows are left behind.
//   3. Only on a step-2 failure: best-effort delete any Auth accounts
//      THIS REQUEST just created (never a pre-existing one), so a
//      retry with the same emails starts clean instead of hitting
//      "account already exists" on a half-finished group.
//   4. Only once step 2 fully succeeds: fire the invite/confirmation
//      emails. Emails never fire before the group is actually
//      guaranteed to exist — fixes the old "premature invite email on
//      a checkout that might still fail" gap.
//
// Payment screenshot / ID card files are uploaded to Supabase Storage
// by the CLIENT before calling this endpoint (same as before) — this
// function only ever receives the resulting public URLs as strings.
//
// Returns { groupId, groupCode, leaderDelegateId, members: [...] }.

import { getAdminClient, getCallerScopedClient, getCallerFromRequest, setCors, findUserByEmail, deleteJustCreatedUsers } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const caller = await getCallerFromRequest(req);
    if (!caller || !token) return res.status(401).json({ error: "Not authenticated" });

    const { leader, paymentScreenshotUrl, utrNumber, isFree, members } = req.body || {};
    if (!leader || !Array.isArray(leader.passCodes) || leader.passCodes.length === 0) {
      return res.status(400).json({ error: "Select at least one Pass/Tier for the group" });
    }
    const memberList = Array.isArray(members) ? members : [];
    if (memberList.length > 14) {
      return res.status(400).json({ error: "Maximum limit of 15 members reached" });
    }
    if (!isFree) {
      if (!paymentScreenshotUrl) return res.status(400).json({ error: "Payment screenshot is required" });
      if (!/^\d{12}$/.test(utrNumber || "")) return res.status(400).json({ error: "Enter a valid 12-digit UTR number" });
    }
    for (const m of memberList) {
      if (!m.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) {
        return res.status(400).json({ error: `Invalid email address for a group member: "${m.email || ""}"` });
      }
      if (!m.fullName?.trim()) return res.status(400).json({ error: `Missing name for member ${m.email}` });
      if (!m.phone?.trim()) return res.status(400).json({ error: `Phone number is required for every group member (${m.email}).` });
      if (!m.idCardUrl) return res.status(400).json({ error: `College ID card is required for every group member (${m.email}).` });
    }
    const emails = memberList.map((m) => m.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      return res.status(400).json({ error: "The same member email was entered twice" });
    }

    const admin = getAdminClient();

    // --- Step 1: provision every member's account (idempotent) ---
    const provisioned = []; // { user_id, email, created }
    const justCreatedIds = [];
    for (const m of memberList) {
      const email = m.email.trim();
      let user = await findUserByEmail(admin, email);
      let created = false;
      if (!user) {
        const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { full_name: m.fullName || null },
        });
        if (inviteErr) {
          // Roll back any accounts we juuust created earlier in this
          // same loop before failing the whole request.
          await deleteJustCreatedUsers(admin, justCreatedIds);
          return res.status(500).json({ error: `Couldn't set up an account for ${email}: ${inviteErr.message}` });
        }
        user = invited.user;
        created = true;
        justCreatedIds.push(user.id);
      }
      provisioned.push({ user_id: user.id, email, created });
    }

    // --- Step 2: single atomic DB transaction for every row ---
    const rpcMembers = memberList.map((m, i) => ({
      user_id: provisioned[i].user_id,
      full_name: m.fullName,
      email: m.email.trim().toLowerCase(),
      phone: m.phone,
      college: m.college || leader.college,
      year_of_study: m.yearOfStudy || leader.yearOfStudy,
      id_card_url: m.idCardUrl,
      pass_codes: Array.isArray(m.passCodes) && m.passCodes.length > 0 ? m.passCodes : leader.passCodes,
    }));

    // create_group_purchase() checks auth.uid() internally, so this
    // call must go through a client authenticated AS THE LEADER
    // (their own token) rather than the service-role admin client,
    // which has no "logged-in user" of its own.
    const scoped = getCallerScopedClient(token);
    const { data: rpcData, error: rpcErr } = await scoped.rpc("create_group_purchase", {
      p_leader_name: leader.fullName,
      p_leader_phone: leader.phone,
      p_leader_college: leader.college,
      p_leader_year: leader.yearOfStudy,
      p_leader_pass_codes: leader.passCodes,
      p_leader_id_card_url: leader.idCardUrl,
      p_payment_screenshot_url: paymentScreenshotUrl || null,
      p_utr_number: isFree ? null : utrNumber,
      p_is_free: !!isFree,
      p_members: rpcMembers,
    });

    if (rpcErr) {
      await deleteJustCreatedUsers(admin, justCreatedIds);
      return res.status(500).json({ error: rpcErr.message || "Group registration failed while saving records" });
    }

    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    const resultMembers = row?.out_members || [];

    // --- Step 3: emails only now the group is guaranteed to exist ---
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Spandan 2026 <onboarding@resend.dev>";
    if (apiKey) {
      const sendOne = async (to, subject, html) => {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from, to, subject, html }),
          });
        } catch (err) {
          console.error("submit-group-purchase: notification email failed (non-blocking):", err.message);
        }
      };
      for (const m of resultMembers) {
        if (m.is_leader) continue;
        await sendOne(
          m.email,
          `Spandan 2026 — ${leader.fullName} added you to a group`,
          `<p>Hi ${m.full_name || "there"},</p><p><b>${leader.fullName}</b> added you to Group <b>${row.out_group_code}</b> for Spandan 2026.</p><p>Your Delegate ID: <b>${m.delegate_id}</b></p><p>Check your inbox for a separate email to set your password, or sign in with Google using this same email address.</p><p>— Team Spandan 2026, JIPMER</p>`
        );
      }
    }

    return res.status(200).json({
      groupId: row?.out_group_id,
      groupCode: row?.out_group_code,
      leaderDelegateId: row?.out_leader_delegate_id,
      members: resultMembers,
    });
  } catch (err) {
    console.error("submit-group-purchase error:", err);
    return res.status(500).json({ error: err.message || "Group registration failed" });
  }
}
