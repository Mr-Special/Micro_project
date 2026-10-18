import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowDownRight, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';
import PredictionGauge from './PredictionGauge';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function TargetCard({ number, title, target, tone, goal }) {
  const [low, high] = target.confidence_interval;
  const span = Math.max(target.max_val - target.min_val, 1);
  const bandStart = clamp(((low - target.min_val) / span) * 100, 0, 100);
  const bandEnd = clamp(((high - target.min_val) / span) * 100, 0, 100);
  const current = clamp(((target.value - target.min_val) / span) * 100, 0, 100);

  return (
    <article className="target-card group flex min-h-[224px] flex-col justify-between rounded-2xl border border-[#E8E2D8] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CC5A2B]/45 dark:border-[#39362F] dark:bg-[#211F1C] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="target-index text-[#CC5A2B]">{number} / TARGET</span>
          <h4 className="target-label mt-2 text-[#78716C] dark:text-[#A8A29E]">{title}</h4>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wide ${tone}`}>
          {target.rating}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-2">
          <span className="target-value text-[#1F1E1D] dark:text-[#F3EDE5]">{target.value}</span>
          <span className="target-unit text-[#78716C] dark:text-[#A8A29E]">{target.unit}</span>
        </div>
        <div className="mt-5 flex items-center justify-between text-[10px] font-mono text-[#78716C] dark:text-[#A8A29E]">
          <span>MODELLED RANGE</span>
          <span>{low} – {high}</span>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-[#F0ECE6] dark:bg-[#34312B]" aria-label={`Modelled range ${low} to ${high} ${target.unit}`}>
          <div className="absolute top-0 h-full rounded-full bg-[#CC5A2B]/30" style={{ left: `${bandStart}%`, width: `${Math.max(bandEnd - bandStart, 1)}%` }} />
          <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#CC5A2B] shadow dark:border-[#211F1C]" style={{ left: `${current}%` }} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1.5 border-t border-[#E8E2D8] pt-3 text-xs text-[#78716C] dark:border-[#39362F] dark:text-[#A8A29E]">
        {target.is_higher_better ? <ArrowUpRight className="h-3.5 w-3.5 text-[#CC5A2B]" /> : <ArrowDownRight className="h-3.5 w-3.5 text-[#CC5A2B]" />}
        {goal}
      </div>
    </article>
  );
}

export default function PredictionDisplay({ predictionData, isCalculating }) {
  if (!predictionData || !predictionData.targets) return null;

  const { targets, composite_score, environmental_impact, feature_contributions } = predictionData;
  const mrr = targets.mrr;
  const ra = targets.surface_roughness;
  const eff = targets.energy_efficiency;

  return (
    <motion.div className="space-y-5" animate={{ opacity: isCalculating ? 0.72 : 1 }} transition={{ duration: 0.18 }}>
      <section className="prediction-panel overflow-hidden rounded-[1.5rem] border border-[#E8E2D8] bg-[#F5F1EC] dark:border-[#39362F] dark:bg-[#1D1B18]">
        <header className="flex flex-col justify-between gap-4 border-b border-[#E4DDD4] px-5 py-5 dark:border-[#39362F] sm:flex-row sm:items-center sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#CC5A2B] text-white shadow-md shadow-[#CC5A2B]/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="target-index text-[#CC5A2B]">03 / Model output</p>
              <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#1F1E1D] dark:text-[#EDE8E1]">Predicted targets</h3>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className={`h-2 w-2 rounded-full ${isCalculating ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">{isCalculating ? 'Updating with current inputs' : 'Modelled confidence ranges'}</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </header>

        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(250px,0.82fr)_minmax(0,1.18fr)] xl:p-6">
          <article className="mrr-feature relative flex min-h-[360px] flex-col overflow-hidden rounded-[1.25rem] border border-[#E7D7CC] bg-[#FBF6F1] dark:border-[#46352C] dark:bg-[#24201C]">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#CC5A2B]/10" />
            <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[#CC5A2B]/15" />
            <div className="relative z-10 flex items-start justify-between px-5 pt-5 sm:px-6">
              <div>
                <p className="target-index text-[#CC5A2B]">01 / Primary target</p>
                <h4 className="target-label mt-1 text-[#1F1E1D] dark:text-[#EDE8E1]">Material removal</h4>
              </div>
              <span className="rounded-full border border-[#CC5A2B]/20 bg-[#CC5A2B]/10 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-[#B84A20] dark:text-[#E99575]">{mrr.rating}</span>
            </div>
            <div className="relative z-10 flex flex-1 items-center justify-center py-1">
              <PredictionGauge value={mrr.value} minVal={mrr.min_val} maxVal={mrr.max_val} label="Removal rate" unit={mrr.unit} score={composite_score} />
            </div>
            <div className="relative z-10 mx-5 mb-5 flex items-center justify-between border-t border-[#E7D7CC] pt-3 text-[10px] font-mono text-[#78716C] dark:border-[#46352C] dark:text-[#A8A29E] sm:mx-6">
              <span>MODELLED RANGE</span><span>{mrr.confidence_interval[0]} – {mrr.confidence_interval[1]} {mrr.unit}</span>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <TargetCard number="02" title="Surface finish" target={ra} tone="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" goal="Lower roughness is better" />
            <TargetCard number="03" title="Energy efficiency" target={eff} tone="bg-sky-500/10 text-sky-700 dark:text-sky-400" goal="Higher efficiency is better" />
          </div>
        </div>

        {environmental_impact && (
          <div className="mx-4 mb-4 grid gap-4 rounded-2xl border border-[#E8E2D8] bg-white/70 p-4 dark:border-[#39362F] dark:bg-[#211F1C] sm:mx-5 sm:mb-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-5 xl:mx-6 xl:mb-6">
            <div className="flex items-center gap-2.5 sm:min-w-48 sm:flex-col sm:items-start sm:gap-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CC5A2B]/10 text-[#CC5A2B]"><Compass className="h-4 w-4" /></span>
              <span className="text-xs font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">Atmospheric effect</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <span className="text-[#78716C] dark:text-[#A8A29E]">Stability <strong className="ml-1 font-mono text-[#CC5A2B]">{environmental_impact.stability_index}%</strong></span>
                <span className="text-[#78716C] dark:text-[#A8A29E]">Thermal drift <strong className="ml-1 font-mono text-[#1F1E1D] dark:text-[#EDE8E1]">±{environmental_impact.thermal_drift_um} µm</strong></span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-[#78716C] dark:text-[#A8A29E]">{environmental_impact.advisory}</p>
            </div>
          </div>
        )}
      </section>

      {feature_contributions && (
        <section className="claude-card p-5 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-2 border-b border-[#E8E2D8] pb-4 dark:border-[#34312B] sm:flex-row sm:items-end">
            <div>
              <p className="target-index text-[#CC5A2B]">Model interpretation</p>
              <h3 className="mt-1 font-serif text-xl font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">What is shaping this result</h3>
            </div>
            <span className="text-[10px] font-mono text-[#78716C] dark:text-[#A8A29E]">Coupled Shapley surrogate</span>
          </div>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {Object.entries(feature_contributions).map(([feature, percentage]) => {
              const friendlyNames = {
                pulse_on_time: 'Pulse-on duration',
                peak_current: 'Discharge current',
                weather_anomaly: 'Atmospheric anomaly',
                gap_voltage: 'Gap voltage',
                flushing_pressure: 'Flushing pressure',
                wire_feed_rate: 'Wire feed rate'
              };
              return (
                <div key={feature}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#78716C] dark:text-[#A8A29E]">{friendlyNames[feature] || feature}</span>
                    <span className="font-mono font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">{percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F0ECE6] dark:bg-[#34312B]">
                    <div className={`h-full rounded-full transition-all duration-500 ${feature === 'weather_anomaly' ? 'bg-[#CC5A2B]' : 'bg-gradient-to-r from-[#CC5A2B]/55 to-[#CC5A2B]'}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
