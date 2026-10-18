import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { pingBackend, getStoredBackendUrl, setStoredBackendUrl } from '../services/api';

export default function BackendSettingsModal({ isOpen, onClose, onStatusChange }) {
  const [url, setUrl] = useState(getStoredBackendUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await pingBackend(url, 5000);
    setTesting(false);
    setTestResult(res);
    if (res.online && onStatusChange) {
      onStatusChange(true, res.latency);
    }
  };

  const handleSave = () => {
    setStoredBackendUrl(url);
    if (onStatusChange) {
      handleTest();
    }
    onClose();
  };

  const handleResetDefault = () => {
    setUrl('https://microoptix-ai-backend.onrender.com');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F1E1D]/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#34312B] shadow-2xl p-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8] dark:border-[#34312B]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] text-[#CC5A2B] border border-[#E8E2D8] dark:border-[#34312B]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">Render Backend Settings</h3>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">Configure connection to your live API instance</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1F1E1D] dark:hover:text-[#EDE8E1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-2">
                  Backend API Endpoint (Render)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-service.onrender.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl font-mono bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-[#1F1E1D] dark:text-[#EDE8E1] focus:outline-none focus:border-[#CC5A2B]"
                />
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  testResult.online
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                }`}>
                  {testResult.online ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {testResult.online ? `Connected (${testResult.latency}ms ping)` : 'Cannot Reach Render Service'}
                    </div>
                    <p className="mt-0.5 opacity-90 text-[11px]">
                      {testResult.online
                        ? 'FastAPI & Scipy optimizer are live and ready for high-speed computation.'
                        : 'Render free tier spins down after 15m idle (takes ~45s to wake up). The app will automatically use the built-in physics surrogate until Render answers.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-xs text-[#78716C] dark:text-[#A8A29E] space-y-1">
                <div className="font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
                  💡 Render Free Tier Warm-up
                </div>
                <p className="text-[11px] leading-relaxed">
                  Render Web Services sleep when inactive. On the first ping, it takes 30-50 seconds to spin up. MicroOptix includes a built-in instant client-side simulator so your UI never stutters.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D8] dark:border-[#34312B]">
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-[#78716C] hover:text-[#1F1E1D] underline"
              >
                Reset Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-[#E8E2D8] dark:border-[#34312B] text-[#1F1E1D] dark:text-[#EDE8E1] hover:bg-[#FAF8F5] dark:hover:bg-[#292723] flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Pinging...' : 'Test Ping'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#CC5A2B] hover:bg-[#B84A20] text-white shadow-sm transition-all"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
