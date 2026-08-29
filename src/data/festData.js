// src/data/festData.js
export const festDetails = {
  name: "SPANDAN 2026",
  theme: "The Enchanted Reverie",
  tagline: "Where reality stutters… and the impossible feels strangely familiar.",
  dates: "October 26 – November 1, 2026",
  targetDate: "2026-10-26T09:00:00+05:30", // Start timestamp for Countdown
  venue: "JIPMER Campus, Pondicherry",
  instagram: "jipmer_spandan",
};

export const tiers = [
  {
    id: "tier-one",
    name: "Tier One",
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
    name: "Tier Two",
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
    name: "Tier Three",
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
    name: "Cult Pass",
    price: 150,
    type: "club-pass",
    desc: "Access to all minor stage events. Individual event registration fee to be paid separately."
  },
  {
    id: "sports-pass",
    name: "Sports Pass",
    price: 250,
    type: "club-pass",
    desc: "Access to all sports events. Individual event registration fee to be paid separately."
  },
  {
    id: "lit-pass",
    name: "Lit Pass",
    price: 500,
    type: "club-pass",
    desc: "Participate in all Literary events. Individual event registration fee not required."
  },
  {
    id: "quiz-pass",
    name: "Quiz Pass",
    price: 550,
    type: "club-pass",
    desc: "Participate in all Quiz events. Individual event registration fee not required."
  },
  {
    id: "premium-pass",
    name: "Premium Pass (Lit & Quiz)",
    price: 800,
    type: "club-pass",
    desc: "Participate in all Literary & Quiz events. Individual event registration fee not required."
  }
];

export const eventCategories = [
  { id: "all", label: "All Realities" },
  { id: "cult-major", label: "Cultural Major" },
  { id: "cult-minor", label: "Cultural Minor" },
  { id: "fine-arts", label: "Les Beaux Arts" },
  { id: "literary", label: "Les Littéraires" },
  { id: "quiz", label: "Quizzes" },
  { id: "sports", label: "Les Jeux" },
  { id: "informals", label: "House Informals" },
  { id: "mediquiz", label: "La Lutte" },
  { id: "gaming", label: "Game Over" },
  { id: "photography", label: "Lumière sur l’Instant" }
];

export const eventsList = [
  // Fine Arts (Les Beaux Arts)
  { id: "painting", title: "Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 0, desc: "Express the wonderland on canvas." },
  { id: "sketching", title: "Sketching", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 0, desc: "Express the wonderland on paper with sketches." },
  { id: "collage", title: "Collage", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 0, desc: "Creative collage art competition." },
  { id: "face-painting", title: "Face Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 0, desc: "Canvas on skin with surreal concepts." },
  { id: "mehendi", title: "Mehendi", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 0, desc: "Intricate traditional and creative henna styling." },
  { id: "pot-painting", title: "Pot Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", price: 0, desc: "Terracotta painting with vibrant themes." },

  // Cultural Major
  { id: "chorea-theme", title: "Chorea (Theme Group Dance)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 0, desc: "Flagship group choreography matching the reverie theme." },
  { id: "chorea-non-theme-eastern", title: "Chorea (Non-Theme Eastern Group Dance)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 0, desc: "High octane eastern group dance competition." },
  { id: "chorea-non-theme-western", title: "Chorea (Non-Theme Western Group Dance)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 0, desc: "Electrifying western group dance competition." },
  { id: "alaap", title: "Alaap (Eastern BoB)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 0, desc: "Eastern Battle of the Bands live on stage." },
  { id: "tinnitus", title: "Tinnitus (Western BoB)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 0, desc: "Western rock and metal Battle of the Bands." },
  { id: "dernier-cri", title: "Dernier Cri (Fashion Show)", category: "cult-major", contact: "Kavyanjali: 7892741773", price: 0, desc: "The premier runway fashion spectacle." },

  // Cultural Minor
  { id: "solo-dance-eastern", title: "Solo Dance (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Individual eastern dance style showcase." },
  { id: "solo-dance-western", title: "Solo Dance (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Individual western dance style showcase." },
  { id: "duet-dance-eastern", title: "Duet Dance (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Synchronized eastern duet dance." },
  { id: "duet-dance-western", title: "Duet Dance (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Synchronized western duet dance." },
  { id: "solo-singing-eastern", title: "Solo Singing (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Eastern solo vocal performance." },
  { id: "solo-singing-western", title: "Solo Singing (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Western solo vocal performance." },
  { id: "duet-singing-eastern", title: "Duet Singing (Eastern)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Harmonized eastern vocal duets." },
  { id: "duet-singing-western", title: "Duet Singing (Western)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Harmonized western vocal duets." },
  { id: "adaptunes", title: "Adaptunes", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Instant choreography on dynamic changing tracks." },
  { id: "showdown", title: "Showdown", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "High intensity stage dance face-off." },
  { id: "euphony", title: "Euphony (Acoustics)", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Unplugged acoustic melodies." },
  { id: "play", title: "Play", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Full stage theatrical play production." },
  { id: "skit", title: "Skit", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Short comedic or thematic theatrical performance." },
  { id: "mime", title: "Mime", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Silent storytelling performance art." },
  { id: "solo-instrumental", title: "Solo Instrumental", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Solo instrumental musical performance." },
  { id: "adzap", title: "Adzap", category: "cult-minor", contact: "Kavyanjali: 7892741773", price: 0, desc: "Creative advertising and presentation showdown." },

  // House Informals
  { id: "arcane-heist", title: "Arcane Heist", category: "informals", contact: "Krishnendu: 9048016206", price: 0, desc: "Immersive campus heist challenge." },
  { id: "beg-borrow-steal", title: "Beg Borrow Steal", category: "informals", contact: "Krishnendu: 9048016206", price: 0, desc: "Classic high-energy scavenger hunt." },

  // La Lutte (MediQuiz)
  { id: "la-lutte-junior", title: "La Lutte (Junior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", price: 0, desc: "Intercollegiate Medical Quiz for juniors." },
  { id: "la-lutte-senior", title: "La Lutte (Senior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", price: 0, desc: "Intercollegiate Medical Quiz for seniors." },

  // Literary (Les Littéraires)
  { id: "formal-debate", title: "Formal Debate", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "Rigorous formal argumentation showdown." },
  { id: "malarkey", title: "Malarkey (Informal Debate)", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "Witty, humorous informal debate battle." },
  { id: "directors-cut", title: "Director's Cut", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "Cinematic literary adaptation event." },
  { id: "cryptic-crossword", title: "Cryptic Crossword", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "Mind-bending word puzzles and cryptic clues." },
  { id: "potpourri", title: "Potpourri (dumbc + picto)", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "Dumb charades and pictionary combo." },
  { id: "jam", title: "JAM (Just a Minute)", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "No hesitation, repetition, or deviation." },
  { id: "turn-coat", title: "Turn Coat", category: "literary", contact: "Akash: 9701344959", price: 0, desc: "Switching perspectives mid-speech." },

  // Quizzes (Les Littéraires)
  { id: "tj-jaishankar-quiz", title: "TJ Jaishankar Memorial Open Quiz by Major Chandrakant Nair", category: "quiz", contact: "Sai Ajay: 6360913421", price: 0, desc: "Flagship open general quiz." },
  { id: "sports-quiz", title: "Sports Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 0, desc: "Ultimate trivia for sports enthusiasts." },
  { id: "fandom-quiz", title: "Fandom Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 0, desc: "Pop culture, movies, TV shows and books quiz." },
  { id: "literature-quiz", title: "Literature Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 0, desc: "Literary trivia and classic works." },
  { id: "tlc-quiz", title: "Travel, Living & Culture Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 0, desc: "World culture, travel and lifestyle trivia." },
  { id: "rewind-quiz", title: "Rewind Quiz", category: "quiz", contact: "Sai Ajay: 6360913421", price: 0, desc: "Nostalgia and retro events quiz." },

  // ==========================================
  // LES JEUX (SPORTS) - TEAM & NON-TEAM SPORTS
  // ==========================================
  
  // --- TEAM SPORTS ---
  {
    id: "basketball",
    category: "sports",
    type: "Team Sports",
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
    title: "Volleyball",
    price: 0,
    contact: "Vinay: 7207867241 / Nikhitha: 9030787037 / Mirshad: 7510166801",
    desc: "Spikes, digs, and team net battles.",
    subEvents: ["Men's", "Women's"]
  },

  // --- NON-TEAM SPORTS ---
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
  { id: "gaming-online", title: "BGMI & CODM Tournaments (Online)", category: "gaming", contact: "Prudhvi: 8056765218", price: 0, desc: "Online mobile esports competition." },
  { id: "gaming-offline", title: "FIFA, WWE 2K25 & Mortal Kombat (Offline)", category: "gaming", contact: "Prudhvi: 8056765218", price: 0, desc: "Console gaming battles." },
  { id: "psvr2", title: "Virtual Reality Experience (PSVR2)", category: "gaming", contact: "Prudhvi: 8056765218", price: 0, desc: "Immersive VR setup with Gran Turismo 7 gaming wheel." },

  // Photography
  { id: "photography", title: "Lumière sur l’Instant (Online Photography)", category: "photography", contact: "Tharaneeswar: 7010370264 / Midhun: 9840710678", price: 0, desc: "Through the lens photo contest." }
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