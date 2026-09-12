import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import CountdownTimer from "./components/CountdownTimer";
import { supabase } from "./lib/supabase";
import Footer from "./components/Footer";
import {
  festDetails,
  tiers,
  clubPasses,
  eventCategories,
  eventsList,
  teamContacts,
  scheduleData,
  aboutJipmer,
  aboutSpandanExtended,
  registrationProcess,
  onReachingJipmer,
  accommodation,
  generalGuidelines,
  gettingHere,
  getEventAccess,
  subEventLabel,
  FORM_ONLY_EVENT_IDS,
  specialSections,
  BROCHURE_URL,
} from "./data/festData";
import AdminDashboard from "./components/AdminDashboard";
import RegistrationFlow from "./components/RegistrationFlow";
import Profile from "./components/Profile";

// Lightweight pure SVGs to avoid React 19 / Lucide incompatibility
const SparklesIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-7 h-7 text-mist-300 mb-2"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M12 2.5v1.4M9.5 1.8h5" strokeLinecap="round" />
    <circle cx="12" cy="13" r="8.2" />
    <circle cx="12" cy="13" r="0.9" fill="currentColor" stroke="none" />
    <path d="M12 13 9 11.3M12 13l3.3-4.3" strokeLinecap="round" />
    <path d="M4.2 6.3 6 8" strokeLinecap="round" />
    <path d="M19.8 6.3 18 8" strokeLinecap="round" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    className="w-7 h-7 text-toadstool-400 mb-2"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      d="M12 3c-4 0-6.5 2.1-6.5 4.3 0 1 .9 1.5 1.9 1.2C8.5 8 10 7.6 12 7.6s3.5.4 4.6.9c1 .3 1.9-.2 1.9-1.2C18.5 5.1 16 3 12 3Z"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="6.1" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="5.6" r="0.5" fill="currentColor" stroke="none" />
    <path d="M12 8v3" strokeLinecap="round" />
    <path
      d="M12 11c-2.4 0-4.3 1.7-4.3 3.9 0 3 2 6.4 4.3 7.6 2.3-1.2 4.3-4.6 4.3-7.6 0-2.2-1.9-3.9-4.3-3.9Z"
      strokeLinejoin="round"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="none">
    <path
      className="text-toadstool-400"
      fill="currentColor"
      d="M12 5c-1.6 0-2.9 1.3-2.9 2.9 0 1.9 1.8 3.3 4.5 5.6C16.3 11.2 18 9.8 18 7.9 18 6.3 16.7 5 15.1 5c-1 0-1.9.5-2.4 1.3C12.2 5.5 12.1 5 12 5Z"
      opacity="0.55"
    />
    <path
      className="text-mist-300"
      fill="currentColor"
      d="M6 12.5 3 18.5h2.2L4 21h4l-1.2-2.5H9L6 12.5Z"
      opacity="0.9"
    />
    <path
      className="text-lantern-300"
      fill="currentColor"
      d="M18 12.5l-3 6h2.2L16 21h4l-1.2-2.5H21l-3-6Z"
      opacity="0.9"
    />
  </svg>
);

const FireflyField = ({ count = 6 }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className="firefly absolute w-1.5 h-1.5 rounded-full bg-lantern-300 shadow-[0_0_8px_3px_rgba(240,169,60,0.7)]"
        style={{
          left: `${(i * 37 + 8) % 100}%`,
          top: `${(i * 53 + 12) % 100}%`,
          animationDelay: `${i * 0.9}s`,
          animationDuration: `${5 + (i % 4)}s`,
        }}
      />
    ))}
  </div>
);

const MushroomCluster = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none">
    <g opacity="0.5">
      <ellipse cx="30" cy="55" rx="26" ry="15" fill="currentColor" />
      <rect
        x="22"
        y="55"
        width="16"
        height="35"
        rx="6"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse cx="95" cy="35" rx="18" ry="11" fill="currentColor" />
      <rect
        x="89"
        y="35"
        width="12"
        height="26"
        rx="5"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse cx="130" cy="60" rx="22" ry="13" fill="currentColor" />
      <rect
        x="122"
        y="60"
        width="14"
        height="30"
        rx="5"
        fill="currentColor"
        opacity="0.85"
      />
    </g>
  </svg>
);

const VineSwirl = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 300 60"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      d="M2 30c20-20 40 20 60 0s40-20 60 0 40 20 60 0 40-20 60 0 40 20 56 0"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path d="M32 28c4-8 12-8 14 0" opacity="0.5" />
    <path d="M92 30c4-8 12-8 14 0" opacity="0.5" />
    <path d="M152 28c4-8 12-8 14 0" opacity="0.5" />
    <path d="M212 30c4-8 12-8 14 0" opacity="0.5" />
  </svg>
);

const FloatingSuits = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
    {[
      { s: "♣", l: "4%", t: "12%", r: -12, sz: "3rem" },
      { s: "♥", l: "90%", t: "20%", r: 10, sz: "2.5rem" },
      { s: "♦", l: "8%", t: "78%", r: 8, sz: "2.75rem" },
      { s: "♠", l: "93%", t: "70%", r: -8, sz: "3.25rem" },
    ].map((c, i) => (
      <span
        key={i}
        className="absolute text-lantern-400/10"
        style={{
          left: c.l,
          top: c.t,
          fontSize: c.sz,
          transform: `rotate(${c.r}deg)`,
        }}
      >
        {c.s}
      </span>
    ))}
  </div>
);

const SectionScenery = ({ suits = true }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
    <VineSwirl className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] max-w-3xl h-10 text-lantern-500/40" />
    <MushroomCluster className="absolute -bottom-4 -left-6 w-36 h-28 text-toadstool-700/40" />
    <MushroomCluster className="absolute -bottom-6 -right-8 w-40 h-32 text-mist-800/40 scale-x-[-1]" />
    {suits && <FloatingSuits />}
  </div>
);

const CheckIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    className="w-12 h-12 text-emerald-400 mx-auto"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("spandan_splash_shown");
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("spandan_splash_shown", "true");
    setShowSplash(false);
  };

  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("error"); // "error" | "success"

  // Password recovery — Supabase redirects the user back here (per the
  // redirectTo URL below) with a recovery session; we detect that via
  // onAuthStateChange's PASSWORD_RECOVERY event and show this view.
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // Passes this user already owns (from approved purchases) — drives
  // event-gating across the Events tab and the Registration flow.
  const [ownedPasses, setOwnedPasses] = useState([]);

  const fetchOwnedPasses = async (currentUser) => {
    const u = currentUser ?? user;
    if (!u) {
      setOwnedPasses([]);
      return;
    }
    const { data } = await supabase
      .from("purchases")
      .select("pass_codes")
      .eq("user_id", u.id)
      .eq("payment_status", "APPROVED");
    const codes = new Set();
    (data || []).forEach((row) => (row.pass_codes || []).forEach((c) => codes.add(c)));
    setOwnedPasses([...codes]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchOwnedPasses(session.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchOwnedPasses(session.user);
      else setOwnedPasses([]);
      if (_event === "PASSWORD_RECOVERY") {
        setShowResetPassword(true);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setAuthMessageType("error");
    try {
      if (authMode === "signup") {
        if (authPassword !== authConfirmPassword) {
          setAuthMessage("Passwords do not match. Please re-enter.");
          return;
        }
        if (authPassword.length < 6) {
          setAuthMessage("Password must be at least 6 characters.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage("Account created! You can now log in.");
        setAuthMessageType("success");
        setAuthMode("login");
        setAuthConfirmPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage("");
        setActiveTab("registration");
      }
    } catch (err) {
      if (authMode === "login" && /invalid login credentials/i.test(err.message)) {
        setAuthMessage(
          "Invalid credentials. If you signed up with Google, click \"Sign in with Google\" or use \"Forgot Password\" to set a password."
        );
      } else {
        setAuthMessage(err.message);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setAuthMessage(error.message);
  };

  const handleForgotPassword = async () => {
    setAuthMessage("");
    setAuthMessageType("error");
    if (!authEmail.trim()) {
      setAuthMessage("Enter your email address above first, then click \"Forgot Password\".");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
      redirectTo: "https://www.jipmerspandan.site/reset-password",
    });
    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage("Password reset email sent — check your inbox for the link.");
      setAuthMessageType("success");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    if (newPassword !== newPasswordConfirm) {
      setResetMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setResetMessage("Password must be at least 6 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setResetMessage(error.message);
    } else {
      setResetMessage("Password updated! You can now use it to log in.");
      setTimeout(() => {
        setShowResetPassword(false);
        setNewPassword("");
        setNewPasswordConfirm("");
        setResetMessage("");
        setActiveTab("home");
      }, 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const [eventSearchQuery, setEventSearchQuery] = useState("");

  const filteredEvents = (() => {
    let list = selectedCategory === "all" ? eventsList : eventsList.filter((ev) => ev.category === selectedCategory);
    if (eventSearchQuery.trim()) {
      const q = eventSearchQuery.trim().toLowerCase();
      list = list.filter((ev) => ev.title.toLowerCase().includes(q) || ev.desc?.toLowerCase().includes(q));
    }
    return list;
  })();

  const getWhatsAppLink = (phone) => {
    const formatted = phone.replace(/\D/g, "");
    const cleanNumber = formatted.length === 10 ? `91${formatted}` : formatted;
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="relative isolate min-h-screen bg-[#122519] text-slate-100 flex flex-col selection:bg-lantern-500 selection:text-parchment-50">
      {/* Consistent faded backdrop — same forest scenery as the hero,
          fixed so it stays put while every page scrolls over it. Low
          opacity + dark overlay keeps text/card contrast high everywhere. */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center opacity-[0.14] pointer-events-none"
        style={{ backgroundImage: "url('/theme-scenery.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-[#0b1d18]/70 pointer-events-none" />

      {/* CONDITIONAL SPLASH SCREEN */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* PASSWORD RESET MODAL — appears when Supabase redirects back here
          after the user clicks the reset link in their email */}
      {showResetPassword && (
        <div className="fixed inset-0 z-[200] bg-canopy-950/90 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="glow-card w-full max-w-md p-8 rounded-3xl space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-display font-bold text-parchment-50">Set a New Password</h3>
              <p className="text-xs text-parchment-100/60">Choose a new password for your account.</p>
            </div>

            {resetMessage && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  resetMessage.startsWith("Password updated")
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-lantern-500/20 border-lantern-500/40 text-lantern-200"
                }`}
              >
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 focus:outline-none focus:border-mist-400 focus:ring-1 focus:ring-mist-400/40"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 focus:outline-none focus:border-mist-400 focus:ring-1 focus:ring-mist-400/40"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm hover:brightness-105 transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-canopy-950/92 backdrop-blur-md border-b-2 border-lantern-500/20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("home")}
          >
            <img
              src="/logo-icon.png"
              alt="Spandan Logo"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:-rotate-3"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div>
              <div className="font-display font-bold tracking-wide text-xl text-lantern-200">
                Spandan <span className="text-mist-300">'26</span>
              </div>
              <div className="font-hand text-base text-toadstool-300/90 -mt-1 leading-none">
                The Enchanted Reverie
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-canopy-900/60 border border-lantern-500/15 rounded-full px-4 py-1.5 shadow-inner">
            {[
              "home",
              "about",
              "events",
              "schedule",
              "registration",
              ...(user ? ["profile"] : []),
              "contact",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                  activeTab === tab
                    ? "bg-lantern-400 text-canopy-950 font-bold shadow-md"
                    : "text-parchment-100/80 hover:text-lantern-200 hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* User Auth Action */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-lantern-300 hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-xs hover:bg-red-500/20 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("auth")}
                className="px-4 sm:px-5 py-2 rounded-full bg-mist-500 text-canopy-950 text-xs font-bold shadow-md hover:bg-mist-400 transition"
              >
                Login / Sign Up
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full border border-lantern-500/20 bg-canopy-900/60"
            >
              <span
                className={`block w-4 h-0.5 bg-lantern-200 rounded transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-4 h-0.5 bg-lantern-200 rounded transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-4 h-0.5 bg-lantern-200 rounded transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-lantern-500/15 bg-canopy-950/97 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
            {[
              "home",
              "about",
              "events",
              "schedule",
              "registration",
              ...(user ? ["profile"] : []),
              "contact",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition capitalize text-left ${
                  activeTab === tab
                    ? "bg-lantern-400 text-canopy-950 font-bold shadow-md"
                    : "text-parchment-100/80 hover:text-lantern-200 hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* BODY CONTENT */}
      <main className="flex-grow">
        {/* TAB 1: HOME */}
        {activeTab === "home" && (
          <div>
            <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('/theme-scenery.jpg')" }}
              />
              <div className="absolute inset-0 z-0 bg-[#0b1d18]/60" />
              <div className="absolute inset-x-0 bottom-0 h-40 z-0 bg-gradient-to-t from-[#0b1d18] to-transparent" />
              <FireflyField count={8} />

              <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-10">
                <div className="stamp-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-dashed border-lantern-400/40 bg-canopy-950/50 backdrop-blur-sm text-lantern-200 text-sm tracking-wide -rotate-1">
                  <SparklesIcon /> JIPMER Pondicherry • Annual Cultural &amp;
                  Sports Fest
                </div>

                <div className="flex justify-center px-4">
                  <img
                    src="/logo-mark.png"
                    alt="Spandan '26 — The Enchanted Reverie"
                    className="w-full max-w-xs sm:max-w-md md:max-w-lg h-auto drop-shadow-[0_0_30px_rgba(240,169,60,0.35)]"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <h1 className="hidden">
                    <span className="block text-6xl md:text-8xl font-black text-parchment-50 glow-text">
                      Spandan 2026
                    </span>
                    <span className="font-hand block text-3xl md:text-5xl text-lantern-300 mt-1">
                      ~ The Enchanted Reverie ~
                    </span>
                  </h1>
                </div>

                {/* Real-Time Live Countdown */}
                <CountdownTimer targetDate={festDetails.targetDate} />

                <p className="text-base md:text-lg text-parchment-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
                  "{festDetails.tagline}" Step into a fever dream where clocks
                  lose track of time, and the ordinary transforms into the
                  extraordinary.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab("registration")}
                    className="px-8 py-3.5 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm tracking-wide shadow-[0_6px_0_0_rgba(166,92,27,0.9)] hover:shadow-[0_3px_0_0_rgba(166,92,27,0.9)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all"
                  >
                    🐇 Suit Up &amp; Register
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="px-8 py-3.5 rounded-full border-2 border-mist-400/50 bg-mist-500/10 text-mist-200 font-bold text-sm hover:bg-mist-500/20 hover:-rotate-1 transition"
                  >
                    Explore Events
                  </button>
                  <a
                    href={BROCHURE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-3.5 rounded-full border-2 border-toadstool-400/50 bg-toadstool-500/10 text-toadstool-200 font-bold text-sm hover:bg-toadstool-500/20 hover:rotate-1 transition flex items-center gap-2"
                  >
                    📖 View Brochure
                  </a>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
                  <div className="glow-card p-5 rounded-2xl">
                    <CalendarIcon />
                    <div className="text-xs text-lantern-200/70 uppercase tracking-wider font-semibold">
                      Festival Dates
                    </div>
                    <div className="text-lg font-bold text-parchment-50">
                      {festDetails.dates}
                    </div>
                  </div>
                  <div className="glow-card p-5 rounded-2xl">
                    <MapPinIcon />
                    <div className="text-xs text-lantern-200/70 uppercase tracking-wider font-semibold">
                      Host Venue
                    </div>
                    <div className="text-lg font-bold text-parchment-50">
                      {festDetails.venue}
                    </div>
                  </div>
                  <div className="glow-card p-5 rounded-2xl">
                    <UsersIcon />
                    <div className="text-xs text-lantern-200/70 uppercase tracking-wider font-semibold">
                      Participation
                    </div>
                    <div className="text-lg font-bold text-parchment-50">
                      5000+ Footfall Expected
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ABOUT */}
        {activeTab === "about" && (
          <section className="relative isolate max-w-5xl mx-auto px-4 py-16 space-y-12">
            <SectionScenery />
            <div className="text-center space-y-4">
              <h2 className="font-display text-4xl md:text-5xl font-black text-lantern-200 glow-text">
                {aboutSpandanExtended.heading}
              </h2>
              <div className="vine-divider w-40 mx-auto" />
              {aboutSpandanExtended.paragraphs.map((p, idx) => (
                <p key={idx} className="text-parchment-100/75 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-display font-black text-lantern-300">
                  15+
                </div>
                <div className="text-xs text-parchment-100/60 mt-1">
                  Years of Legacy
                </div>
              </div>
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-display font-black text-mist-300">
                  5000+
                </div>
                <div className="text-xs text-parchment-100/60 mt-1">
                  Participants
                </div>
              </div>
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-display font-black text-lantern-300">
                  100+
                </div>
                <div className="text-xs text-parchment-100/60 mt-1">
                  Colleges Across India
                </div>
              </div>
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-display font-black text-toadstool-300">
                  50+
                </div>
                <div className="text-xs text-parchment-100/60 mt-1">
                  Competitions
                </div>
              </div>
            </div>

            <div className="glow-card p-8 rounded-3xl space-y-4">
              <h3 className="text-xl font-display font-bold text-parchment-50">
                The 2026 Concept: The Enchanted Reverie
              </h3>
              <p className="text-parchment-100/75 text-sm leading-relaxed">
                Inspired by the surrealism of fever dreams and the whimsical
                paradoxes of Alice in Wonderland, this year's edition turns
                every corridor, stage, and stadium into an ethereal playground.
                Prepare for mind-bending proshows, high-stakes sports battles,
                and captivating artistic spectacles.
              </p>
            </div>

            {/* About JIPMER — from the official brochure */}
            <div className="glow-card p-8 rounded-3xl space-y-4">
              <h3 className="text-xl font-display font-bold text-parchment-50">
                {aboutJipmer.heading}
              </h3>
              {aboutJipmer.paragraphs.map((p, idx) => (
                <p key={idx} className="text-parchment-100/75 text-sm leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* On Reaching JIPMER */}
            <div className="glow-card p-8 rounded-3xl space-y-4">
              <h3 className="text-xl font-display font-bold text-parchment-50">
                {onReachingJipmer.heading}
              </h3>
              <div>
                <p className="text-xs uppercase tracking-wider text-lantern-300 font-bold mb-2">
                  On arrival, all delegates must bring:
                </p>
                <ul className="space-y-1.5 text-sm text-parchment-100/75 list-decimal list-inside">
                  {onReachingJipmer.bringItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <ul className="space-y-2 text-sm text-parchment-100/75">
                {onReachingJipmer.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-lantern-400 mt-0.5">✦</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accommodation — full details now live under Events > Accommodation */}
            <div className="glow-card p-8 rounded-3xl space-y-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-display font-bold text-parchment-50">{accommodation.heading}</h3>
                <p className="font-hand text-lg text-toadstool-300/90">{accommodation.subheading}</p>
                <p className="text-sm text-parchment-100/70 mt-1">
                  Full details, terms, and the booking form are under the Accommodation domain on the Events page.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("events")}
                className="px-5 py-2.5 rounded-full bg-toadstool-500 text-canopy-950 text-xs font-bold hover:bg-toadstool-400 transition shrink-0"
              >
                View Accommodation →
              </button>
            </div>

            {/* General Guidelines */}
            <div className="glow-card p-8 rounded-3xl space-y-4">
              <h3 className="text-xl font-display font-bold text-parchment-50">
                {generalGuidelines.heading}
              </h3>
              <ul className="space-y-2 text-sm text-parchment-100/75">
                {generalGuidelines.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-lantern-400 mt-0.5">✦</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Getting Here */}
            <div className="glow-card p-8 rounded-3xl space-y-4">
              <h3 className="text-xl font-display font-bold text-parchment-50">
                {gettingHere.heading}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gettingHere.routes.map((route, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-canopy-950/50 border border-lantern-500/15">
                    <p className="text-sm font-bold text-lantern-300 mb-2">{route.mode}</p>
                    <ul className="space-y-1 text-xs text-parchment-100/70">
                      {route.points.map((pt, i2) => (
                        <li key={i2}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: EVENTS */}
        {activeTab === "events" && (
          <section className="relative isolate max-w-7xl mx-auto px-4 py-16 space-y-8">
            <SectionScenery suits={false} />
            <div className="text-center space-y-2">
              <h2 className="font-display text-4xl md:text-5xl font-black text-lantern-200 glow-text">
                Festival Events
              </h2>
              <p className="text-slate-400 text-sm">
                Choose your domain of competition
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                placeholder="Search events by name..."
                className="w-full px-5 py-3 rounded-full bg-canopy-950/60 border border-lantern-500/20 text-parchment-50 text-sm placeholder:text-parchment-100/40 focus:outline-none focus:border-mist-400"
              />
              <svg className="w-4 h-4 text-parchment-100/40 absolute right-5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {eventCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? cat.special
                        ? "bg-toadstool-500 text-canopy-950 shadow-[0_0_15px_rgba(226,100,61,0.4)]"
                        : "bg-mist-500 text-canopy-950 shadow-[0_0_15px_rgba(63,167,154,0.4)]"
                      : cat.special
                      ? "bg-toadstool-500/10 text-toadstool-300 border border-toadstool-500/30 hover:bg-toadstool-500/20"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accommodation / Food & Catering panel (selected from the domain bar above) */}
            {specialSections.some((s) => s.id === selectedCategory) ? (
              selectedCategory === "accommodation" ? (
                <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl space-y-4 border-toadstool-500/30">
                  <div>
                    <h3 className="text-xl font-display font-bold text-parchment-50">{accommodation.heading}</h3>
                    <p className="font-hand text-lg text-toadstool-300/90">{accommodation.subheading}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-parchment-100/75">
                    {accommodation.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-mist-400 mt-0.5">✦</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs uppercase tracking-wider text-toadstool-300 font-bold mb-2">
                      {accommodation.termsHeading}
                    </p>
                    <ul className="space-y-1.5 text-xs text-parchment-100/65">
                      {accommodation.terms.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-toadstool-400 mt-0.5">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-lantern-300">Contact — {accommodation.contact}</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {specialSections
                      .find((s) => s.id === "accommodation")
                      .links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-5 py-2.5 rounded-full bg-toadstool-500 text-canopy-950 text-xs font-bold hover:bg-toadstool-400 transition"
                        >
                          {link.label} →
                        </a>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl space-y-5 border-toadstool-500/30">
                  {specialSections
                    .filter((s) => s.id === selectedCategory)
                    .map((sec) => (
                      <div key={sec.id} className="space-y-4">
                        <h3 className="text-xl font-display font-bold text-parchment-50">{sec.label}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{sec.desc}</p>
                        <div className="flex flex-wrap gap-3">
                          {sec.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-5 py-2.5 rounded-full bg-toadstool-500 text-canopy-950 text-xs font-bold hover:bg-toadstool-400 transition"
                            >
                              {link.label} →
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )
            ) : (
              <>
                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {filteredEvents.length === 0 && (
                    <p className="col-span-full text-center text-sm text-slate-400 py-10">
                      No events match "{eventSearchQuery}".
                    </p>
                  )}
                  {filteredEvents.map((ev) => {
                    const hasSubEvents = ev.subEvents && ev.subEvents.length > 0;
                    const access = getEventAccess(ev, ownedPasses);
                    const isFormOnly = FORM_ONLY_EVENT_IDS.includes(ev.id);

                return (
                  <div
                    key={ev.id}
                    className={`glow-card p-6 rounded-2xl flex flex-col justify-between space-y-4 relative ${
                      isFormOnly ? "!border-emerald-400/40 shadow-[0_0_20px_-6px_rgba(52,211,153,0.35)]" : ""
                    }`}
                  >
                    {!access.unlocked && !isFormOnly && (
                      <div className="absolute top-4 right-4 z-10 group/lock">
                        <div className="w-8 h-8 rounded-full bg-canopy-950/90 border border-lantern-500/40 flex items-center justify-center cursor-help">
                          <svg className="w-4 h-4 text-lantern-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="10" width="16" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 018 0v3" />
                          </svg>
                        </div>
                        <div className="pointer-events-none absolute right-0 top-9 w-52 p-2.5 rounded-xl bg-canopy-950 border border-lantern-500/30 text-[10px] text-parchment-100/90 opacity-0 group-hover/lock:opacity-100 transition-opacity shadow-xl z-20">
                          Buy {access.requiredLabel} to unlock registration for this event
                        </div>
                      </div>
                    )}
                    {isFormOnly && (
                      <span className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                        No Pass Needed
                      </span>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-1 pr-8">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-lantern-400">
                          {ev.type ? `${ev.type} • ` : ""}
                          {ev.category.replace("-", " ")}
                        </span>
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {!isFormOnly && (access.price > 0 ? `₹${access.price}` : "Free")}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-parchment-50">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {ev.desc}
                      </p>

                      {hasSubEvents && (
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                          <span className="text-[11px] font-semibold text-lantern-300 block">
                            Sub-Categories / Formats:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.subEvents.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-canopy-950/60 border-white/10 text-slate-300"
                              >
                                {subEventLabel(sub)}
                                {typeof sub === "object" ? ` · ₹${sub.price}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ev.externalFormUrl && (
                        <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-[10px] text-emerald-300 font-semibold">{ev.externalFormNote}</p>
                          <a
                            href={ev.externalFormUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-mist-300 hover:text-mist-200 underline font-semibold"
                          >
                            Open External Registration Form →
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                      <span className="text-slate-400 break-words min-w-0 flex-1">
                        Contact: {ev.contact}
                      </span>
                      {!isFormOnly && (
                      <button
                        onClick={() => setActiveTab("registration")}
                        className={`font-semibold shrink-0 flex items-center gap-1.5 ${
                          access.unlocked ? "text-mist-400 hover:text-mist-300" : "text-parchment-100/50"
                        }`}
                      >
                        {access.unlocked ? (
                          "Add Event →"
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="4" y="10" width="16" height="10" rx="2" />
                              <path d="M8 10V7a4 4 0 018 0v3" />
                            </svg>
                            Buy Valid Pass to Unlock
                          </>
                        )}
                      </button>
                      )}
                    </div>
                  </div>
                );
              })}
                </div>
              </>
            )}
          </section>
        )}

        {/* TAB: SCHEDULE */}
        {activeTab === "schedule" && (
          <section className="relative isolate max-w-5xl mx-auto px-4 py-16 space-y-10">
            <SectionScenery />
            <div className="text-center space-y-2">
              <h2 className="font-display text-4xl md:text-5xl font-black text-lantern-200 glow-text">
                Festival Schedule
              </h2>
              <div className="vine-divider w-40 mx-auto" />
              <p className="text-parchment-100/60 text-sm pt-2">
                {festDetails.dates} • 7 Days of Pure Reverie
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheduleData.map((dayPlan, idx) => (
                <div
                  key={idx}
                  className="glow-card p-6 rounded-3xl hover:border-mist-400/50 transition duration-300 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-lantern-500/10 pb-3">
                    <div>
                      <span className="stamp-badge inline-block px-2.5 py-0.5 rounded-full text-sm bg-lantern-500/20 text-lantern-300 border border-lantern-500/30">
                        {dayPlan.day}
                      </span>
                      <h3 className="text-lg font-display font-black text-parchment-50 mt-1">
                        {dayPlan.title}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-mist-300 font-semibold bg-mist-950/40 px-3 py-1 rounded-xl border border-mist-800/40">
                      {dayPlan.date}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-parchment-100/70">
                    {dayPlan.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span className="text-toadstool-300 mt-0.5 text-sm">
                          {["♠", "♥", "♦", "♣"][hIdx % 4]}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: REGISTRATION */}
        {activeTab === "registration" && (
          <section className="relative isolate max-w-6xl mx-auto px-4 py-16 space-y-12">
            <SectionScenery suits={false} />
            <div className="text-center space-y-2">
              <h2 className="font-display text-4xl md:text-5xl font-black text-toadstool-200 glow-text">
                Delegate Registration &amp; Passes
              </h2>
              <div className="vine-divider w-40 mx-auto" />
              <p className="text-parchment-100/60 text-sm pt-2">
                Select your Delegate Tier or Club Pass to enter the Reverie
              </p>
            </div>

            {/* Registration Process — from the official brochure */}
            <div className="max-w-3xl mx-auto glow-card p-6 rounded-2xl">
              <h3 className="text-sm font-display font-bold text-lantern-200 mb-3">
                {registrationProcess.heading}
              </h3>
              <ul className="space-y-2 text-xs text-parchment-100/70">
                {registrationProcess.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-lantern-400 mt-0.5">✦</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <RegistrationFlow
              user={user}
              setActiveTab={setActiveTab}
              ownedPasses={ownedPasses}
              refreshOwnedPasses={fetchOwnedPasses}
            />
          </section>
        )}

        {/* TAB 5: CONTACT */}
        {activeTab === "contact" && (
          <section className="relative isolate max-w-5xl mx-auto px-4 py-16 space-y-12">
            <SectionScenery />
            <div className="text-center space-y-2">
              <h2 className="font-display text-4xl md:text-5xl font-black text-lantern-200 glow-text">
                Festival Leadership &amp; Contacts
              </h2>
              <div className="vine-divider w-40 mx-auto" />
              <p className="text-parchment-100/60 text-sm pt-2">
                Reach out to the organizing team for assistance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamContacts.map((mem, idx) => (
                <div
                  key={idx}
                  className="glow-card p-6 rounded-2xl space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-lantern-400">
                      {mem.role}
                    </div>
                    <div className="text-lg font-bold text-parchment-50">
                      {mem.name}
                    </div>
                  </div>
                  <a
                    href={getWhatsAppLink(mem.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-mist-400 hover:text-mist-300 text-xs font-semibold mt-2"
                  >
                    <PhoneIcon /> +91 {mem.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className="glow-card p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-parchment-50">
                  Official Fest Instagram
                </h4>
                <p className="text-xs text-slate-400">
                  Follow @{festDetails.instagram} for live announcements
                </p>
              </div>
              <a
                href={`https://instagram.com/${festDetails.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-full bg-berry-600 hover:bg-berry-500 text-parchment-50 text-xs font-bold flex items-center gap-2 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Open Instagram
              </a>
            </div>
          </section>
        )}

        {/* TAB: ADMIN DASHBOARD */}
        {activeTab === "profile" && (
          <section className="relative isolate max-w-6xl mx-auto px-4 py-16">
            <SectionScenery suits={false} />
            <Profile user={user} setActiveTab={setActiveTab} />
          </section>
        )}

        {activeTab === "admin" && <AdminDashboard />}

        {/* TAB 6: AUTH MODAL / SCREEN */}
        {activeTab === "auth" && (
          <section className="max-w-md mx-auto px-4 py-20">
            <div className="glow-card p-8 rounded-3xl space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-display font-bold text-parchment-50">
                  {authMode === "login"
                    ? "Login to Spandan"
                    : "Create an Account"}
                </h3>
                <p className="text-xs text-parchment-100/60">
                  Manage your event registrations
                </p>
              </div>

              {authMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    authMessageType === "success"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-lantern-500/20 border-lantern-500/40 text-lantern-200"
                  }`}
                >
                  {authMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 rounded-full bg-white text-canopy-950 font-bold text-xs flex items-center justify-center gap-2.5 hover:brightness-95 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <div className="flex-1 h-px bg-white/10" />
                OR
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleAuth} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 focus:outline-none focus:border-mist-400 focus:ring-1 focus:ring-mist-400/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showAuthPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 focus:outline-none focus:border-mist-400 focus:ring-1 focus:ring-mist-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                      aria-label={
                        showAuthPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showAuthPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                          className="h-4 w-4"
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
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-mist-400 hover:text-mist-300 underline mt-1.5"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                {authMode === "signup" && (
                  <div>
                    <label className="block text-slate-300 mb-1">Confirm Password</label>
                    <input
                      required
                      type={showAuthPassword ? "text" : "password"}
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 rounded-xl bg-canopy-950/50 border text-parchment-50 focus:outline-none focus:ring-1 ${
                        authConfirmPassword && authConfirmPassword !== authPassword
                          ? "border-red-500/50 focus:border-red-400 focus:ring-red-400/40"
                          : "border-lantern-500/15 focus:border-mist-400 focus:ring-mist-400/40"
                      }`}
                    />
                    {authConfirmPassword && authConfirmPassword !== authPassword && (
                      <p className="text-[11px] text-red-400 mt-1">Passwords do not match.</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-mist-500 font-bold text-parchment-50 shadow-[0_4px_0_0_rgba(23,69,62,0.9)] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all"
                >
                  {authMode === "login" ? "Sign In" : "Register Account"}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400">
                {authMode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthConfirmPassword("");
                      }}
                      className="text-mist-400 font-semibold underline"
                    >
                      Sign up here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setAuthConfirmPassword("");
                      }}
                      className="text-mist-400 font-semibold underline"
                    >
                      Login here
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
