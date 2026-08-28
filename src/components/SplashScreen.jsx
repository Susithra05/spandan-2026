// src/components/SplashScreen.jsx
import React, { useEffect, useRef, useState } from 'react';

const loadingPhrases = [
  "Following the White Rabbit down the rabbit hole...",
  "Brewing the Mad Hatter's potion...",
  "Painting the white roses red...",
  "Reality is stuttering...",
  "Welcome to the Enchanted Reverie.",
];

const PROGRESS_DURATION_MS = 3400; // 0 -> 100%
const EXIT_DELAY_MS = 300; // pause on 100% before fading out
const EXIT_FADE_MS = 450;

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const timers = useRef([]);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setDismissing(true);
    const t = setTimeout(onComplete, EXIT_FADE_MS);
    timers.current.push(t);
  };

  useEffect(() => {
    const stepMs = PROGRESS_DURATION_MS / 100;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, stepMs);

    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 650);

    timers.current.push(progressInterval, phraseInterval);
    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(finish, EXIT_DELAY_MS);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    return () => timers.current.forEach((t) => clearTimeout(t) || clearInterval(t));
  }, []);

  return (
    <div
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="Skip intro animation"
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#0b1d18] cursor-pointer transition-opacity ease-in ${
        dismissing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${EXIT_FADE_MS}ms` }}
    >
      {/* Full-bleed Rabbit Hole scene — the whole picture, zooming in as if falling into it */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${dismissing ? '' : 'well-zoom'}`}
        style={{ backgroundImage: "url('/rabbit-hole-bg.jpg')" }}
      />
      {/* Scrim that deepens slightly as we zoom, keeping the centre legible */}
      <div className={`absolute inset-0 bg-[#0b1d18] ${dismissing ? 'opacity-60' : 'scrim-deepen'}`} />

      {/* Drifting firefly particle field */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[8, 20, 33, 47, 58, 72, 84, 93].map((left, i) => (
          <span
            key={i}
            className="firefly absolute w-1.5 h-1.5 rounded-full bg-lantern-300 shadow-[0_0_8px_3px_rgba(240,169,60,0.65)]"
            style={{
              left: `${left}%`,
              top: `${(i * 37 + 10) % 85}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* The White Rabbit — small, falls from the top into the heart of the hole */}
      <img
        src="/rabbit-watch.png"
        alt=""
        aria-hidden="true"
        className={`rabbit-fall-sprite absolute ${dismissing ? '' : 'rabbit-fall-small'}`}
        style={{
          left: '50%',
          top: '50%',
          height: '20vh',
          width: 'auto',
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      {/* Title, loading phrase, and progress — fades in at the centre, above the rabbit */}
      <div
        className={`relative z-10 h-full flex flex-col items-center justify-center px-6 text-center ${
          dismissing ? '' : 'center-fade-in'
        }`}
      >
        <img
          src="/logo-mark.png"
          alt="Spandan '26 — The Enchanted Reverie"
          className="w-full max-w-[220px] sm:max-w-xs h-auto drop-shadow-[0_0_22px_rgba(240,169,60,0.45)]"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        <div className="h-6 mt-6">
          <p className="text-xs md:text-sm tracking-wide text-parchment-100/70 animate-fade">
            {loadingPhrases[phraseIndex]}
          </p>
        </div>

        <div className="w-64 md:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mt-4 border border-lantern-500/15">
          <div
            className="h-full bg-gradient-to-r from-lantern-500 via-toadstool-500 to-mist-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(63,167,154,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[11px] font-mono text-mist-300/80 mt-2">{progress}%</div>
      </div>

      {/* Skip control */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs text-parchment-100/50 hover:text-parchment-100 border border-lantern-500/15 hover:border-lantern-400/40 px-4 py-1.5 rounded-full transition"
      >
        Skip Intro ➔
      </button>
    </div>
  );
}
