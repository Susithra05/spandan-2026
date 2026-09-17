// api/provision-group-member.js
//
// POST { email, fullName, groupId }
// Auth: Authorization: Bearer <caller's Supabase access token>
//
// Called once per teammate email during a Group Leader's pass
// purchase. Verifies the caller actually leads the given group (so a
// random authenticated user can't mint accounts into someone else's
// group), then either:
//   - finds the existing Supabase Auth user for that email, or
//   - creates one via inviteUserByEmail(), which also sends Supabase's
//     built-in invite email (a magic link the member uses to set their
//     own password). They can also just "Sign in with Google" using
//     the same email later — Supabase will match it to this account
//     as long as email confirmation / account linking is enabled in
//     Authentication → Settings on your Supabase project.
//
// Returns { user_id, email, created }.

import { getAdminClient, getCallerFromRequest, setCors, findUserByEmail } from "./_supabaseAdmin.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const caller = await getCallerFromRequest(req);
    if (!caller) return res.status(401).json({ error: "Not authenticated" });

    const { email, fullName, groupId } = req.body || {};
    if (!email || !groupId) {
      return res.status(400).json({ error: "email and groupId are required" });
    }

    const admin = getAdminClient();

    const { data: group, error: groupErr } = await admin
      .from("groups")
      .select("id, leader_user_id")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) return res.status(404).json({ error: "Group not found" });
    if (group.leader_user_id !== caller.id) {
      return res.status(403).json({ error: "Only this group's leader can add members to it" });
    }

    let user = await findUserByEmail(admin, email);
    let created = false;

    if (!user) {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName || null, spandan_group_id: groupId },
      });
      if (inviteErr) throw inviteErr;
      user = invited.user;
      created = true;
    }

    return res.status(200).json({ user_id: user.id, email: user.email, created });
  } catch (err) {
    console.error("provision-group-member error:", err);
    return res.status(500).json({ error: err.message || "Provisioning failed" });
  }
}
