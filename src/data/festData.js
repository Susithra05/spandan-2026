// src/data/festData.js
export const festDetails = {
  name: "SPANDAN 2026",
  theme: "The Enchanted Reverie",
  tagline: "Where reality stutters… and the impossible feels strangely familiar.",
  dates: "October 26 – October 31, 2026",
  targetDate: "2026-10-26T09:00:00+05:30", // Start timestamp for Countdown
  venue: "JIPMER Campus, Pondicherry",
  instagram: "jipmer_spandan",
};

export const tiers = [
  {
    id: "white-rabbit",
    name: "White Rabbit",
    price: 375,
    tag: "Essential Pass",
    color: "from-blue-600/30 to-cyan-500/20 border-cyan-500/40",
    amenities: [
      "Access to all competitive events (excl. Dernier Cri)",
      "Inaugural Night (Day 1)",
      "Chorea Night (Day 2)",
      "Aalaap Finals (Day 3)",
      "Tinnitus Finals (Day 4)",
      "DJ Night (Day 1)",
      "1 Minor Proshow"
    ]
  },
  {
    id: "mad-hatter",
    name: "Mad Hatter",
    price: 650,
    tag: "Popular Choice",
    color: "from-amber-600/30 to-purple-600/20 border-amber-500/40",
    amenities: [
      "Access to all competitive events (excl. Dernier Cri)",
      "Inaugural Night (Day 1)",
      "Chorea Night (Day 2)",
      "Aalaap Finals (Day 3)",
      "Tinnitus Finals (Day 4)",
      "DJ Night (Day 1 & 2)",
      "2 Minor Proshows"
    ]
  },
  {
    id: "red-queen",
    name: "Red Queen",
    price: 850,
    tag: "All-Access Pass",
    color: "from-rose-700/40 to-fuchsia-700/20 border-rose-500/50",
    amenities: [
      "Access to all competitive events (INCL. Dernier Cri)",
      "Inaugural Night (Day 1)",
      "Chorea Night (Day 2)",
      "Aalaap Finals (Day 3)",
      "Tinnitus Finals (Day 4)",
      "DJ Night (Day 1, 2 & 3)",
      "2 Minor Proshows",
      "Major Proshow Finale"
    ]
  }
];

export const eventCategories = [
  { id: "all", label: "All Realities" },
  { id: "cult-major", label: "Cultural Major" },
  { id: "cult-minor", label: "Cultural Minor" },
  { id: "fine-arts", label: "Les Beaux Arts" },
  { id: "literary", label: "Les Littéraires" },
  { id: "sports", label: "Les Jeux" },
  { id: "informals", label: "House Informals" },
  { id: "mediquiz", label: "La Lutte" },
  { id: "photography", label: "Photography" }
];

export const eventsList = [
  // Cultural Major
  { id: "chorea-theme", title: "Chorea (Theme Group Dance)", category: "cult-major", contact: "Brochure", desc: "Flagship group choreography matching the reverie theme." },
  { id: "chorea-non-theme", title: "Chorea (Non-Theme)", category: "cult-major", contact: "Brochure", desc: "High octane eastern & western group dance competition." },
  { id: "alaap", title: "Alaap (Eastern BoB)", category: "cult-major", contact: "Brochure", desc: "Eastern Battle of the Bands live on stage." },
  { id: "tinnitus", title: "Tinnitus (Western BoB)", category: "cult-major", contact: "Brochure", desc: "Western rock and metal Battle of the Bands." },
  { id: "dernier-cri", title: "Dernier Cri (Fashion Show)", category: "cult-major", contact: "Brochure", desc: "The premier runway fashion spectacle." },

  // Cultural Minor
  { id: "solo-dance", title: "Solo Dance (Eastern & Western)", category: "cult-minor", contact: "Brochure", desc: "Individual dance battle across styles." },
  { id: "duet-dance", title: "Duet Dance", category: "cult-minor", contact: "Brochure", desc: "Synchronized duet dance." },
  { id: "adaptunes", title: "Adaptunes", category: "cult-minor", contact: "Brochure", desc: "Instant choreography on dynamic changing tracks." },
  { id: "showdown", title: "Showdown", category: "cult-minor", contact: "Brochure", desc: "High intensity stage face-off." },
  { id: "solo-singing", title: "Solo Singing (Eastern & Western)", category: "cult-minor", contact: "Brochure", desc: "Solo vocal performance." },
  { id: "duet-singing", title: "Duet Singing", category: "cult-minor", contact: "Brochure", desc: "Harmonized vocal duets." },
  { id: "euphony", title: "Euphony (Western Acoustic)", category: "cult-minor", contact: "Brochure", desc: "Unplugged acoustic melodies." },
  { id: "play-skit-mime", title: "Play / Skit / Mime", category: "cult-minor", contact: "Brochure", desc: "Theatrical, comic sketches and silent storytelling." },
  { id: "adzap", title: "Adzap", category: "cult-minor", contact: "Brochure", desc: "Creative advertising and presentation showdown." },

  // Fine Arts
  { id: "face-painting", title: "Face Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", desc: "Canvas on skin with surreal fever dream concepts." },
  { id: "painting-sketching", title: "Painting & Sketching", category: "fine-arts", contact: "Kavyanjali: 7892741773", desc: "Express the wonderland on paper & canvas." },
  { id: "mehendi", title: "Mehendi", category: "fine-arts", contact: "Kavyanjali: 7892741773", desc: "Intricate traditional and creative henna styling." },
  { id: "pot-painting", title: "Pot Painting", category: "fine-arts", contact: "Kavyanjali: 7892741773", desc: "Terracotta painting with vibrant themes." },

  // Literary
  { id: "formal-debate", title: "Formal Debate & Malarkey", category: "literary", contact: "Akash: 9901344959", desc: "Rigorous formal argumentation + witty informal banter." },
  { id: "tj-memorial-quiz", title: "TJ Jaishankar Memorial Quiz", category: "literary", contact: "Akash: 9901344959", desc: "Flagship open general quiz." },
  { id: "jam", title: "JAM (Just A Minute)", category: "literary", contact: "Akash: 9901344959", desc: "No hesitation, repetition, or deviation." },
  { id: "genre-quizzes", title: "Fandom / Sports / India / Rewind Quiz", category: "literary", contact: "Akash: 9901344959", desc: "Theme specific rapid-fire quizzes." },
  { id: "creative-writing", title: "Creative Writing & Poetry", category: "literary", contact: "Akash: 9901344959", desc: "English, Hindi & Tamil writing + 6-word story." },

  // Sports
  { id: "futsal-football", title: "Football & Futsal", category: "sports", contact: "Vinay: 7207867241 / Nikhitha: 9030787037", desc: "Men & Women field tournaments." },
  { id: "cricket-basketball", title: "Cricket, Basketball & Volleyball", category: "sports", contact: "Vinay / Nikhitha", desc: "Outdoor court & ground championships." },
  { id: "racket-sports", title: "Badminton, Tennis & Table Tennis", category: "sports", contact: "Vinay / Nikhitha", desc: "Singles and doubles court battles." },
  { id: "chess-aquatics", title: "Chess, Aquatics & Athletics", category: "sports", contact: "Vinay / Nikhitha", desc: "Track, pool and board competitions." },

  // Informals & Special
  { id: "house-informals", title: "Beg Borrow Steal, Double Trouble & Eat-athon", category: "informals", contact: "Brochure", desc: "Fun-filled campus challenges." },
  { id: "la-lutte", title: "La Lutte (Junior & Senior MediQuiz)", category: "mediquiz", contact: "Praneetha: 6380924669", desc: "Intercollegiate Medical Quiz showdown." },
  { id: "photography", title: "Lumière sur l’Instant (Online Photography)", category: "photography", contact: "Tharaneeswar: 7010370264 / Midhun: 9840710678", desc: "Through the lens photo contest." }
];

export const teamContacts = [
  { role: "President", name: "Sankhalp Sunod", phone: "8590907650" },
  { role: "Vice-President", name: "Subapreti", phone: "9487174005" },
  { role: "General Secretary", name: "Mathivardhan", phone: "9042667273" },
  { role: "Speaker", name: "Karthikeya", phone: "8074601095" },
  { role: "Public Relations", name: "Thirupugazh", phone: "7358121539" },
  { role: "Public Relations", name: "Lineysha", phone: "8121217021" },
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
      "House Informals (Beg Borrow Steal, Eat-athon, Double Trouble)",
      "Sports Grand Finals & Aquatics",
      "Dernier Cri (The Flagship Fashion Show)",
      "Acoustic Night & Informal Showdowns"
    ]
  },
  {
    day: "Day 6",
    date: "Oct 31, 2026",
    title: "The Grand Finale",
    highlights: [
      "Valedictory Ceremony & Prize Distribution",
      "Photography & Online Writing Awards",
      "Grand Major Proshow (Celebrity Star Night)",
      "Closing Reverie"
    ]
  }
];