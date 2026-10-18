import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function PredictionGauge({ value, minVal = 0, maxVal = 50, label, unit, score }) {
  const percentage = Math.min(100, Math.max(0, ((value - minVal) / (maxVal - minVal)) * 100));

  const springValue = useSpring(value, { stiffness: 60, damping: 15 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest.toFixed(2));
    });
    return () => unsubscribe();
  }, [springValue]);

  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      
      <div className="relative w-48 h-40 flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-[200deg] overflow-visible" viewBox="0 0 200 200">
          
          <defs>
            <linearGradient id="claudeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CC5A2B" />
              <stop offset="100%" stopColor="#E07A5F" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-[#E8E2D8] dark:text-[#34312B]"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#claudeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex min-w-0 flex-col items-center justify-center px-2 pt-2">
          <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-[#78716C] dark:text-[#A8A29E]">
            {label}
          </span>
          <div className="my-0.5 flex max-w-full items-baseline justify-center gap-1">
            <span className="target-value-display shrink-0 text-4xl leading-none text-[#1F1E1D] dark:text-[#EDE8E1] sm:text-[2.75rem]">
              {displayValue}
            </span>
            <span className="shrink-0 whitespace-nowrap font-sans text-[10px] font-semibold tracking-tight text-[#CC5A2B] sm:text-[11px]">
              {unit}
            </span>
          </div>

          {score !== undefined && (
            <div className="mt-1 max-w-full truncate rounded-full border border-[#CC5A2B]/20 bg-[#CC5A2B]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#CC5A2B] sm:text-[10px]">
              Resilience Score: {score}/100
            </div>
          )}
        </div>
      </div>

      <div className="w-44 flex items-center justify-between text-[10px] font-mono text-[#78716C] dark:text-[#A8A29E] -mt-2">
        <span>{minVal} {unit}</span>
        <span>{maxVal} {unit}</span>
      </div>

    </div>
  );
}
