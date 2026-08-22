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
      <div className="stamp-badge inline-block px-6 py-3 rounded-full bg-lantern-600/20 border-2 border-dashed border-lantern-500/40 text-lantern-300 text-lg -rotate-1 animate-pulse">
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
    <div className="flex items-center justify-center gap-2.5 sm:gap-5 my-6">
      {timeUnits.map((unit, index) => (
        <div
          key={index}
          className="relative flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#17291d] border-2 border-lantern-400/50 shadow-[0_0_15px_rgba(240,169,60,0.25),inset_0_0_12px_rgba(0,0,0,0.4)]"
        >
          {/* pocket-watch loop nub */}
          <span className="absolute -top-1.5 w-2.5 h-2.5 rounded-full bg-lantern-400/60 border border-lantern-300/50" />
          <span className="text-lg sm:text-2xl font-display font-black text-parchment-50 font-mono leading-none">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[9px] text-lantern-300/80 uppercase tracking-wider font-semibold mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}