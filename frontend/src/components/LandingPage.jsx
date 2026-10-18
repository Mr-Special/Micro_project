import React from 'react';
import { ArrowDownRight, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage({ onOpenDashboard }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF8F5] text-[#1F1E1D] dark:bg-[#181715] dark:text-[#EDE8E1]">
      <header className="relative z-10 border-b border-[#E8E2D8] dark:border-[#34312B]">
        <div className="mx-auto flex w-full items-center justify-between px-5 py-4 sm:px-8 lg:px-12 2xl:px-16">
          <a href="#home" className="flex items-center gap-3" aria-label="MicroOptix home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CC5A2B] font-serif text-xl text-white">µ</span>
            <span>
              <span className="block font-serif text-lg font-semibold tracking-tight">MicroOptix</span>
              <span className="hidden text-[10px] uppercase tracking-[0.18em] text-[#78716C] dark:text-[#A8A29E] sm:block">Weather informed process studio</span>
            </span>
          </a>
          <nav className="flex items-center gap-4 sm:gap-7">
            <a href="#approach" className="hidden text-sm text-[#78716C] transition-colors hover:text-[#CC5A2B] dark:text-[#A8A29E] sm:inline">Approach</a>
            <button onClick={toggleTheme} aria-label="Toggle color theme" className="rounded-full border border-[#E8E2D8] p-2.5 text-[#78716C] transition-colors hover:bg-white dark:border-[#34312B] dark:hover:bg-[#292723]">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={onOpenDashboard} className="group inline-flex items-center gap-2 rounded-full bg-[#CC5A2B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B84A20]">
              Open studio <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </nav>
        </div>
      </header>

      <main id="home" className="mx-auto w-full px-5 sm:px-8 lg:px-12 2xl:px-16">
        <section className="grid min-h-[min(760px,calc(100svh-72px))] items-center gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:py-16">
          <div className="relative z-10 max-w-3xl py-5 lg:py-10">
            <div className="mb-7 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A29E]">
              <span className="h-px w-9 bg-[#CC5A2B]" /> Process, in context <span className="font-mono tracking-normal text-[#CC5A2B]">01 / 03</span>
            </div>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl 2xl:text-[6.5rem]">
              The atmosphere is part of the <em className="font-normal text-[#CC5A2B]">process.</em>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#78716C] dark:text-[#A8A29E] sm:text-lg sm:leading-8">
              See how local weather shifts machining outcomes. Bring live conditions into your process model, then shape a more considered operating setup.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <button onClick={onOpenDashboard} className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[#1F1E1D] px-6 text-sm font-medium text-white transition-all hover:bg-[#CC5A2B] dark:bg-[#EDE8E1] dark:text-[#1F1E1D] dark:hover:bg-[#E07A5F]">
                Explore the studio <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#approach" className="inline-flex items-center gap-2 text-sm text-[#78716C] hover:text-[#CC5A2B] dark:text-[#A8A29E]">
                How it works <ArrowDownRight size={15} />
              </a>
            </div>
            <div className="mt-14 flex items-center gap-3 text-xs text-[#78716C] dark:text-[#A8A29E]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E8E2D8] font-mono text-[10px] dark:border-[#34312B]">IN</span>
              Built around Indian locations <span className="h-px w-12 bg-[#E8E2D8] dark:bg-[#34312B]" /> Current weather, considered locally
            </div>
          </div>

          <figure className="studio-art relative mx-auto flex min-h-[400px] w-full max-w-[760px] items-center justify-center overflow-hidden rounded-[2rem] border border-[#E8E2D8] bg-[#F3EFEA] dark:border-[#39362F] dark:bg-[#211F1C] sm:min-h-[500px] lg:min-h-[590px]">
            <div className="absolute left-7 top-7 z-10 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#78716C] dark:text-[#A8A29E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CC5A2B]" /> Environmental study <span className="text-[#CC5A2B]">/ 24.07</span>
            </div>
            <div className="absolute bottom-7 left-7 z-10 text-[10px] font-mono uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]">Fig. 01 <span className="ml-2 normal-case tracking-normal">Weather to workpiece</span></div>
            <div className="absolute right-7 top-7 z-10 text-right text-[10px] font-mono uppercase tracking-[0.14em] text-[#78716C] dark:text-[#A8A29E]">T∞ <span className="text-[#CC5A2B]">→</span> MRR</div>

            <svg className="relative z-[1] h-full w-full max-w-[700px] p-8 sm:p-12" viewBox="0 0 640 500" fill="none" role="img" aria-label="An abstract diagram connecting atmospheric conditions with machining output">
              <defs>
                <linearGradient id="orbit" x1="130" y1="70" x2="510" y2="420" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D87550" />
                  <stop offset="1" stopColor="#E8B99E" stopOpacity=".28" />
                </linearGradient>
                <linearGradient id="signal" x1="107" y1="303" x2="544" y2="210" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CC5A2B" stopOpacity=".18" />
                  <stop offset=".52" stopColor="#CC5A2B" />
                  <stop offset="1" stopColor="#CC5A2B" stopOpacity=".42" />
                </linearGradient>
              </defs>
              <circle cx="320" cy="250" r="176" stroke="url(#orbit)" strokeWidth="1.4" />
              <circle cx="320" cy="250" r="132" stroke="#BFB6AA" strokeOpacity=".55" strokeDasharray="3 8" />
              <circle cx="320" cy="250" r="82" fill="#CC5A2B" fillOpacity=".07" stroke="#CC5A2B" strokeOpacity=".32" />
              <path d="M143 251C185 251 193 224 226 224C261 224 261 293 300 293C339 293 341 184 379 184C416 184 412 251 449 251C483 251 491 226 522 226" stroke="url(#signal)" strokeWidth="3" strokeLinecap="round" />
              <path d="M320 75V113M495 250H457M320 425V387M145 250H183" stroke="#CC5A2B" strokeOpacity=".55" strokeWidth="1.2" />
              <circle cx="320" cy="250" r="13" fill="#CC5A2B" />
              <circle cx="320" cy="250" r="4" fill="#FAF8F5" />
              <circle cx="226" cy="224" r="5" fill="#F3EFEA" stroke="#CC5A2B" strokeWidth="2" />
              <circle cx="379" cy="184" r="5" fill="#F3EFEA" stroke="#CC5A2B" strokeWidth="2" />
              <text x="290" y="54" fill="#78716C" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2">AMBIENT</text>
              <text x="484" y="270" fill="#78716C" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2">OUTPUT</text>
              <text x="268" y="475" fill="#78716C" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2">MATERIAL / ENERGY</text>
              <text x="78" y="270" fill="#78716C" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2">INPUT</text>
            </svg>

            <div className="absolute bottom-[19%] right-[8%] z-10 rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5]/90 px-4 py-3 shadow-lg shadow-[#5C3A2B]/5 backdrop-blur dark:border-[#39362F] dark:bg-[#292723]/90">
              <p className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#78716C] dark:text-[#A8A29E]">Model response</p>
              <p className="mt-1 font-serif text-lg text-[#1F1E1D] dark:text-[#EDE8E1]">Measured. Adaptable.</p>
            </div>
          </figure>
        </section>

        <section id="approach" className="border-t border-[#E8E2D8] py-12 dark:border-[#34312B] sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CC5A2B]">A considered workflow</p>
              <h2 className="mt-3 max-w-sm font-serif text-3xl leading-tight tracking-tight sm:text-4xl">From local air to a better setup.</h2>
            </div>
            <div className="grid gap-0 sm:grid-cols-3">
              {[
                ['01', 'Choose a place', 'Select an Indian state and city to set the local context.'],
                ['02', 'Read the conditions', 'Current temperature, humidity, pressure and wind inform the model.'],
                ['03', 'Shape the process', 'Compare predicted targets and tune settings around the conditions.']
              ].map(([number, title, description]) => (
                <article key={number} className="border-t border-[#E8E2D8] py-5 dark:border-[#34312B] sm:px-5 sm:first:pl-0 sm:last:pr-0 sm:first:border-t">
                  <span className="font-mono text-[10px] tracking-widest text-[#CC5A2B]">{number} / 03</span>
                  <h3 className="mt-4 font-serif text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#78716C] dark:text-[#A8A29E]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8E2D8] py-5 dark:border-[#34312B]">
        <div className="mx-auto flex w-full items-center justify-between px-5 text-xs text-[#78716C] dark:text-[#A8A29E] sm:px-8 lg:px-12 2xl:px-16">
          <span className="font-serif text-sm font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">MicroOptix</span>
          <span className="font-mono text-[10px] uppercase tracking-widest">Weather · Process · Prediction</span>
        </div>
      </footer>
    </div>
  );
}
