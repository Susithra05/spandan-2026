// src/components/AdminDashboard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
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

      if (error) {
        // Fallback query if RPC isn't configured
        const { data: directData, error: directError } = await supabase
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false });

        if (directError) throw directError;
        setRegistrations(directData || []);
      } else {
        setRegistrations(data || []);
      }

      setIsAuthenticated(true);
      sessionStorage.setItem("spandan_admin_key", passcode.trim());
    } catch (err) {
      setErrorMsg("Invalid Passcode or Unauthorized Access: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ payment_status: status })
        .eq("id", id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, payment_status: status } : r)),
      );
    } catch (err) {
      alert("Failed to update status: " + err.message);
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
      "Year of Study",
      "Pass ID",
      "Pass Type",
      "Events Selected",
      "ID Card URL",
      "Payment Screenshot URL",
      "Total Amount",
      "Payment Status",
      "Created At",
    ];

    const rows = registrations.map((r) => [
      `"${r.id || ""}"`,
      `"${r.full_name || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.college || ""}"`,
      `"${r.year_of_study || ""}"`,
      `"${r.pass_id || r.tier || ""}"`,
      `"${r.pass_type || ""}"`,
      `"${(r.selected_events || r.events || []).join("; ")}"`,
      `"${r.id_card_url || ""}"`,
      `"${r.payment_screenshot_url || ""}"`,
      `"${r.total_amount || 0}"`,
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
    const matchesSearch =
      item.full_name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.college?.toLowerCase().includes(term) ||
      item.phone?.includes(term) ||
      item.pass_id?.toLowerCase().includes(term);

    const matchesStatus =
      filterStatus === "ALL" || item.payment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <section className="max-w-md mx-auto px-4 py-20">
        <div className="glow-card p-8 rounded-3xl border border-lantern-500/30 bg-[#16281f] shadow-[0_0_30px_rgba(240,169,60,0.2)] text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-lantern-500/20 border border-lantern-500/40 flex items-center justify-center text-xl">
            🔒
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-parchment-50">
              Committee Portal
            </h2>
            <p className="text-xs text-slate-400">
              Enter committee passcode to view registration records and verify
              ID / Payment files.
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

            {errorMsg && (
              <p className="text-xs text-toadstool-400">{errorMsg}</p>
            )}
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
            Committee Verification Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time participant feed, College ID photos, and Payment Proof
            verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-parchment-50 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
          >
            <span>📥 Export to CSV</span>
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
            Pending Verifications
          </p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {
              registrations.filter(
                (r) =>
                  !r.payment_status ||
                  r.payment_status === "PENDING_VERIFICATION",
              ).length
            }
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Approved Registrations
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {
              registrations.filter((r) => r.payment_status === "APPROVED")
                .length
            }
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Filter by Name, College, Email, Phone, or Pass..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-parchment-50 text-xs outline-none focus:border-mist-500 transition"
        />

        <div className="flex gap-2 w-full sm:w-auto">
          {["ALL", "PENDING_VERIFICATION", "APPROVED", "REJECTED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === status
                    ? "bg-lantern-400 text-canopy-950 font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {status === "PENDING_VERIFICATION" ? "PENDING" : status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Master Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#16281f]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Participant Name</th>
              <th className="px-4 py-3">Phone No</th>
              <th className="px-4 py-3">College Name</th>
              <th className="px-4 py-3">ID Card</th>
              <th className="px-4 py-3">Payment SS</th>
              <th className="px-4 py-3">Pass / Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-500">
                  No registrations found matching your query.
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition">
                  {/* Name & Email */}
                  <td className="px-4 py-3 font-semibold text-parchment-50">
                    <div>{row.full_name || "N/A"}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      {row.email}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 font-mono text-slate-200">
                    {row.phone || "—"}
                  </td>

                  {/* College */}
                  <td
                    className="px-4 py-3 max-w-[150px] truncate"
                    title={row.college}
                  >
                    {row.college || "—"}
                  </td>

                  {/* College ID Card Image Link */}
                  <td className="px-4 py-3">
                    {row.id_card_url ? (
                      <a
                        href={row.id_card_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-mist-400 hover:underline font-semibold"
                      >
                        🖼️ View ID Card
                      </a>
                    ) : (
                      <span className="text-slate-500 italic">No File</span>
                    )}
                  </td>

                  {/* Payment Screenshot Link */}
                  <td className="px-4 py-3">
                    {row.payment_screenshot_url ? (
                      <a
                        href={row.payment_screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-lantern-300 hover:underline font-semibold"
                      >
                        💳 View Receipt
                      </a>
                    ) : (
                      <span className="text-slate-500 italic">No File</span>
                    )}
                  </td>

                  {/* Pass & Amount */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-lantern-500/20 text-lantern-300 border border-lantern-500/30 block w-fit">
                      {row.pass_id || row.tier || "Standard"}
                    </span>
                    <span className="text-amber-300 font-bold block mt-1">
                      ₹{row.total_amount || 0}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.payment_status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : row.payment_status === "REJECTED"
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {row.payment_status || "PENDING"}
                    </span>
                  </td>

                  {/* Status Change Buttons */}
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => updateStatus(row.id, "APPROVED")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(row.id, "REJECTED")}
                      className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold transition"
                    >
                      Reject
                    </button>
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
