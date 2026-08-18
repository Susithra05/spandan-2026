// src/components/CountdownTimer.jsx
import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    } else {
      timeLeft.expired = true;
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className="inline-block px-6 py-3 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold text-sm tracking-widest uppercase animate-pulse">
        ✦ The Reverie Has Begun! ✦
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 my-6">
      {timeUnits.map((unit, index) => (
        <div 
          key={index}
          className="flex flex-col items-center justify-center w-16 sm:w-20 h-18 sm:h-22 rounded-2xl bg-[#120b22]/90 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.15)] backdrop-blur-md"
        >
          <span className="text-xl sm:text-3xl font-black bg-gradient-to-b from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent font-mono">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] text-fuchsia-300/70 uppercase tracking-wider font-semibold mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}