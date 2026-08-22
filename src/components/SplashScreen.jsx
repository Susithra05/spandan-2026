// src/components/SplashScreen.jsx
import React, { useState, useEffect } from 'react';

const loadingPhrases = [
  "Following the White Rabbit down the rabbit hole...",
  "Brewing the Mad Hatter's potion...",
  "Painting the white roses red...",
  "Reality is stuttering...",
  "Welcome to the Enchanted Reverie."
];

const RING_COUNT = 7;

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Increment progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 28); // ~2.8 seconds total duration

    // Cycle through mystical phrases
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 650);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 750); // Wait for the "fall through" transition
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 750);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b1d18] px-6 text-center overflow-hidden transition-all ease-in ${
        isFadingOut
          ? 'opacity-0 scale-[2.6] blur-md duration-700'
          : 'opacity-100 scale-100 duration-300'
      }`}
    >
      {/* Rabbit-hole tunnel — concentric rings pulling inward */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:600px]">
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`tunnel-ring absolute rounded-full border-2 ${
              i % 2 === 0 ? 'border-lantern-400/40' : 'border-mist-400/30'
            }`}
            style={{
              width: '90vmin',
              height: '90vmin',
              animationDelay: `${(i * 2.4) / RING_COUNT}s`,
            }}
          />
        ))}
        {/* falling rabbit cue */}
        <span className="falling-rabbit absolute text-3xl md:text-4xl" aria-hidden="true">
          🐇
        </span>
      </div>

      {/* Background glow orb */}
      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-lantern-600/20 via-mist-500/10 to-transparent blur-3xl -z-10 animate-pulse" />

      {/* Drifting fireflies */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[12, 28, 47, 63, 79, 88].map((left, i) => (
          <span
            key={i}
            className="firefly absolute w-1.5 h-1.5 rounded-full bg-lantern-300 shadow-[0_0_8px_3px_rgba(240,169,60,0.7)]"
            style={{ left: `${left}%`, top: `${(i * 41 + 15) % 90}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${5 + (i % 3)}s` }}
          />
        ))}
      </div>

      {/* Logo mark */}
      <div className="relative mb-4 group z-10">
        <img
          src="/logo-mark.png"
          alt="Spandan '26 — The Enchanted Reverie"
          className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_25px_rgba(240,169,60,0.5)] transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <h1 className="hidden font-display text-4xl md:text-6xl font-black tracking-wide text-parchment-50 glow-text">
          Spandan 2026
        </h1>
      </div>

      {/* Dynamic Fever Dream Phrase */}
      <div className="h-6 mt-4 z-10">
        <p className="text-xs tracking-wide text-parchment-100/60 animate-fade">
          {loadingPhrases[phraseIndex]}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-64 md:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mt-4 border border-lantern-500/15 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-lantern-500 via-toadstool-500 to-mist-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(63,167,154,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-[11px] font-mono text-mist-300/80 mt-2 z-10">
        {progress}%
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 text-xs text-parchment-100/50 hover:text-parchment-100 border border-lantern-500/15 hover:border-lantern-400/40 px-4 py-1.5 rounded-full transition z-10"
      >
        Skip Intro ➔
      </button>
    </div>
  );
}
