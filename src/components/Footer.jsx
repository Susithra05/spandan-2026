import React from "react";
import { festDetails } from "../data/festData";

export default function Footer({ setActiveTab }) {
  const mapDirectionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=JIPMER+Campus+Pondicherry";

  return (
    <footer className="w-full bg-[#0b1d18] text-slate-300 border-t border-lantern-500/20 pt-12 pb-6 px-4 relative overflow-hidden">
      {/* TOP CONTENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10 text-sm">
        {/* COLUMN 1: BRAND & TAGLINE */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lantern-400/20 border border-lantern-400/40 flex items-center justify-center font-bold text-lantern-300 text-xl shadow-[0_0_12px_rgba(240,169,60,0.3)]">
              ✨
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-parchment-50 tracking-wide leading-none">
                SPANDAN 2026
              </h3>
              <p className="text-xs text-toadstool-300 font-serif italic mt-0.5">
                The Enchanted Reverie
              </p>
            </div>
          </div>
          <p className="text-xs text-parchment-100/70 leading-relaxed">
            Where reality stutters… and the impossible feels strangely familiar.
            Join us at JIPMER Pondicherry for South India's grandest festival
            experience.
          </p>
        </div>

        {/* COLUMN 2: QUICK LINKS */}
        <div className="space-y-3">
          <h4 className="font-bold text-lantern-300 uppercase tracking-widest text-xs">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: "Home", tab: "home" },
              { label: "About JIPMER", tab: "about" },
              { label: "Events", tab: "events" },
              { label: "Schedule", tab: "schedule" },
              { label: "Registration & Passes", tab: "registration" },
              { label: "Contact Us", tab: "contact" },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab(link.tab);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-lantern-200 transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span className="text-lantern-400/60 text-[10px]">›</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 3: CONTACT INFO */}
        <div className="space-y-3">
          <h4 className="font-bold text-lantern-300 uppercase tracking-widest text-xs">
            Contact Info
          </h4>
          <ul className="space-y-2.5 text-xs text-parchment-100/80">
            <li className="flex items-center gap-2.5">
              <span className="text-lantern-400 shrink-0">✉</span>
              <a
                href={`mailto:${festDetails.instagram}@jipmer.edu.in`}
                className="hover:text-lantern-200 transition"
              >
                spandan2026@jipmer.edu.in
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-lantern-400 shrink-0">📞</span>
              <a
                href="https://wa.me/918510107650"
                target="_blank"
                rel="noreferrer"
                className="hover:text-lantern-200 transition"
              >
                +91 85101 07650 (President)
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-lantern-400 shrink-0 mt-0.5">📍</span>
              <div>
                <span className="font-semibold text-parchment-50 block">
                  JIPMER Campus
                </span>
                <span className="text-slate-400 text-[11px]">
                  Dhanvantari Nagar, Pondicherry - 605006
                </span>
              </div>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-lantern-400 shrink-0">📅</span>
              <span className="font-semibold text-lantern-200">
                {festDetails.dates}
              </span>
            </li>
          </ul>
        </div>

        {/* COLUMN 4: FIND US HERE (MAP CARD) */}
        <div className="space-y-3">
          <h4 className="font-bold text-lantern-300 uppercase tracking-widest text-xs">
            Find Us Here
          </h4>

          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative rounded-xl overflow-hidden border border-lantern-500/30 bg-canopy-950 hover:border-lantern-400 transition shadow-lg"
          >
            {/* Embedded Interactive Map Preview */}
            <div className="h-28 w-full relative bg-slate-900 overflow-hidden">
              <iframe
                title="JIPMER Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.6601445778265!2d79.80932847585805!3d11.96323868826723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3aceb72045555555%3A0xb35fa3247071f654!2sJIPMER!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canopy-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] bg-canopy-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                <span className="font-bold text-parchment-50">
                  📍 JIPMER Pondicherry
                </span>
                <span className="text-lantern-300 font-semibold group-hover:underline">
                  Open Map ↗
                </span>
              </div>
            </div>
          </a>
          <p className="text-[11px] text-slate-400 text-center">
            Click map to get turn-by-turn directions
          </p>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          <p>© 2026 SPANDAN - JIPMER Pondicherry. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Designed with <span className="text-toadstool-400">♥</span> for the
            Enchanted Reverie
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <span className="font-mono text-lantern-300/80 text-[11px]">
            #Spandan2026 #TheEnchantedReverie
          </span>
          {setActiveTab && (
            <button
              onClick={() => {
                setActiveTab("admin");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-slate-600 hover:text-lantern-300 transition font-mono text-[11px]"
            >
              ⚙ Admin
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
