import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Trash2,
  Download,
  ArrowRight,
  Check,
  GitCompare,
  RotateCcw,
  Sparkles,
  Calendar,
  Sliders,
  MapPin,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PARAM_CONFIGS } from '../services/surrogate';

export default function PredictionHistory({
  historyItems,
  onClearHistory,
  onDeleteHistoryItem,
  onApplyHistoricalParams,
  onClose
}) {
  const [selectedRunAId, setSelectedRunAId] = useState(null);
  const [selectedRunBId, setSelectedRunBId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const runA = historyItems.find(item => item.id === selectedRunAId);
  const runB = historyItems.find(item => item.id === selectedRunBId);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `microoptix_prediction_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Controls */}
      <section className="claude-card p-6 border border-[#E8E2D8] dark:border-[#39362F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#CC5A2B]/10 text-[#CC5A2B]">
              <History className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">
              Prediction History & Run Compare
            </h2>
          </div>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
            Persisted simulation runs stored locally. Select any two runs to perform an engineering diff comparison.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={historyItems.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#E8E2D8] dark:border-[#39362F] bg-white dark:bg-[#22201D] text-[#1F1E1D] dark:text-[#EDE8E1] hover:bg-[#FAF8F5] dark:hover:bg-[#292723] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#CC5A2B]" />
            <span>Export JSON</span>
          </button>
          
          <button
            type="button"
            onClick={onClearHistory}
            disabled={historyItems.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </section>

      {/* Side-by-Side Comparison Panel (Visible when 2 runs are selected) */}
      {runA && runB && (
        <section className="claude-card p-6 sm:p-7 border-2 border-[#CC5A2B] bg-[#FAF8F5]/80 dark:bg-[#181715]/90 space-y-5 animate-scaleUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E2D8] dark:border-[#39362F]">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-[#CC5A2B]" />
              <h3 className="font-serif text-lg font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">
                Side-by-Side Run Differential Analysis
              </h3>
            </div>
            <div className="text-xs font-mono text-[#78716C] dark:text-[#A8A29E]">
              Comparing Run A ({runA.timestamp.split(',')[1]}) vs Run B ({runB.timestamp.split(',')[1]})
            </div>
          </div>

          {/* Metric Comparison Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#39362F]">
              <span className="text-[11px] text-[#78716C] block">Material Removal Rate</span>
              <div className="flex items-center justify-between mt-1 text-sm font-serif">
                <span className="text-[#78716C]">{runA.targets.mrr.value}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                <span className="font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{runB.targets.mrr.value} mm³/min</span>
              </div>
              {(() => {
                const diff = Number((runB.targets.mrr.value - runA.targets.mrr.value).toFixed(2));
                const pct = Number(((diff / runA.targets.mrr.value) * 100).toFixed(1));
                return (
                  <span className={`text-[10px] font-mono font-bold mt-1 block ${pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {pct >= 0 ? `+${pct}%` : `${pct}%`} Throughput Shift
                  </span>
                );
              })()}
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#39362F]">
              <span className="text-[11px] text-[#78716C] block">Surface Roughness Ra</span>
              <div className="flex items-center justify-between mt-1 text-sm font-serif">
                <span className="text-[#78716C]">{runA.targets.surface_roughness.value}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                <span className="font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{runB.targets.surface_roughness.value} µm</span>
              </div>
              {(() => {
                const diff = Number((runA.targets.surface_roughness.value - runB.targets.surface_roughness.value).toFixed(3));
                const pct = Number(((diff / runA.targets.surface_roughness.value) * 100).toFixed(1));
                return (
                  <span className={`text-[10px] font-mono font-bold mt-1 block ${pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                    {pct >= 0 ? `${pct}% Smoother Finish` : `${Math.abs(pct)}% Rougher`}
                  </span>
                );
              })()}
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#39362F]">
              <span className="text-[11px] text-[#78716C] block">Composite Resilience Score</span>
              <div className="flex items-center justify-between mt-1 text-sm font-serif">
                <span className="text-[#78716C]">{runA.composite_score}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                <span className="font-bold text-[#CC5A2B]">{runB.composite_score} / 100</span>
              </div>
              {(() => {
                const diff = Number((runB.composite_score - runA.composite_score).toFixed(1));
                return (
                  <span className={`text-[10px] font-mono font-bold mt-1 block ${diff >= 0 ? 'text-[#CC5A2B]' : 'text-[#78716C]'}`}>
                    {diff >= 0 ? `+${diff}` : diff} Quality Index Shift
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Operating Parameters Delta Table */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#39362F] overflow-x-auto">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-3">
              Operating Parameters Shift
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {PARAM_CONFIGS.map(cfg => {
                const valA = runA.parameters[cfg.name] ?? cfg.default_val;
                const valB = runB.parameters[cfg.name] ?? cfg.default_val;
                const diff = Number((valB - valA).toFixed(2));
                return (
                  <div key={cfg.name} className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#39362F] text-center">
                    <span className="text-[10px] text-[#78716C] block truncate">{cfg.label.split(' ')[0]}</span>
                    <div className="font-mono text-xs font-bold text-[#1F1E1D] dark:text-[#EDE8E1] my-0.5">
                      {valA} → {valB}
                    </div>
                    <span className={`text-[10px] font-mono font-semibold ${diff > 0 ? 'text-[#CC5A2B]' : (diff < 0 ? 'text-sky-600' : 'text-[#78716C]')}`}>
                      {diff > 0 ? `+${diff}` : (diff < 0 ? `${diff}` : '0')} {cfg.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* History List */}
      <section className="space-y-3">
        {historyItems.length === 0 ? (
          <div className="claude-card p-12 text-center border border-[#E8E2D8] dark:border-[#39362F]">
            <History className="w-10 h-10 text-[#78716C] mx-auto mb-3 opacity-40" />
            <h3 className="font-serif text-lg font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
              No Saved Runs Yet
            </h3>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-md mx-auto mt-1">
              Adjust operating parameters and atmospheric settings on the Studio Workbench, then click <strong>"Save Snapshot"</strong> to record and compare your experiment runs here.
            </p>
          </div>
        ) : (
          historyItems.map((item, idx) => {
            const isA = selectedRunAId === item.id;
            const isB = selectedRunBId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`claude-card p-4 sm:p-5 border transition-all ${
                  isA || isB
                    ? 'border-[#CC5A2B] bg-[#CC5A2B]/5 shadow-sm'
                    : 'border-[#E8E2D8] dark:border-[#39362F] hover:border-[#CC5A2B]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs text-[#78716C] w-6 shrink-0">
                      #{historyItems.length - idx}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#1F1E1D] dark:text-[#EDE8E1]">
                          {item.note || `Process Snapshot ${historyItems.length - idx}`}
                        </span>

                        {item.weather && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#39362F] text-[#78716C]">
                            <MapPin className="w-3 h-3 text-[#CC5A2B]" />
                            <span>{item.weather.city_name} ({item.weather.temperature}°C)</span>
                            {item.weather.is_anomaly && (
                              <span className="text-[#CC5A2B] font-semibold flex items-center gap-0.5">
                                <ShieldAlert className="w-3 h-3" />
                                {item.weather.anomaly_type}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                        <span>•</span>
                        <span>Score: <strong className="text-[#CC5A2B] font-bold">{item.composite_score}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    {/* Compare Checkboxes */}
                    <button
                      type="button"
                      onClick={() => setSelectedRunAId(prev => prev === item.id ? null : item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                        isA
                          ? 'bg-[#CC5A2B] text-white border-[#CC5A2B]'
                          : 'bg-white dark:bg-[#22201D] text-[#78716C] border-[#E8E2D8] dark:border-[#39362F] hover:text-[#1F1E1D]'
                      }`}
                    >
                      {isA ? 'Selected A' : 'Set as A'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRunBId(prev => prev === item.id ? null : item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                        isB
                          ? 'bg-[#CC5A2B] text-white border-[#CC5A2B]'
                          : 'bg-white dark:bg-[#22201D] text-[#78716C] border-[#E8E2D8] dark:border-[#39362F] hover:text-[#1F1E1D]'
                      }`}
                    >
                      {isB ? 'Selected B' : 'Set as B'}
                    </button>

                    {/* Apply parameters to workbench */}
                    <button
                      type="button"
                      onClick={() => onApplyHistoricalParams(item.parameters)}
                      className="p-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#39362F] text-[#78716C] hover:text-[#CC5A2B] hover:bg-[#FAF8F5] dark:hover:bg-[#292723] transition-colors"
                      title="Load these parameters into workbench"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#39362F] text-[#78716C] hover:text-[#1F1E1D] dark:hover:text-[#EDE8E1] transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete item */}
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                      title="Delete run"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Collapsible details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 mt-3 border-t border-[#E8E2D8] dark:border-[#39362F] space-y-3"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#181715] text-xs">
                          <span className="text-[#78716C] text-[10px] block">MRR Output</span>
                          <span className="font-serif font-bold text-sm text-[#1F1E1D] dark:text-[#EDE8E1]">
                            {item.targets.mrr.value} mm³/min
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#181715] text-xs">
                          <span className="text-[#78716C] text-[10px] block">Roughness Ra</span>
                          <span className="font-serif font-bold text-sm text-[#1F1E1D] dark:text-[#EDE8E1]">
                            {item.targets.surface_roughness.value} µm
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#181715] text-xs">
                          <span className="text-[#78716C] text-[10px] block">Efficiency</span>
                          <span className="font-serif font-bold text-sm text-[#1F1E1D] dark:text-[#EDE8E1]">
                            {item.targets.energy_efficiency.value} %
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#181715] text-xs">
                          <span className="text-[#78716C] text-[10px] block">Pulse & Current</span>
                          <span className="font-mono font-bold text-xs text-[#1F1E1D] dark:text-[#EDE8E1]">
                            {item.parameters.pulse_on_time}µs · {item.parameters.peak_current}A
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
