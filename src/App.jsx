import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import CountdownTimer from './components/CountdownTimer';
import { supabase } from './lib/supabase';
import { 
  festDetails, 
  tiers, 
  eventCategories, 
  eventsList, 
  teamContacts, 
  scheduleData 
} from './data/festData';

// Lightweight pure SVGs to avoid React 19 / Lucide incompatibility
const SparklesIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6 text-cyan-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-6 h-6 text-fuchsia-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6 text-amber-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-12 h-12 text-emerald-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show once per session (so refreshes while working don't get annoying)
    return !sessionStorage.getItem('spandan_splash_shown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('spandan_splash_shown', 'true');
    setShowSplash(false);
  };  
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authMessage, setAuthMessage] = useState('');
  
  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    college: '',
    yearOfStudy: '1st Year',
    tier: 'mad-hatter',
    selectedEvents: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage('');
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        setAuthMessage('Account created! You can now log in.');
        setAuthMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setAuthMessage('');
        setActiveTab('registration');
      }
    } catch (err) {
      setAuthMessage(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleEventToggle = (eventId) => {
    setFormData(prev => {
      const exists = prev.selectedEvents.includes(eventId);
      return {
        ...prev,
        selectedEvents: exists 
          ? prev.selectedEvents.filter(id => id !== eventId)
          : [...prev.selectedEvents, eventId]
      };
    });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in or create an account first to register.');
      setActiveTab('auth');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('registrations').insert([
        {
          user_id: user.id,
          full_name: formData.fullName,
          email: user.email,
          phone: formData.phone,
          college: formData.college,
          year_of_study: formData.yearOfStudy,
          tier: formData.tier,
          selected_events: formData.selectedEvents
        }
      ]);

      if (error) throw error;
      setRegisteredSuccess(true);
    } catch (err) {
      alert('Registration failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = selectedCategory === 'all' 
    ? eventsList 
    : eventsList.filter(ev => ev.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#07040d] text-slate-100 flex flex-col selection:bg-fuchsia-500 selection:text-white">
      {/* 3. CONDITIONAL SPLASH SCREEN GOES RIGHT HERE */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#0c0817]/90 backdrop-blur-md border-b border-fuchsia-950/60">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <img src="/logo.png" alt="Spandan Logo" className="h-12 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <div className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-fuchsia-400 via-rose-300 to-cyan-400 bg-clip-text text-transparent">
                SPANDAN '26
              </div>
              <div className="text-[10px] text-fuchsia-300/70 tracking-widest uppercase">The Enchanted Reverie</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 shadow-inner">
            {['home', 'about', 'events', 'schedule', 'registration', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* User Auth Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-fuchsia-300 hidden sm:inline">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-xs hover:bg-red-500/20 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('auth')}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="flex-grow">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-[#07040d]/80 to-[#07040d] -z-10" />
              
              <div className="max-w-4xl mx-auto space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-medium tracking-wide">
                  <SparklesIcon /> JIPMER PONDICHERRY • ANNUAL CULTURAL & SPORTS FEST
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    SPANDAN 2026
                  </span>
                  <span className="block text-2xl md:text-4xl font-serif italic text-fuchsia-400 mt-2 font-normal">
                    The Enchanted Reverie
                  </span>
                </h1>

                {/* Real-Time Live Countdown */}
                <CountdownTimer targetDate={festDetails.targetDate} />

                <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                  "{festDetails.tagline}" Step into a fever dream where clocks lose track of time, 
                  and the ordinary transforms into the extraordinary.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setActiveTab('registration')}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-cyan-500 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(217,70,239,0.4)] hover:brightness-110 transition"
                  >
                    Suit Up & Register
                  </button>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="px-8 py-3.5 rounded-xl border border-white/20 bg-white/5 font-semibold text-sm hover:bg-white/10 transition"
                  >
                    Explore Events
                  </button>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
                  <div className="glow-card p-5 rounded-2xl">
                    <CalendarIcon />
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Festival Dates</div>
                    <div className="text-lg font-bold text-slate-100">{festDetails.dates}</div>
                  </div>
                  <div className="glow-card p-5 rounded-2xl">
                    <MapPinIcon />
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Host Venue</div>
                    <div className="text-lg font-bold text-slate-100">{festDetails.venue}</div>
                  </div>
                  <div className="glow-card p-5 rounded-2xl">
                    <UsersIcon />
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Participation</div>
                    <div className="text-lg font-bold text-slate-100">5000+ Footfall Expected</div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ABOUT */}
        {activeTab === 'about' && (
          <section className="max-w-5xl mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                About Spandan
              </h2>
              <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Spandan is South India’s premier intercollegiate medical, cultural, and sports festival, 
                welcoming thousands of students to the historic halls of JIPMER Pondicherry.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-extrabold text-fuchsia-400">15+</div>
                <div className="text-xs text-slate-400 mt-1">Years of Legacy</div>
              </div>
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-extrabold text-cyan-400">5000+</div>
                <div className="text-xs text-slate-400 mt-1">Participants</div>
              </div>
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-extrabold text-amber-400">100+</div>
                <div className="text-xs text-slate-400 mt-1">Colleges Across India</div>
              </div>
              <div className="glow-card p-6 rounded-2xl">
                <div className="text-3xl font-extrabold text-rose-400">50+</div>
                <div className="text-xs text-slate-400 mt-1">Competitions</div>
              </div>
            </div>

            <div className="glow-card p-8 rounded-3xl space-y-4 border border-fuchsia-500/20">
              <h3 className="text-xl font-bold text-slate-100">The 2026 Concept: The Enchanted Reverie</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Inspired by the surrealism of fever dreams and the whimsical paradoxes of Alice in Wonderland, 
                this year's edition turns every corridor, stage, and stadium into an ethereal playground. 
                Prepare for mind-bending proshows, high-stakes sports battles, and captivating artistic spectacles.
              </p>
            </div>
          </section>
        )}

        {/* TAB 3: EVENTS */}
        {activeTab === 'events' && (
          <section className="max-w-7xl mx-auto px-4 py-16 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                Festival Events
              </h2>
              <p className="text-slate-400 text-sm">Choose your domain of competition</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {eventCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {filteredEvents.map(ev => (
                <div key={ev.id} className="glow-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-fuchsia-400 mb-1">
                      {ev.category.replace('-', ' ')}
                    </div>
                    <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{ev.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Contact: {ev.contact}</span>
                    <button 
                      onClick={() => {
                        handleEventToggle(ev.id);
                        setActiveTab('registration');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      + Select & Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB: SCHEDULE */}
        {activeTab === 'schedule' && (
          <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
              Festival Schedule
              </h2>
              <p className="text-slate-400 text-sm">October 26 – October 31, 2026 • 6 Days of Pure Reverie</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheduleData.map((dayPlan, idx) => (
                <div 
                 key={idx} 
                 className="glow-card p-6 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition duration-300 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                   <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                     {dayPlan.day}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">{dayPlan.title}</h3>
                   </div>
                   <div className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-3 py-1 rounded-xl border border-cyan-800/40">
                    {dayPlan.date}
                   </div>
                 </div>

                 <ul className="space-y-2.5 text-xs text-slate-300">
                  {dayPlan.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5">
                      <span className="text-cyan-400 mt-0.5 text-sm">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                 </ul>
               </div>
              ))}
           </div>
         </section>
        )}

        {/* TAB 4: REGISTRATION */}
        {activeTab === 'registration' && (
          <section className="max-w-6xl mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-rose-400">
                Delegate Registration & Passes
              </h2>
              <p className="text-slate-400 text-sm">Choose your entry tier to enter the Reverie</p>
            </div>

            {/* Pricing Tiers Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map(tier => (
                <div 
                  key={tier.id} 
                  className={`p-6 rounded-3xl border bg-gradient-to-b ${tier.color} backdrop-blur-md flex flex-col justify-between space-y-6 ${
                    formData.tier === tier.id ? 'ring-2 ring-white shadow-2xl' : ''
                  }`}
                >
                  <div className="space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10">
                      {tier.tag}
                    </div>
                    <h3 className="text-2xl font-black text-white">{tier.name}</h3>
                    <div className="text-3xl font-extrabold text-white">₹{tier.price} <span className="text-xs font-normal text-slate-300">/ delegate</span></div>
                    
                    <ul className="space-y-2 text-xs text-slate-200">
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
                    onClick={() => setFormData({ ...formData, tier: tier.id })}
                    className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider transition ${
                      formData.tier === tier.id 
                        ? 'bg-white text-black shadow-lg' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {formData.tier === tier.id ? '✓ Selected Tier' : 'Select Tier'}
                  </button>
                </div>
              ))}
            </div>

            {/* Registration Form */}
            <div className="max-w-2xl mx-auto glow-card p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-6 text-white text-center">Complete Your Details</h3>

              {registeredSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircleIcon />
                  <h4 className="text-xl font-bold text-white">Registration Submitted!</h4>
                  <p className="text-sm text-slate-300">Your details and selected events have been saved to the Spandan database.</p>
                  <button 
                    onClick={() => setRegisteredSuccess(false)}
                    className="px-6 py-2 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
                  >
                    Register Another Person
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegistrationSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Susithra..."
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">Phone Number (WhatsApp)</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">College / Institution</label>
                      <input 
                        required
                        type="text" 
                        placeholder="JIPMER / Medical College"
                        value={formData.college}
                        onChange={e => setFormData({ ...formData, college: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Year of Study</label>
                    <select 
                      value={formData.yearOfStudy}
                      onChange={e => setFormData({ ...formData, yearOfStudy: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#140f24] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>Final Year</option>
                      <option>Intern / Post-Graduate</option>
                    </select>
                  </div>

                  {/* Event Checkbox Selection */}
                  <div className="pt-2">
                    <label className="block text-slate-300 mb-2 font-semibold">Select Events to Participate In ({formData.selectedEvents.length} selected):</label>
                    <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      {eventsList.map(ev => (
                        <label key={ev.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input 
                            type="checkbox"
                            checked={formData.selectedEvents.includes(ev.id)}
                            onChange={() => handleEventToggle(ev.id)}
                            className="rounded border-white/20 text-fuchsia-600 focus:ring-0"
                          />
                          <span>{ev.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 font-bold text-sm text-white shadow-lg hover:brightness-110 transition mt-4 disabled:opacity-50"
                  >
                    {submitting ? 'Saving to Database...' : 'Confirm & Save Registration'}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* TAB 5: CONTACT */}
        {activeTab === 'contact' && (
          <section className="max-w-5xl mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                Festival Leadership & Contacts
              </h2>
              <p className="text-slate-400 text-sm">Reach out to the organizing team for assistance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamContacts.map((mem, idx) => (
                <div key={idx} className="glow-card p-6 rounded-2xl space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-fuchsia-400">{mem.role}</div>
                  <div className="text-lg font-bold text-white">{mem.name}</div>
                  <a 
                    href={`https://wa.me/91${mem.phone}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs font-semibold mt-2"
                  >
                    <PhoneIcon /> +91 {mem.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className="glow-card p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white">Official Fest Instagram</h4>
                <p className="text-xs text-slate-400">Follow @{festDetails.instagram} for live announcements</p>
              </div>
              <a 
                href={`https://instagram.com/${festDetails.instagram}`} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Open Instagram
              </a>
            </div>
          </section>
        )}

        {/* TAB 6: AUTH MODAL / SCREEN */}
        {activeTab === 'auth' && (
          <section className="max-w-md mx-auto px-4 py-20">
            <div className="glow-card p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-white">
                  {authMode === 'login' ? 'Login to Spandan' : 'Create an Account'}
                </h3>
                <p className="text-xs text-slate-400">Manage your event registrations</p>
              </div>

              {authMessage && (
                <div className="p-3 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-xs text-fuchsia-200">
                  {authMessage}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Password</label>
                  <input 
                    required
                    type="password" 
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-md hover:brightness-110 transition"
                >
                  {authMode === 'login' ? 'Sign In' : 'Register Account'}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400">
                {authMode === 'login' ? (
                  <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-cyan-400 font-semibold underline">Sign up here</button></>
                ) : (
                  <>Already have an account? <button onClick={() => setAuthMode('login')} className="text-cyan-400 font-semibold underline">Login here</button></>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#05030a] py-8 text-center text-xs text-slate-500">
        <p>© 2026 JIPMER Spandan — The Enchanted Reverie. All rights reserved.</p>
      </footer>

    </div>
  );
}