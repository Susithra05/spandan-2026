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

export default function Profile({ user, setActiveTab }) {
  const [purchases, setPurchases] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPurchases(p || []);

      if (p && p.length > 0) {
        const { data: ev } = await supabase
          .from("event_registrations")
          .select("*")
          .in("purchase_id", p.map((row) => row.id))
          .order("created_at", { ascending: false });
        setEvents(ev || []);
      }
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="glow-card p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
        <p className="text-parchment-100/80 text-sm">Please log in to view your profile.</p>
        <button
          onClick={() => setActiveTab("auth")}
          className="px-6 py-2.5 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm"
        >
          Login / Sign Up
        </button>
      </div>
    );
  }

  const activeDelegateId = purchases.find((p) => p.delegate_id)?.delegate_id;
  const primaryPurchase = purchases.find((p) => p.delegate_id);

  // Look up each event's own status via its parent purchase (events are
  // bought in their own separate checkout, so their status is independent
  // of the pass purchase's status).
  const statusForPurchase = (purchaseId) => purchases.find((p) => p.id === purchaseId)?.payment_status || "PENDING_VERIFICATION";

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
              <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs">
                <div>
                  <p className="text-parchment-100/60">{primaryPurchase?.full_name}</p>
                  <p className="text-parchment-100/60">{primaryPurchase?.college}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    statusStyle[primaryPurchase?.payment_status] || statusStyle.PENDING_VERIFICATION
                  }`}
                >
                  {statusLabel[primaryPurchase?.payment_status] || statusLabel.PENDING_VERIFICATION}
                </span>
              </div>
            </div>
          ) : (
            <div className="glow-card p-8 rounded-3xl text-center space-y-3 max-w-md mx-auto">
              <p className="text-sm text-parchment-100/70">
                You haven't registered for a Delegate Tier or Club Pass yet.
              </p>
              <button
                onClick={() => setActiveTab("registration")}
                className="px-6 py-2.5 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm"
              >
                Register Now
              </button>
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
                  const status = statusForPurchase(e.purchase_id);
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
