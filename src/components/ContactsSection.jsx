import React, { useState } from "react";
import { teamContacts, festDetails } from "./data/festData";

export default function ContactsSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Categorize committee contacts for clean filtering
  const coreLeadership = teamContacts.filter((c) =>
    [
      "President",
      "Vice-President",
      "General Secretary",
      "Speaker",
      "Public Relations",
    ].includes(c.role),
  );

  const domainCoordinators = teamContacts.filter(
    (c) =>
      ![
        "President",
        "Vice-President",
        "General Secretary",
        "Speaker",
        "Public Relations",
      ].includes(c.role),
  );

  // Helper function to format phone numbers into WhatsApp API links
  const getWhatsAppLink = (phone) => {
    // Standardize to international format (assuming India +91)
    const formatted = phone.replace(/\D/g, "");
    const cleanNumber = formatted.length === 10 ? `91${formatted}` : formatted;
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto text-white">
      {/* SECTION HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-wide mb-2">
          CONTACT US
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
          Have questions or need assistance? Reach out directly to our domain
          leads or click any number to chat on WhatsApp.
        </p>

        {/* INSTAGRAM BUTTON */}
        <div className="mt-4">
          <a
            href={`https://instagram.com/${festDetails.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 transition shadow-lg text-sm font-bold"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Follow @{festDetails.instagram}</span>
          </a>
        </div>
      </div>

      {/* CORE LEADERSHIP SECTION */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-amber-300 border-b border-amber-500/30 pb-2 mb-6 flex items-center">
          <span className="bg-amber-500 w-2 h-2 rounded-full mr-2"></span>
          Core Committee Leadership
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {coreLeadership.map((member, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl transition shadow-md flex justify-between items-center group"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold block">
                  {member.role}
                </span>
                <h4 className="font-bold text-white text-base group-hover:text-amber-200 transition">
                  {member.name}
                </h4>
              </div>
              <a
                href={getWhatsAppLink(member.phone)}
                target="_blank"
                rel="noopener noreferrer"
                title="Click to open WhatsApp chat"
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-medium text-xs rounded-lg transition border border-emerald-500/30 flex items-center space-x-1"
              >
                <span>{member.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* DOMAIN & EVENT COORDINATORS SECTION */}
      <div>
        <h3 className="text-xl font-bold text-amber-300 border-b border-amber-500/30 pb-2 mb-6 flex items-center">
          <span className="bg-amber-500 w-2 h-2 rounded-full mr-2"></span>
          Domain & Event Contacts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {domainCoordinators.map((member, idx) => (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 p-4 rounded-xl transition flex justify-between items-center"
            >
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  {member.role}
                </span>
                <h4 className="font-semibold text-slate-200 text-sm">
                  {member.name}
                </h4>
              </div>
              <a
                href={getWhatsAppLink(member.phone)}
                target="_blank"
                rel="noopener noreferrer"
                title="Click to open WhatsApp chat"
                className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-mono text-xs rounded transition border border-slate-700"
              >
                {member.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
