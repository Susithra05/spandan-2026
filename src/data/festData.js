// ----------------------------------------------------------------
// EXTERNAL GOOGLE FORM LINKS
// ----------------------------------------------------------------
export const EXTERNAL_FORM_LINKS = {
  accommodation: "https://docs.google.com/forms/d/e/1FAIpQLSeRMJZGIREfwvrhrLKy8WSnsLmMS2C2yutua2BAwVcq_sle8g/viewform?usp=publish-editor",
  foodIndividual: "https://docs.google.com/forms/d/e/1FAIpQLSf-LzC7k8UbDv8FyLknOVF6cf8tRYF4eXJo7K0yWrHfDawz_Q/viewform?usp=publish-editor",
  foodGroup: "https://docs.google.com/forms/d/e/1FAIpQLSf0hKLifko0xG5nDLz8Fe9INczY4kyW03vEyqmrQJRRypMi6Q/viewform?usp=publish-editor",
  foodGrandDinner: "https://docs.google.com/forms/d/e/1FAIpQLSfMWcQPTp2dxDL8w-SwWLrfl1fhiw-WUecotve5btSkk99pUQ/viewform?usp=publish-editor",
  mediquizJunior: "https://forms.gle/ttLJVZU4rcCxb3288",
  mediquizSenior: "https://forms.gle/HPKEfizx3ovPLzU27",
  soloSinging: "https://docs.google.com/forms/d/e/1FAIpQLSel7EED6WW0sg5gkecM-GQzAluSXcxqRR5FWnwMTQqvcWILLQ/viewform?usp=publish-editor",
  arcaneHeist: "https://docs.google.com/forms/d/16G9yHWSTdYD1poNoufJjLfDlpmqqqwtQmlc3jeIamZY/edit",
  begBorrowSteal: "https://docs.google.com/forms/d/1rtnW4f1mt3zZm2KHBnRbKMZgqkDltA85aSCCS0nc8ww/edit",
};

// UTR / UPI Transaction Reference Number: always exactly 12 numeric
// digits. Used to validate the compulsory UTR field on every checkout
// form (Pass Checkout and Event Checkout) before submission.
export const UTR_REGEX = /^\d{12}$/;

// The "View Brochure" button on the Home page reads from here — swap
// this single constant if the brochure link ever needs to change.
export const BROCHURE_URL = "https://drive.google.com/file/d/1yfmSD6EkU26QryuHiFRCuO6wwK3P15Uh/view?usp=sharing";

// UPI payment details shown under the QR code on both checkout screens
// (Pass Checkout and Event Checkout). Single source of truth so the
// committee only ever has to update it in one place.
export const UPI_ID = "9442172827@sbi";
export const UPI_MERCHANT_NAME = "DIRECTOR ACCOUNTS OFFICER JIPMER RECEIPTS";

// Rendered as extra tabs in the main domain selection bar, alongside
// the competitive-event categories. Never pass-gated — each links out
// to its own Google Form (a category can have more than one, e.g.
// Food & Catering has separate Individual / Group / Grand Dinner forms).
export const specialSections = [
  {
    id: "accommodation",
    label: "Accommodation",
    desc: "Book your stay at The Dreamer's Vale for the duration of the fest. Both AC and Non-AC rooms are available; a refundable ₹500/head caution deposit is collected in cash on arrival. Basic delegate registration is required first.",
    links: [{ label: "Accommodation Registration Form", url: EXTERNAL_FORM_LINKS.accommodation }],
  },
  {
    id: "food-catering",
    label: "Food & Catering",
    desc: "Register for meal plans and catering available to delegates throughout Spandan 2026 — choose an individual order, a group order for your contingent, or the Grand Dinner.",
    links: [
      { label: "Individual Order Form", url: EXTERNAL_FORM_LINKS.foodIndividual },
      { label: "Group Order Form", url: EXTERNAL_FORM_LINKS.foodGroup },
      { label: "Grand Dinner Form", url: EXTERNAL_FORM_LINKS.foodGrandDinner },
    ],
  },
];

export const festDetails = {
  name: "SPANDAN 2026",
  theme: "The Enchanted Reverie",
  tagline: "Where reality stutters… and the impossible feels strangely familiar.",
  dates: "October 26 – November 1, 2026",
  targetDate: "2026-10-26T09:00:00+05:30",
  venue: "JIPMER Campus, Pondicherry",
  instagram: "jipmer_spandan",
};

export const aboutJipmer = {
  heading: "About JIPMER",
  paragraphs: [
    "JIPMER's origin dates back to 1823 when it was established as \"École de Médicine de Pondicherry\" by the French Government.",
    "JIPMER's steadfast dedication to academic brilliance and cutting-edge medical research has earned it an eminent position among the best medical colleges in the nation; its exalted status fortified by its designation as an Institute of National Importance. The students of JIPMER embody a rare combination of erudition and versatility, showcasing their multifaceted brilliance in a diverse array of extracurricular pursuits and the academic realm alike. Nestled in the quaint French town of Pondicherry, JIPMER boasts of a lush 195 acre campus.",
    "Pondicherry is an enchanting costal enclave along the azure waters of the Bay of Bengal. With an amalgamation of its rich cultural heritage, picturesque promenades, unparalleled gastronomic experiences and spiritual renaissance symbolised by Auroville, Pondicherry is swiftly becoming one of the most sought after travel destinations in South India.",
  ],
};

export const aboutSpandanExtended = {
  heading: "About Spandan",
  paragraphs: [
    "Spandan — a 7 day long spectacle where reality dissolves into a waking dream, where imagination and magic take center stage, and where medicos from all over the country come together for South India's biggest medical college fest.",
    "Step into the unknown on the 27th of October, and unravel the mystique on November 1st. Take on challenges in Les Jeux, showcase your artistic brilliance in Les Beaux-Arts, engage in thought-provoking debates at Les Littéraires, display your academic prowess at La Lutte, and revel in the enchanting fun of House Informals.",
    "Don't miss the captivating highlights of this bonanza: the pro shows and Spandan's iconic ramp walk, the Dernier Cri. Join us as we journey through this \"Enchanted Reverie\" into various mystical realms and wonderland, and create unforgettable memories. After all, it's the thrill of discovery that makes the journey special.",
  ],
};

export const registrationProcess = {
  heading: "Registration Process",
  points: [
    "Registration for the fest shall only be carried out through the official Spandan website. Delegate registration is mandatory for participation in any event during the fest (exceptions are mentioned under individual event descriptions).",
    "Delegate cards are of three tiers (refer to Delegate Tiers).",
    "Individual club passes are available for Sports, Culturals and Literary events (refer to Club Passes).",
    "After registering as a delegate, a unique Delegate ID will be assigned to each participant.",
    "Participants can register for different events as well as for accommodation and food on the Spandan website with their unique Delegate ID.",
    "You will receive a confirmation email within 24 hours after registering as a delegate and for each individual event following completion of the payment.",
    "In case you encounter any problems or discrepancies during the registration process, contact the Public Relations team.",
    "On-spot registration will be open for selected events subject to the availability of slots.",
  ],
};

export const onReachingJipmer = {
  heading: "On Reaching JIPMER",
  bringItems: [
    "A valid student ID card",
    "4 passport size photographs",
    "A letter of approval from the Head of the Institute, carrying the names of all contingent members and indicating the team leader",
  ],
  points: [
    "Head to the reception room and collect your Delegate Card upon showing the confirmation email and your college ID card.",
    "After collecting your Delegate Card, head to the respective event desk in the reception room and show the confirmation email(s) for each event you've registered for.",
    "On-spot registration will also be done in the reception room.",
  ],
};

export const accommodation = {
  heading: "Accommodation",
  subheading: "The Dreamer's Vale",
  contact: "Aijaz: 9148746711",
  points: [
    "Accommodation booking shall be through the Spandan 2026 official website.",
    "Both AC and Non-AC rooms can be availed by delegates through the website.",
    "Basic delegate registration is necessary to avail accommodation.",
    "A Google Form must be filled by delegates prior to payment with their particulars and other details.",
    "The team leader can contact the Accommodation in-charges for further details.",
    "A refundable caution deposit of ₹500/- per head for all delegate card holders should be paid in CASH only at the finance desk in the reception room after arrival.",
    "The accommodation provided will be basic. Mattresses and buckets will be provided; bed sheets and pillow covers will not be.",
    "Participants are responsible for returning items in good condition — a fine of ₹4000 applies for missing/damaged mattresses.",
    "Accommodation will be allotted based on contingent size, date of arrival, and duration of stay.",
    "Non-AC rooms will mostly be provided in dorms and halls (20+ people per hall). Rooms may have to be shared with delegates of other colleges.",
    "Accommodation and mattresses are given on a first-come-first-served basis.",
    "Transportation will not be provided by the organisers.",
  ],
  termsHeading: "Terms & Conditions",
  terms: [
    "Only the team leader should communicate with the Accommodation Committee.",
    "You may have to share accommodation facilities with participants from other colleges.",
    "Locks and keys for luggage will not be provided.",
    "We are not responsible for any loss of valuables, luggage, or other belongings.",
    "Smoking, alcohol, or narcotics on campus is strictly prohibited — violations result in strict action.",
    "A team may be denied participation or disqualified in case of misconduct by its members.",
    "Damage to college property will be fined from the caution deposit; charges beyond the deposit amount can be levied additionally.",
    "Decision of the JSA (JIPMER Students' Association) is binding and final in any circumstance.",
  ],
};

export const generalGuidelines = {
  heading: "General Guidelines",
  points: [
    "Registration as a delegate is compulsory to participate in any Spandan event and for accommodation.",
    "Registration will be through the official Spandan website.",
    "Registration is complete once you receive the confirmation email on your registered email ID.",
    "Refunds will not be issued under any circumstance.",
    "The Team Leader of a contingent should be the one who confirms the registration of participants at the Reception Desk on arrival.",
    "Participants should carry their Delegate Cards with them at all times — they'll be required to show it on demand by any authorised personnel.",
    "Smoking, consumption of alcohol and narcotics is strictly prohibited in the college campus.",
    "Violation of this rule will lead to severe consequences. Decision of the Judges will be final and binding for any event.",
    "All prize amounts are subject to change with the number of registrations. Prize money will be transferred directly to the participant's bank account within 7 working days.",
    "In case of any disputes arising, the decision of the JIPMER Students' Association shall be binding.",
  ],
};

export const gettingHere = {
  heading: "All Aboard — Getting Here",
  routes: [
    { mode: "By Air", points: ["Puducherry Airport", "Chennai International Airport"] },
    { mode: "By Rail", points: ["Chennai Central", "Puducherry Railway Station", "Villupuram Junction"] },
    { mode: "By Road", points: ["Well connected by road network.", "Buses, taxis and cabs available."] },
  ],
};

export const tiers = [
  {
    id: "tier-one",
    name: "The Red Queen",
    tierLabel: "Tier One",
    price: 750,
    tag: "All-Access Pass",
    suit: "♥",
    color: "from-toadstool-700/50 to-berry-700/35 border-toadstool-400/50",
    amenities: [
      "Participate & spectate all competitive events (INCL. Dernier Cri)",
      "Inaugural Night",
      "Chorea Night",
      "Alaap Finals",
      "Tinnitus Finals",
      "DJ Night",
      "1 Minor Proshow",
      "Major Proshow",
      "Dernier Cri (Fashion Show)"
    ]
  },
  {
    id: "tier-two",
    name: "The Mad Hatter",
    tierLabel: "Tier Two",
    price: 650,
    tag: "Popular Choice",
    suit: "♦",
    color: "from-lantern-600/40 to-berry-700/25 border-lantern-400/40",
    amenities: [
      "Participate & spectate all competitive events (EXCL. Dernier Cri)",
      "Inaugural Night",
      "Chorea Night",
      "Alaap Finals",
      "Tinnitus Finals",
      "DJ Night",
      "1 Minor Proshow"
    ]
  },
  {
    id: "tier-three",
    name: "The White Rabbit",
    tierLabel: "Tier Three",
    price: 375,
    tag: "Essential Pass",
    suit: "♠",
    color: "from-mist-700/40 to-canopy-600/30 border-mist-400/40",
    amenities: [
      "Participate & spectate all competitive events (EXCL. Dernier Cri)",
      "Inaugural Night",
      "Chorea Night",
      "Alaap Finals",
      "Tinnitus Finals",
      "DJ Night"
    ]
  }
];

export const clubPasses = [
  {
    id: "cult-pass",
    name: "The Mystic Caterpillar",
    passLabel: "Cult Pass",
    price: 150,
    type: "club-pass",
    desc: "Viewer access to all minor stage events. Individual event registration fee to be paid separately to participate.",
  },
  {
    id: "sports-pass",
    name: "The Cheshire Cat",
    passLabel: "Sports Pass",
    price: 250,
    type: "club-pass",
    desc: "Viewer access to all sports events. Individual event registration fee to be paid separately to participate.",
  },
  {
    id: "lit-pass",
    name: "Cheshire Charades",
    passLabel: "Lit Pass",
    price: 500,
    type: "club-pass",
    desc: "Participate in all Literary events free of charge — no separate event fee."
  },
  {
    id: "quiz-pass",
    name: "Wonderland Whiz",
    passLabel: "Quiz Pass",
    price: 550,
    type: "club-pass",
    desc: "Participate in all Quiz events free of charge — no separate event fee."
  },
  {
    id: "premium-pass",
    name: "The Golden Key",
    passLabel: "Premium Pass",
    price: 800,
    type: "club-pass",
    desc: "Participate in all Literary & Quiz events free of charge — no separate event fee."
  }
];

// ----------------------------------------------------------------
// PASS-GATED EVENT ACCESS
// A pass/tier always grants ACCESS to register for its category.
// Whether it also waives the per-event fee depends on the pass:
//   - Delegate Tiers (any):        unlock access, fee still applies.
//   - Cult Pass / The Mad March
//     Hare (Sports Pass):          unlock access ("viewer" pass,
//                                  per the brochure), fee still applies.
//   - Cheshire Charades (Lit),
//     Wonderland Whiz (Quiz),
//     The Golden Key (Premium):    unlock access AND make matching
//                                  events completely free (₹0).
// ----------------------------------------------------------------
const ALL_TIERS = ["tier-one", "tier-two", "tier-three"];

export const categoryAccess = {
  "cult-major": { requiredPasses: [...ALL_TIERS, "cult-pass"], freeWithPasses: [] },
  "cult-minor": { requiredPasses: [...ALL_TIERS, "cult-pass"], freeWithPasses: [] },
  "fine-arts": { requiredPasses: [...ALL_TIERS, "cult-pass"], freeWithPasses: [] },
  "literary": { requiredPasses: [...ALL_TIERS, "lit-pass", "premium-pass"], freeWithPasses: ["lit-pass", "premium-pass"] },
  "quiz": { requiredPasses: [...ALL_TIERS, "quiz-pass", "premium-pass"], freeWithPasses: ["quiz-pass", "premium-pass"] },
  "sports": { requiredPasses: [...ALL_TIERS, "sports-pass"], freeWithPasses: [] },
  "informals": { requiredPasses: [], freeWithPasses: [] },
  "mediquiz": { requiredPasses: [], freeWithPasses: [] },
};

// Per-event overrides where the category default doesn't apply.
export const eventOverrides = {
  // Dernier Cri unlocks with Tier One (The Red Queen) only, per Delegate
  // Tier amenities above — Tier Two and Tier Three explicitly exclude it.
  "dernier-cri": { requiredPasses: ["tier-one"], freeWithPasses: [] },
  // Solo Singing sits under Cultural Minor (normally pass-gated), but per
  // the Google-Form-only workflow these two are open to everyone.
  "solo-singing-eastern": { requiredPasses: [], freeWithPasses: [] },
  "solo-singing-western": { requiredPasses: [], freeWithPasses: [] },
};

// Events that register ENTIRELY through an external Google Form — no
// pass required, no in-app "Add Event" button, no lock ever shown.
export const FORM_ONLY_EVENT_IDS = [
  "arcane-heist",
  "beg-borrow-steal",
  "la-lutte-junior",
  "la-lutte-senior",
  "solo-singing-eastern",
  "solo-singing-western",
];

/**
 * Given an event and the set of pass codes a user owns, work out
 * whether they can register for it and what it costs. A sub-event
 * (string or {name, price}) can override the parent event's price —
 * used by Gymnasium, where each lift is priced separately.
 */
export function getEventAccess(event, ownedPassCodes = [], subEvent = null) {
  const rule = eventOverrides[event.id] || categoryAccess[event.category] || { requiredPasses: [], freeWithPasses: [] };

  const isOpen = rule.requiredPasses.length === 0;
  const owns = (code) => ownedPassCodes.includes(code);
  const unlocked = isOpen || rule.requiredPasses.some(owns);
  const free = !isOpen && (rule.freeWithPasses || []).some(owns);

  const basePrice = subEvent && typeof subEvent === "object" ? subEvent.price : event.price;

  return {
    unlocked,
    price: unlocked && free ? 0 : basePrice,
    requiredLabel: unlocked
      ? null
      : rule.requiredPasses
          .map((code) => {
            const tier = tiers.find((t) => t.id === code);
            const club = clubPasses.find((p) => p.id === code);
            return tier ? tier.tierLabel : club ? club.passLabel : code;
          })
          .join(" or "),
  };
}

// Normalizes a subEvents entry (plain string OR {name, price}) into
// a display label — used anywhere sub-events are rendered.
export function subEventLabel(sub) {
  return typeof sub === "string" ? sub : sub.name;
}

// Team events: informals and team-format sports need a roster.
// (Individual/solo sports and all cultural/literary/quiz events are
// single-participant registrations.)
export function isTeamEvent(event) {
  return event.category === "informals" || event.type === "Team Sports";
}


export const eventCategories = [
  { id: "all", label: "All Realities" },
  { id: "cult-major", label: "Les Beaux Arts (Cultural Major)" },
  { id: "cult-minor", label: "Les Beaux Arts (Cultural Minor)" },
  { id: "fine-arts", label: "Motif (Fine Arts)" },
  { id: "literary", label: "Les Littéraires (Literature & Debating)" },
  { id: "quiz", label: "Quizzes (General Knowledge)" },
  { id: "sports", label: "Les Jeux (Sports)" },
  { id: "informals", label: "House Informals (Fun Challenges)" },
  { id: "mediquiz", label: "La Lutte (Academic Quiz)" },
  { id: "accommodation", label: "Accommodation", special: true },
  { id: "food-catering", label: "Food & Catering", special: true },
];

export const eventsList = [
  // Fine Arts (Motif)
  { id: "painting", title: "Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 100, desc: "Express the wonderland on canvas." },
  { id: "sketching", title: "Sketching", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 100, desc: "Express the wonderland on paper with sketches." },
  { id: "collage", title: "Collage", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 100, desc: "Creative collage art competition." },
  { id: "face-painting", title: "Face Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 100, desc: "Canvas on skin with surreal concepts." },
  { id: "mehendi", title: "Mehendi", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 100, desc: "Intricate traditional and creative henna styling." },
  { id: "pot-painting", title: "Pot Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 100, desc: "Terracotta painting with vibrant themes." },

  // Cultural Major
  { id: "chorea-theme", title: "Chorea (Theme Group Dance)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 250, desc: "Flagship group choreography matching the reverie theme." },
  { id: "chorea-non-theme-eastern", title: "Chorea (Non-Theme Eastern Group Dance)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 250, desc: "High octane eastern group dance competition." },
  { id: "chorea-non-theme-western", title: "Chorea (Non-Theme Western Group Dance)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 250, desc: "Electrifying western group dance competition." },
  { id: "alaap", title: "Alaap (Eastern BoB)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 200, desc: "Eastern Battle of the Bands live on stage." },
  { id: "tinnitus", title: "Tinnitus (Western BoB)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 200, desc: "Western rock and metal Battle of the Bands." },
  { id: "dernier-cri", title: "Dernier Cri (Fashion Show)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 250, desc: "The premier runway fashion spectacle." },

  // Cultural Minor
  { id: "solo-dance-eastern", title: "Solo Dance (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Individual eastern dance style showcase." },
  { id: "solo-dance-western", title: "Solo Dance (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Individual western dance style showcase." },
  { id: "duet-dance-eastern", title: "Duet Dance (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Synchronized eastern duet dance." },
  { id: "duet-dance-western", title: "Duet Dance (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Synchronized western duet dance." },
  { id: "solo-singing-eastern", title: "Solo Singing (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Eastern solo vocal performance.", externalFormUrl: EXTERNAL_FORM_LINKS.soloSinging, externalFormNote: "Note: Participants should complete registration for this event through this Google Form Only." },
  { id: "solo-singing-western", title: "Solo Singing (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Western solo vocal performance.", externalFormUrl: EXTERNAL_FORM_LINKS.soloSinging, externalFormNote: "Note: Participants should complete registration for this event through this Google Form Only." },
  { id: "duet-singing-eastern", title: "Duet Singing (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 100, desc: "Harmonized eastern vocal duets." },
  { id: "duet-singing-western", title: "Duet Singing (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 100, desc: "Harmonized western vocal duets." },
  { id: "adaptunes", title: "Adaptunes", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Instant choreography on dynamic changing tracks." },
  { id: "showdown", title: "Showdown", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 125, desc: "High intensity stage dance face-off." },
  { id: "euphony", title: "Euphony (Acoustics)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Unplugged acoustic melodies." },
  { id: "play", title: "Play", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Full stage theatrical play production." },
  { id: "skit", title: "Skit", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Short comedic or thematic theatrical performance." },
  { id: "mime", title: "Mime", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Silent storytelling performance art." },
  { id: "solo-instrumental", title: "Solo Instrumental", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Solo instrumental musical performance." },
  { id: "adzap", title: "Adzap", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 150, desc: "Creative advertising and presentation showdown." },

  // House Informals
  { id: "arcane-heist", title: "Arcane Heist", category: "informals", contact: "Krishnendu: 9048016206", price: 0, minTeamSize: 4, desc: "Immersive campus heist challenge.", externalFormUrl: EXTERNAL_FORM_LINKS.arcaneHeist, externalFormNote: "Note: Participants should complete registration for this event through this Google Form Only." },
  { id: "beg-borrow-steal", title: "Beg Borrow Steal", category: "informals", contact: "Krishnendu: 9048016206", price: 0, minTeamSize: 4, desc: "Classic high-energy scavenger hunt.", externalFormUrl: EXTERNAL_FORM_LINKS.begBorrowSteal, externalFormNote: "Note: Participants should complete registration for this event through this Google Form Only." },

  // La Lutte (MediQuiz)
  { id: "la-lutte-junior", title: "La Lutte (Junior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", price: 0, desc: "Intercollegiate Medical Quiz for juniors.", externalFormUrl: EXTERNAL_FORM_LINKS.mediquizJunior, externalFormNote: "Note: Participants should complete registration for this event through this Google Form Only." },
  { id: "la-lutte-senior", title: "La Lutte (Senior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", price: 0, desc: "Intercollegiate Medical Quiz for seniors.", externalFormUrl: EXTERNAL_FORM_LINKS.mediquizSenior, externalFormNote: "Note: Participants should complete registration for this event through this Google Form Only." },

  // Literary (Les Littéraires)
  { id: "formal-debate", title: "Formal Debate", category: "literary", contact: "Akash: 9701344959", price: 250, desc: "Rigorous formal argumentation showdown." },
  { id: "malarkey", title: "Malarkey (Informal Debate)", category: "literary", contact: "Akash: 9701344959", price: 150, desc: "Witty, humorous informal debate battle." },
  { id: "directors-cut", title: "Director's Cut", category: "literary", contact: "Akash: 9701344959", price: 150, desc: "Cinematic literary adaptation event." },
  { id: "cryptic-crossword", title: "Cryptic Crossword", category: "literary", contact: "Akash: 9701344959", price: 250, desc: "Mind-bending word puzzles and cryptic clues." },
  { id: "potpourri", title: "Potpourri (dumbc + picto)", category: "literary", contact: "Akash: 9701344959", price: 150, desc: "Dumb charades and pictionary combo." },
  { id: "jam", title: "JAM (Just a Minute)", category: "literary", contact: "Akash: 9701344959", price: 250, desc: "No hesitation, repetition, or deviation." },
  { id: "turn-coat", title: "Turn Coat", category: "literary", contact: "Akash: 9701344959", price: 150, desc: "Switching perspectives mid-speech." },

  // Quizzes (Les Littéraires)
  { id: "tj-jaishankar-quiz", title: "TJ Jaishankar Memorial Open Quiz by Major Chandrakant Nair", category: "quiz", contact: "Sai Ajay: 6360913421", price: 250, desc: "Flagship open general quiz." },
  { id: "sports-quiz", title: "Offside - Sports Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "Ultimate trivia for sports enthusiasts." },
  { id: "fandom-quiz", title: "Stardom - Fandom Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "Pop culture, movies, TV shows and books quiz." },
  { id: "literature-quiz", title: "Literature Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "Literary trivia and classic works." },
  { id: "tlc-quiz", title: "Travel, Living & Culture Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "World culture, travel and lifestyle trivia." },
  { id: "rewind-quiz", title: "Rewind Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "Nostalgia and retro events quiz." },

  // Les Jeux (Sports)
  {
    id: "basketball",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 5,
    title: "Basketball",
    price: 300,
    contact: "Guru: 9182915457 / Sanjay: 8825444851 / Rahul: 8522067425 / Kamalika: 9008931094 / Nikitha: 9030787037",
    desc: "Court battles across divisions.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "cricket",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 11,
    title: "Cricket",
    price: 300,
    contact: "Karthik: 6303874139 / Raveendra: 8143111533",
    desc: "Intercollegiate men's cricket tournament.",
    subEvents: ["Men's"]
  },
  {
    id: "football",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 11,
    title: "Football",
    price: 300,
    contact: "Ruthvik: 9346353160 / Prem: 7825029059",
    desc: "11v11 intercollegiate football championship.",
    subEvents: ["Men's"]
  },
  {
    id: "futsal",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 5,
    title: "Futsal",
    price: 300,
    contact: "Rahul: 6301785989 / Thanmay: 8317690859 / Chaitanya: 8877775566 / Farhat: 8688743769",
    desc: "High-octane indoor short-format soccer.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "hockey",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 11,
    title: "Hockey",
    price: 300,
    contact: "Abhishek: 9493604268 / Manideep: 6309702436 / Santhoshini: 7981897219",
    desc: "Field hockey tournaments in 11s and 5s formats.",
    subEvents: ["Hockey 11s", "Hockey 5s (Men's)", "Hockey 5s (Women's)"]
  },
  {
    id: "throwball",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 6,
    title: "Throwball",
    price: 300,
    contact: "Bruhathi: 9441506027 / Elisha: 9398348069",
    desc: "High-energy aerial rallies across categories.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "volleyball",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 6,
    title: "Volleyball",
    price: 300,
    contact: "Vishwa: 7337092925 / Thrivedhi: 7981958991 / Yashwanth: 9392607606 / Vyshnavi: 8501080093",
    desc: "Spikes, digs, and team net battles.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "aquatics",
    category: "sports",
    type: "Non-Team Sports",
    title: "Aquatics",
    price: 200,
    contact: "Rupesh: 6305669174 / Siddartha: 6302770266",
    desc: "Competitive swimming & aquatic events.",
    subEvents: [
      "Men's Freestyle 50m", "Men's Backstroke 50m", "Men's Breaststroke 50m", "Men's Butterfly 50m", "Men's Freestyle 4x50m",
      "Women's Freestyle 50m", "Women's Backstroke 50m", "Women's Breaststroke 50m", "Women's Butterfly 50m",
      "Mixed Freestyle 4x50m"
    ]
  },
  {
    id: "athletics",
    category: "sports",
    type: "Non-Team Sports",
    title: "Athletics",
    price: 200,
    contact: "Abhijith: 9959362836 / Dhanush: 9505603451",
    desc: "Track & field events.",
    subEvents: [
      "Men's 100m", "Men's 200m", "Men's 400m", "Men's 800m", "Men's 1500m", "Men's 4x100m", "Men's Shotput", "Men's Discus Throw", "Men's Long Jump",
      "Women's 100m", "Women's 200m", "Women's 400m", "Women's 800m", "Women's 1500m", "Women's 4x100m", "Women's Shotput", "Women's Discus Throw", "Women's Long Jump"
    ]
  },
  {
    id: "badminton",
    category: "sports",
    type: "Non-Team Sports",
    title: "Badminton",
    price: 300,
    contact: "Rohit: 9652757103 / Nithin: 8248974822",
    desc: "Fast shuttlecraft singles & doubles tournaments.",
    subEvents: ["Men's Team Event", "Women's Team Event", "Mixed Doubles"]
  },
  {
    id: "carrom",
    category: "sports",
    type: "Non-Team Sports",
    title: "Carrom",
    price: 300,
    contact: "Hemanth: 6304426622 / Praharsh: 7569443743",
    desc: "Precision carrom board tournament.",
    subEvents: ["Singles", "Doubles"]
  },
  {
    id: "chess",
    category: "sports",
    type: "Non-Team Sports",
    title: "Chess",
    price: 200,
    contact: "Karthik: 8925324459 / Kaadambari: 7032613316",
    desc: "Mind games across rapid, blitz, bullet, and team setups.",
    subEvents: ["Rapid", "Blitz", "Bullet", "Team Event"]
  },
  {
    id: "table-tennis",
    category: "sports",
    type: "Non-Team Sports",
    title: "Table Tennis",
    price: 300,
    contact: "Vivek: 7993567879",
    desc: "High speed table tennis rallies.",
    subEvents: ["Men's Singles", "Men's Team Event", "Women's Singles", "Women's Team Event"]
  },
  {
    id: "tennis",
    category: "sports",
    type: "Non-Team Sports",
    title: "Tennis",
    price: 300,
    contact: "Abubakar: 7842552193 / Akshay: 7904653955 / Manish: 9573834328",
    desc: "Lawn tennis championships across all categories.",
    subEvents: [
      "Men's Singles",
      "Men's Doubles",
      "Women's Singles",
      "Women's Doubles",
      "Mixed Doubles"
    ]
  },
  {
    // Fixed: was previously duplicated as two separate "gymnasium" entries
    // (same id, slightly different titles) which caused a React key
    // collision and an accidental duplicate listing. Merged into one
    // event, exclusively under the "sports" category, with all four
    // lifts as sub-events (each priced separately).
    id: "gymnasium",
    category: "sports",
    type: "Non-Team Sports",
    title: "Gymnasium (Men's)",
    price: 200,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037",
    desc: "Strength events — bench press, squats, pull-ups, and push-ups.",
    subEvents: [
      { name: "Bench Press", price: 200 },
      { name: "Squats", price: 200 },
      { name: "Pull-ups", price: 70 },
      { name: "Push-ups", price: 70 }
    ]
  },
];

export const teamContacts = [
  { role: "President", name: "Sankhalp Sunod", phone: "8510107650" },
  { role: "General Secretary", name: "Mathivardhan", phone: "9042667273" },
  { role: "Vice-President", name: "Subapreti", phone: "9487174005" },
  { role: "Speaker", name: "Karthikeya", phone: "8074601095" },
  { role: "Public Relations", name: "Thirupugazh", phone: "7358121539" },
  { role: "Public Relations", name: "Lineysha", phone: "8121217021" },
  { role: "Fine Arts & Culturals", name: "Kavyanjali", phone: "7892741773" },
  { role: "Literary & Debate", name: "Akash", phone: "9701344959" },
  { role: "Quizzes", name: "Sai Ajay", phone: "6360913421" },
  { role: "Sports", name: "Vinay", phone: "7207867241" },
  { role: "Sports", name: "Nikhitha", phone: "9030787037" },
  { role: "Sports", name: "Mirshad", phone: "7510166801" },
  { role: "House Informals", name: "Krishnendu", phone: "9048016206" },
  { role: "La Lutte (MediQuiz)", name: "Praneetha", phone: "6380924669" },
  { role: "Photography", name: "Tharaneeswar PS", phone: "7010370264" },
  { role: "Photography", name: "Midhun Raj", phone: "9840710678" },
  { role: "Gaming (Game Over)", name: "Prudhvi", phone: "8056765218" },
  { role: "Social Service", name: "Jaagruthi", phone: "9019823915" },
  { role: "Catering", name: "Koushika", phone: "6374004239" },
  { role: "Catering", name: "Shree Siva A", phone: "6383244647" },
  { role: "Accommodation", name: "Aijaz", phone: "9148746711" }
];

export const scheduleData = [
  {
    day: "Day 1",
    date: "Oct 26, 2026",
    title: "Down The Rabbit Hole",
    highlights: [
      "Registration & Welcome Portals Open",
      "Formal Debate & Opening Literary Rounds",
      "Inaugural Ceremony (Evening)",
      "Minor Proshow 1",
      "DJ Night 1"
    ]
  },
  {
    day: "Day 2",
    date: "Oct 27, 2026",
    title: "The Chorea Spectacle",
    highlights: [
      "Track & Court Sports Tournaments (Football, Basketball, Cricket)",
      "Les Beaux Arts (Face Painting, Sketching, Pot Painting)",
      "Chorea (Theme Group Dance) Prelims & Finals",
      "Chorea (Non-Theme Eastern & Western Group Dance)",
      "DJ Night 2"
    ]
  },
  {
    day: "Day 3",
    date: "Oct 28, 2026",
    title: "Symphony & Beats",
    highlights: [
      "TJ Jaishankar Memorial Open Quiz",
      "Minor Cultural Events (Solo & Duet Dance, Adaptunes)",
      "Alaap Finals (Eastern Battle of the Bands)",
      "DJ Night 3"
    ]
  },
  {
    day: "Day 4",
    date: "Oct 29, 2026",
    title: "Rock & Reverie",
    highlights: [
      "La Lutte (Junior & Senior MediQuiz Prelims/Finals)",
      "Sports Semi-Finals (Badminton, Tennis, Table Tennis)",
      "Tinnitus Finals (Western Battle of the Bands)",
      "Minor Proshow 2"
    ]
  },
  {
    day: "Day 5",
    date: "Oct 30, 2026",
    title: "The Mad Runway",
    highlights: [
      "House Informals (Beg Borrow Steal, Arcane Heist)",
      "Sports Grand Finals & Aquatics",
      "Dernier Cri (The Flagship Fashion Show)",
      "Acoustic Night & Informal Showdowns"
    ]
  },
  {
    day: "Day 6",
    date: "Oct 31, 2026",
    title: "The Dream Unfolds",
    highlights: [
      "Literary & Fine Arts Finals",
      "Gaming Tournament Finals",
      "Special Proshow & DJ Night"
    ]
  },
  {
    day: "Day 7",
    date: "Nov 1, 2026",
    title: "The Grand Finale",
    highlights: [
      "Valedictory Ceremony & Prize Distribution",
      "Photography Awards",
      "Grand Major Proshow (Celebrity Star Night)",
      "Closing Reverie"
    ]
  }
];