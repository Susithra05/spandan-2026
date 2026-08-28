import React from "react";
import { clubPasses, tiers } from "./data/festData";

export default function ClubPassesSection({ onSelectPass }) {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto text-white">
      {/* SECTION HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-wide mb-2">
          CLUB PASSES & DELEGATE TIERS
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Looking to participate only in specific domains? Choose a Club Pass as
          an alternative to full Delegate Tiers.
        </p>
      </div>

      {/* CLUB PASSES GRID */}
      <div className="mb-14">
        <h3 className="text-xl font-bold text-amber-300 border-b border-amber-500/30 pb-2 mb-6 flex items-center">
          <span className="bg-amber-500 w-2 h-2 rounded-full mr-2"></span>
          Club Passes (Category Specific)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubPasses.map((pass) => (
            <div
              key={pass.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                      Club Pass
                    </span>
                    <h4 className="text-xl font-bold text-white mt-2 group-hover:text-amber-300 transition">
                      {pass.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-amber-400">
                      ₹{pass.price}
                    </span>
                    <span className="text-xs text-amber-300/60 block">*</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {pass.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Alternative to delegate cards
                </span>
                {onSelectPass && (
                  <button
                    onClick={() => onSelectPass(pass.id, "club")}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold text-xs rounded-xl transition border border-amber-500/30"
                  >
                    Select Pass
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PASS FOOTNOTE / NOTE FROM BROCHURE */}
        <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start space-x-2">
          <span className="text-amber-400 font-bold">Note:</span>
          <span>
            These passes are alternatives to delegate cards for participants
            wishing to participate only in selected events. Holding the Cult /
            Sports / Lit pass does not allow main stage access. Prices are
            subject to change.
          </span>
        </div>
      </div>

      {/* DELEGATE TIERS SUMMARY GRID */}
      <div>
        <h3 className="text-xl font-bold text-amber-300 border-b border-amber-500/30 pb-2 mb-6 flex items-center">
          <span className="bg-amber-500 w-2 h-2 rounded-full mr-2"></span>
          Full Delegate Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`p-6 rounded-2xl bg-gradient-to-b ${tier.color} border transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-2xl mr-2">{tier.suit}</span>
                    <h4 className="text-2xl font-extrabold text-white inline-block">
                      {tier.name}
                    </h4>
                  </div>
                  <span className="text-2xl font-extrabold text-amber-400">
                    ₹{tier.price}*
                  </span>
                </div>

                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-4">
                  {tier.tag}
                </span>

                <ul className="text-xs text-slate-200 space-y-2 mb-6">
                  {tier.amenities.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-amber-400 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {onSelectPass && (
                <button
                  onClick={() => onSelectPass(tier.id, "tier")}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition text-center"
                >
                  Choose {tier.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
