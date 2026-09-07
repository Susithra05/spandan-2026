// src/components/AdminDashboard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

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

export default function AdminDashboard() {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [eventRegs, setEventRegs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Table 1 filters
  const [passSearch, setPassSearch] = useState("");
  const [passStatusFilter, setPassStatusFilter] = useState("ALL");

  // Table 2 filters
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [expandedEventRegId, setExpandedEventRegId] = useState(null);
  const [activeTable, setActiveTable] = useState("passes"); // "passes" | "events"

  const adminKey = () => sessionStorage.getItem("spandan_admin_key") || passcode.trim();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const key = passcode.trim();

    try {
      const [purchasesRes, eventsRes, teamsRes] = await Promise.all([
        supabase.rpc("get_admin_purchases", { admin_key: key }),
        supabase.rpc("get_admin_event_registrations", { admin_key: key }),
        supabase.rpc("get_admin_team_members", { admin_key: key }),
      ]);

      if (purchasesRes.error) {
        const { data: directPurchases, error: directErr } = await supabase
          .from("purchases")
          .select("*")
          .order("created_at", { ascending: false });
        if (directErr) throw directErr;
        setPurchases(directPurchases || []);
        const { data: directEvents } = await supabase.from("event_registrations").select("*");
        setEventRegs(directEvents || []);
        const { data: directTeams } = await supabase.from("team_members").select("*");
        setTeamMembers(directTeams || []);
      } else {
        setPurchases(purchasesRes.data || []);
        setEventRegs(eventsRes.data || []);
        setTeamMembers(teamsRes.data || []);
      }

      setIsAuthenticated(true);
      sessionStorage.setItem("spandan_admin_key", key);
    } catch (err) {
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
      if (error) {
        const { error: directErr } = await supabase.from("purchases").update({ payment_status: status }).eq("id", id);
        if (directErr) throw directErr;
      }
      setPurchases((prev) => prev.map((r) => (r.id === id ? { ...r, payment_status: status } : r)));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const teamForEventReg = (eventRegId) => teamMembers.filter((m) => m.event_registration_id === eventRegId);
  const purchaseFor = (purchaseId) => purchases.find((p) => p.id === purchaseId);

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
      "College ID Photo URL", "Selected Passes/Tiers", "Payment Screenshot URL",
      "Delegate ID", "Status", "Submitted At",
    ];
    const rows = filteredPassRows.map((r) => [
      `"${r.full_name || ""}"`, `"${r.email || ""}"`, `"${r.phone || ""}"`, `"${r.college || ""}"`,
      `"${r.year_of_study || ""}"`, `"${r.id_card_url || ""}"`, `"${(r.pass_codes || []).join("; ")}"`,
      `"${r.payment_screenshot_url || ""}"`, `"${r.delegate_id || ""}"`, `"${r.payment_status || "PENDING"}"`,
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);
    downloadCSV(`spandan_passes_master_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // ---------------- TABLE 2: Event Registrations ----------------
  const filteredEventRows = eventRegs.filter((row) => {
    const parent = purchaseFor(row.purchase_id);
    const term = eventSearch.toLowerCase();
    const matchesSearch =
      !term ||
      row.participant_name?.toLowerCase().includes(term) ||
      row.delegate_id?.toLowerCase().includes(term) ||
      row.event_title?.toLowerCase().includes(term) ||
      row.participant_whatsapp?.includes(term);
    const status = parent?.payment_status || "PENDING_VERIFICATION";
    const matchesStatus = eventStatusFilter === "ALL" || status === eventStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportEventsCSV = () => {
    const headers = [
      "Delegate ID", "Participant Name", "WhatsApp Number", "Event Registered", "Sub Event",
      "Team Event", "Teammates (Name:ID)", "Payment Screenshot URL", "Status", "Submitted At",
    ];
    const rows = filteredEventRows.map((r) => {
      const parent = purchaseFor(r.purchase_id);
      const roster = teamForEventReg(r.id);
      return [
        `"${r.delegate_id || ""}"`, `"${r.participant_name || ""}"`, `"${r.participant_whatsapp || ""}"`,
        `"${r.event_title || ""}"`, `"${r.sub_event || ""}"`, `"${r.is_team_event ? "Yes" : "No"}"`,
        `"${roster.map((m) => `${m.full_name}:${m.delegate_id}`).join("; ")}"`,
        `"${parent?.payment_screenshot_url || ""}"`, `"${parent?.payment_status || "PENDING"}"`,
        `"${new Date(r.created_at).toLocaleString()}"`,
      ];
    });
    downloadCSV(`spandan_events_master_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
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
        <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1">
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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPassRows.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">No pass registrations found.</td></tr>
              ) : (
                filteredPassRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-mono font-bold text-lantern-300">{row.delegate_id || "—"}</td>
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
                    <td className="px-4 py-3"><StatusBadge status={row.payment_status} /></td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button onClick={() => updatePurchaseStatus(row.id, "APPROVED")} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition">Approve</button>
                      <button onClick={() => updatePurchaseStatus(row.id, "REJECTED")} className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold transition">Reject</button>
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
                <th className="px-4 py-3">Teammates</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEventRows.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-500">No event registrations found.</td></tr>
              ) : (
                filteredEventRows.map((row) => {
                  const parent = purchaseFor(row.purchase_id);
                  const roster = teamForEventReg(row.id);
                  const status = parent?.payment_status || "PENDING_VERIFICATION";
                  return (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3 font-mono font-bold text-lantern-300">{row.delegate_id || "—"}</td>
                        <td className="px-4 py-3 font-semibold text-parchment-50">{row.participant_name || "—"}</td>
                        <td className="px-4 py-3 font-mono">{row.participant_whatsapp || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="text-parchment-50 font-medium">{row.event_title}</div>
                          {row.sub_event && <div className="text-[10px] text-slate-400">{row.sub_event}</div>}
                          <div className="text-amber-300 font-bold mt-0.5">{row.price > 0 ? `₹${row.price}` : "Free"}</div>
                        </td>
                        <td className="px-4 py-3">
                          {row.is_team_event ? (
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
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {parent && (
                            <>
                              <button onClick={() => updatePurchaseStatus(parent.id, "APPROVED")} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition">Approve</button>
                              <button onClick={() => updatePurchaseStatus(parent.id, "REJECTED")} className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold transition">Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                      {expandedEventRegId === row.id && (
                        <tr>
                          <td colSpan="8" className="px-4 py-4 bg-canopy-950/60">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Team Roster</p>
                            <div className="space-y-1">
                              {roster.map((m) => (
                                <div key={m.id} className="flex justify-between text-[11px] text-slate-300">
                                  <span>{m.full_name} · {m.whatsapp_number}</span>
                                  <span className={m.verified ? "text-emerald-400" : "text-red-400"}>
                                    {m.delegate_id} {m.verified ? "✓" : "✗ unverified"}
                                  </span>
                                </div>
                              ))}
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
    </section>
  );
}
