import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Download,
  Check,
  ChevronRight,
  Wind
} from 'lucide-react';
import Header from './components/Header';
import WeatherPanel from './components/WeatherPanel';
import ParameterSlider from './components/ParameterSlider';
import PredictionDisplay from './components/PredictionDisplay';
import OptimizationModal from './components/OptimizationModal';
import SensitivityChart from './components/SensitivityChart';
import PresetScenarios from './components/PresetScenarios';
import LandingPage from './components/LandingPage';
import { PARAM_CONFIGS, DEFAULT_PARAMETERS } from './services/surrogate';
import { fetchPrediction, pingBackend } from './services/api';

export default function App() {
  const [page, setPage] = useState('home');
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [weatherContext, setWeatherContext] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [latency, setLatency] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Ping backend on initial load and periodically
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      const res = await pingBackend();
      if (isMounted) {
        setIsBackendOnline(res.online);
        setLatency(res.latency);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update prediction when parameters OR weatherContext change
  useEffect(() => {
    if (!weatherContext) {
      setPrediction(null);
      setIsCalculating(false);
      return undefined;
    }
    let isCurrent = true;
    setIsCalculating(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetchPrediction(parameters, weatherContext);
        if (isCurrent && res.data) {
          setPrediction(res.data);
        }
      } catch (err) {
        console.error('Prediction fetch error:', err);
      } finally {
        if (isCurrent) setIsCalculating(false);
      }
    }, 40);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [parameters, weatherContext]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleParameterChange = useCallback((name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  if (page === 'home') {
    return <LandingPage onOpenDashboard={() => setPage('dashboard')} />;
  }

  const handleResetDefaults = () => {
    setParameters(DEFAULT_PARAMETERS);
    showToast('Reset operating parameters to baseline');
  };

  const handleSelectPreset = (presetParams) => {
    setParameters(presetParams);
    showToast('Applied operating preset configuration');
  };

  const handleApplyOptimal = (optimalParams) => {
    setParameters(optimalParams);
    showToast('Applied weather-optimized parameters');
  };

  const handleExportConfig = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      weather: weatherContext,
      parameters,
      prediction: prediction?.targets,
      environmental_impact: prediction?.environmental_impact,
      composite_score: prediction?.composite_score,
      engine: isBackendOnline ? 'Render FastAPI Backend' : 'Local Physics Surrogate'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microoptix-weather-run-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported run configuration JSON');
  };

  return (
    <div className="dashboard-canvas min-h-screen flex flex-col text-[#1F1E1D] dark:text-[#EDE8E1] transition-colors duration-200">
      
      {/* Header */}
      <Header
        isBackendOnline={isBackendOnline}
        latency={latency}
        onOpenOptimize={() => setIsOptimizeOpen(true)}
        weatherContext={weatherContext}
        onHome={() => setPage('home')}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F1E1D] text-white text-xs font-medium shadow-xl border border-white/10"
          >
            <Check className="w-3.5 h-3.5 text-[#CC5A2B]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Dashboard */}
      <main className="mx-auto w-full max-w-none flex-1 space-y-8 px-4 py-6 sm:px-7 lg:space-y-10 lg:px-10 lg:py-8 2xl:px-14">
        
        {/* Mission Banner (Claude Minimalist Aesthetic) */}
        <section className="dashboard-intro relative isolate overflow-hidden rounded-[1.5rem] border border-[#E8E2D8] dark:border-[#39362F]">
          <div className="dashboard-intro-orbit pointer-events-none absolute -right-10 -top-32 h-[30rem] w-[30rem] rounded-full border border-[#CC5A2B]/15" />
          <div className="dashboard-intro-orbit pointer-events-none absolute -right-2 -top-24 h-[24rem] w-[24rem] rounded-full border border-[#CC5A2B]/20" />
          <div className="relative z-10 grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-10 lg:py-10 xl:px-12 xl:py-12">
            <div className="max-w-4xl">
              <p className="mb-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#CC5A2B]">
                <span className="h-px w-7 bg-[#CC5A2B]" /> Process studio <span className="text-[#78716C] dark:text-[#A8A29E]">/ Workbench 01</span>
              </p>
              <h1 className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl xl:text-7xl">
                A better process starts with <em className="font-normal text-[#CC5A2B]">context.</em>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#78716C] dark:text-[#A8A29E] sm:text-base sm:leading-7">
                Local weather and machine settings, brought into one clear view. Tune the inputs and see the predicted result respond.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <button disabled={!weatherContext} onClick={handleExportConfig} className="secondary-button disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-3.5 w-3.5 text-[#78716C]" /><span>Export run</span>
                </button>
                <button onClick={() => setIsOptimizeOpen(true)} className="primary-button">
                  <Sparkles className="h-3.5 w-3.5" /><span>Launch optimizer</span>
                </button>
              </div>
            </div>

            <div className="dashboard-flow relative mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-2 py-8 sm:px-5 lg:min-h-64 lg:px-2">
              <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-[#CC5A2B]/15 via-[#CC5A2B]/70 to-[#CC5A2B]/15" />
              <div className="absolute left-[30%] top-[calc(50%-4px)] h-2 w-2 rounded-full bg-[#CC5A2B] shadow-[0_0_16px_rgba(204,90,43,0.7)]" />
              <div className="absolute left-[67%] top-[calc(50%-4px)] h-2 w-2 rounded-full bg-[#CC5A2B] shadow-[0_0_16px_rgba(204,90,43,0.7)]" />
              {[
                ['01', 'Weather', 'Local signal'],
                ['02', 'Model', 'Process inputs'],
                ['03', 'Targets', 'Predicted output']
              ].map(([number, title, caption], index) => (
                <div key={number} className={`relative z-[1] flex flex-col gap-2 ${index === 1 ? 'translate-y-[-1.25rem]' : 'translate-y-5'}`}>
                  <span className="font-mono text-[10px] tracking-widest text-[#CC5A2B]">{number} / 03</span>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg shadow-black/5 sm:h-16 sm:w-16 ${index === 1 ? 'border-[#CC5A2B]/60 bg-[#CC5A2B] text-white' : 'border-[#E8E2D8] bg-[#FAF8F5] text-[#1F1E1D] dark:border-[#39362F] dark:bg-[#292723] dark:text-[#EDE8E1]'}`}>
                    <span className="font-serif text-2xl">{index === 0 ? '°' : index === 1 ? 'µ' : '↗'}</span>
                  </div>
                  <span className="font-serif text-lg font-semibold">{title}</span>
                  <span className="text-[10px] text-[#78716C] dark:text-[#A8A29E]">{caption}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-[#CC5A2B] to-transparent" />
        </section>

        {/* WEATHER & ANOMALY PANEL (Open-Meteo Live API) */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <span className="font-mono text-[10px] tracking-widest text-[#CC5A2B]">01</span>
            <span className="h-px w-6 bg-[#CC5A2B]/50" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#78716C] dark:text-[#A8A29E]">Location & atmosphere</span>
          </div>
          <WeatherPanel
            weatherContext={weatherContext}
            onWeatherChange={(newWeather) => setWeatherContext(newWeather)}
          />
        </section>

        {/* Industry Presets */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <span className="font-mono text-[10px] tracking-widest text-[#CC5A2B]">02</span>
            <span className="h-px w-6 bg-[#CC5A2B]/50" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#78716C] dark:text-[#A8A29E]">Starting points</span>
          </div>
          <PresetScenarios
            onSelectPreset={handleSelectPreset}
            currentParameters={parameters}
          />
        </section>

        {/* Split Grid: Left = Sliders / Inputs, Right = Predictions & Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8 2xl:gap-10">
          
          {/* Left Column: Parameter Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#CC5A2B]" />
                <h3 className="font-serif text-lg font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
                  Operating parameters
                </h3>
              </div>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] text-[#78716C] hover:text-[#CC5A2B] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-3">
              {PARAM_CONFIGS.map((config, index) => (
                <ParameterSlider
                  key={config.name}
                  config={config}
                  index={String(index + 1).padStart(2, '0')}
                  value={parameters[config.name] ?? config.default_val}
                  onChange={handleParameterChange}
                />
              ))}
            </div>

            {/* Quick Action Card */}
            <div className="p-4 rounded-xl claude-card flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
                  Counteract Weather Impact
                </h4>
                <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                  Run Scipy solver to eliminate thermal drift & stabilize Ra.
                </p>
              </div>
              <button
                disabled={!weatherContext}
                onClick={() => setIsOptimizeOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#CC5A2B] hover:bg-[#B84A20] text-white text-xs font-semibold shadow-sm flex items-center gap-1 shrink-0 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Optimize</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Column: Model Predictions, Targets & Sensitivity (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {weatherContext ? (
              <>
                <PredictionDisplay
                  predictionData={prediction}
                  isCalculating={isCalculating}
                />
                <SensitivityChart
                  currentParameters={parameters}
                  weatherContext={weatherContext}
                />
              </>
            ) : (
              <section className="claude-card flex min-h-64 flex-col justify-center p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#CC5A2B]">Prediction</p>
                <h2 className="mt-3 text-xl font-semibold">Choose a location to begin</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#78716C] dark:text-[#A8A29E]">
                  Choose a state and city above to load current weather for the prediction.
                </p>
              </section>
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D8] dark:border-[#34312B] py-6 mt-12 text-center text-xs text-[#78716C] dark:text-[#A8A29E]">
        <div className="mx-auto flex w-full max-w-none flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-7 lg:px-10 2xl:px-14">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">MicroOptix</span>
            <span>•</span>
              <span>Process dashboard</span>
            <span>•</span>
            <span>Open-Meteo Weather API Integration</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Vercel + Render Ready</span>
          </div>
        </div>
      </footer>

      {/* Optimizer Modal */}
      <OptimizationModal
        isOpen={isOptimizeOpen}
        onClose={() => setIsOptimizeOpen(false)}
        currentParameters={parameters}
        weatherContext={weatherContext}
        onApplyOptimal={handleApplyOptimal}
      />

    </div>
  );
}
