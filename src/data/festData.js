// ----------------------------------------------------------------
// EXTERNAL GOOGLE FORM LINKS
// Replace the "#" placeholders below with the real form URLs once
// they're published — nothing else in the app needs to change,
// every place that links to these reads from this one object.
// ----------------------------------------------------------------
export const EXTERNAL_FORM_LINKS = {
  accommodation: "#", // TODO: replace with the Accommodation Google Form URL
  foodCatering: "#", // TODO: replace with the Food & Catering Google Form URL
  mediquizJunior: "https://forms.gle/ttLJVZU4rcCxb3288",
  mediquizSenior: "https://forms.gle/HPKEfizx3ovPLzU27",
};

// Shown as extra cards alongside the event domains — these aren't
// competitive events, so they're never pass-gated; each just links
// out to its own Google Form.
export const specialSections = [
  {
    id: "accommodation",
    title: "Accommodation",
    desc: "Book your stay at The Dreamer's Vale for the duration of the fest. AC and Non-AC rooms available.",
    formUrl: EXTERNAL_FORM_LINKS.accommodation,
  },
  {
    id: "food-catering",
    title: "Food & Catering",
    desc: "Register for meal plans and catering options available to delegates throughout Spandan 2026.",
    formUrl: EXTERNAL_FORM_LINKS.foodCatering,
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
    "Spandan — a 5 day long spectacle where reality dissolves into a waking dream, where imagination and magic take center stage, and where medicos from all over the country come together for South India's biggest medical college fest.",
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
    name: "The Knave of Hearts",
    passLabel: "Lit Pass",
    price: 500,
    type: "club-pass",
    desc: "Participate in all Literary events free of charge. Individual event registration fee not required."
  },
  {
    id: "quiz-pass",
    name: "Quiz Pass",
    passLabel: "Quiz Pass",
    price: 550,
    type: "club-pass",
    desc: "Participate in all Quiz events free of charge. Individual event registration fee not required."
  },
  {
    id: "premium-pass",
    name: "Premium Pass (Lit & Quiz)",
    passLabel: "Premium Pass",
    price: 800,
    type: "club-pass",
    desc: "Participate in all Literary & Quiz events free of charge. Individual event registration fee not required."
  }
];

// ----------------------------------------------------------------
// PASS-GATED EVENT ACCESS
// Which passes/tiers unlock a category. Owning a pass grants ACCESS
// to register for that category — it does not waive the per-event
// fee. Every event keeps its own listed price at checkout, always,
// per the official brochure's "individual registration fee to be
// paid separately" rule (now applied uniformly to every pass type,
// including Delegate Tiers).
// ----------------------------------------------------------------
const ALL_TIERS = ["tier-one", "tier-two", "tier-three"];

export const categoryAccess = {
  "cult-major": { requiredPasses: [...ALL_TIERS, "cult-pass"] },
  "cult-minor": { requiredPasses: [...ALL_TIERS, "cult-pass"] },
  "fine-arts": { requiredPasses: [...ALL_TIERS, "cult-pass"] },
  "literary": { requiredPasses: [...ALL_TIERS, "lit-pass", "premium-pass"] },
  "quiz": { requiredPasses: [...ALL_TIERS, "quiz-pass", "premium-pass"] },
  "sports": { requiredPasses: [...ALL_TIERS, "sports-pass"] },
  "informals": { requiredPasses: [] },
  "mediquiz": { requiredPasses: [] },
  "gaming": { requiredPasses: [] },
};

// Per-event overrides where the category default doesn't apply.
// Dernier Cri is Tier One/Two only, per Delegate Tier amenities above
// (Tier Three / The White Rabbit excludes it).
export const eventOverrides = {
  "dernier-cri": { requiredPasses: ["tier-one", "tier-two"] },
};

/**
 * Given an event and the set of pass codes a user owns, work out
 * whether they can register for it. Price is always the event's own
 * listed price when unlocked — no pass makes an event free, a pass
 * only unlocks the *ability* to buy it.
 */
export function getEventAccess(event, ownedPassCodes = []) {
  const rule = eventOverrides[event.id] || categoryAccess[event.category] || { requiredPasses: [] };

  const isOpen = rule.requiredPasses.length === 0;
  const owns = (code) => ownedPassCodes.includes(code);
  const unlocked = isOpen || rule.requiredPasses.some(owns);

  return {
    unlocked,
    price: event.price,
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

// Team events: informals and team-format sports need a roster.
// (Individual/solo sports and all cultural/literary/quiz events are
// single-participant registrations.)
export function isTeamEvent(event) {
  return event.category === "informals" || event.type === "Team Sports";
}


export const eventCategories = [
  { id: "all", label: "All Realities" },
  { id: "cult-major", label: "Cultural Major (Dance, Music & Fashion)" },
  { id: "cult-minor", label: "Cultural Minor (Solo & Duet Performances)" },
  { id: "fine-arts", label: "Les Beaux Arts (Fine Arts)" },
  { id: "literary", label: "Les Littéraires (Literature & Debating)" },
  { id: "quiz", label: "Quizzes (General Knowledge)" },
  { id: "sports", label: "Les Jeux (Sports)" },
  { id: "informals", label: "House Informals (Fun Challenges)" },
  { id: "mediquiz", label: "La Lutte (Academic Quiz)" },
  { id: "gaming", label: "Game Over (Gaming)" }
];

export const eventsList = [
  // Fine Arts (Les Beaux Arts / Motif)
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
  { id: "solo-singing-eastern", title: "Solo Singing (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 100, desc: "Eastern solo vocal performance." },
  { id: "solo-singing-western", title: "Solo Singing (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 100, desc: "Western solo vocal performance." },
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
  { id: "arcane-heist", title: "Arcane Heist", category: "informals", contact: "Krishnendu: 9048016206", price: 300, minTeamSize: 4, desc: "Immersive campus heist challenge (₹300 per team)." },
  { id: "beg-borrow-steal", title: "Beg Borrow Steal", category: "informals", contact: "Krishnendu: 9048016206", price: 160, minTeamSize: 4, desc: "Classic high-energy scavenger hunt (₹160 per team)." },

  // La Lutte (MediQuiz)
  { id: "la-lutte-junior", title: "La Lutte (Junior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", price: 0, desc: "Intercollegiate Medical Quiz for juniors.", externalFormUrl: EXTERNAL_FORM_LINKS.mediquizJunior, externalFormNote: "Note: Users must complete their registration through this Google Form link as well." },
  { id: "la-lutte-senior", title: "La Lutte (Senior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", price: 0, desc: "Intercollegiate Medical Quiz for seniors.", externalFormUrl: EXTERNAL_FORM_LINKS.mediquizSenior, externalFormNote: "Note: Users must complete their registration through this Google Form link as well." },

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
  { id: "sports-quiz", title: "Sports Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "Ultimate trivia for sports enthusiasts." },
  { id: "fandom-quiz", title: "Fandom Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 150, desc: "Pop culture, movies, TV shows and books quiz." },
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
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Court battles across divisions.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "cricket",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 11,
    title: "Cricket",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Intercollegiate men's cricket tournament.",
    subEvents: ["Men's"]
  },
  {
    id: "football",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 11,
    title: "Football",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "11v11 intercollegiate football championship.",
    subEvents: ["Men's"]
  },
  {
    id: "futsal",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 5,
    title: "Futsal",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "High-octane indoor short-format soccer.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "hockey",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 11,
    title: "Hockey",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Field hockey tournaments in 11s and 5s formats.",
    subEvents: ["Hockey 11s", "Hockey 5s (Men's)", "Hockey 5s (Women's)"]
  },
  {
    id: "throwball",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 6,
    title: "Throwball",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "High-energy aerial rallies across categories.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "volleyball",
    category: "sports",
    type: "Team Sports",
    minTeamSize: 6,
    title: "Volleyball",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Spikes, digs, and team net battles.",
    subEvents: ["Men's", "Women's"]
  },
  {
    id: "aquatics",
    category: "sports",
    type: "Non-Team Sports",
    title: "Aquatics",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Competitive swimming & aquatic events.",
    subEvents: ["TBD 1", "TBD 2"]
  },
  {
    id: "athletics",
    category: "sports",
    type: "Non-Team Sports",
    title: "Athletics",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Track & field events.",
    subEvents: ["TBD 1", "TBD 2"]
  },
  {
    id: "badminton",
    category: "sports",
    type: "Non-Team Sports",
    title: "Badminton",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Fast shuttlecraft singles & doubles tournaments.",
    subEvents: ["Singles", "Doubles", "Mixed Doubles"]
  },
  {
    id: "carrom",
    category: "sports",
    type: "Non-Team Sports",
    title: "Carrom",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Precision carrom board tournament.",
    subEvents: ["Singles", "Doubles"]
  },
  {
    id: "chess",
    category: "sports",
    type: "Non-Team Sports",
    title: "Chess",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Mind games across rapid, blitz, bullet, and team setups.",
    subEvents: ["Rapid", "Blitz", "Bullet", "Team"]
  },
  {
    id: "table-tennis",
    category: "sports",
    type: "Non-Team Sports",
    title: "Table Tennis",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "High speed table tennis rallies.",
    subEvents: ["TBD 1", "TBD 2"]
  },
  {
    id: "tennis",
    category: "sports",
    type: "Non-Team Sports",
    title: "Tennis",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Lawn tennis championships across all categories.",
    subEvents: [
      "Men's Singles",
      "Men's Doubles",
      "Women's Singles",
      "Women's Doubles",
      "Mixed Doubles"
    ]
  },

  // Game Over
  { id: "gaming-offline", title: "FIFA, WWE 2K25 & Mortal Kombat (Offline)", category: "gaming", contact: "Prudhvi: 8056765218", price: 0, desc: "Console gaming battles." },
  { id: "psvr2", title: "Virtual Reality Experience (PSVR2)", category: "gaming", contact: "Prudhvi: 8056765218", price: 0, desc: "Immersive VR setup with Gran Turismo 7 gaming wheel." },
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