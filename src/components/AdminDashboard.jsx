// src/components/AdminDashboard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { sendNotification } from "../lib/serverApi";
import { refreshLiveCatalog } from "../lib/liveCatalog";

const statusPill = {
  APPROVED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/40",
  PENDING_VERIFICATION: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusPill[status] || statusPill.PENDING_VERIFICATION}`}>
      {status === "PENDING_VERIFICATION" ? "PENDING" : status || "PENDING"}
    </span>
  );
}

function downloadCSV(filename, headers, rows) {
  const csvContent =
    "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// A small fixed palette used to give every multi-item purchase a
// consistent, distinguishable accent so bundled rows in Table 2 read
// as one group at a glance, without merging them into one row —
// each stays independently approvable/rejectable (Section 5.1).
const BUNDLE_ACCENTS = [
  "border-l-mist-400/70 shadow-[inset_3px_0_0_0_rgba(125,211,252,0.15)]",
  "border-l-lantern-400/70 shadow-[inset_3px_0_0_0_rgba(240,169,60,0.15)]",
  "border-l-berry-400/70 shadow-[inset_3px_0_0_0_rgba(236,72,153,0.15)]",
  "border-l-emerald-400/70 shadow-[inset_3px_0_0_0_rgba(52,211,153,0.15)]",
  "border-l-toadstool-400/70 shadow-[inset_3px_0_0_0_rgba(249,115,22,0.15)]",
];
function bundleAccentFor(purchaseId) {
  let hash = 0;
  for (let i = 0; i < purchaseId.length; i++) hash = (hash * 31 + purchaseId.charCodeAt(i)) >>> 0;
  return BUNDLE_ACCENTS[hash % BUNDLE_ACCENTS.length];
}

export default function AdminDashboard() {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [eventRegs, setEventRegs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [priceCatalog, setPriceCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Table 1 filters
  const [passSearch, setPassSearch] = useState("");
  const [passStatusFilter, setPassStatusFilter] = useState("ALL");

  // Table 2 filters
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [expandedEventRegId, setExpandedEventRegId] = useState(null);
  const [activeTable, setActiveTable] = useState("passes"); // "passes" | "events" | "catalog"

  // Table 3 (Event Master) filters + in-progress edits
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogDrafts, setCatalogDrafts] = useState({}); // { [code]: { price?, title_override? } }
  const [catalogSaving, setCatalogSaving] = useState(null); // code currently saving

  const adminKey = () => sessionStorage.getItem("spandan_admin_key") || passcode.trim();

  // ---------------------------------------------------------------
  // AUTH — previously, an RPC error (e.g. simply typing the WRONG
  // passcode) fell through to an UNAUTHENTICATED direct table query
  // and still marked the session as logged in, leaking real purchase
  // data to anyone who guessed wrong. There is no fallback path any
  // more: every one of these calls is admin_key-gated server-side,
  // and isAuthenticated only ever becomes true once ALL of them have
  // actually succeeded (Section 1.3).
  // ---------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const key = passcode.trim();

    try {
      const [purchasesRes, eventsRes, teamsRes, groupsRes, catalogRes] = await Promise.all([
        supabase.rpc("get_admin_purchases", { admin_key: key }),
        supabase.rpc("get_admin_event_registrations", { admin_key: key }),
        supabase.rpc("get_admin_team_members", { admin_key: key }),
        supabase.rpc("get_admin_groups", { admin_key: key }),
        supabase.rpc("admin_list_price_catalog", { admin_key: key }),
      ]);

      const firstError = purchasesRes.error || eventsRes.error || teamsRes.error || groupsRes.error || catalogRes.error;
      if (firstError) throw firstError;

      setPurchases(purchasesRes.data || []);
      setEventRegs(eventsRes.data || []);
      setTeamMembers(teamsRes.data || []);
      setGroups(groupsRes.data || []);
      setPriceCatalog(catalogRes.data || []);

      setIsAuthenticated(true);
      sessionStorage.setItem("spandan_admin_key", key);
    } catch (err) {
      setIsAuthenticated(false);
      setPurchases([]);
      setEventRegs([]);
      setTeamMembers([]);
      setGroups([]);
      setPriceCatalog([]);
      setErrorMsg("Invalid Passcode or Unauthorized Access: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseStatus = async (id, status) => {
    try {
      const { error } = await supabase.rpc("admin_update_purchase_status", {
        admin_key: adminKey(),
        p_id: id,
        p_status: status,
      });
      if (error) throw error;
      setPurchases((prev) => prev.map((r) => (r.id === id ? { ...r, payment_status: status } : r)));

      // Best-effort email — requires the admin's browser to have an
      // active Spandan login session (any account) since /api/send-
      // notification checks for a valid Supabase access token. If
      // nobody's logged in on this device, the status still updates
      // fine — only the email is skipped (logged to console).
      const row = purchases.find((r) => r.id === id);
      if (row?.email) {
        sendNotification("status_change", row.email, { fullName: row.full_name, delegateId: row.delegate_id, status });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Table 2's own independent status — previously this table had NO
  // status of its own and Approve/Reject actually mutated the PARENT
  // pass purchase (silently affecting every other event bought in the
  // same checkout too). Each event registration row is now approved
  // or rejected on its own (Section 5.1); a rejected PASS purchase
  // still cascades down to that person's pending/approved events
  // automatically server-side (migration_v7.sql trigger, Section 5.2).
  const updateEventStatus = async (id, status) => {
    try {
      const { error } = await supabase.rpc("admin_update_event_status", {
        admin_key: adminKey(),
        p_id: id,
        p_status: status,
      });
      if (error) throw error;
      setEventRegs((prev) => prev.map((r) => (r.id === id ? { ...r, payment_status: status } : r)));
      const row = eventRegs.find((r) => r.id === id);
      const parent = purchases.find((p) => p.id === row?.purchase_id);
      if (parent?.email) {
        sendNotification("status_change", parent.email, { fullName: row.participant_name, delegateId: row.delegate_id, status });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const teamForEventReg = (eventRegId) => teamMembers.filter((m) => m.event_registration_id === eventRegId);
  const purchaseFor = (purchaseId) => purchases.find((p) => p.id === purchaseId);
  const groupCodeFor = (groupId) => groups.find((g) => g.id === groupId)?.group_code;

  // ---------------- TABLE 1: Passes & Membership ----------------
  const passRows = purchases.filter((p) => p.pass_codes && p.pass_codes.length > 0);
  const filteredPassRows = passRows.filter((row) => {
    const term = passSearch.toLowerCase();
    const matchesSearch =
      !term ||
      row.full_name?.toLowerCase().includes(term) ||
      row.email?.toLowerCase().includes(term) ||
      row.college?.toLowerCase().includes(term) ||
      row.phone?.includes(term) ||
      row.delegate_id?.toLowerCase().includes(term);
    const matchesStatus = passStatusFilter === "ALL" || row.payment_status === passStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportPassesCSV = () => {
    const headers = [
      "Full Name", "Login Email", "WhatsApp Number", "College Name", "Year of Study",
      "College ID Photo URL", "Selected Passes/Tiers", "Payment Screenshot URL", "UTR Number",
      "Delegate ID", "Status", "Submitted At",
    ];
    const rows = filteredPassRows.map((r) => [
      `"${r.full_name || ""}"`, `"${r.email || ""}"`, `"${r.phone || ""}"`, `"${r.college || ""}"`,
      `"${r.year_of_study || ""}"`, `"${r.id_card_url || ""}"`, `"${(r.pass_codes || []).join("; ")}"`,
      `"${r.payment_screenshot_url || ""}"`, `"${r.utr_number || ""}"`, `"${r.delegate_id || ""}"`, `"${r.payment_status || "PENDING"}"`,
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);
    downloadCSV(`spandan_passes_master_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // ---------------- TABLE 2: Event Registrations ----------------
  const filteredEventRows = eventRegs.filter((row) => {
    const term = eventSearch.toLowerCase();
    const matchesSearch =
      !term ||
      row.participant_name?.toLowerCase().includes(term) ||
      row.delegate_id?.toLowerCase().includes(term) ||
      row.event_title?.toLowerCase().includes(term) ||
      row.participant_whatsapp?.includes(term);
    const status = row.payment_status || "PENDING_VERIFICATION";
    const matchesStatus = eventStatusFilter === "ALL" || status === eventStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // purchase_id -> row count, used to decide which rows get a bundle
  // accent (only purchases with MORE THAN ONE event row bother).
  const purchaseRowCounts = eventRegs.reduce((acc, r) => {
    acc[r.purchase_id] = (acc[r.purchase_id] || 0) + 1;
    return acc;
  }, {});

  const exportEventsCSV = () => {
    const headers = [
      "Delegate ID", "Participant Name", "WhatsApp Number", "Event Registered", "Sub Event", "Group Code",
      "Team Event", "Teammates (Name:ID)", "Payment Screenshot URL", "UTR Number", "Status", "Submitted At",
    ];
    const rows = filteredEventRows.map((r) => {
      const parent = purchaseFor(r.purchase_id);
      const roster = teamForEventReg(r.id);
      return [
        `"${r.delegate_id || ""}"`, `"${r.participant_name || ""}"`, `"${r.participant_whatsapp || ""}"`,
        `"${r.event_title || ""}"`, `"${r.sub_event || ""}"`, `"${groupCodeFor(parent?.group_id) || ""}"`,
        `"${r.is_team_event ? "Yes" : "No"}"`,
        `"${roster.map((m) => `${m.full_name}:${m.delegate_id}`).join("; ")}"`,
        `"${parent?.payment_screenshot_url || ""}"`, `"${r.utr_number || parent?.utr_number || ""}"`, `"${r.payment_status || "PENDING"}"`,
        `"${new Date(r.created_at).toLocaleString()}"`,
      ];
    });
    downloadCSV(`spandan_events_master_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // ---------------- TABLE 3: Event Master (price_catalog) ----------------
  const catalogEventRows = priceCatalog.filter((c) => c.kind === "event");
  const filteredCatalogRows = catalogEventRows.filter((row) => {
    const term = catalogSearch.toLowerCase();
    return !term || row.code.toLowerCase().includes(term) || row.base_label.toLowerCase().includes(term);
  });
  const liveRegCount = (code) =>
    eventRegs.filter((r) => {
      const rowCode = r.sub_event ? `${r.event_id}:${r.sub_event}` : r.event_id;
      return rowCode === code && r.payment_status !== "REJECTED";
    }).length;

  const draftFor = (code) => catalogDrafts[code] || {};
  const setDraft = (code, patch) => setCatalogDrafts((prev) => ({ ...prev, [code]: { ...prev[code], ...patch } }));

  const saveCatalogRow = async (code) => {
    const draft = draftFor(code);
    if (draft.price === undefined && draft.title_override === undefined) return;
    setCatalogSaving(code);
    try {
      const titleDraft = draft.title_override !== undefined ? draft.title_override.trim() : undefined;
      const { data, error } = await supabase.rpc("admin_update_price_catalog", {
        admin_key: adminKey(),
        p_code: code,
        p_price: draft.price !== undefined && draft.price !== "" ? Number(draft.price) : null,
        p_title_override: titleDraft ? titleDraft : null,
        // Emptying the box now RESETS the title back to the festData.js
        // original (before, blanking it silently did nothing).
        p_clear_title_override: titleDraft === "",
      });
      if (error) throw error;
      setPriceCatalog((prev) => prev.map((c) => (c.code === code ? data : c)));
      refreshLiveCatalog(); // push the change to the public Events / Registration tabs right away
      setCatalogDrafts((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setCatalogSaving(null);
    }
  };

  const toggleCatalogOpen = async (code, currentlyOpen) => {
    try {
      const { data, error } = await supabase.rpc("admin_update_price_catalog", {
        admin_key: adminKey(),
        p_code: code,
        p_registrations_open: !currentlyOpen,
      });
      if (error) throw error;
      setPriceCatalog((prev) => prev.map((c) => (c.code === code ? data : c)));
      refreshLiveCatalog();
    } catch (err) {
      alert("Failed to toggle: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="max-w-md mx-auto px-4 py-20">
        <div className="glow-card p-8 rounded-3xl border border-lantern-500/30 bg-[#16281f] shadow-[0_0_30px_rgba(240,169,60,0.2)] text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-lantern-500/20 border border-lantern-500/40 flex items-center justify-center text-xl">🔒</div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-parchment-50">Committee Portal</h2>
            <p className="text-xs text-slate-400">Enter committee passcode to view registration records.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 focus:border-lantern-500 text-parchment-50 text-sm outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50">
              {loading ? "Verifying..." : "Enter Portal"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 space-y-10">
      <h2 className="text-2xl font-black text-parchment-50 text-center">Committee Dashboard</h2>

      {/* Table toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1 flex-wrap justify-center">
          <button
            onClick={() => setActiveTable("passes")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTable === "passes" ? "bg-lantern-400 text-canopy-950" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Table 1: User Passes Master ({passRows.length})
          </button>
          <button
            onClick={() => setActiveTable("events")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTable === "events" ? "bg-toadstool-400 text-canopy-950" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Table 2: Event Registrations Master ({eventRegs.length})
          </button>
          <button
            onClick={() => setActiveTable("catalog")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTable === "catalog" ? "bg-mist-400 text-canopy-950" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Table 3: Event Master ({catalogEventRows.length})
          </button>
        </div>
      </div>

      {/* ============ TABLE 1: User Passes & Membership Master ============ */}
      {activeTable === "passes" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-xl font-display font-bold text-lantern-200">
            User Passes &amp; Membership Master <span className="text-sm text-slate-400 font-normal">({filteredPassRows.length})</span>
          </h3>
          <button onClick={exportPassesCSV} className="px-4 py-2 rounded-xl bg-mist-500 text-canopy-950 text-xs font-bold hover:bg-mist-400 transition">
            ⬇ Export Passes CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Search by Name, Delegate ID, College, Email, Phone..."
            value={passSearch}
            onChange={(e) => setPassSearch(e.target.value)}
            className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-parchment-50 text-xs outline-none focus:border-mist-500 transition"
          />
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING_VERIFICATION", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setPassStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  passStatusFilter === status ? "bg-lantern-400 text-canopy-950 font-bold" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {status === "PENDING_VERIFICATION" ? "PENDING" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#16281f]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Delegate ID</th>
                <th className="px-4 py-3">Name / College / Year</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Files</th>
                <th className="px-4 py-3">Passes / Tiers</th>
                <th className="px-4 py-3">UTR Number</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPassRows.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-500">No pass registrations found.</td></tr>
              ) : (
                filteredPassRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-mono font-bold text-lantern-300">
                      {row.delegate_id || "—"}
                      {row.group_id && (
                        <span className="block text-[9px] font-mono font-normal text-mist-400 mt-0.5">👑 {groupCodeFor(row.group_id) || "Group"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-parchment-50">{row.full_name || "N/A"}</div>
                      <div className="text-[10px] text-slate-400">{row.college} · {row.year_of_study}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[11px]">{row.email}</div>
                      <div className="font-mono text-slate-200">{row.phone}</div>
                    </td>
                    <td className="px-4 py-3 space-y-0.5">
                      {row.id_card_url ? (
                        <a href={row.id_card_url} target="_blank" rel="noreferrer" className="block text-mist-400 hover:underline font-semibold">🖼️ ID Card</a>
                      ) : <span className="text-slate-500 italic block">No ID</span>}
                      {row.payment_screenshot_url ? (
                        <a href={row.payment_screenshot_url} target="_blank" rel="noreferrer" className="block text-lantern-300 hover:underline font-semibold">💳 Receipt</a>
                      ) : <span className="text-slate-500 italic block">No Receipt</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-lantern-500/20 text-lantern-300 border border-lantern-500/30 block w-fit mb-1">
                        {(row.pass_codes || []).join(", ")}
                      </span>
                      <span className="text-amber-300 font-bold">₹{row.total_amount || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.utr_number ? (
                        <span className="font-mono text-parchment-50">{row.utr_number}</span>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={row.payment_status} /></td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button onClick={() => updatePurchaseStatus(row.id, "APPROVED")} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition">Approve</button>
                      <button onClick={() => updatePurchaseStatus(row.id, "REJECTED")} className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold transition">Reject</button>
                      {row.payment_status !== "PENDING_VERIFICATION" && (
                        <button onClick={() => updatePurchaseStatus(row.id, "PENDING_VERIFICATION")} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold transition">↺ Pending</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ============ TABLE 2: Event Registrations Master ============ */}
      {activeTable === "events" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-xl font-display font-bold text-toadstool-200">
            Event Registrations Master <span className="text-sm text-slate-400 font-normal">({filteredEventRows.length})</span>
          </h3>
          <button onClick={exportEventsCSV} className="px-4 py-2 rounded-xl bg-mist-500 text-canopy-950 text-xs font-bold hover:bg-mist-400 transition">
            ⬇ Export Events CSV
          </button>
        </div>
        <p className="text-[10px] text-slate-500 -mt-2">
          Rows sharing a colored left edge were bought together in one checkout (same transaction/UTR) — each is still approved or rejected
          independently.
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Search by Delegate ID, Name, Event, Phone..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-parchment-50 text-xs outline-none focus:border-mist-500 transition"
          />
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING_VERIFICATION", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setEventStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  eventStatusFilter === status ? "bg-toadstool-400 text-canopy-950 font-bold" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {status === "PENDING_VERIFICATION" ? "PENDING" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#16281f]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Delegate ID</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Event Registered</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Teammates</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">UTR Number</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEventRows.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-8 text-slate-500">No event registrations found.</td></tr>
              ) : (
                filteredEventRows.map((row) => {
                  const parent = purchaseFor(row.purchase_id);
                  const roster = teamForEventReg(row.id);
                  const status = row.payment_status || "PENDING_VERIFICATION";
                  const bundled = (purchaseRowCounts[row.purchase_id] || 0) > 1;
                  return (
                    <React.Fragment key={row.id}>
                      <tr className={`hover:bg-white/[0.02] transition ${bundled ? `border-l-2 ${bundleAccentFor(row.purchase_id)}` : ""}`}>
                        <td className="px-4 py-3 font-mono font-bold text-lantern-300">{row.delegate_id || "—"}</td>
                        <td className="px-4 py-3 font-semibold text-parchment-50">{row.participant_name || "—"}</td>
                        <td className="px-4 py-3 font-mono">{row.participant_whatsapp || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="text-parchment-50 font-medium">{row.event_title}</div>
                          {row.sub_event && <div className="text-[10px] text-slate-400">{row.sub_event}</div>}
                          <div className="text-amber-300 font-bold mt-0.5">{row.price > 0 ? `₹${row.price}` : "Free"}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-mist-400">
                          {parent?.group_id ? `👑 ${groupCodeFor(parent.group_id) || "Group"}` : <span className="text-slate-500 italic font-sans">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {row.team_size > 0 ? (
                            <button
                              onClick={() => setExpandedEventRegId(expandedEventRegId === row.id ? null : row.id)}
                              className="text-mist-400 hover:underline font-semibold"
                            >
                              {roster.length} member{roster.length !== 1 ? "s" : ""} {expandedEventRegId === row.id ? "▲" : "▼"}
                            </button>
                          ) : <span className="text-slate-500 italic">Individual</span>}
                        </td>
                        <td className="px-4 py-3">
                          {parent?.payment_screenshot_url ? (
                            <a href={parent.payment_screenshot_url} target="_blank" rel="noreferrer" className="text-lantern-300 hover:underline font-semibold">💳 View</a>
                          ) : <span className="text-slate-500 italic">None</span>}
                        </td>
                        <td className="px-4 py-3">
                          {row.utr_number || parent?.utr_number ? (
                            <span className="font-mono text-parchment-50">{row.utr_number || parent?.utr_number}</span>
                          ) : (
                            <span className="text-slate-500 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button onClick={() => updateEventStatus(row.id, "APPROVED")} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition">Approve</button>
                          <button onClick={() => updateEventStatus(row.id, "REJECTED")} className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold transition">Reject</button>
                          {status !== "PENDING_VERIFICATION" && (
                            <button onClick={() => updateEventStatus(row.id, "PENDING_VERIFICATION")} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold transition">↺ Pending</button>
                          )}
                        </td>
                      </tr>
                      {expandedEventRegId === row.id && (
                        <tr>
                          <td colSpan="10" className="px-4 py-4 bg-canopy-950/60">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Team Member{roster.length !== 1 ? "s" : ""}</p>
                            <div className="space-y-1">
                              {roster.map((m) => (
                                <div key={m.id} className="flex justify-between text-[11px] text-slate-300">
                                  <span>{m.full_name} · {m.whatsapp_number}</span>
                                  <span className={m.verified ? "text-emerald-400" : "text-red-400"}>
                                    {m.delegate_id} {m.verified ? "✓" : "✗ unverified"}
                                  </span>
                                </div>
                              ))}
                              {roster.length === 0 && <p className="text-[11px] text-slate-500 italic">No team members added.</p>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ============ TABLE 3: Event Master ============ */}
      {activeTable === "catalog" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-xl font-display font-bold text-mist-200">
            Event Master <span className="text-sm text-slate-400 font-normal">({filteredCatalogRows.length})</span>
          </h3>
        </div>
        <p className="text-[10px] text-slate-500">
          Price and title changes apply site-wide immediately. Closing registrations shows "Registrations Full" on the public event card and
          blocks new sign-ups for that event/sub-event — anyone already registered is unaffected.
        </p>

        <input
          type="text"
          placeholder="Search events..."
          value={catalogSearch}
          onChange={(e) => setCatalogSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-parchment-50 text-xs outline-none focus:border-mist-500 transition"
        />

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#16281f]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Event / Sub-event</th>
                <th className="px-4 py-3">Live Registrations</th>
                <th className="px-4 py-3">Title Override</th>
                <th className="px-4 py-3">Price (₹)</th>
                <th className="px-4 py-3">Registrations</th>
                <th className="px-4 py-3 text-right">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCatalogRows.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No matching events.</td></tr>
              ) : (
                filteredCatalogRows.map((row) => {
                  const draft = draftFor(row.code);
                  const dirty = draft.price !== undefined || draft.title_override !== undefined;
                  return (
                    <tr key={row.code} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-parchment-50">{row.title_override || row.base_label}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{row.code}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-mist-300">{liveRegCount(row.code)}</td>
                      <td className="px-4 py-3">
                        <input
                          placeholder={row.title_override || row.base_label}
                          title="Type a new title and Save. Clear the box and Save to reset to the original."
                          value={draft.title_override !== undefined ? draft.title_override : row.title_override || ""}
                          onChange={(e) => setDraft(row.code, { title_override: e.target.value })}
                          className="w-40 px-2 py-1.5 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-[11px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={draft.price !== undefined ? draft.price : row.price}
                          onChange={(e) => setDraft(row.code, { price: e.target.value })}
                          className="w-20 px-2 py-1.5 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-[11px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleCatalogOpen(row.code, row.registrations_open)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                            row.registrations_open
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                              : "bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25"
                          }`}
                        >
                          {row.registrations_open ? "Accepting" : "Closed"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => saveCatalogRow(row.code)}
                          disabled={!dirty || catalogSaving === row.code}
                          className="px-3 py-1.5 rounded-lg bg-lantern-400 text-canopy-950 text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          {catalogSaving === row.code ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </section>
  );
}
