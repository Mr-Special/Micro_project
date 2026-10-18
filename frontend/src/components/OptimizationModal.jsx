import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchOptimization } from '../services/api';
import { PARAM_CONFIGS } from '../services/surrogate';

const GOALS = [
  {
    id: 'weather_resilience',
    title: 'Atmospheric Anomaly Resilience',
    description: 'Stabilizes process against current weather/anomaly stress, mitigating thermal drift.',
    icon: ShieldCheck,
    badge: 'Weather Aware'
  },
  {
    id: 'balanced_pareto',
    title: 'Balanced Pareto Optimum',
    description: 'Simultaneously maximizes Material Removal Rate and minimizes Surface Roughness.',
    icon: Sparkles,
    badge: 'Recommended'
  },
  {
    id: 'maximize_mrr',
    title: 'Peak Throughput (MRR)',
    description: 'Maximal bulk material erosion rate while respecting safety constraints.',
    icon: Zap,
    badge: 'Throughput'
  },
  {
    id: 'minimize_roughness',
    title: 'Ultra-Fine Surface Polish',
    description: 'Minimizes crater roughness (Ra) down to optical mirror-grade tolerances.',
    icon: Target,
    badge: 'Precision'
  }
];

export default function OptimizationModal({ isOpen, onClose, currentParameters, weatherContext, onApplyOptimal }) {
  const [selectedGoal, setSelectedGoal] = useState('weather_resilience');
  const [targetRaValue, setTargetRaValue] = useState(0.8);
  const [algorithm, setAlgorithm] = useState('differential_evolution');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#CC5A2B', '#E07A5F', '#D97706', '#10B981']
    });
  };

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setError(null);
    try {
      const objective = {
        goal: selectedGoal,
        target_value: selectedGoal === 'target_roughness' ? targetRaValue : null,
        algorithm: algorithm
      };

      const res = await fetchOptimization(currentParameters, objective, weatherContext);
      setResult(res.data);
      triggerConfetti();
    } catch (err) {
      setError(err.message || 'Failed to converge optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (result && result.optimal_parameters) {
      onApplyOptimal(result.optimal_parameters);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F1E1D]/55 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#34312B] shadow-2xl p-6 sm:p-8 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8] dark:border-[#34312B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CC5A2B] text-white flex items-center justify-center font-serif text-lg font-bold">
                  µ
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">
                    Atmospheric Process Optimizer
                  </h2>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Differential Evolution multi-objective solver calibrated for live weather conditions
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1F1E1D] dark:hover:text-[#EDE8E1] hover:bg-[#FAF8F5] dark:hover:bg-[#292723] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="py-5 space-y-5">
              
              {/* Step 1: Goal Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-2.5">
                  1. Select Optimization Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoal === goal.id;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FAF8F5] dark:bg-[#292723] border-[#CC5A2B] shadow-sm'
                            : 'bg-white dark:bg-[#22201D] border-[#E8E2D8] dark:border-[#34312B] hover:border-[#CC5A2B]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[#CC5A2B]' : 'text-[#78716C]'}`} />
                            <span className="text-xs sm:text-sm font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
                              {goal.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-[#CC5A2B] text-white'
                              : 'bg-[#FAF8F5] dark:bg-[#181715] text-[#78716C]'
                          }`}>
                            {goal.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-1">
                          {goal.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Algorithm & Execute */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#78716C]">Solver:</span>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#34312B] text-[#1F1E1D] dark:text-[#EDE8E1] focus:outline-none"
                  >
                    <option value="differential_evolution">Differential Evolution (Global Genetic)</option>
                    <option value="nelder_mead">Nelder-Mead (Adaptive Simplex)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRunOptimization}
                  disabled={isOptimizing}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#CC5A2B] hover:bg-[#B84A20] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  {isOptimizing ? 'Exploring Optimal Setpoints...' : 'Execute Optimizer'}
                </button>
              </div>

              {/* Results View */}
              {result && (
                <div className="space-y-4 pt-4 border-t border-[#E8E2D8] dark:border-[#34312B]">
                  
                  {/* Summary Banner */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold font-serif">Optimization Converged</h4>
                      <p className="text-[11px] opacity-90 mt-0.5">{result.objective_summary}</p>
                    </div>
                  </div>

                  {/* Convergence Trajectory Chart */}
                  {result.convergence_history && result.convergence_history.length > 1 && (
                    <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1F1E1D] dark:text-[#EDE8E1]">
                          Convergence Trajectory
                        </span>
                        <span className="text-[10px] font-mono text-[#78716C]">
                          {result.iterations_count} Iterations ({result.execution_time_ms}ms)
                        </span>
                      </div>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={result.convergence_history}>
                            <defs>
                              <linearGradient id="claudeOptGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#CC5A2B" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#CC5A2B" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis dataKey="iteration" tickLine={false} stroke="#A8A29E" fontSize={10} />
                            <YAxis domain={['auto', 'auto']} tickLine={false} stroke="#A8A29E" fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#22201D',
                                borderRadius: '8px',
                                border: '1px solid #34312B',
                                fontSize: '11px',
                                color: '#EDE8E1'
                              }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#CC5A2B" strokeWidth={2} fill="url(#claudeOptGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Target Performance Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#34312B]">
                      <span className="text-[11px] text-[#78716C]">Material Removal Rate</span>
                      <div className="flex items-center justify-between mt-1 text-sm font-serif">
                        <span className="text-[#78716C]">{result.baseline_predictions.mrr}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                        <span className="font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{result.optimal_predictions.mrr}</span>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        {result.percentage_improvements.mrr > 0 ? '+' : ''}{result.percentage_improvements.mrr}% Throughput
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#34312B]">
                      <span className="text-[11px] text-[#78716C]">Surface Roughness Ra</span>
                      <div className="flex items-center justify-between mt-1 text-sm font-serif">
                        <span className="text-[#78716C]">{result.baseline_predictions.surface_roughness}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                        <span className="font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{result.optimal_predictions.surface_roughness}</span>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        {result.percentage_improvements.surface_roughness > 0 ? '+' : ''}{result.percentage_improvements.surface_roughness}% Smoother
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#34312B]">
                      <span className="text-[11px] text-[#78716C]">Resilience Score</span>
                      <div className="flex items-center justify-between mt-1 text-sm font-serif">
                        <span className="text-[#78716C]">{result.baseline_predictions.composite_score}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                        <span className="font-bold text-[#CC5A2B]">{result.optimal_predictions.composite_score}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#CC5A2B] mt-1 font-semibold">
                        +{result.percentage_improvements.composite_score} pts Gain
                      </div>
                    </div>
                  </div>

                  {/* Parameter Diffs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PARAM_CONFIGS.map((p) => {
                      const baseVal = currentParameters[p.name];
                      const optVal = result.optimal_parameters[p.name];
                      const diff = Number((optVal - baseVal).toFixed(2));
                      return (
                        <div key={p.name} className="p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-center">
                          <span className="text-[10px] text-[#78716C] truncate block">{p.label.split(' ')[0]}</span>
                          <div className="font-mono font-bold text-xs text-[#1F1E1D] dark:text-[#EDE8E1] my-0.5">
                            {optVal}
                          </div>
                          <span className={`text-[10px] font-mono ${diff > 0 ? 'text-[#CC5A2B]' : (diff < 0 ? 'text-sky-600' : 'text-[#78716C]')}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D8] dark:border-[#34312B]">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#78716C] hover:text-[#1F1E1D] dark:hover:text-[#EDE8E1]"
              >
                Close
              </button>

              {result && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#CC5A2B] hover:bg-[#B84A20] shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span>Apply Optimal Parameters</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
