// src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { tiers, clubPasses } from "../data/festData";

function passLabel(code) {
  const tier = tiers.find((t) => t.id === code);
  if (tier) return tier.name;
  const club = clubPasses.find((p) => p.id === code);
  return club ? club.name : code;
}

const statusStyle = {
  APPROVED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/40",
  PENDING_VERIFICATION: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};
const statusLabel = {
  APPROVED: "✓ Accepted / Approved",
  REJECTED: "✗ Rejected",
  PENDING_VERIFICATION: "⏳ Verification Pending",
};

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Intern", "PG/Resident"];

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback for older / permission-denied browsers
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <button
      onClick={doCopy}
      title="Copy Delegate ID"
      className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-parchment-50 text-[10px] font-bold transition"
    >
      {copied ? (
        <>✓ Copied</>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// Inline edit form for one purchase row's editable identity fields.
// Used both for a person's own card and, for Group Leaders, for each
// of their group members. The actual permission check (own row vs.
// leader-of-that-group) is enforced server-side by RLS — this
// component doesn't need to know which case it's in.
function EditableIdentityFields({ purchase, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: purchase.full_name || "",
    phone: purchase.phone || "",
    college: purchase.college || "",
    year_of_study: purchase.year_of_study || YEAR_OPTIONS[0],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedNotice, setSavedNotice] = useState("");

  const startEdit = () => {
    setForm({
      full_name: purchase.full_name || "",
      phone: purchase.phone || "",
      college: purchase.college || "",
      year_of_study: purchase.year_of_study || YEAR_OPTIONS[0],
    });
    setSaveError("");
    setSavedNotice("");
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    const wasApproved = purchase.payment_status === "APPROVED";
    // Only ever sends these four columns — the database itself only
    // grants UPDATE on these (see migration_v6.sql), so this can't be
    // abused to touch payment_status, delegate_id, or amounts even if
    // someone tampered with the client.
    const { error } = await supabase
      .from("purchases")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.replace(/\D/g, "").slice(0, 10),
        college: form.college.trim(),
        year_of_study: form.year_of_study,
      })
      .eq("id", purchase.id);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setEditing(false);
    if (wasApproved) {
      setSavedNotice("Saved — since this was already Approved, it's back to Pending Verification until the committee re-checks it.");
    } else {
      setSavedNotice("Saved.");
    }
    if (onSaved) onSaved();
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-parchment-100/60 space-y-0.5">
          <p>{purchase.full_name}</p>
          <p>
            {purchase.phone} · {purchase.college} {purchase.year_of_study ? `· ${purchase.year_of_study}` : ""}
          </p>
          {savedNotice && <p className="text-amber-300">{savedNotice}</p>}
        </div>
        <button onClick={startEdit} className="text-lantern-300 text-[11px] font-semibold hover:underline shrink-0">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {saveError && <p className="text-[11px] text-red-400">{saveError}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          placeholder="Full Name"
          className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
        />
        <input
          value={form.phone}
          maxLength={10}
          inputMode="numeric"
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
          placeholder="Phone"
          className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
        />
        <input
          value={form.college}
          onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
          placeholder="College"
          className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
        />
        <select
          value={form.year_of_study}
          onChange={(e) => setForm((f) => ({ ...f, year_of_study: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setEditing(false)} disabled={saving} className="px-4 py-1.5 rounded-full bg-white/10 text-parchment-50 text-[11px] font-bold">
          Cancel
        </button>
        <button onClick={save} disabled={saving} className="px-4 py-1.5 rounded-full bg-lantern-400 text-canopy-950 text-[11px] font-bold disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function Profile({ user, setActiveTab }) {
  const [purchases, setPurchases] = useState([]);
  const [events, setEvents] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({}); // { [groupId]: purchase[] }
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setPurchases(p || []);

    if (p && p.length > 0) {
      const { data: ev } = await supabase
        .from("event_registrations")
        .select("*")
        .in("purchase_id", p.map((row) => row.id))
        .order("created_at", { ascending: false });
      setEvents(ev || []);
    } else {
      setEvents([]);
    }

    const { data: groups } = await supabase.from("groups").select("*").eq("leader_user_id", user.id).order("created_at", { ascending: false });
    setMyGroups(groups || []);

    if (groups && groups.length > 0) {
      const membersByGroup = {};
      for (const g of groups) {
        const { data: members } = await supabase.from("purchases").select("*").eq("group_id", g.id).order("delegate_id");
        membersByGroup[g.id] = members || [];
      }
      setGroupMembers(membersByGroup);
    } else {
      setGroupMembers({});
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="glow-card p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
        <p className="text-parchment-100/80 text-sm">Please log in to view your profile.</p>
        <button onClick={() => setActiveTab("auth")} className="px-6 py-2.5 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm">
          Login / Sign Up
        </button>
      </div>
    );
  }

  const activeDelegateId = purchases.find((p) => p.delegate_id)?.delegate_id;
  const primaryPurchase = purchases.find((p) => p.delegate_id);
  // Every purchase now shares ONE canonical Delegate ID (Section 2.3) —
  // buying a 2nd/3rd pass updates that same ID in place rather than
  // minting a disconnected new one. The card above always reflects
  // your MOST RECENT purchase's own status, so a newly bought pass
  // shows as pending right here even though the ID itself is the same
  // one already printed on an earlier, already-approved pass — "Your
  // Checkouts" below lists every purchase's own status individually.
  const passPurchases = purchases.filter((p) => p.pass_codes && p.pass_codes.length > 0 && p.delegate_id);
  const hasMultiplePassPurchases = passPurchases.length > 1;

  // Each event registration now carries its OWN status (Section 5.1 —
  // it's no longer just inherited from its parent purchase).
  const statusForEvent = (e) => e.payment_status || "PENDING_VERIFICATION";

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-display text-4xl md:text-5xl font-black text-lantern-200 glow-text">My Profile</h2>
        <div className="vine-divider w-40 mx-auto" />
      </div>

      {loading ? (
        <p className="text-center text-sm text-parchment-100/60">Loading your reverie...</p>
      ) : (
        <>
          {/* Delegate ID Card */}
          {activeDelegateId ? (
            <div className="relative max-w-md mx-auto p-7 rounded-3xl bg-gradient-to-br from-lantern-600/40 via-berry-700/30 to-canopy-900 border-2 border-lantern-400/50 shadow-[0_8px_32px_-8px_rgba(240,169,60,0.4)] overflow-hidden">
              <div className="absolute top-3 right-4 text-4xl opacity-20">✦</div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-lantern-200/80 font-bold">Spandan '26 Delegate</p>
              <div className="flex items-center mt-1">
                <p className="text-3xl font-mono font-black text-parchment-50 tracking-wider">{activeDelegateId}</p>
                <CopyButton value={activeDelegateId} />
              </div>
              <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs gap-2">
                <div className="flex-1">
                  <p className="text-parchment-100/60">{primaryPurchase?.full_name}</p>
                  <p className="text-parchment-100/60">{primaryPurchase?.college}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                    statusStyle[primaryPurchase?.payment_status] || statusStyle.PENDING_VERIFICATION
                  }`}
                >
                  {statusLabel[primaryPurchase?.payment_status] || statusLabel.PENDING_VERIFICATION}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/15">
                <EditableIdentityFields purchase={primaryPurchase} onSaved={refresh} />
              </div>
              {hasMultiplePassPurchases && (
                <p className="mt-3 text-[10px] text-parchment-100/50 leading-relaxed">
                  This Delegate ID stays the same across every pass you buy — the status above is for your newest purchase. See "Your Checkouts"
                  below for each pass's own approval status.
                </p>
              )}
            </div>
          ) : (
            <div className="glow-card p-8 rounded-3xl text-center space-y-3 max-w-md mx-auto">
              <p className="text-sm text-parchment-100/70">You haven't registered for a Delegate Tier or Club Pass yet.</p>
              <button onClick={() => setActiveTab("registration")} className="px-6 py-2.5 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm">
                Register Now
              </button>
            </div>
          )}

          {/* Group Leader panel */}
          {myGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-display font-bold text-parchment-50">👑 Your Group{myGroups.length > 1 ? "s" : ""}</h3>
              {myGroups.map((g) => (
                <div key={g.id} className="glow-card p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-lantern-300">{g.group_code}</p>
                    <span className="text-[10px] text-parchment-100/50">{(groupMembers[g.id] || []).length} member(s)</span>
                  </div>
                  <div className="space-y-3 divide-y divide-white/5">
                    {(groupMembers[g.id] || []).map((m) => (
                      <div key={m.id} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono text-parchment-50">{m.delegate_id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[m.payment_status] || statusStyle.PENDING_VERIFICATION}`}>
                            {statusLabel[m.payment_status] || statusLabel.PENDING_VERIFICATION}
                          </span>
                        </div>
                        <EditableIdentityFields purchase={m} onSaved={refresh} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-parchment-100/50 text-center">
                To register events on behalf of a member, go to Registration → 2. Register for Events → switch to "Group ID".
              </p>
            </div>
          )}

          {/* Purchase history */}
          {purchases.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-display font-bold text-parchment-50">Your Checkouts</h3>
              {purchases.map((p) => (
                <div key={p.id} className="glow-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-parchment-50 font-semibold flex items-center">
                      {p.delegate_id ? (
                        <>
                          {p.delegate_id}
                          <CopyButton value={p.delegate_id} />
                          <span className="mx-1.5">·</span>
                        </>
                      ) : null}
                      {p.pass_codes.map(passLabel).join(", ") || `Events checkout`}
                    </div>
                    <div className="text-parchment-100/50">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lantern-300 font-bold">₹{p.total_amount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[p.payment_status] || statusStyle.PENDING_VERIFICATION}`}>
                      {statusLabel[p.payment_status] || statusLabel.PENDING_VERIFICATION}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Registered events */}
          {events.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-display font-bold text-parchment-50">Registered Events ({events.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map((e) => {
                  const status = statusForEvent(e);
                  return (
                    <div key={e.id} className="glow-card p-4 rounded-2xl text-xs space-y-2">
                      <div className="text-parchment-50 font-semibold">{e.event_title}</div>
                      <div className="text-parchment-100/50">
                        {e.is_team_event ? `Team of ${e.team_size}` : "Individual"} · {e.price > 0 ? `₹${e.price}` : "Free"}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[status] || statusStyle.PENDING_VERIFICATION}`}>
                        {statusLabel[status] || statusLabel.PENDING_VERIFICATION}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setActiveTab("registration")}
              className="px-6 py-2.5 rounded-full border-2 border-lantern-400/40 text-lantern-200 font-bold text-sm hover:bg-lantern-500/10"
            >
              + Register for More Events / Passes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
