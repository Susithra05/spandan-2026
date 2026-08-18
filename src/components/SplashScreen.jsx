// src/components/SplashScreen.jsx
import React, { useState, useEffect } from 'react';

const loadingPhrases = [
  "Following the White Rabbit down the rabbit hole...",
  "Brewing the Mad Hatter's potion...",
  "Painting the white roses red...",
  "Reality is stuttering...",
  "Welcome to the Enchanted Reverie."
];

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
        }, 600); // Wait for fade-out transition
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07040d] px-6 text-center transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow orb */}
      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-fuchsia-600/20 via-cyan-500/10 to-transparent blur-3xl -z-10 animate-pulse" />

      {/* Floating Cheshire Logo */}
      <div className="relative mb-8 group">
        <img
          src="/logo.png"
          alt="Spandan Logo"
          className="h-28 md:h-36 w-auto object-contain drop-shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Title & Tagline */}
      <h1 className="text-3xl md:text-5xl font-black tracking-wider bg-gradient-to-r from-fuchsia-400 via-rose-300 to-cyan-400 bg-clip-text text-transparent">
        SPANDAN 2026
      </h1>
      <p className="text-xs md:text-sm font-serif italic text-fuchsia-300/80 tracking-widest mt-1">
        The Enchanted Reverie
      </p>

      {/* Dynamic Fever Dream Phrase */}
      <div className="h-6 mt-8">
        <p className="text-xs tracking-wide text-slate-400 animate-fade">
          {loadingPhrases[phraseIndex]}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-64 md:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mt-4 border border-white/5 relative">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-cyan-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-[11px] font-mono text-cyan-400/80 mt-2">
        {progress}%
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 text-xs text-slate-500 hover:text-slate-300 border border-white/5 hover:border-white/20 px-4 py-1.5 rounded-full transition"
      >
        Skip Intro ➔
      </button>
    </div>
  );
}