// src/components/RegistrationFlow.jsx
import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { generateDelegateId, generateGroupCode, buildGroupDelegateId, normalizeDelegateId, INDIVIDUAL_ID_REGEX, GROUP_ID_REGEX } from "../lib/idGenerator";
import { provisionGroupMember, sendNotification } from "../lib/serverApi";
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
  UPI_ID,
  UPI_MERCHANT_NAME,
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

// Shared by PassCheckout (buying for yourself) and GroupPurchaseCheckout
// (a Group Leader buying the same pass bundle for N people) so pricing
// logic only lives in one place.
const computePassesAmount = (cartPasses) => {
  let total = 0;
  const tierCode = cartPasses.find((c) => tiers.find((t) => t.id === c));
  if (tierCode) total += tiers.find((t) => t.id === tierCode)?.price || 0;
  cartPasses.forEach((code) => {
    const club = clubPasses.find((p) => p.id === code);
    if (club) total += club.price;
  });
  return total;
};

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

// Small "📋 Copy" chip, reused for the UPI ID (here) and for every
// field on the Review Details modal below.
const CopyChip = ({ value, label = "value" }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = async (ev) => {
    ev?.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for older / permission-denied browsers
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      type="button"
      onClick={doCopy}
      title={`Copy ${label}`}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-parchment-50 text-[10px] font-bold transition shrink-0"
    >
      {copied ? "✓ Copied" : "📋 Copy"}
    </button>
  );
};

// Renders the UPI payment QR code reliably across every checkout —
// falls back to plain text (with the UPI ID, if known) if the image
// asset ever fails to load, instead of leaving a broken/hidden image.
// Below the QR, always shows the UPI ID (with a copy button) and the
// registered merchant name, so people can pay manually if scanning
// isn't an option.
const PaymentQR = ({ upiId = UPI_ID, merchantName = UPI_MERCHANT_NAME }) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="p-4 rounded-2xl bg-canopy-950/60 border border-lantern-500/20 flex flex-col items-center gap-3">
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

      <div className="w-full space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-parchment-100/50 shrink-0">UPI ID</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono font-semibold text-parchment-50 text-xs truncate">{upiId}</span>
            <CopyChip value={upiId} label="UPI ID" />
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-parchment-100/50 shrink-0 mt-0.5">Merchant</span>
          <span className="font-semibold text-parchment-50 text-xs text-right leading-tight">{merchantName}</span>
        </div>
      </div>

      <p className="text-[10px] text-parchment-100/50 text-center">
        After paying, upload your screenshot and enter the UTR number below.
      </p>
    </div>
  );
};

// ------------------------------------------------------------------
// REVIEW DETAILS MODAL — shown right before final submission on both
// checkout flows. Lets the person double-check every field, the
// attached screenshot(s), and the UTR before it's written to the
// database. "Go Back & Edit" just closes the overlay (the form behind
// it keeps whatever was typed); "Confirm & Submit" runs the real
// submit handler.
// ------------------------------------------------------------------
function FilePreview({ file, label }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  if (!file) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-parchment-100/50">{label}</p>
      {url && (
        <img src={url} alt={label} className="w-full max-h-56 object-contain rounded-xl bg-white/5 border border-white/10" />
      )}
      <p className="text-[10px] text-parchment-100/40 truncate">{file.name}</p>
    </div>
  );
}

function ReviewDetailsModal({ title, fields, files = [], amount, isFree, utrNumber, onBack, onConfirm, submitting, errorMsg, progressMsg }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-canopy-950/80 backdrop-blur-sm">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-lg glow-card p-6 sm:p-8 rounded-3xl space-y-5 my-auto">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-display font-bold text-parchment-50">Review Your Details</h3>
          <p className="text-xs text-parchment-100/60">{title}</p>
        </div>

        {errorMsg && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">{errorMsg}</div>}
        {submitting && progressMsg && <p className="text-xs text-center text-parchment-100/60">{progressMsg}</p>}

        <div className="rounded-2xl border border-lantern-500/15 divide-y divide-white/5 overflow-hidden">
          {fields.map((f, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 px-4 py-2.5 text-xs">
              <span className="text-parchment-100/50 shrink-0">{f.label}</span>
              <span className="text-parchment-50 font-medium text-right break-words">{f.value || "—"}</span>
            </div>
          ))}
          {!isFree && utrNumber && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
              <span className="text-parchment-100/50 shrink-0">UTR Number</span>
              <span className="text-parchment-50 font-mono font-medium">{utrNumber}</span>
            </div>
          )}
        </div>

        {!isFree && files.filter((f) => f.file).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((f, idx) => (
              <FilePreview key={idx} file={f.file} label={f.label} />
            ))}
          </div>
        )}

        <div className="bg-canopy-950/60 rounded-2xl p-4 flex justify-between items-center text-sm font-bold">
          <span className="text-parchment-50">Total Payable</span>
          <span className="text-lantern-300">{isFree ? "Free (₹0)" : `₹${amount}`}</span>
        </div>

        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="px-6 py-3 rounded-full bg-white/10 text-parchment-50 text-sm font-bold disabled:opacity-50"
          >
            ← Go Back &amp; Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Confirm & Submit"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

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
  const refreshMyDelegateIds = async () => {
    const { data } = await supabase
      .from("purchases")
      .select("delegate_id, full_name, phone, college")
      .eq("user_id", user.id)
      .not("delegate_id", "is", null);
    setMyDelegateIds(data || []);
  };
  useEffect(() => {
    if (!user) return;
    refreshMyDelegateIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ownedPasses]);

  // Groups this user LEADS (empty for everyone until they run a group
  // purchase for the first time). Drives the "Group Registration" tab
  // and the Individual/Group ID toggle on the Events checkout.
  const [myGroups, setMyGroups] = useState([]);
  const refreshMyGroups = async () => {
    const { data } = await supabase.from("groups").select("*").eq("leader_user_id", user.id).order("created_at", { ascending: false });
    setMyGroups(data || []);
  };
  useEffect(() => {
    if (!user) return;
    refreshMyGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
        <div className="w-6 h-px bg-white/10" />
        <button
          onClick={() => setView("group")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            view === "group" ? "bg-lantern-400 text-canopy-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          👑 Group Registration
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
        <EventsCheckout user={user} ownedPasses={ownedPasses} myDelegateIds={myDelegateIds} myGroups={myGroups} />
      )}

      {view === "group" && (
        <GroupPurchaseCheckout user={user} myGroups={myGroups} refreshMyGroups={refreshMyGroups} refreshOwnedPasses={refreshOwnedPasses} />
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
  const [showReview, setShowReview] = useState(false);

  const passesAmount = useMemo(() => computePassesAmount(cartPasses), [cartPasses]);

  // Currently no Delegate Tier / Club Pass is ever priced at ₹0, but this
  // keeps the checkout screen future-proof (e.g. a free/promo pass) and
  // matches the same free-checkout logic used on the Events checkout.
  const isFree = passesAmount === 0;

  const toggleTier = (tierId) => {
    setCartPasses((prev) => {
      const withoutTiers = prev.filter((c) => !tiers.find((t) => t.id === c));
      return prev.includes(tierId) ? withoutTiers : [...withoutTiers, tierId];
    });
  };
  const toggleClubPass = (passId) => {
    setCartPasses((prev) => (prev.includes(passId) ? prev.filter((c) => c !== passId) : [...prev, passId]));
  };

  // Shared by the "Review Details" button (so the modal never opens on
  // an incomplete form) and handleSubmit (as a final safety net).
  const validate = () => {
    setErrorMsg("");
    const cleanPhone = onlyDigits(formData.phone);
    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!formData.fullName.trim() || !formData.college.trim()) {
      setErrorMsg("Please fill in your name and college.");
      return false;
    }
    if (!idCardFile) {
      setErrorMsg("Please upload a photo of your College ID card.");
      return false;
    }
    if (!isFree) {
      if (!paymentScreenshot) {
        setErrorMsg("Please upload your payment screenshot.");
        return false;
      }
      if (!UTR_REGEX.test(utrNumber)) {
        setErrorMsg("Please enter a valid 12-digit UTR / UPI Transaction Reference Number.");
        return false;
      }
    }
    return true;
  };

  const openReview = () => {
    if (validate()) setShowReview(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const cleanPhone = onlyDigits(formData.phone);

    setSubmitting(true);
    let step_ = "uploading your College ID card";
    try {
      const idExt = idCardFile.name.split(".").pop();
      const idPath = `id_cards/id_${user.id}_${Date.now()}.${idExt}`;
      const { error: idErr } = await supabase.storage.from("payment-screenshots").upload(idPath, idCardFile);
      if (idErr) throw idErr;
      const { data: idUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(idPath);

      let payUrlData = null;
      if (!isFree) {
        step_ = "uploading your payment screenshot";
        const payExt = paymentScreenshot.name.split(".").pop();
        const payPath = `receipts/pay_${user.id}_${Date.now()}.${payExt}`;
        const { error: payErr } = await supabase.storage.from("payment-screenshots").upload(payPath, paymentScreenshot);
        if (payErr) throw payErr;
        ({ data: payUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(payPath));
      }

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
          payment_screenshot_url: payUrlData?.publicUrl || null,
          utr_number: isFree ? null : utrNumber,
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
      sendNotification("pass_purchase", user.email, { fullName: formData.fullName, delegateId, amount: passesAmount });
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
            <span className="text-lantern-300">{isFree ? "Free (₹0)" : `₹${passesAmount}`}</span>
          </div>

          {isFree && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
              🎉 This checkout is free — no payment needed. Just confirm your details below.
            </div>
          )}

          {!isFree && <PaymentQR />}

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
            {!isFree && (
              <>
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
              </>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setSubStep("select")} className="px-6 py-3 rounded-full bg-white/10 text-parchment-50 text-sm font-bold">
              ← Back
            </button>
            <button
              onClick={openReview}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50"
            >
              Review Details →
            </button>
          </div>
        </div>
      )}

      {showReview && subStep === "checkout" && (
        <ReviewDetailsModal
          title={`${cartPasses.length} pass${cartPasses.length > 1 ? "es" : ""} · ${formData.fullName}`}
          fields={[
            { label: "Full Name", value: formData.fullName },
            { label: "Phone", value: formData.phone },
            { label: "College", value: formData.college },
            { label: "Year of Study", value: formData.yearOfStudy },
            { label: "Passes", value: cartPasses.map((c) => tiers.find((t) => t.id === c)?.name || clubPasses.find((p) => p.id === c)?.name || c).join(", ") },
          ]}
          files={[
            { label: "College ID Card", file: idCardFile },
            ...(isFree ? [] : [{ label: "Payment Screenshot", file: paymentScreenshot }]),
          ]}
          amount={passesAmount}
          isFree={isFree}
          utrNumber={utrNumber}
          onBack={() => setShowReview(false)}
          onConfirm={handleSubmit}
          submitting={submitting}
          errorMsg={errorMsg}
        />
      )}
    </div>
  );
}

// ============================================================
// STEP 2 — EVENTS CHECKOUT (only reachable once a pass is owned)
// ============================================================
function EventsCheckout({ user, ownedPasses, myDelegateIds, myGroups }) {
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
  const [showReview, setShowReview] = useState(false);

  // "individual" = registering yourself (default, everyone gets this).
  // "group" = a Group Leader registering events on behalf of one of
  // their verified group members. Only shown as an option once the
  // person actually leads at least one group.
  const [registrationMode, setRegistrationMode] = useState("individual");
  const [selectedGroupId, setSelectedGroupId] = useState(myGroups[0]?.id || "");
  useEffect(() => {
    if (myGroups.length > 0 && !selectedGroupId) setSelectedGroupId(myGroups[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myGroups]);

  // Whose account this registration is actually filed under. Defaults
  // to yourself; becomes the selected group member's user_id in Group
  // ID mode. This is what gets written as purchases.user_id.
  const [targetUserId, setTargetUserId] = useState(user.id);

  // Once a Delegate ID resolves to a known, verified identity (either
  // via autocomplete selection or the Validate button), we snapshot
  // the canonical name/phone here. If the person then hand-edits those
  // fields away from the snapshot, submission is blocked — per the
  // "no editing autofilled identity data" rule.
  const [identitySnapshot, setIdentitySnapshot] = useState(null);

  // Autocomplete dropdown state, shared by both modes.
  const [showIdSuggestions, setShowIdSuggestions] = useState(false);
  const [groupMemberOptions, setGroupMemberOptions] = useState([]);

  useEffect(() => {
    if (myDelegateIds[0]) {
      setDelegateId(myDelegateIds[0].delegate_id);
      setParticipantName(myDelegateIds[0].full_name || "");
      setParticipantWhatsapp(myDelegateIds[0].phone || "");
    }
  }, [myDelegateIds]);

  // Live group-member search as the leader types, scoped server-side
  // to a group they actually lead (see search_group_members() — it
  // re-checks leadership itself, this isn't just a client-side filter).
  useEffect(() => {
    if (registrationMode !== "group" || !selectedGroupId) {
      setGroupMemberOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("search_group_members", {
        p_group_id: selectedGroupId,
        p_prefix: delegateId || "",
      });
      if (!cancelled) setGroupMemberOptions(error ? [] : data || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [registrationMode, selectedGroupId, delegateId]);

  const switchRegistrationMode = (mode) => {
    setRegistrationMode(mode);
    setDelegateVerified(null);
    setSelfValidation(null);
    setIdentitySnapshot(null);
    setShowIdSuggestions(false);
    if (mode === "individual") {
      setTargetUserId(user.id);
      setDelegateId(myDelegateIds[0]?.delegate_id || "");
      setParticipantName(myDelegateIds[0]?.full_name || "");
      setParticipantWhatsapp(myDelegateIds[0]?.phone || "");
    } else {
      setTargetUserId(null);
      setDelegateId("");
      setParticipantName("");
      setParticipantWhatsapp("");
    }
  };

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

  // True when every event in the cart is fee-waived (e.g. unlocked via
  // Cheshire Charades / Wonderland Whiz / The Golden Key, or a free-only
  // event). Bypasses payment entirely — no QR, no UPI details, no UTR,
  // no screenshot upload.
  const isFree = cartEvents.length > 0 && eventsAmount === 0;

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
      members: team ? Array.from({ length: suggestedSize || 1 }, () => ({ name: "", whatsapp: "", email: "", delegateId: "" })) : [],
    };
    setCartEvents((prev) => [...prev, entry]);
    if (team) setExpandedTeamKey(key);
  };

  const removeEventFromCart = (key) => {
    setCartEvents((prev) => prev.filter((e) => e.key !== key));
    if (expandedTeamKey === key) setExpandedTeamKey(null);
  };

  const addMemberRow = (key) => {
    setCartEvents((prev) => prev.map((e) => (e.key === key ? { ...e, members: [...e.members, { name: "", whatsapp: "", email: "", delegateId: "" }] } : e)));
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

  // Team-mate "type to search" autosuggest — name + ID only (see
  // search_delegate_ids() in migration_v6.sql), open for at most one
  // row at a time.
  const [openSuggestFor, setOpenSuggestFor] = useState(null); // `${key}:${idx}` | null
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const fetchMemberSuggestions = async (key, idx, prefix) => {
    if (!prefix || prefix.trim().length < 2) {
      setMemberSuggestions([]);
      return;
    }
    const { data, error } = await supabase.rpc("search_delegate_ids", { p_prefix: prefix, p_limit: 6 });
    setOpenSuggestFor(`${key}:${idx}`);
    setMemberSuggestions(error ? [] : data || []);
  };
  const selectMemberSuggestion = (key, idx, suggestion) => {
    updateTeamMember(key, idx, "delegateId", suggestion.delegate_id);
    setOpenSuggestFor(null);
    setMemberSuggestions([]);
  };

  // Checks existence, and — when an event is given — whether that
  // person's pass actually grants access to THIS specific event.
  // p_expected_email, when supplied, asks the DB to confirm the ID
  // belongs to that exact email (used for team-mate verification)
  // without ever exposing the actual email back to the client.
  const validateId = async (idValue, event, expectedEmail = null) => {
    if (!idValue?.trim()) return { status: null };
    const { data, error } = await supabase.rpc("verify_delegate_id", {
      p_delegate_id: normalizeDelegateId(idValue),
      p_expected_email: expectedEmail ? expectedEmail.trim().toLowerCase() : null,
    });
    if (error || !data || data.length === 0) return { status: "not_found" };
    const record = data[0];
    if (expectedEmail && !record.email_match) return { status: "email_mismatch", name: record.full_name };
    if (event) {
      const access = getEventAccess(event, record.pass_codes || []);
      if (!access.unlocked) return { status: "invalid_pass", name: record.full_name };
    }
    return { status: "valid", name: record.full_name, phone: record.phone, isSelf: record.is_self };
  };

  const eventById = (eventId) => eventsList.find((e) => e.id === eventId);

  const verifyMemberId = async (key, idx) => {
    const entry = cartEvents.find((e) => e.key === key);
    const member = entry?.members[idx];
    const event = eventById(entry?.eventId);
    if (!member?.email?.trim()) {
      updateTeamMember(key, idx, "validation", "email_required");
      updateTeamMember(key, idx, "verified", false);
      return;
    }
    const result = await validateId(member?.delegateId, event, member.email);
    updateTeamMember(key, idx, "validation", result.status);
    updateTeamMember(key, idx, "verified", result.status === "valid");
    updateTeamMember(key, idx, "verifiedName", result.name || null);
  };

  const [selfValidation, setSelfValidation] = useState(null);

  // Individual mode: the ID must belong to the LOGGED-IN user
  // (result.isSelf) — existing-and-approved is no longer sufficient.
  // Group mode: the ID must be a verified member of the SELECTED
  // group (checked via search_group_members, which itself re-checks
  // leadership server-side).
  const verifySelfId = async () => {
    if (registrationMode === "group") {
      if (!selectedGroupId) return setSelfValidation("no_group");
      const match = groupMemberOptions.find((m) => m.delegate_id === normalizeDelegateId(delegateId));
      if (!match) {
        const { data } = await supabase.rpc("search_group_members", { p_group_id: selectedGroupId, p_prefix: delegateId });
        const found = (data || []).find((m) => m.delegate_id === normalizeDelegateId(delegateId));
        if (!found) return setSelfValidation("not_in_group");
        applyIdentitySelection(found.delegate_id, found.full_name, found.phone, found.user_id);
        return setSelfValidation("valid");
      }
      applyIdentitySelection(match.delegate_id, match.full_name, match.phone, match.user_id);
      return setSelfValidation("valid");
    }

    const result = await validateId(delegateId, null);
    if (result.status === "valid" && !result.isSelf) {
      setSelfValidation("not_owned");
      setDelegateVerified(false);
      return;
    }
    setSelfValidation(result.status);
    setDelegateVerified(result.status === "valid");
    if (result.status === "valid") {
      applyIdentitySelection(normalizeDelegateId(delegateId), result.name, result.phone, user.id);
    }
  };

  // Shared by the autocomplete dropdown (both modes) and verifySelfId
  // — locks in the canonical identity so hand-edited mismatches can be
  // caught at submit time.
  const applyIdentitySelection = (id, name, phone, ownerUserId) => {
    setDelegateId(id);
    setParticipantName(name || "");
    setParticipantWhatsapp(phone || "");
    setDelegateVerified(true);
    setSelfValidation("valid");
    setIdentitySnapshot({ name: name || "", phone: phone || "" });
    setTargetUserId(ownerUserId);
    setShowIdSuggestions(false);
  };

  // My-own-account suggestions for the Individual ID input.
  const myIdSuggestions = useMemo(() => {
    const q = normalizeDelegateId(delegateId);
    if (!q) return myDelegateIds;
    return myDelegateIds.filter((d) => d.delegate_id?.includes(q));
  }, [delegateId, myDelegateIds]);

  // Shared by the "Review Details" button (so the modal never opens on
  // an incomplete form) and handleSubmit (as a final safety net).
  const validate = () => {
    setErrorMsg("");
    if (cartEvents.length === 0) {
      setErrorMsg("Add at least one event to your cart.");
      return false;
    }
    if (registrationMode === "group" && !selectedGroupId) {
      setErrorMsg("Select which group you're registering a member from.");
      return false;
    }
    if (!delegateId.trim()) {
      setErrorMsg(registrationMode === "group" ? "Please enter the member's Group Delegate ID." : "Please enter your Delegate ID.");
      return false;
    }
    const idFormatOk =
      registrationMode === "group" ? GROUP_ID_REGEX.test(normalizeDelegateId(delegateId)) : INDIVIDUAL_ID_REGEX.test(normalizeDelegateId(delegateId));
    if (!idFormatOk) {
      setErrorMsg(
        registrationMode === "group"
          ? "Group Delegate IDs must be 13 characters, formatted like G001-SP000001."
          : "Delegate IDs must be exactly 8 characters."
      );
      return false;
    }
    if (!targetUserId || delegateVerified !== true) {
      setErrorMsg('Please validate the Delegate ID (click "Validate") before checking out.');
      return false;
    }
    if (!participantName.trim()) {
      setErrorMsg("Please enter a name.");
      return false;
    }
    if (onlyDigits(participantWhatsapp).length !== 10) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp number.");
      return false;
    }
    // Autofilled identity fields can't be hand-edited into a mismatch —
    // catches someone verifying ID "X" and then typing a different
    // name/number over the top of it.
    if (identitySnapshot) {
      const nameChanged = participantName.trim() !== (identitySnapshot.name || "").trim();
      const phoneChanged = identitySnapshot.phone && onlyDigits(participantWhatsapp) !== onlyDigits(identitySnapshot.phone);
      if (nameChanged || phoneChanged) {
        setErrorMsg("Name/WhatsApp don't match the verified Delegate ID's registered details. Please re-validate instead of editing these fields.");
        return false;
      }
    }
    if (!isFree) {
      if (!paymentScreenshot) {
        setErrorMsg("Please upload your payment screenshot.");
        return false;
      }
      if (!UTR_REGEX.test(utrNumber)) {
        setErrorMsg("Please enter a valid 12-digit UTR / UPI Transaction Reference Number.");
        return false;
      }
    }

    for (const e of cartEvents) {
      if (!e.isTeam) continue;
      if (e.members.length < 1) {
        setErrorMsg(`${e.title} needs at least one team member.`);
        return false;
      }
      for (const m of e.members) {
        if (!m.name || !m.whatsapp || !m.email || !m.delegateId) {
          setErrorMsg(`Please complete every team member's details (including email) for ${e.title}.`);
          return false;
        }
        if (!m.verified) {
          setErrorMsg(`Please validate every team member's Delegate ID for ${e.title} before checking out.`);
          return false;
        }
      }
    }
    return true;
  };

  const openReview = () => {
    if (validate()) setShowReview(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const cleanPhone = onlyDigits(participantWhatsapp);

    setSubmitting(true);
    let step_ = "uploading your payment screenshot";
    try {
      let payUrlData = null;
      if (!isFree) {
        const payExt = paymentScreenshot.name.split(".").pop();
        const payPath = `receipts/pay_${user.id}_${Date.now()}.${payExt}`;
        const { error: payErr } = await supabase.storage.from("payment-screenshots").upload(payPath, paymentScreenshot);
        if (payErr) throw payErr;
        ({ data: payUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(payPath));
      }

      step_ = "saving your purchase record";
      const { data: purchase, error: purchaseErr } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: targetUserId,
            group_id: registrationMode === "group" ? selectedGroupId : null,
            delegate_id: null,
            pass_type: null,
            pass_codes: [],
            full_name: participantName,
            email: registrationMode === "group" ? null : user.email,
            phone: cleanPhone,
            college: myDelegateIds[0]?.college || "",
            id_card_url: null,
            payment_screenshot_url: payUrlData?.publicUrl || null,
            utr_number: isFree ? null : utrNumber,
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
              utr_number: isFree ? null : utrNumber,
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
            email: m.email?.trim().toLowerCase() || null,
            verified: !!m.verified,
          }));
          const { error: teamErr } = await supabase.from("team_members").insert(rows);
          if (teamErr) throw teamErr;
        }
      }

      setResult({ totalAmount: eventsAmount, count: cartEvents.length });
      setSubStep("success");
      sendNotification("event_registration", user.email, {
        fullName: participantName,
        events: cartEvents.map((e) => e.title).join(", "),
        amount: eventsAmount,
      });
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
                        const suggestKey = `${e.key}:${idx}`;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2">
                              <input
                                placeholder={`Member ${idx + 1} Name`}
                                value={m.name || ""}
                                onChange={(ev3) => updateTeamMember(e.key, idx, "name", ev3.target.value)}
                                className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                              />
                              <input
                                placeholder="Member's Email (must match their account)"
                                value={m.email || ""}
                                onChange={(ev3) => {
                                  updateTeamMember(e.key, idx, "email", ev3.target.value);
                                  updateTeamMember(e.key, idx, "verified", null);
                                  updateTeamMember(e.key, idx, "validation", null);
                                }}
                                className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto_auto] gap-2 items-center">
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
                                  placeholder="Delegate ID (e.g. DT100019)"
                                  value={m.delegateId || ""}
                                  maxLength={13}
                                  onChange={(ev3) => {
                                    const v = ev3.target.value.toUpperCase();
                                    updateTeamMember(e.key, idx, "delegateId", v);
                                    updateTeamMember(e.key, idx, "verified", null);
                                    updateTeamMember(e.key, idx, "validation", null);
                                    fetchMemberSuggestions(e.key, idx, v);
                                  }}
                                  onFocus={() => fetchMemberSuggestions(e.key, idx, m.delegateId || "")}
                                  onBlur={() => setTimeout(() => setOpenSuggestFor((cur) => (cur === suggestKey ? null : cur)), 150)}
                                  className={`w-full px-3 py-2 rounded-lg bg-canopy-950/60 border text-parchment-50 text-xs ${
                                    m.verified === true ? "border-emerald-500/50" : m.validation ? "border-red-500/50" : "border-white/10"
                                  }`}
                                />
                                {m.verified === true && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px]">✓</span>}
                                {openSuggestFor === suggestKey && memberSuggestions.length > 0 && (
                                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl bg-canopy-950 border border-lantern-500/30 shadow-xl overflow-hidden">
                                    {memberSuggestions.map((s) => (
                                      <button
                                        type="button"
                                        key={s.delegate_id}
                                        onClick={() => selectMemberSuggestion(e.key, idx, s)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex justify-between gap-2"
                                      >
                                        <span className="font-mono text-lantern-300">{s.delegate_id}</span>
                                        <span className="text-parchment-100/60 truncate">{s.full_name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
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
                              <p className="text-[10px] text-red-400 pl-1">No such Delegate ID present.</p>
                            )}
                            {m.validation === "invalid_pass" && (
                              <p className="text-[10px] text-red-400 pl-1">This ID's pass doesn't grant access to this event.</p>
                            )}
                            {m.validation === "email_required" && (
                              <p className="text-[10px] text-red-400 pl-1">Enter the teammate's email before validating.</p>
                            )}
                            {m.validation === "email_mismatch" && (
                              <p className="text-[10px] text-red-400 pl-1">This Delegate ID doesn't belong to that email address.</p>
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

          {myGroups.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                onClick={() => switchRegistrationMode("individual")}
                className={`px-4 py-1.5 rounded-full font-semibold transition ${
                  registrationMode === "individual" ? "bg-lantern-400 text-canopy-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Individual ID
              </button>
              <button
                onClick={() => switchRegistrationMode("group")}
                className={`px-4 py-1.5 rounded-full font-semibold transition ${
                  registrationMode === "group" ? "bg-lantern-400 text-canopy-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                👑 Group ID
              </button>
            </div>
          )}

          {registrationMode === "group" && myGroups.length > 1 && (
            <div>
              <label className="text-xs text-parchment-100/70 block mb-1">Which group?</label>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setDelegateId("");
                  setDelegateVerified(null);
                  setIdentitySnapshot(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm"
              >
                {myGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.group_code}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-parchment-100/70 block mb-1">
              {registrationMode === "group" ? "Group Member's Delegate ID" : "Your Delegate ID"}
            </label>
            <div className="flex gap-2 relative">
              <input
                value={delegateId}
                maxLength={registrationMode === "group" ? 13 : 8}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  setDelegateId(v);
                  setDelegateVerified(null);
                  setSelfValidation(null);
                  setIdentitySnapshot(null);
                  setShowIdSuggestions(true);
                }}
                onFocus={() => setShowIdSuggestions(true)}
                onBlur={() => setTimeout(() => setShowIdSuggestions(false), 150)}
                placeholder={registrationMode === "group" ? "e.g. G001-SP000002" : "e.g. DT100019"}
                className={`flex-1 px-4 py-3 rounded-xl bg-canopy-950/50 border text-parchment-50 text-sm focus:outline-none ${
                  delegateVerified === true ? "border-emerald-500/50" : selfValidation ? "border-red-500/50" : "border-lantern-500/15"
                }`}
              />
              <button onClick={verifySelfId} className="px-4 py-2 rounded-xl bg-mist-500 text-canopy-950 text-xs font-bold shrink-0">
                Validate
              </button>

              {showIdSuggestions && registrationMode === "individual" && myIdSuggestions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-16 mt-1 rounded-xl bg-canopy-950 border border-lantern-500/30 shadow-xl overflow-hidden">
                  {myIdSuggestions.map((s) => (
                    <button
                      type="button"
                      key={s.delegate_id}
                      onClick={() => applyIdentitySelection(s.delegate_id, s.full_name, s.phone, user.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex justify-between gap-2"
                    >
                      <span className="font-mono text-lantern-300">{s.delegate_id}</span>
                      <span className="text-parchment-100/60 truncate">{s.full_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {showIdSuggestions && registrationMode === "group" && groupMemberOptions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-16 mt-1 rounded-xl bg-canopy-950 border border-lantern-500/30 shadow-xl overflow-hidden">
                  {groupMemberOptions.map((s) => (
                    <button
                      type="button"
                      key={s.delegate_id}
                      onClick={() => applyIdentitySelection(s.delegate_id, s.full_name, s.phone, s.user_id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex justify-between gap-2"
                    >
                      <span className="font-mono text-lantern-300">{s.delegate_id}</span>
                      <span className="text-parchment-100/60 truncate">{s.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {delegateVerified === true && <p className="text-[11px] text-emerald-400 mt-1">✓ Verified{identitySnapshot?.name ? ` — ${identitySnapshot.name}` : ""}</p>}
            {selfValidation === "not_found" && <p className="text-[11px] text-red-400 mt-1">No such Delegate ID present.</p>}
            {selfValidation === "not_owned" && <p className="text-[11px] text-red-400 mt-1">This Delegate ID isn't linked to your account.</p>}
            {selfValidation === "not_in_group" && <p className="text-[11px] text-red-400 mt-1">This ID isn't a member of the selected group.</p>}
            {selfValidation === "no_group" && <p className="text-[11px] text-red-400 mt-1">Select a group first.</p>}
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
            <span className="text-lantern-300">{isFree ? "Free (₹0)" : `₹${eventsAmount}`}</span>
          </div>

          {isFree && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
              🎉 Every event in your cart is free with your pass — no payment needed. Just confirm your details below.
            </div>
          )}

          {!isFree && (
            <>
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
            </>
          )}

          <div className="flex justify-between">
            <button onClick={() => setSubStep("browse")} className="px-6 py-3 rounded-full bg-white/10 text-parchment-50 text-sm font-bold">
              ← Back
            </button>
            <button
              onClick={openReview}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50"
            >
              Review Details →
            </button>
          </div>
        </div>
      )}

      {showReview && subStep === "checkout" && (
        <ReviewDetailsModal
          title={`${cartEvents.length} event${cartEvents.length > 1 ? "s" : ""} · ${participantName}`}
          fields={[
            { label: "Registering As", value: registrationMode === "group" ? `Group Member (${myGroups.find((g) => g.id === selectedGroupId)?.group_code || ""})` : "Myself" },
            { label: "Delegate ID", value: normalizeDelegateId(delegateId) },
            { label: "Full Name", value: participantName },
            { label: "WhatsApp", value: participantWhatsapp },
            { label: "Events", value: cartEvents.map((e) => e.title).join(", ") },
          ]}
          files={isFree ? [] : [{ label: "Payment Screenshot", file: paymentScreenshot }]}
          amount={eventsAmount}
          isFree={isFree}
          utrNumber={utrNumber}
          onBack={() => setShowReview(false)}
          onConfirm={handleSubmit}
          submitting={submitting}
          errorMsg={errorMsg}
        />
      )}
    </div>
  );
}

// ============================================================
// GROUP REGISTRATION — a Group Leader buys the same Pass/Tier for
// themselves plus any number of teammates in a single transaction.
// The leader becomes Member 1 automatically; every other member is
// added by email only — their Supabase account is created (or
// matched, if it already exists) via the /api/provision-group-member
// serverless function, which is the one place in this app that needs
// the service role key (see api/_supabaseAdmin.js).
// ============================================================
function GroupPurchaseCheckout({ user, myGroups, refreshMyGroups, refreshOwnedPasses }) {
  const [subStep, setSubStep] = useState("form"); // form -> checkout -> success
  const [cartPasses, setCartPasses] = useState([]);
  const [leader, setLeader] = useState({ fullName: "", phone: "", college: "", yearOfStudy: "1st Year" });
  const [members, setMembers] = useState([]); // [{ email, fullName, phone }]
  const [idCardFile, setIdCardFile] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const togglePass = (id) => {
    const isTier = !!tiers.find((t) => t.id === id);
    setCartPasses((prev) => {
      if (isTier) {
        const withoutTiers = prev.filter((p) => !tiers.find((t) => t.id === p));
        return prev.includes(id) ? withoutTiers : [...withoutTiers, id];
      }
      return prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
    });
  };

  const perPersonAmount = useMemo(() => computePassesAmount(cartPasses), [cartPasses]);
  const totalMembers = 1 + members.length; // leader counts as Member 1
  const totalAmount = perPersonAmount * totalMembers;
  const isFree = cartPasses.length > 0 && totalAmount === 0;

  const addMember = () => setMembers((prev) => [...prev, { email: "", fullName: "", phone: "" }]);
  const removeMember = (idx) => setMembers((prev) => prev.filter((_, i) => i !== idx));
  const updateMember = (idx, field, value) => setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const validate = () => {
    setErrorMsg("");
    if (cartPasses.length === 0) {
      setErrorMsg("Select at least one Pass or Tier for the group.");
      return false;
    }
    if (!leader.fullName.trim() || !leader.college.trim()) {
      setErrorMsg("Fill in your own name and college.");
      return false;
    }
    if (onlyDigits(leader.phone).length !== 10) {
      setErrorMsg("Enter a valid 10-digit phone number for yourself.");
      return false;
    }
    if (!idCardFile) {
      setErrorMsg("Upload your own College ID card photo.");
      return false;
    }
    for (const m of members) {
      if (!m.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) {
        setErrorMsg("Enter a valid email address for every group member.");
        return false;
      }
      if (!m.fullName.trim()) {
        setErrorMsg("Enter a name for every group member.");
        return false;
      }
    }
    const emails = members.map((m) => m.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      setErrorMsg("You've entered the same member email twice.");
      return false;
    }
    if (emails.includes(user.email.toLowerCase())) {
      setErrorMsg("Don't add your own email as a member — you're automatically Member 1 (the leader).");
      return false;
    }
    if (!isFree) {
      if (!paymentScreenshot) {
        setErrorMsg("Upload the payment screenshot (it covers the whole group).");
        return false;
      }
      if (!UTR_REGEX.test(utrNumber)) {
        setErrorMsg("Enter a valid 12-digit UTR / UPI Transaction Reference Number.");
        return false;
      }
    }
    return true;
  };

  const openReview = () => {
    if (validate()) setShowReview(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      setProgressMsg("Creating your group...");
      const groupCode = await generateGroupCode();
      const { data: group, error: groupErr } = await supabase
        .from("groups")
        .insert([{ group_code: groupCode, leader_user_id: user.id, leader_name: leader.fullName, leader_email: user.email }])
        .select()
        .single();
      if (groupErr) throw groupErr;

      let payUrlData = null;
      if (!isFree) {
        setProgressMsg("Uploading payment screenshot...");
        const payExt = paymentScreenshot.name.split(".").pop();
        const payPath = `receipts/pay_${user.id}_${Date.now()}.${payExt}`;
        const { error: payErr } = await supabase.storage.from("payment-screenshots").upload(payPath, paymentScreenshot);
        if (payErr) throw payErr;
        ({ data: payUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(payPath));
      }

      setProgressMsg("Uploading your College ID card...");
      const idExt = idCardFile.name.split(".").pop();
      const idPath = `id_cards/id_${user.id}_${Date.now()}.${idExt}`;
      const { error: idErr } = await supabase.storage.from("payment-screenshots").upload(idPath, idCardFile);
      if (idErr) throw idErr;
      const { data: idUrlData } = supabase.storage.from("payment-screenshots").getPublicUrl(idPath);

      const passType = cartPasses.some((c) => tiers.find((t) => t.id === c)) ? "tier" : "club";
      const createdMembers = [];

      // Member 1 is always the leader themselves.
      setProgressMsg(`Generating Delegate ID 1 of ${totalMembers}...`);
      const leaderBaseId = await generateDelegateId(cartPasses);
      const leaderFullId = buildGroupDelegateId(groupCode, leaderBaseId);
      const { error: leaderPurchaseErr } = await supabase.from("purchases").insert([
        {
          user_id: user.id,
          group_id: group.id,
          delegate_id: leaderFullId,
          pass_type: passType,
          pass_codes: cartPasses,
          full_name: leader.fullName,
          email: user.email,
          phone: onlyDigits(leader.phone),
          college: leader.college,
          year_of_study: leader.yearOfStudy,
          id_card_url: idUrlData.publicUrl,
          payment_screenshot_url: payUrlData?.publicUrl || null,
          utr_number: isFree ? null : utrNumber,
          base_amount: perPersonAmount,
          events_amount: 0,
          total_amount: perPersonAmount,
          payment_status: "PENDING_VERIFICATION",
        },
      ]);
      if (leaderPurchaseErr) throw leaderPurchaseErr;
      createdMembers.push({ email: user.email, fullName: leader.fullName, delegateId: leaderFullId });

      // Every other member: provision (or find) their account, then
      // mint their own group-prefixed Delegate ID and purchase row.
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        setProgressMsg(`Setting up account ${i + 2} of ${totalMembers} (${m.email})...`);
        const { user_id: memberUserId } = await provisionGroupMember({
          email: m.email.trim(),
          fullName: m.fullName,
          groupId: group.id,
        });

        setProgressMsg(`Generating Delegate ID ${i + 2} of ${totalMembers}...`);
        const baseId = await generateDelegateId(cartPasses);
        const fullId = buildGroupDelegateId(groupCode, baseId);

        const { error: memberPurchaseErr } = await supabase.from("purchases").insert([
          {
            user_id: memberUserId,
            group_id: group.id,
            delegate_id: fullId,
            pass_type: passType,
            pass_codes: cartPasses,
            full_name: m.fullName,
            email: m.email.trim().toLowerCase(),
            phone: onlyDigits(m.phone) || null,
            college: leader.college,
            year_of_study: leader.yearOfStudy,
            id_card_url: null,
            payment_screenshot_url: payUrlData?.publicUrl || null,
            utr_number: isFree ? null : utrNumber,
            base_amount: perPersonAmount,
            events_amount: 0,
            total_amount: perPersonAmount,
            payment_status: "PENDING_VERIFICATION",
          },
        ]);
        if (memberPurchaseErr) throw memberPurchaseErr;
        createdMembers.push({ email: m.email, fullName: m.fullName, delegateId: fullId });

        sendNotification("group_invite", m.email, { fullName: m.fullName, groupCode, delegateId: fullId, leaderName: leader.fullName });
      }

      sendNotification("pass_purchase", user.email, { fullName: leader.fullName, delegateId: leaderFullId, amount: totalAmount });

      setResult({ groupCode, members: createdMembers, totalAmount });
      setSubStep("success");
      if (refreshMyGroups) refreshMyGroups();
      if (refreshOwnedPasses) refreshOwnedPasses();
    } catch (err) {
      setErrorMsg(`Group registration failed while setting things up: ${err.message}`);
    } finally {
      setSubmitting(false);
      setProgressMsg("");
    }
  };

  if (subStep === "success" && result) {
    return (
      <div className="max-w-lg mx-auto glow-card p-8 rounded-3xl text-center space-y-4">
        <div className="text-5xl">👑</div>
        <h3 className="text-2xl font-display font-bold text-parchment-50">Group {result.groupCode} Registered!</h3>
        <p className="text-sm text-parchment-100/70">Pending committee verification. Delegate IDs generated:</p>
        <div className="text-left rounded-2xl border border-lantern-500/15 divide-y divide-white/5 overflow-hidden">
          {result.members.map((m, i) => (
            <div key={i} className="flex justify-between px-4 py-2.5 text-xs gap-2">
              <span className="text-parchment-100/70 truncate">
                {m.fullName} ({m.email})
              </span>
              <span className="font-mono font-bold text-lantern-300 shrink-0">{m.delegateId}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-parchment-100/50">
          Teammates who didn't already have an account will get an email to set their password — or they can just sign in with Google using
          that same email address.
        </p>
        <button
          onClick={() => {
            setSubStep("form");
            setCartPasses([]);
            setMembers([]);
            setIdCardFile(null);
            setPaymentScreenshot(null);
            setUtrNumber("");
            setResult(null);
          }}
          className="px-6 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm"
        >
          Register Another Group
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {myGroups.length > 0 && subStep === "form" && (
        <p className="text-center text-xs text-parchment-100/50">
          You already lead {myGroups.length} group{myGroups.length > 1 ? "s" : ""} ({myGroups.map((g) => g.group_code).join(", ")}). Running this
          again starts a brand-new group.
        </p>
      )}

      {subStep === "form" && (
        <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-display font-bold text-parchment-50">👑 Group Registration</h3>
            <p className="text-xs text-parchment-100/60">
              Buy the same Pass/Tier for your whole group in one go. You're automatically Member 1 (the leader).
            </p>
          </div>

          {errorMsg && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">{errorMsg}</div>}

          <div>
            <p className="text-xs font-semibold text-parchment-100/80 mb-2">Pass / Tier for every member</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[...tiers, ...clubPasses].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePass(p.id)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs transition ${
                    cartPasses.includes(p.id) ? "border-lantern-400 bg-lantern-500/10" : "border-white/10 bg-canopy-950/40 hover:border-white/20"
                  }`}
                >
                  <span className="font-bold text-parchment-50 block">{p.name}</span>
                  <span className="block text-parchment-100/60">₹{p.price} / person</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-xs font-semibold text-parchment-100/80">Your Own Details (Member 1 — Leader)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Full Name"
                value={leader.fullName}
                onChange={(e) => setLeader((l) => ({ ...l, fullName: e.target.value }))}
                className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm"
              />
              <input
                placeholder="Phone Number"
                value={leader.phone}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => setLeader((l) => ({ ...l, phone: onlyDigits(e.target.value) }))}
                className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm"
              />
              <input
                placeholder="College"
                value={leader.college}
                onChange={(e) => setLeader((l) => ({ ...l, college: e.target.value }))}
                className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm"
              />
              <select
                value={leader.yearOfStudy}
                onChange={(e) => setLeader((l) => ({ ...l, yearOfStudy: e.target.value }))}
                className="px-4 py-3 rounded-xl bg-canopy-950/50 border border-lantern-500/15 text-parchment-50 text-sm"
              >
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "Intern", "PG/Resident"].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-parchment-100/70 block mb-1">Your College ID Card Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIdCardFile(e.target.files[0])}
                className="text-xs text-parchment-100/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-lantern-500/20 file:text-lantern-300 file:text-xs w-full"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-parchment-100/80">Group Members ({members.length})</p>
              <button type="button" onClick={addMember} className="text-lantern-300 text-xs font-semibold hover:underline">
                + Add Member
              </button>
            </div>
            <p className="text-[10px] text-parchment-100/50">
              Each email gets its own Spandan account automatically (or is linked to their existing one) — they can log in via Google, or use
              "Forgot Password" to set one.
            </p>
            {members.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr_auto] gap-2 items-center">
                <input
                  placeholder="Member Email"
                  value={m.email}
                  onChange={(e) => updateMember(idx, "email", e.target.value)}
                  className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                />
                <input
                  placeholder="Full Name"
                  value={m.fullName}
                  onChange={(e) => updateMember(idx, "fullName", e.target.value)}
                  className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                />
                <input
                  placeholder="Phone (optional)"
                  value={m.phone}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => updateMember(idx, "phone", onlyDigits(e.target.value))}
                  className="px-3 py-2 rounded-lg bg-canopy-950/60 border border-white/10 text-parchment-50 text-xs"
                />
                <button type="button" onClick={() => removeMember(idx)} className="text-red-400 text-xs hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-canopy-950/60 rounded-2xl p-4 flex justify-between items-center text-sm font-bold">
            <span className="text-parchment-50">
              Total ({totalMembers} member{totalMembers > 1 ? "s" : ""} × ₹{perPersonAmount})
            </span>
            <span className="text-lantern-300">{isFree ? "Free (₹0)" : `₹${totalAmount}`}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (cartPasses.length === 0) return setErrorMsg("Select a Pass/Tier first.");
                setErrorMsg("");
                setSubStep("checkout");
              }}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm"
            >
              Continue to Payment →
            </button>
          </div>
        </div>
      )}

      {subStep === "checkout" && (
        <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-display font-bold text-parchment-50 text-center">Group Payment</h3>
          {errorMsg && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">{errorMsg}</div>}

          <div className="bg-canopy-950/60 rounded-2xl p-4 flex justify-between items-center text-sm font-bold">
            <span className="text-parchment-50">Total Payable ({totalMembers} members)</span>
            <span className="text-lantern-300">{isFree ? "Free (₹0)" : `₹${totalAmount}`}</span>
          </div>

          {isFree ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
              🎉 This group registration is free — no payment needed.
            </div>
          ) : (
            <>
              <PaymentQR />
              <div>
                <label className="text-xs text-parchment-100/70 block mb-1">Payment Screenshot (covers the whole group)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                  className="text-xs text-parchment-100/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-lantern-500/20 file:text-lantern-300 file:text-xs w-full"
                />
              </div>
              <UtrInput value={utrNumber} onChange={setUtrNumber} />
            </>
          )}

          <div className="flex justify-between">
            <button onClick={() => setSubStep("form")} className="px-6 py-3 rounded-full bg-white/10 text-parchment-50 text-sm font-bold">
              ← Back
            </button>
            <button
              onClick={openReview}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-lantern-400 text-canopy-950 font-bold text-sm disabled:opacity-50"
            >
              Review Details →
            </button>
          </div>
        </div>
      )}

      {showReview && subStep === "checkout" && (
        <ReviewDetailsModal
          title={`Group of ${totalMembers} · Leader: ${leader.fullName}`}
          fields={[
            {
              label: "Pass/Tier",
              value: cartPasses.map((id) => tiers.find((t) => t.id === id)?.name || clubPasses.find((p) => p.id === id)?.name || id).join(", "),
            },
            { label: "Leader", value: `${leader.fullName} (${user.email})` },
            { label: "Members", value: members.map((m) => `${m.fullName} <${m.email}>`).join("; ") || "None — solo group of 1" },
          ]}
          files={[{ label: "Your College ID Card", file: idCardFile }, ...(isFree ? [] : [{ label: "Payment Screenshot", file: paymentScreenshot }])]}
          amount={totalAmount}
          isFree={isFree}
          utrNumber={utrNumber}
          onBack={() => setShowReview(false)}
          onConfirm={handleSubmit}
          submitting={submitting}
          progressMsg={progressMsg}
          errorMsg={errorMsg}
        />
      )}
    </div>
  );
}
