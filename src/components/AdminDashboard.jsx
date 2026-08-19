// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.rpc("get_admin_registrations", {
        admin_key: passcode.trim(),
      });

      if (error) throw error;

      setRegistrations(data || []);
      setIsAuthenticated(true);
      sessionStorage.setItem("spandan_admin_key", passcode.trim());
    } catch (err) {
      setErrorMsg("Invalid Passcode or Unauthorized Access.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "College",
      "Tier",
      "Events Selected",
      "Created At",
    ];

    const rows = registrations.map((r) => [
      `"${r.id || ""}"`,
      `"${r.full_name || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.college || ""}"`,
      `"${r.tier || ""}"`,
      `"${(r.selected_events || []).join(", ")}"`, // 👈 updated
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `spandan_2026_registrations_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.college?.toLowerCase().includes(term) ||
      item.phone?.includes(term) ||
      item.tier?.toLowerCase().includes(term)
    );
  });

  if (!isAuthenticated) {
    return (
      <section className="max-w-md mx-auto px-4 py-20">
        <div className="glow-card p-8 rounded-3xl border border-fuchsia-500/30 bg-[#0c0817] shadow-[0_0_30px_rgba(217,70,239,0.15)] text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-xl">
            🔒
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Committee Portal</h2>
            <p className="text-xs text-slate-400">
              Enter committee passcode to view all registration records.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-fuchsia-500 text-white text-sm outline-none transition"
              required
            />
            {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 font-bold text-sm text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Registration Master Table
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of participants registered across all tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
          >
            <span>📥 Export to CSV (.xlsx)</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Attendees */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Total Registrations
          </p>
          <p className="text-2xl font-black text-white mt-1">
            {registrations.length}
          </p>
        </div>

        {/* Card 2: Distinct Colleges */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Colleges Represented
          </p>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {
              new Set(
                registrations
                  .map((r) => r.college?.trim().toLowerCase())
                  .filter(Boolean),
              ).size
            }
          </p>
        </div>

        {/* Card 3: Unique Events Picked */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Unique Events Picked
          </p>
          <p className="text-2xl font-black text-fuchsia-400 mt-1">
            {
              new Set(
                registrations.flatMap(
                  (r) => r.selected_events || r.events || [],
                ),
              ).size
            }
          </p>
        </div>

        {/* Card 4: Total Event Signups */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Total Event Signups
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {registrations.reduce(
              (total, r) =>
                total + (r.selected_events || r.events || []).length,
              0,
            )}
          </p>
        </div>
      </div>
      {/* Search Input */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Filter by Name, College, Email, Phone, or Tier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-cyan-500 transition"
        />
        <span className="text-xs text-slate-400 font-mono hidden md:inline">
          Showing {filteredRegistrations.length} of {registrations.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c0817]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">College</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Events Selected</th>
              <th className="px-4 py-3">Registered On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  No registrations found matching your query.
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 font-semibold text-white">
                    <div>{row.full_name || "N/A"}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      {row.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.college || "—"}</td>
                  <td className="px-4 py-3 font-mono">{row.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                      {row.tier || "Standard"}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {row.selected_events && row.selected_events.length > 0 ? (
                        row.selected_events.map((ev, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[9px]"
                          >
                            {ev}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">
                          None selected
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    {row.created_at || row.timestamp
                      ? new Date(
                          row.created_at || row.timestamp,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
