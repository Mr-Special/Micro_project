import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Server, MapPin, ShieldAlert, House } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BackendSettingsModal from './BackendSettingsModal';

export default function Header({ isBackendOnline, latency, weatherContext, onHome }) {
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="dashboard-header sticky top-0 z-30 w-full border-b border-[#E8E2D8] dark:border-[#34312B] bg-[#FAF8F5]/90 dark:bg-[#181715]/90 backdrop-blur-md transition-colors duration-200">
        <div className="dashboard-header-inner mx-auto flex w-full max-w-none items-center justify-between px-4 py-3.5 sm:px-7 lg:px-10 2xl:px-14">
          
          {/* Brand Logo & Name (Claude Minimalist styling) */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-lg bg-[#CC5A2B] text-white flex items-center justify-center font-semibold text-lg shadow-sm"
            >
              µ
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-[#1F1E1D] dark:text-[#EDE8E1]">
                  MicroOptix
                </span>
                <span className="dashboard-brand-tag hidden px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-md bg-[#FAF8F5] dark:bg-[#292723] text-[#78716C] dark:text-[#A8A29E] border border-[#E8E2D8] dark:border-[#34312B] xs:inline">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] font-medium hidden sm:block">
                Process prediction and optimization
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={onHome}
              className="dashboard-home-button px-1.5 py-2 text-xs font-medium text-[#78716C] hover:text-[#CC5A2B] sm:px-2"
              aria-label="Home"
            >
              <span className="hidden xs:inline">Home</span>
              <House className="h-4 w-4 xs:hidden" />
            </button>
            
            {/* Active Weather / Anomaly Indicator Pill */}
            {weatherContext && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D8] dark:border-[#34312B] bg-white dark:bg-[#22201D] text-xs text-[#1F1E1D] dark:text-[#EDE8E1]">
                {weatherContext.is_anomaly ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-[#CC5A2B]" />
                    <span className="font-semibold text-[#CC5A2B]">{weatherContext.anomaly_type || 'Weather Anomaly'}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-[#78716C]" />
                    <span>{weatherContext.city_name}: <strong className="font-mono">{weatherContext.temperature}°C</strong></span>
                    {(weatherContext.region_name || weatherContext.country_name) && <span className="text-[#78716C]">· {[weatherContext.region_name, weatherContext.country_name].filter(Boolean).join(', ')}</span>}
                  </>
                )}
              </div>
            )}

            {/* Render Backend Connection Status Pill */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium border border-[#E8E2D8] dark:border-[#34312B] bg-white dark:bg-[#22201D] text-[#1F1E1D] dark:text-[#EDE8E1] hover:bg-[#F3EFEA] dark:hover:bg-[#292723] transition-colors sm:px-3"
              title="Click to configure Render backend API"
            >
              <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="backend-status-label hidden xs:inline text-[#78716C] dark:text-[#A8A29E]">
                {isBackendOnline ? `Backend · ${latency || 42} ms` : 'Local model'}
              </span>
              <Server className="w-3.5 h-3.5 text-[#78716C]" />
            </motion.button>

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E8E2D8] dark:border-[#34312B] bg-white dark:bg-[#22201D] text-[#78716C] dark:text-[#EDE8E1] hover:bg-[#F3EFEA] dark:hover:bg-[#292723] transition-colors"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#78716C]" />
              )}
            </motion.button>

          </div>
        </div>
      </header>

      <BackendSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onStatusChange={() => {}}
      />
    </>
  );
}
