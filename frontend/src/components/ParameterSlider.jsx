import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Info } from 'lucide-react';

export default function ParameterSlider({ config, value, onChange, index }) {
  const { name, label, unit, min_val, max_val, step, description, category } = config;
  const [localVal, setLocalVal] = useState(value);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const percentage = Math.min(100, Math.max(0, ((localVal - min_val) / (max_val - min_val)) * 100));

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalVal(val);
    onChange(name, val);
  };

  const handleStep = (direction) => {
    const newVal = Math.min(max_val, Math.max(min_val, parseFloat((localVal + direction * step).toFixed(2))));
    setLocalVal(newVal);
    onChange(name, newVal);
  };

  const handleInputChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      const clamped = Math.min(max_val, Math.max(min_val, val));
      setLocalVal(clamped);
      onChange(name, clamped);
    }
  };

  return (
    <div className="claude-card group p-5 transition-all duration-200 hover:border-[#CC5A2B]/35 sm:p-6">
      
      {/* Parameter Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-[#CC5A2B]">{index}</span>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-[#1F1E1D] dark:text-[#EDE8E1]">
            {label}
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-0.5 text-[#78716C] hover:text-[#CC5A2B] transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute left-6 top-0 z-40 w-56 p-2.5 rounded-xl bg-[#1F1E1D] text-[#EDE8E1] text-[11px] shadow-lg border border-white/10 pointer-events-none">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Category & Unit */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded-md bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-[#78716C] dark:text-[#A8A29E]">
            {category}
          </span>
          <span className="text-xs font-mono font-medium text-[#CC5A2B] bg-[#CC5A2B]/10 px-2 py-0.5 rounded-md">
            {unit}
          </span>
        </div>
      </div>

      {/* Numeric Input & Steppers */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={localVal <= min_val}
            className="p-1 rounded-lg border border-[#E8E2D8] dark:border-[#34312B] hover:bg-[#FAF8F5] dark:hover:bg-[#292723] text-[#78716C] dark:text-[#A8A29E] disabled:opacity-30 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="number"
            value={localVal}
            onChange={handleInputChange}
            step={step}
            min={min_val}
            max={max_val}
            className="w-20 sm:w-24 px-2 py-1.5 text-center font-mono text-sm font-semibold text-[#1F1E1D] dark:text-[#EDE8E1] bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] rounded-lg focus:outline-none focus:border-[#CC5A2B]"
          />

          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={localVal >= max_val}
            className="p-1 rounded-lg border border-[#E8E2D8] dark:border-[#34312B] hover:bg-[#FAF8F5] dark:hover:bg-[#292723] text-[#78716C] dark:text-[#A8A29E] disabled:opacity-30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-xs font-mono text-[#78716C] dark:text-[#A8A29E]">
          {percentage.toFixed(0)}% Range
        </span>
      </div>

      {/* Slider Track with Claude Terracotta Underlay */}
      <div className="relative pt-1 pb-1">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full pointer-events-none overflow-hidden w-full bg-[#E8E2D8] dark:bg-[#34312B]">
          <div
            className="h-full bg-[#CC5A2B] transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <input
          type="range"
          min={min_val}
          max={max_val}
          step={step}
          value={localVal}
          onChange={handleSliderChange}
          className="relative z-10 w-full"
        />
      </div>

      {/* Bounds */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C] dark:text-[#A8A29E] mt-1">
        <span>Min: {min_val}</span>
        <span>Max: {max_val}</span>
      </div>

    </div>
  );
}
