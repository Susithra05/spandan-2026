// src/components/RegistrationFlow.jsx
import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { generateDelegateId } from "../lib/idGenerator";
import {
  tiers,
  clubPasses,
  eventCategories,
  eventsList,
  specialSections,
  accommodation,
  getEventAccess,
  isTeamEvent,
  subEventLabel,
  FORM_ONLY_EVENT_IDS,
  UTR_REGEX,
} from "../data/festData";

const CheckIcon = () => (
  <svg className="w-4 h-4 text-lantern-300 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockBadge = ({ label }) => (
  <div className="absolute top-3 right-3 z-10 group/lock">
    <div className="w-7 h-7 rounded-full bg-canopy-950/90 border border-lantern-500/40 flex items-center justify-center cursor-help">
      <svg className="w-3.5 h-3.5 text-lantern-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 018 0v3" />
      </svg>
    </div>
    <div className="pointer-events-none absolute right-0 top-9 w-48 p-2.5 rounded-xl bg-canopy-950 border border-lantern-500/30 text-[10px] text-parchment-100/90 opacity-0 group-hover/lock:opacity-100 transition-opacity shadow-xl z-20">
      Buy {label} to unlock registration for this event
    </div>
  </div>
);

const onlyDigits = (val, max = 10) => val.replace(/\D/g, "").slice(0, max);

// Compulsory 12-digit UTR / UPI Transaction Reference Number input,
// shared by both the Pass Checkout and Event Checkout forms.
const UtrInput = ({ value, onChange }) => {
  const isValid = UTR_REGEX.test(value);
  const showError = value.length > 0 && !isValid;
  return (
    <div>
      <label className="text-xs text-parchment-100/70 block mb-1">
        UTR / UPI Transaction Reference Number <span className="text-red-400">*</span>
      </label>
      <input
        placeholder="12-digit UTR number"
        value={value}
        maxLength={12}
        inputMode="numeric"
        onChange={(e) => onChange(onlyDigits(e.target.value, 12))}
        className={`w-full px-4 py-3 rounded-xl bg-canopy-950/50 border text-parchment-50 text-sm focus:outline-none ${
          isValid ? "border-emerald-500/50" : showError ? "border-red-500/50" : "border-lantern-500/15"
        }`}
      />
      {showError && <p className="text-[11px] text-red-400 mt-1">UTR must be exactly 12 digits.</p>}
      {isValid && <p className="text-[11px] text-emerald-400 mt-1">✓ Looks good</p>}
      <p className="text-[10px] text-parchment-100/50 mt-1">
        Found on your UPI app's payment confirmation screen or bank statement, right after you pay.
      </p>
    </div>
  );
};

// Renders the UPI payment QR code reliably across every checkout —
// falls back to plain text (with the UPI ID, if known) if the image
// asset ever fails to load, instead of leaving a broken/hidden image.
const PaymentQR = ({ upiId }) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="p-4 rounded-2xl bg-canopy-950/60 border border-lantern-500/20 flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-parchment-50">Scan &amp; Pay via UPI</p>
      {!imgFailed ? (
        <img
          src="/upi-qr.png"
          alt="Spandan 2026 UPI Payment QR Code"
          onError={() => setImgFailed(true)}
          className="w-48 h-48 object-contain rounded-xl bg-white p-2"
        />
      ) : (
        <div className="w-48 h-48 flex items-center justify-center rounded-xl bg-white/5 border border-dashed border-lantern-500/30 text-center p-3">
          <p className="text-[11px] text-parchment-100/70">
            QR code image couldn't load.{upiId ? ` Pay directly to UPI ID: ${upiId}` : " Please contact the committee for the UPI ID."}
          </p>
        </div>
      )}
      <p className="text-[10px] text-parchment-100/50 text-center">
        After paying, upload your screenshot and enter the UTR number below.
      </p>
    </div>
  );
};

const statusBanner = {
  PENDING_VERIFICATION: { text: "Verification Pending", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  APPROVED: { text: "Accepted / Approved", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  REJECTED: { text: "Rejected", cls: "bg-red-500/15 text-red-300 border-red-500/40" },
};

export default function RegistrationFlow({ user, setActiveTab, ownedPasses, refreshOwnedPasses }) {
  // Top-level view: which of the two SEPARATE checkouts is active.
  // You can only reach "events" once you own at least one pass.
  const [view, setView] = useState(ownedPasses.length > 0 ? "events" : "passes");

  // My own Delegate ID(s), fetched for prefill/confirmation at event checkout
  const [myDelegateIds, setMyDelegateIds] = useState([]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("purchases")
        .select("delegate_id, full_name, phone")
        .eq("user_id", user.id)
        .not("delegate_id", "is", null);
      setMyDelegateIds(data || []);
    })();
  }, [user, ownedPasses]);

  if (!user) {
    return (
      <div className="glow-card p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
        <p className="text-parchment-100/80 text-sm">
          Please log in or create an account first to register for Spandan.
        </p>
        <button onClick={() => setActiveTab("auth")} className="px-6 py-2.5 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm">
          Login / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sequential-flow toggle */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <button
          onClick={() => setView("passes")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            view === "passes" ? "bg-lantern-400 text-canopy-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          1. Buy Pass / Tier
        </button>
        <div className="w-6 h-px bg-white/10" />
        <button
          onClick={() => ownedPasses.length > 0 && setView("events")}
          disabled={ownedPasses.length === 0}
          title={ownedPasses.length === 0 ? "Buy a Pass or Tier first to unlock event registration" : ""}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            view === "events"
              ? "bg-lantern-400 text-canopy-950"
              : ownedPasses.length === 0
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          2. Register for Events {ownedPasses.length === 0 && "🔒"}
        </button>
      </div>

      {view === "passes" && (
        <PassCheckout
          user={user}
          ownedPasses={ownedPasses}
          refreshOwnedPasses={refreshOwnedPasses}
          onDoneGoToEvents={() => setView("events")}
        />
      )}

      {view === "events" && ownedPasses.length > 0 && (
        <EventsCheckout user={user} ownedPasses={ownedPasses} myDelegateIds={myDelegateIds} />
      )}
    </div>
  );
}

// ============================================================
// STEP 1 — PASS / TIER CHECKOUT (standalone, no events attached)
// ============================================================
function PassCheckout({ user, ownedPasses, refreshOwnedPasses, onDoneGoToEvents }) {
  const [subStep, setSubStep] = useState("select"); // select -> checkout -> success
  const [cartPasses, setCartPasses] = useState([]);
  const [formData, setFormData] = useState({ fullName: "", phone: "", college: "", yearOfStudy: "1st Year" });
  const [idCardFile, setIdCardFile] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const passesAmount = useMemo(() => {
    let total = 0;
    const tierCode = cartPasses.find((c) => tiers.find((t) => t.id === c));
    if (tierCode) total += tiers.find((t) => t.id === tierCode)?.price || 0;
    cartPasses.forEach((code) => {
      const club = clubPasses.find((p) => p.id === code);
      if (club) total += club.price;
    });
    return total;
  }, [cartPasses]);

  const toggleTier = (tierId) => {
    setCartPasses((prev) => {
      const withoutTiers = prev.filter((c) => !tiers.find((t) => t.id === c));
      return prev.includes(tierId) ? withoutTiers : [...withoutTiers, tierId];
    });
  };
  const toggleClubPass = (passId) => {
    setCartPasses((prev) => (prev.includes(passId) ? prev.filter((c) => c !== passId) : [...prev, passId]));
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    const cleanPhone = onlyDigits(formData.phone);
    if (cleanPhone.length !== 10) return setErrorMsg("Please enter a valid 10-digit phone number.");
    if (!formData.fullName.trim() || !formData.college.trim()) return setErrorMsg("Please fill in your name and college.");
    if (!idCardFile) return setErrorMsg("Please upload a photo of your College ID card.");
    if (!paymentScreenshot) return setErrorMsg("Please upload your payment screenshot.");
    if (!UTR_REGEX.test(utrNumber)) return setErrorMsg("Please enter a valid 12-digit UTR / UPI Transaction Reference Number.");

    setSubmitting(true);
    let step_ = "uploading your College ID card";
    try {
      const idExt = idCardFile.name.split(".").pop();
      const idPath = `id_cards/id_${user.id}_${Date.now()}.${idExt}`;
      const { error: idErr } = await supabase.storage.from("payment-screenshots").upload(idPath, idCardFile);
      if (idErr) throw idErr;
      const { data: idUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(idPath);

      step_ = "uploading your payment screenshot";
      const payExt = paymentScreenshot.name.split(".").pop();
      const payPath = `receipts/pay_${user.id}_${Date.now()}.${payExt}`;
      const { error: payErr } = await supabase.storage.from("payment-screenshots").upload(payPath, paymentScreenshot);
      if (payErr) throw payErr;
      const { data: payUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(payPath);

      step_ = "generating your Delegate ID";
      const delegateId = await generateDelegateId(cartPasses);

      step_ = "saving your purchase record";
      const passType = cartPasses.some((c) => tiers.find((t) => t.id === c)) ? "tier" : "club";
      const { error: purchaseErr } = await supabase.from("purchases").insert([
        {
          user_id: user.id,
          delegate_id: delegateId,
          pass_type: passType,
          pass_codes: cartPasses,
          full_name: formData.fullName,
          email: user.email,
          phone: cleanPhone,
          college: formData.college,
          year_of_study: formData.yearOfStudy,
          id_card_url: idUrlData.publicUrl,
          payment_screenshot_url: payUrlData.publicUrl,
          utr_number: utrNumber,
          base_amount: passesAmount,
          events_amount: 0,
          total_amount: passesAmount,
          payment_status: "PENDING_VERIFICATION",
        },
      ]);
      if (purchaseErr) throw purchaseErr;

      setResult({ delegateId, totalAmount: passesAmount });
      setSubStep("success");
      if (refreshOwnedPasses) refreshOwnedPasses();
    } catch (err) {
      setErrorMsg(`Registration failed while ${step_}: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (subStep === "success" && result) {
    return (
      <div className="max-w-lg mx-auto glow-card p-10 rounded-3xl text-center space-y-6">
        <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${statusBanner.PENDING_VERIFICATION.cls}`}>
          ⏳ {statusBanner.PENDING_VERIFICATION.text}
        </div>
        <h3 className="text-2xl font-display font-bold text-parchment-50">Pass Registration Submitted!</h3>
        <p className="text-sm text-parchment-100/70">
          Your details are pending committee verification. You'll receive a confirmation email once approved.
        </p>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-lantern-600/30 to-berry-700/20 border border-lantern-400/40 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-lantern-300">Your Delegate ID</p>
          <p className="text-3xl font-mono font-black text-parchment-50 tracking-wider">{result.delegateId}</p>
        </div>
        <button onClick={onDoneGoToEvents} className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm">
          Continue to Event Registration →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {ownedPasses.length > 0 && (
        <div className="glow-card p-4 rounded-2xl text-xs text-parchment-100/80 text-center">
          You already hold: <span className="text-lantern-300 font-semibold">{ownedPasses.join(", ")}</span>. You can buy an
          additional pass below, or head straight to Event Registration.
        </div>
      )}

      {subStep === "select" && (
        <>
          <div>
            <h3 className="text-lg font-display font-bold text-parchment-50 mb-3">Delegate Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => toggleTier(tier.id)}
                  className={`cursor-pointer p-6 rounded-3xl border bg-gradient-to-b ${tier.color} backdrop-blur-md flex flex-col justify-between space-y-6 transition-all ${
                    cartPasses.includes(tier.id) ? "ring-2 ring-lantern-300 shadow-2xl -translate-y-1" : "opacity-85 hover:opacity-100"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="stamp-badge px-3 py-1 rounded-full text-sm bg-white/10 text-parchment-50">
                        {tier.tierLabel} · {tier.tag}
                      </div>
                      <span className="text-3xl leading-none text-parchment-50/90">{tier.suit}</span>
                    </div>
                    <h3 className="text-2xl font-display font-black text-parchment-50">{tier.name}</h3>
                    <div className="text-3xl font-display font-extrabold text-parchment-50">
                      ₹{tier.price}
                      <span className="text-xs font-body font-normal text-parchment-100/60"> / delegate</span>
                    </div>
                    <ul className="space-y-2 text-xs text-parchment-100/85">
                      {tier.amenities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    className={`w-full py-3 rounded-full font-bold text-xs tracking-wider transition ${
                      cartPasses.includes(tier.id) ? "bg-lantern-400 text-canopy-950 shadow-lg" : "bg-white/10 hover:bg-white/20 text-parchment-50"
                    }`}
                  >
                    {cartPasses.includes(tier.id) ? "✓ Selected" : "Select Tier"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-parchment-50 mb-1">Club Passes</h3>
            <p className="text-xs text-parchment-100/50 mb-3">
              Select any combination. A pass grants entry/access to register for its category — event registration fees
              still apply separately at Event Checkout.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubPasses.map((pass) => (
                <div
                  key={pass.id}
                  onClick={() => toggleClubPass(pass.id)}
                  className={`cursor-pointer p-6 rounded-3xl border bg-canopy-950/80 border-lantern-500/20 backdrop-blur-md flex flex-col justify-between space-y-4 transition-all ${
                    cartPasses.includes(pass.id)
                      ? "ring-2 ring-lantern-300 border-lantern-400 shadow-2xl -translate-y-1 bg-canopy-900"
                      : "hover:border-lantern-500/40 opacity-90 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-lantern-400 font-bold">{pass.passLabel}</span>
                      <span className="text-xl font-extrabold text-lantern-300">₹{pass.price}</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-parchment-50">{pass.name}</h3>
                    <p className="text-xs text-parchment-100/70 mt-1">{pass.desc}</p>
                  </div>
                  <div className={`text-center py-2 rounded-full text-xs font-bold ${cartPasses.includes(pass.id) ? "bg-lantern-400 text-canopy-950" : "bg-white/10 text-parchment-50"}`}>
                    {cartPasses.includes(pass.id) ? "✓ Selected" : "Select Pass"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={cartPasses.length === 0}
              onClick={() => setSubStep("checkout")}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Checkout →
            </button>
          </div>
        </>
      )}

      {subStep === "checkout" && (
        <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-display font-bold text-parchment-50 text-center">Complete Your Details</h3>

          {errorMsg && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">{errorMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm focus:outline-none focus:border-mist-400"
            />
            <input
              placeholder="Phone Number (WhatsApp)"
              value={formData.phone}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => setFormData({ ...formData, phone: onlyDigits(e.target.value) })}
              className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm focus:outline-none focus:border-mist-400"
            />
            <input
              placeholder="College / Institution"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm focus:outline-none focus:border-mist-400"
            />
            <select
              value={formData.yearOfStudy}
              onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
              className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm focus:outline-none focus:border-mist-400"
            >
              {["1st Year", "2nd Year", "3rd Year", "4th Year", "Intern", "PG/Resident"].map((y) => (
                <option key={y} value={y} className="bg-canopy-950">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-canopy-950/60 rounded-2xl p-4 flex justify-between items-center text-sm font-bold">
            <span className="text-parchment-50">Total Payable</span>
            <span className="text-lantern-300">₹{passesAmount}</span>
          </div>

          <PaymentQR />

          <div className="space-y-3">
            <div>
              <label className="text-xs text-parchment-100/70 block mb-1">College ID Card Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIdCardFile(e.target.files[0])}
                className="text-xs text-parchment-100/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-lantern-500/20 file:text-lantern-300 file:text-xs w-full"
              />
            </div>
            <div>
              <label className="text-xs text-parchment-100/70 block mb-1">Payment Screenshot (UPI)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                className="text-xs text-parchment-100/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-lantern-500/20 file:text-lantern-300 file:text-xs w-full"
              />
            </div>
            <UtrInput value={utrNumber} onChange={setUtrNumber} />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setSubStep("select")} className="px-6 py-3 rounded-full bg-white/10 text-parchment-50 text-sm font-bold">
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50"
            >
              {submitting ? "Processing..." : `Confirm & Pay ₹${passesAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STEP 2 — EVENTS CHECKOUT (only reachable once a pass is owned)
// ============================================================
function EventsCheckout({ user, ownedPasses, myDelegateIds }) {
  const [subStep, setSubStep] = useState("browse"); // browse -> checkout -> success
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartEvents, setCartEvents] = useState([]);
  const [expandedTeamKey, setExpandedTeamKey] = useState(null);

  const [delegateId, setDelegateId] = useState(myDelegateIds[0]?.delegate_id || "");
  const [delegateVerified, setDelegateVerified] = useState(null);
  const [participantName, setParticipantName] = useState(myDelegateIds[0]?.full_name || "");
  const [participantWhatsapp, setParticipantWhatsapp] = useState(myDelegateIds[0]?.phone || "");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (myDelegateIds[0]) {
      setDelegateId(myDelegateIds[0].delegate_id);
      setParticipantName(myDelegateIds[0].full_name || "");
      setParticipantWhatsapp(myDelegateIds[0].phone || "");
    }
  }, [myDelegateIds]);

  const filteredEvents = useMemo(() => {
    let list = selectedCategory === "all" ? eventsList : eventsList.filter((ev) => ev.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((ev) => ev.title.toLowerCase().includes(q) || ev.desc?.toLowerCase().includes(q));
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // For team events, the price is per-person: perPersonPrice × number of
  // members currently in the roster. Non-team events keep a flat price.
  const entryPrice = (e) => (e.isTeam ? e.perPersonPrice * Math.max(e.members.length, 1) : e.price);

  const eventsAmount = useMemo(() => cartEvents.reduce((sum, e) => sum + (entryPrice(e) || 0), 0), [cartEvents]);

  const addEventToCart = (event, subEvent = null) => {
    const subLabel = subEvent ? subEventLabel(subEvent) : null;
    const key = subLabel ? `${event.id}:${subLabel}` : event.id;
    if (cartEvents.some((e) => e.key === key)) return;
    const access = getEventAccess(event, ownedPasses, subEvent);
    const team = isTeamEvent(event);
    // This is only a starting suggestion — team rosters are fully
    // flexible now, members can be freely added or removed, and the
    // price recalculates live as perPersonPrice × current roster size.
    const suggestedSize = event.minTeamSize || (team ? 2 : 0);
    const entry = {
      key,
      eventId: event.id,
      title: subLabel ? `${event.title} — ${subLabel}` : event.title,
      subEvent: subLabel,
      price: access.price,
      perPersonPrice: access.price,
      isTeam: team,
      suggestedTeamSize: suggestedSize,
      members: team ? Array.from({ length: suggestedSize || 1 }, () => ({ name: "", whatsapp: "", delegateId: "" })) : [],
    };
    setCartEvents((prev) => [...prev, entry]);
    if (team) setExpandedTeamKey(key);
  };

  const removeEventFromCart = (key) => {
    setCartEvents((prev) => prev.filter((e) => e.key !== key));
    if (expandedTeamKey === key) setExpandedTeamKey(null);
  };

  const addMemberRow = (key) => {
    setCartEvents((prev) => prev.map((e) => (e.key === key ? { ...e, members: [...e.members, { name: "", whatsapp: "", delegateId: "" }] } : e)));
  };
  const removeMemberRow = (key, idx) => {
    setCartEvents((prev) =>
      prev.map((e) => {
        if (e.key !== key) return e;
        // No more hardcoded minimum — any row can be removed, down to a
        // single remaining member (a team can't register with zero people).
        if (e.members.length <= 1) return e;
        return { ...e, members: e.members.filter((_, i) => i !== idx) };
      })
    );
  };
  const updateTeamMember = (key, idx, field, value) => {
    setCartEvents((prev) =>
      prev.map((e) => {
        if (e.key !== key) return e;
        const members = [...e.members];
        members[idx] = { ...(members[idx] || {}), [field]: value };
        return { ...e, members };
      })
    );
  };

  // Checks existence, and — when an event is given — whether that
  // person's pass actually grants access to THIS specific event.
  const validateId = async (idValue, event) => {
    if (!idValue?.trim()) return { status: null };
    const { data, error } = await supabase.rpc("verify_delegate_id", { p_delegate_id: idValue.trim().toUpperCase() });
    if (error || !data || data.length === 0) return { status: "not_found" };
    const record = data[0];
    if (event) {
      const access = getEventAccess(event, record.pass_codes || []);
      if (!access.unlocked) return { status: "invalid_pass", name: record.full_name };
    }
    return { status: "valid", name: record.full_name };
  };

  const eventById = (eventId) => eventsList.find((e) => e.id === eventId);

  const verifyMemberId = async (key, idx) => {
    const entry = cartEvents.find((e) => e.key === key);
    const member = entry?.members[idx];
    const event = eventById(entry?.eventId);
    const result = await validateId(member?.delegateId, event);
    updateTeamMember(key, idx, "validation", result.status);
    updateTeamMember(key, idx, "verified", result.status === "valid");
    updateTeamMember(key, idx, "verifiedName", result.name || null);
  };

  const [selfValidation, setSelfValidation] = useState(null);
  const verifySelfId = async () => {
    const result = await validateId(delegateId, null);
    setSelfValidation(result.status);
    setDelegateVerified(result.status === "valid");
    if (result.status === "valid" && result.name) setParticipantName((prev) => prev || result.name);
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (cartEvents.length === 0) return setErrorMsg("Add at least one event to your cart.");
    if (!delegateId.trim()) return setErrorMsg("Please enter your Delegate ID.");
    if (delegateVerified !== true) return setErrorMsg('Please validate your Delegate ID (click "Validate") before checking out.');
    if (!participantName.trim()) return setErrorMsg("Please enter your name.");
    const cleanPhone = onlyDigits(participantWhatsapp);
    if (cleanPhone.length !== 10) return setErrorMsg("Please enter a valid 10-digit WhatsApp number.");
    if (!paymentScreenshot) return setErrorMsg("Please upload your payment screenshot.");
    if (!UTR_REGEX.test(utrNumber)) return setErrorMsg("Please enter a valid 12-digit UTR / UPI Transaction Reference Number.");

    for (const e of cartEvents) {
      if (!e.isTeam) continue;
      if (e.members.length < 1) {
        return setErrorMsg(`${e.title} needs at least one team member.`);
      }
      for (const m of e.members) {
        if (!m.name || !m.whatsapp || !m.delegateId) return setErrorMsg(`Please complete every team member's details for ${e.title}.`);
        if (!m.verified) return setErrorMsg(`Please validate every team member's Delegate ID for ${e.title} before checking out.`);
      }
    }

    setSubmitting(true);
    let step_ = "uploading your payment screenshot";
    try {
      const payExt = paymentScreenshot.name.split(".").pop();
      const payPath = `receipts/pay_${user.id}_${Date.now()}.${payExt}`;
      const { error: payErr } = await supabase.storage.from("payment-screenshots").upload(payPath, paymentScreenshot);
      if (payErr) throw payErr;
      const { data: payUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(payPath);

      step_ = "saving your purchase record";
      const { data: purchase, error: purchaseErr } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: user.id,
            delegate_id: null,
            pass_type: null,
            pass_codes: [],
            full_name: participantName,
            email: user.email,
            phone: cleanPhone,
            college: myDelegateIds[0]?.college || "",
            id_card_url: null,
            payment_screenshot_url: payUrlData.publicUrl,
            utr_number: utrNumber,
            base_amount: 0,
            events_amount: eventsAmount,
            total_amount: eventsAmount,
            payment_status: "PENDING_VERIFICATION",
          },
        ])
        .select()
        .single();
      if (purchaseErr) throw purchaseErr;

      for (const e of cartEvents) {
        step_ = `saving your registration for "${e.title}"`;
        const { data: evReg, error: evErr } = await supabase
          .from("event_registrations")
          .insert([
            {
              purchase_id: purchase.id,
              event_id: e.eventId,
              event_title: e.title,
              sub_event: e.subEvent,
              price: entryPrice(e),
              is_team_event: e.isTeam,
              team_size: e.isTeam ? e.members.length : null,
              delegate_id: delegateId.trim().toUpperCase(),
              participant_name: participantName,
              participant_whatsapp: cleanPhone,
              utr_number: utrNumber,
            },
          ])
          .select()
          .single();
        if (evErr) throw evErr;

        if (e.isTeam && e.members.length > 0) {
          step_ = `saving the team roster for "${e.title}"`;
          const rows = e.members.map((m) => ({
            event_registration_id: evReg.id,
            full_name: m.name,
            whatsapp_number: onlyDigits(m.whatsapp),
            delegate_id: m.delegateId?.trim().toUpperCase(),
            verified: !!m.verified,
          }));
          const { error: teamErr } = await supabase.from("team_members").insert(rows);
          if (teamErr) throw teamErr;
        }
      }

      setResult({ totalAmount: eventsAmount, count: cartEvents.length });
      setSubStep("success");
    } catch (err) {
      setErrorMsg(`Registration failed while ${step_}: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (subStep === "success" && result) {
    return (
      <div className="max-w-lg mx-auto glow-card p-10 rounded-3xl text-center space-y-6">
        <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${statusBanner.PENDING_VERIFICATION.cls}`}>
          ⏳ {statusBanner.PENDING_VERIFICATION.text}
        </div>
        <h3 className="text-2xl font-display font-bold text-parchment-50">Event Registration Submitted!</h3>
        <p className="text-sm text-parchment-100/70">
          {result.count} event{result.count > 1 ? "s" : ""} registered for ₹{result.totalAmount}, pending committee
          verification. Check your Profile for live status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subStep === "browse" && (
        <>
          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by name..."
              className="w-full px-5 py-3 rounded-full bg-canopy-950/60 border border-lantern-500/20 text-parchment-50 text-sm placeholder:text-parchment-100/40 focus:outline-none focus:border-mist-400"
            />
            <svg className="w-4 h-4 text-parchment-100/40 absolute right-5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {eventCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? cat.special
                      ? "bg-toadstool-500 text-canopy-950"
                      : "bg-mist-500 text-canopy-950"
                    : cat.special
                    ? "bg-toadstool-500/10 text-toadstool-300 border border-toadstool-500/30 hover:bg-toadstool-500/20"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEvents.length === 0 && (
                  <p className="col-span-full text-center text-sm text-parchment-100/50 py-8">No events match your search.</p>
                )}
                {filteredEvents.map((ev) => {
                  const access = getEventAccess(ev, ownedPasses);
                  const hasSub = ev.subEvents && ev.subEvents.length > 0;
                  const isFormOnly = FORM_ONLY_EVENT_IDS.includes(ev.id);

                  return (
                    <div
                      key={ev.id}
                      className={`glow-card p-5 rounded-2xl flex flex-col justify-between space-y-3 relative ${
                        isFormOnly ? "!border-emerald-400/40 shadow-[0_0_20px_-6px_rgba(52,211,153,0.35)]" : ""
                      }`}
                    >
                  {!access.unlocked && !isFormOnly && <LockBadge label={access.requiredLabel} />}
                  {isFormOnly && (
                    <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
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
                        {!isFormOnly &&
                          (access.price > 0 ? `₹${access.price}${isTeamEvent(ev) ? "/person" : ""}` : "Free")}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-parchment-50">{ev.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ev.desc}</p>
                    {ev.externalFormUrl && (
                      <div className="mt-2 p-2 rounded-lg bg-toadstool-500/10 border border-toadstool-500/30">
                        <p className="text-[10px] text-toadstool-300 font-semibold">{ev.externalFormNote}</p>
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

                  {isFormOnly ? null : hasSub ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ev.subEvents.map((sub, idx) => {
                        const subLabel = subEventLabel(sub);
                        const key = `${ev.id}:${subLabel}`;
                        const inCart = cartEvents.some((e) => e.key === key);
                        const subAccess = getEventAccess(ev, ownedPasses, sub);
                        return (
                          <button
                            key={idx}
                            disabled={!access.unlocked}
                            onClick={() => (inCart ? removeEventFromCart(key) : addEventToCart(ev, sub))}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border disabled:opacity-40 disabled:cursor-not-allowed ${
                              inCart ? "bg-lantern-400 text-canopy-950 border-lantern-400 font-bold" : "bg-canopy-950/60 border-white/10 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {inCart ? "✓ " : "+ "}
                            {subLabel}
                            {typeof sub === "object" ? ` · ${subAccess.price > 0 ? `₹${subAccess.price}` : "Free"}` : ""}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      disabled={!access.unlocked}
                      onClick={() => (cartEvents.some((e) => e.key === ev.id) ? removeEventFromCart(ev.id) : addEventToCart(ev))}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
                        !access.unlocked
                          ? "bg-white/5 text-parchment-100/50"
                          : cartEvents.some((e) => e.key === ev.id)
                          ? "bg-lantern-400 text-canopy-950"
                          : "bg-white/10 hover:bg-white/20 text-parchment-50"
                      }`}
                    >
                      {!access.unlocked ? (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="10" width="16" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 018 0v3" />
                          </svg>
                          Buy Valid Pass to Unlock
                        </>
                      ) : cartEvents.some((e) => e.key === ev.id) ? (
                        "✓ Added"
                      ) : (
                        "+ Add Event"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
              </div>
            </>
          )}

          {cartEvents.length > 0 && (
            <div className="glow-card p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-display font-bold text-parchment-50">Your Cart ({cartEvents.length})</h3>
              {cartEvents.map((e) => (
                <div key={e.key} className="border-b border-white/5 pb-3 last:border-0">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-parchment-50 font-medium">{e.title}</span>
                      {e.isTeam && <span className="text-[10px] text-lantern-300 ml-2">TEAM EVENT</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lantern-300 font-bold">
                        {entryPrice(e) > 0 ? `₹${entryPrice(e)}` : "Free"}
                        {e.isTeam && e.perPersonPrice > 0 && (
                          <span className="text-[10px] text-parchment-100/50 font-normal ml-1">
                            (₹{e.perPersonPrice} × {Math.max(e.members.length, 1)})
                          </span>
                        )}
                      </span>
                      <button onClick={() => removeEventFromCart(e.key)} className="text-red-400 text-xs hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>

                  {e.isTeam && (
                    <div className="mt-3 pl-2 border-l-2 border-lantern-500/20 space-y-2">
                      <p className="text-[10px] text-parchment-100/60 uppercase tracking-wider">
                        Team Roster ({e.members.length}) — add as many members as your team needs
                        {e.suggestedTeamSize ? ` (suggested: ${e.suggestedTeamSize})` : ""}
                      </p>
                      {e.members.map((m, idx) => {
                        const canRemove = e.members.length > 1;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr_auto_auto] gap-2 items-center">
                              <input
                                placeholder={`Member ${idx + 1} Name`}
                                value={m.name || ""}
                                onChange={(ev3) => updateTeamMember(e.key, idx, "name", ev3.target.value)}
                                className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                              />
                              <input
                                placeholder="WhatsApp Number"
                                value={m.whatsapp || ""}
                                maxLength={10}
                                inputMode="numeric"
                                onChange={(ev3) => updateTeamMember(e.key, idx, "whatsapp", onlyDigits(ev3.target.value))}
                                className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                              />
                              <div className="relative">
                                <input
                                  placeholder="Delegate ID (e.g. DT10019)"
                                  value={m.delegateId || ""}
                                  onChange={(ev3) => {
                                    updateTeamMember(e.key, idx, "delegateId", ev3.target.value);
                                    updateTeamMember(e.key, idx, "verified", null);
                                    updateTeamMember(e.key, idx, "validation", null);
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg bg-canopy-950/60 border text-parchment-50 text-xs ${
                                    m.verified === true ? "border-emerald-500/50" : m.validation ? "border-red-500/50" : "border-white/10"
                                  }`}
                                />
                                {m.verified === true && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px]">✓</span>}
                              </div>
                              <button
                                onClick={() => verifyMemberId(e.key, idx)}
                                className="px-3 py-2 rounded-lg bg-mist-500 text-canopy-950 text-[11px] font-bold shrink-0"
                              >
                                Validate
                              </button>
                              <button
                                onClick={() => removeMemberRow(e.key, idx)}
                                disabled={!canRemove}
                                title={!canRemove ? "A team needs at least one member" : "Remove"}
                                className="text-red-400 text-xs hover:underline justify-self-start sm:justify-self-center disabled:text-slate-600 disabled:no-underline disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </div>
                            {m.validation === "not_found" && (
                              <p className="text-[10px] text-red-400 pl-1">No such ID present.</p>
                            )}
                            {m.validation === "invalid_pass" && (
                              <p className="text-[10px] text-red-400 pl-1">Invalid Pass for this Event.</p>
                            )}
                          </div>
                        );
                      })}
                      <button onClick={() => addMemberRow(e.key)} className="text-lantern-300 text-xs font-semibold hover:underline">
                        + Add Team Member
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-sm font-bold">
                <span className="text-parchment-50">Events Subtotal</span>
                <span className="text-lantern-300">₹{eventsAmount}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              disabled={cartEvents.length === 0}
              onClick={() => setSubStep("checkout")}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Checkout →
            </button>
          </div>
        </>
      )}

      {subStep === "checkout" && (
        <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-display font-bold text-parchment-50 text-center">Confirm Event Registration</h3>

          {errorMsg && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">{errorMsg}</div>}

          <div>
            <label className="text-xs text-parchment-100/70 block mb-1">Your Delegate ID</label>
            <div className="flex gap-2">
              <input
                value={delegateId}
                onChange={(e) => {
                  setDelegateId(e.target.value);
                  setDelegateVerified(null);
                  setSelfValidation(null);
                }}
                placeholder="e.g. DT10019"
                className={`flex-1 px-4 py-3 rounded-xl bg-canopy-950/50 border text-parchment-50 text-sm focus:outline-none ${
                  delegateVerified === true ? "border-emerald-500/50" : selfValidation ? "border-red-500/50" : "border-lantern-500/15"
                }`}
              />
              <button onClick={verifySelfId} className="px-4 py-2 rounded-xl bg-mist-500 text-canopy-950 text-xs font-bold shrink-0">
                Validate
              </button>
            </div>
            {delegateVerified === true && <p className="text-[11px] text-emerald-400 mt-1">✓ Valid Delegate ID</p>}
            {selfValidation === "not_found" && <p className="text-[11px] text-red-400 mt-1">No such ID present.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Full Name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm focus:outline-none focus:border-mist-400"
            />
            <input
              placeholder="WhatsApp Number"
              value={participantWhatsapp}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => setParticipantWhatsapp(onlyDigits(e.target.value))}
              className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm focus:outline-none focus:border-mist-400"
            />
          </div>

          <div className="bg-canopy-950/60 rounded-2xl p-4 flex justify-between items-center text-sm font-bold">
            <span className="text-parchment-50">Total Payable ({cartEvents.length} events)</span>
            <span className="text-lantern-300">₹{eventsAmount}</span>
          </div>

          <PaymentQR />

          <div>
            <label className="text-xs text-parchment-100/70 block mb-1">Payment Screenshot (UPI)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPaymentScreenshot(e.target.files[0])}
              className="text-xs text-parchment-100/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-lantern-500/20 file:text-lantern-300 file:text-xs w-full"
            />
          </div>

          <UtrInput value={utrNumber} onChange={setUtrNumber} />

          <div className="flex justify-between">
            <button onClick={() => setSubStep("browse")} className="px-6 py-3 rounded-full bg-white/10 text-parchment-50 text-sm font-bold">
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50"
            >
              {submitting ? "Processing..." : `Confirm & Pay ₹${eventsAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
