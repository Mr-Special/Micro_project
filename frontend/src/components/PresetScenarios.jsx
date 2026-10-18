import React from 'react';
import { BookmarkCheck, Gauge, Sparkles, Leaf, Zap } from 'lucide-react';
import { PRESETS_DATA } from '../services/surrogate';

const ICONS = {
  balanced_standard: Gauge,
  high_speed_roughing: Zap,
  fine_finish_polishing: Sparkles,
  eco_energy_efficient: Leaf
};

export default function PresetScenarios({ onSelectPreset, currentParameters }) {
  const isPresetActive = (presetParams) => {
    return Object.entries(presetParams).every(
      ([k, v]) => Math.abs((currentParameters[k] ?? 0) - v) < 0.01
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-serif text-lg font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
          <BookmarkCheck className="h-4 w-4 text-[#CC5A2B]" />
          Quick presets
        </span>
        <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">Select a starting point</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:gap-4">
        {PRESETS_DATA.map((preset) => {
          const Icon = ICONS[preset.id] || Gauge;
          const active = isPresetActive(preset.params);

          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => onSelectPreset(preset.params)}
              aria-pressed={active}
              className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 sm:p-5 ${preset.id === 'balanced_standard' ? 'xl:col-span-2' : 'xl:col-span-1'} ${
                active
                  ? 'bg-white dark:bg-[#22201D] border-[#CC5A2B] shadow-[0_8px_28px_-16px_rgba(204,90,43,0.45)]'
                  : 'bg-white dark:bg-[#22201D] border-[#E8E2D8] dark:border-[#34312B] hover:border-[#CC5A2B]/50'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-[#CC5A2B] text-white' : 'bg-[#FAF8F5] text-[#78716C] dark:bg-[#181715] dark:text-[#A8A29E]'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  active
                    ? 'bg-[#CC5A2B] text-white font-bold'
                    : 'bg-[#FAF8F5] dark:bg-[#181715] text-[#78716C]'
                }`}>
                  {preset.badge}
                </span>
              </div>

              <h4 className="truncate font-serif text-base font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
                {preset.name}
              </h4>
              <p className="mt-1 text-xs leading-5 text-[#78716C] dark:text-[#A8A29E] line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
