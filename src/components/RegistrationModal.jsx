import React, { useState } from "react";
import { tiers, clubPasses, eventsList } from "./data/festData";

export default function RegistrationCheckout() {
  // Selection states
  const [selectedPassType, setSelectedPassType] = useState("tier"); // 'tier' | 'club'
  const [selectedPassId, setSelectedPassId] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Registration Form details
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
  });

  // Find selected pass object
  const activePass =
    selectedPassType === "tier"
      ? tiers.find((t) => t.id === selectedPassId)
      : clubPasses.find((p) => p.id === selectedPassId);

  // Price Calculation Logic
  const passPrice = activePass ? activePass.price : 0;

  const selectedEventObjects = eventsList.filter((e) =>
    selectedEvents.includes(e.id),
  );
  const eventsTotalPrice = selectedEventObjects.reduce(
    (sum, evt) => sum + (evt.price || 0),
    0,
  );

  const grandTotal = passPrice + eventsTotalPrice;

  // Toggle Event Selection
  const handleEventToggle = (eventId) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPassId) {
      alert(
        "Please select at least one Delegate Tier or Club Pass to proceed.",
      );
      return;
    }

    // Proceed to payment gateway integration or confirmation step
    console.log("Registration Payload:", {
      user: formData,
      pass: activePass,
      events: selectedEventObjects,
      grandTotal,
    });
    alert(`Registration initiated for ₹${grandTotal}!`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <h2 className="text-3xl font-bold text-amber-400 mb-2">
        Spandan 2026 Registration
      </h2>
      <p className="text-slate-400 mb-6">
        Select your pass, pick your events, and review your checkout total.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: COMPULSORY PASS SELECTION */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-amber-300">
              1. Select Pass or Tier <span className="text-red-400">*</span>
            </h3>

            {/* Toggle Pass Category */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSelectedPassType("tier");
                  setSelectedPassId("");
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${selectedPassType === "tier" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
              >
                Delegate Tiers
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPassType("club");
                  setSelectedPassId("");
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${selectedPassType === "club" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
              >
                Club Passes
              </button>
            </div>
          </div>

          {/* Delegate Tiers Grid */}
          {selectedPassType === "tier" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedPassId(tier.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedPassId === tier.id ? "border-amber-400 bg-amber-500/10" : "border-slate-800 bg-slate-800/40 hover:border-slate-600"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-white">
                      {tier.name}
                    </h4>
                    <span className="text-amber-400 font-bold">
                      ₹{tier.price}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/80 mb-3">{tier.tag}</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {tier.amenities.slice(0, 3).map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                    {tier.amenities.length > 3 && (
                      <li>+ {tier.amenities.length - 3} more amenities</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Club Passes Grid */}
          {selectedPassType === "club" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubPasses.map((pass) => (
                <div
                  key={pass.id}
                  onClick={() => setSelectedPassId(pass.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedPassId === pass.id ? "border-amber-400 bg-amber-500/10" : "border-slate-800 bg-slate-800/40 hover:border-slate-600"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-white">
                      {pass.name}
                    </h4>
                    <span className="text-amber-400 font-bold">
                      ₹{pass.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{pass.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* STEP 2: EVENT SELECTION */}
        <section
          className={`transition-opacity ${!selectedPassId ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          <h3 className="text-xl font-semibold text-amber-300 mb-2">
            2. Select Events to Participate
          </h3>
          {!selectedPassId && (
            <p className="text-xs text-amber-400/80 mb-4">
              Please select a Tier or Club Pass above to unlock event selection.
            </p>
          )}

          <div className="max-h-64 overflow-y-auto pr-2 space-y-2 border border-slate-800 rounded-xl p-4 bg-slate-950/50">
            {eventsList.map((event) => (
              <label
                key={event.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-sm"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => handleEventToggle(event.id)}
                    className="accent-amber-400 w-4 h-4 rounded"
                  />
                  <div>
                    <span className="font-medium text-slate-200">
                      {event.title}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      ({event.category})
                    </span>
                  </div>
                </div>
                <span className="text-amber-400 font-medium">
                  {event.price > 0 ? `₹${event.price}` : "₹0"}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* STEP 3: USER DETAILS */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-300">
            3. Participant Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              name="college"
              placeholder="College / Institution"
              required
              value={formData.college}
              onChange={handleInputChange}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </section>

        {/* STEP 4: DYNAMIC CHECKOUT SUMMARY */}
        <section className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">
            Checkout Summary
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>
                Selected Pass:{" "}
                {activePass ? (
                  activePass.name
                ) : (
                  <span className="text-slate-500 italic">None selected</span>
                )}
              </span>
              <span className="font-semibold text-amber-400">₹{passPrice}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Selected Events ({selectedEvents.length}):</span>
              <span className="font-semibold text-amber-400">
                ₹{eventsTotalPrice}
              </span>
            </div>

            {selectedEventObjects.length > 0 && (
              <div className="pl-4 text-xs text-slate-500 space-y-1 border-l-2 border-slate-800">
                {selectedEventObjects.map((evt) => (
                  <div key={evt.id} className="flex justify-between">
                    <span>• {evt.title}</span>
                    <span>₹{evt.price || 0}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-lg font-bold">
              <span className="text-white">Total Payable Amount:</span>
              <span className="text-2xl text-amber-400">₹{grandTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedPassId}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {selectedPassId
              ? `Proceed to Pay ₹${grandTotal}`
              : "Select a Pass to Continue"}
          </button>
        </section>
      </form>
    </div>
  );
}
