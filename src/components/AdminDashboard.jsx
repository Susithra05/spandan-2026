// src/components/AdminDashboard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [showPassword, setShowPassword] = useState(false);
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
      "UTR Number",
      "Payment Status",
      "Created At",
    ];

    const rows = registrations.map((r) => [
      `"${r.id || ""}"`,
      `"${r.full_name || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.college || ""}"`,
      `"${r.tier || ""}"`,
      `"${(r.selected_events || r.events || []).join(", ")}"`,
      `"${r.utr_number || ""}"`,
      `"${r.payment_status || "PENDING"}"`,
      `"${new Date(r.created_at || r.timestamp).toLocaleString()}"`,
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
      item.tier?.toLowerCase().includes(term) ||
      item.utr_number?.toLowerCase().includes(term)
    );
  });

  if (!isAuthenticated) {
    return (
      <section className="max-w-md mx-auto px-4 py-20">
        <div className="glow-card p-8 rounded-3xl border border-lantern-500/30 bg-[#16281f] shadow-[0_0_30px_rgba(240,169,60,0.2)] text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-lantern-500/20 border border-lantern-500/40 flex items-center justify-center text-xl">
            🔒
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-parchment-50">Committee Portal</h2>
            <p className="text-xs text-slate-400">
              Enter committee passcode to view all registration records.
            </p>
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
                aria-label={showPassword ? "Hide passcode" : "Show passcode"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {errorMsg && <p className="text-xs text-toadstool-400">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-lantern-600 to-toadstool-600 font-bold text-sm text-parchment-50 hover:opacity-90 transition disabled:opacity-50"
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
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lantern-400 to-mist-400">
            Registration Master Table
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of participants registered across all tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-parchment-50 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
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
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Total Registrations
          </p>
          <p className="text-2xl font-black text-parchment-50 mt-1">
            {registrations.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Colleges Represented
          </p>
          <p className="text-2xl font-black text-mist-400 mt-1">
            {
              new Set(
                registrations
                  .map((r) => r.college?.trim().toLowerCase())
                  .filter(Boolean),
              ).size
            }
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Unique Events Picked
          </p>
          <p className="text-2xl font-black text-lantern-400 mt-1">
            {
              new Set(
                registrations.flatMap(
                  (r) => r.selected_events || r.events || [],
                ),
              ).size
            }
          </p>
        </div>

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
          placeholder="Filter by Name, College, Email, Phone, Tier, or UTR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-parchment-50 text-xs outline-none focus:border-mist-500 transition"
        />
        <span className="text-xs text-slate-400 font-mono hidden md:inline">
          Showing {filteredRegistrations.length} of {registrations.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#16281f]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">College</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Events Selected</th>
              <th className="px-4 py-3">Payment / UTR</th>
              <th className="px-4 py-3">Registered On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500">
                  No registrations found matching your query.
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 font-semibold text-parchment-50">
                    <div>{row.full_name || "N/A"}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      {row.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.college || "—"}</td>
                  <td className="px-4 py-3 font-mono">{row.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-lantern-500/20 text-lantern-300 border border-lantern-500/30">
                      {row.tier || "Standard"}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {row.selected_events && row.selected_events.length > 0 ? (
                        row.selected_events.map((ev, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-mist-950/60 text-mist-300 border border-mist-800/40 text-[9px]"
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

                  <td className="px-4 py-3 font-mono text-[11px]">
                    {row.utr_number ? (
                      <div className="space-y-1">
                        <span className="text-mist-300 bg-mist-950/60 px-2 py-0.5 rounded border border-mist-800/40 block w-fit">
                          {row.utr_number}
                        </span>
                        <span className="text-[9px] text-lantern-400 uppercase font-bold block">
                          {row.payment_status || "PENDING"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[10px]">
                        No UTR
                      </span>
                    )}
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
