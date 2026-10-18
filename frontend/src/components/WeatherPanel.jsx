import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind,
  Droplets,
  Gauge,
  Flame,
  Snowflake,
  RefreshCw,
  Sliders,
  Check,
  AlertTriangle,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { ANOMALY_PRESETS, CITIES_BY_STATE, INDIAN_STATES_AND_UTS, fetchLiveWeather, searchCities } from '../services/weatherApi';
import IndiaStateMap from './IndiaStateMap';

export default function WeatherPanel({ weatherContext, onWeatherChange }) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Live mode uses fetched conditions; anomaly mode applies offsets to them.
  const [mode, setMode] = useState('normal'); // 'normal' | 'anomaly'
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [anomalyEditor, setAnomalyEditor] = useState('presets');

  // Custom delta sliders
  const [deltaTemp, setDeltaTemp] = useState(0);
  const [deltaHumidity, setDeltaHumidity] = useState(0);
  const [deltaPressure, setDeltaPressure] = useState(0);
  const [deltaWind, setDeltaWind] = useState(0);
  const [deltaPrecipitation, setDeltaPrecipitation] = useState(0);
  const [deltaCloudCover, setDeltaCloudCover] = useState(0);
  const scenarioRef = useRef(null);
  scenarioRef.current = { mode, selectedAnomaly, deltaTemp, deltaHumidity, deltaPressure, deltaWind, deltaPrecipitation, deltaCloudCover };

  // Load current conditions when the city changes and refresh periodically.
  useEffect(() => {
    if (!selectedCity) return undefined;
    let isMounted = true;
    async function load() {
      setIsFetchingWeather(true);
      const data = await fetchLiveWeather(selectedCity.lat, selectedCity.lon, selectedCity.name, selectedCity);
      if (isMounted) {
        setIsFetchingWeather(false);
        const scenario = scenarioRef.current;
        updateContext(data, scenario.mode === 'anomaly', scenario.selectedAnomaly, scenario.deltaTemp, scenario.deltaHumidity, scenario.deltaPressure, scenario.deltaWind, scenario.deltaPrecipitation, scenario.deltaCloudCover);
      }
    }
    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCity, refreshKey]);

  // Resolve the selected city to coordinates before requesting its weather.
  useEffect(() => {
    if (!selectedState || !selectedCityName) return undefined;
    let isMounted = true;
    const loadCityLocation = async () => {
      setIsFetchingWeather(true);
      const results = await searchCities(selectedCityName, selectedState);
      if (!isMounted) return;
      const city = results.find(result => result.name.toLowerCase() === selectedCityName.toLowerCase()) || results[0];
      if (city) {
        setSelectedCity({ ...city, selected_state: selectedState });
      } else {
        setSelectedCity(null);
        setIsFetchingWeather(false);
      }
    };
    loadCityLocation();
    return () => { isMounted = false; };
  }, [selectedState, selectedCityName]);

  const updateContext = (baseWeather, isAnomaly, anomalyObj, dTemp, dHum, dPress, dWind = 0, dPrecip = 0, dCloud = 0) => {
    const ctx = {
      city_name: baseWeather.city_name,
      region_name: baseWeather.region_name || '',
      country_name: baseWeather.country_name || '',
      temperature: baseWeather.temperature,
      relative_humidity: baseWeather.relative_humidity,
      pressure: baseWeather.pressure,
      wind_speed: baseWeather.wind_speed,
      precipitation: baseWeather.precipitation ?? 0,
      cloud_cover: baseWeather.cloud_cover ?? 0,
      weather_condition: baseWeather.weather_condition,
      is_anomaly: isAnomaly,
      anomaly_type: isAnomaly ? (anomalyObj?.name || 'Custom Anomaly') : null,
      delta_temperature: isAnomaly ? dTemp : 0.0,
      delta_humidity: isAnomaly ? dHum : 0.0,
      delta_pressure: isAnomaly ? dPress : 0.0,
      delta_wind_speed: isAnomaly ? dWind : 0.0,
      delta_precipitation: isAnomaly ? dPrecip : 0.0,
      delta_cloud_cover: isAnomaly ? dCloud : 0.0,
      is_live: baseWeather.is_live,
      timestamp: baseWeather.timestamp
    };
    onWeatherChange(ctx);
  };

  const selectState = (state) => {
    setSelectedState(state);
    setSelectedCityName('');
    setSelectedCity(null);
    onWeatherChange(null);
  };

  const handleStateChange = (event) => selectState(event.target.value);

  const handleCityChange = (event) => {
    setSelectedCityName(event.target.value);
    setSelectedCity(null);
    onWeatherChange(null);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (!weatherContext) return;
    if (newMode === 'normal') {
      setSelectedAnomaly(null);
      setDeltaTemp(0);
      setDeltaHumidity(0);
      setDeltaPressure(0);
      setDeltaWind(0); setDeltaPrecipitation(0); setDeltaCloudCover(0);
      updateContext(weatherContext, false, null, 0, 0, 0);
    } else {
      // Start with observed conditions; the user chooses a preset or custom offsets.
      setAnomalyEditor('presets');
      setSelectedAnomaly(null);
      setDeltaTemp(0);
      setDeltaHumidity(0);
      setDeltaPressure(0);
      setDeltaWind(0); setDeltaPrecipitation(0); setDeltaCloudCover(0);
      updateContext(weatherContext, true, null, 0, 0, 0);
    }
  };

  const handleSelectAnomalyPreset = (preset) => {
    setAnomalyEditor('presets');
    setSelectedAnomaly(preset);
    setDeltaTemp(preset.deltas.temp);
    setDeltaHumidity(preset.deltas.humidity);
    setDeltaPressure(preset.deltas.pressure);
    setDeltaWind(preset.deltas.wind ?? 0); setDeltaPrecipitation(preset.deltas.precipitation ?? 0); setDeltaCloudCover(preset.deltas.cloud ?? 0);
    updateContext(weatherContext, true, preset, preset.deltas.temp, preset.deltas.humidity, preset.deltas.pressure, preset.deltas.wind ?? 0, preset.deltas.precipitation ?? 0, preset.deltas.cloud ?? 0);
  };

  const handleDeltaChange = (type, val) => {
    setSelectedAnomaly(null);
    let t = deltaTemp;
    let h = deltaHumidity;
    let p = deltaPressure;
    if (type === 'temp') { t = val; setDeltaTemp(val); }
    if (type === 'humidity') { h = val; setDeltaHumidity(val); }
    if (type === 'pressure') { p = val; setDeltaPressure(val); }
    const w = type === 'wind' ? val : deltaWind;
    const pr = type === 'precipitation' ? val : deltaPrecipitation;
    const c = type === 'cloud' ? val : deltaCloudCover;
    if (type === 'wind') setDeltaWind(val);
    if (type === 'precipitation') setDeltaPrecipitation(val);
    if (type === 'cloud') setDeltaCloudCover(val);
    updateContext(weatherContext, true, null, t, h, p, w, pr, c);
  };

  // Weather Icon renderer
  const renderWeatherIcon = () => {
    const cond = (weatherContext?.weather_condition || '').toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return <Sun className="w-5 h-5 text-amber-500" />;
    if (cond.includes('rain')) return <CloudRain className="w-5 h-5 text-sky-500" />;
    if (cond.includes('thunder')) return <CloudLightning className="w-5 h-5 text-amber-500" />;
    if (cond.includes('snow')) return <CloudSnow className="w-5 h-5 text-indigo-300" />;
    return <Cloud className="w-5 h-5 text-stone-400" />;
  };

  const effectiveTemp = ((weatherContext?.temperature ?? 20) + (mode === 'anomaly' ? deltaTemp : 0)).toFixed(1);
  const effectiveHumidity = Math.min(100, Math.max(0, (weatherContext?.relative_humidity ?? 50) + (mode === 'anomaly' ? deltaHumidity : 0))).toFixed(0);
  const effectivePressure = Math.max(850, (weatherContext?.pressure ?? 1013) + (mode === 'anomaly' ? deltaPressure : 0)).toFixed(1);
  const effectiveWind = Math.max(0, (weatherContext?.wind_speed ?? 3.5) + (mode === 'anomaly' ? deltaWind : 0)).toFixed(1);
  const effectivePrecipitation = Math.max(0, (weatherContext?.precipitation ?? 0) + (mode === 'anomaly' ? deltaPrecipitation : 0)).toFixed(1);
  const effectiveCloudCover = Math.min(100, Math.max(0, (weatherContext?.cloud_cover ?? 0) + (mode === 'anomaly' ? deltaCloudCover : 0))).toFixed(0);

  return (
    <div className="weather-panel claude-card p-4 sm:p-6 transition-all duration-200">
      
      {/* Top Header: Atmospheric Context & Mode Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8] dark:border-[#34312B]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CC5A2B] animate-pulse" />
            <h3 className="font-serif text-lg font-semibold text-[#1F1E1D] dark:text-[#EDE8E1] tracking-tight">
              Weather conditions
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#292723] border border-[#E8E2D8] dark:border-[#34312B] text-[#78716C] dark:text-[#A8A29E]">
              {mode === 'anomaly' ? 'Live + simulated offsets' : 'Live conditions'}
            </span>
          </div>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
            Current conditions are included in each prediction.
          </p>
        </div>

        {/* Minimalist Switcher: Normal Live vs Anomaly Stress-Test */}
        <div className="weather-mode-switch flex items-center p-1 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B]">
          <button
            type="button"
            disabled={!weatherContext}
            onClick={() => handleModeSwitch('normal')}
            aria-pressed={mode === 'normal'}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'normal'
                ? 'bg-white dark:bg-[#22201D] text-[#1F1E1D] dark:text-[#EDE8E1] shadow-sm font-semibold'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1F1E1D]'
            }`}
          >
            Live weather
          </button>
          <button
            type="button"
            disabled={!weatherContext}
            onClick={() => handleModeSwitch('anomaly')}
            aria-pressed={mode === 'anomaly'}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'anomaly'
                ? 'bg-[#CC5A2B] text-white shadow-sm font-semibold'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1F1E1D]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Anomaly test</span>
          </button>
        </div>
      </div>

      {/* State map and location selection */}
      <div className="weather-location-layout grid items-center gap-4 py-3 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)]">
        <IndiaStateMap selectedState={selectedState} onSelectState={selectState} />
        <div className="space-y-3">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">

          <label className="sm:w-64 shrink-0">
            <span className="sr-only">Indian state or union territory</span>
            <select
              value={selectedState}
              onChange={handleStateChange}
              aria-label="Select an Indian state or union territory"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-[#1F1E1D] dark:text-[#EDE8E1] focus:outline-none focus:border-[#CC5A2B]"
            >
              <option value="">Select an Indian state or UT</option>
              {INDIAN_STATES_AND_UTS.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>

          <label className="sm:w-64 shrink-0">
            <span className="sr-only">City</span>
            <select
              value={selectedCityName}
              onChange={handleCityChange}
              disabled={!selectedState}
              aria-label="Select a city"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] text-[#1F1E1D] dark:text-[#EDE8E1] focus:outline-none focus:border-[#CC5A2B]"
            >
              <option value="">{selectedState ? 'Select a city' : 'Select a state first'}</option>
              {(CITIES_BY_STATE[selectedState] || []).map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </label>
          
          </div>

          {!selectedState && <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">Select a state, then choose a city to load its weather.</p>}
          {selectedCity && <div className="flex items-center gap-2 text-xs text-[#78716C] dark:text-[#A8A29E]">
            <span>Weather for {selectedCity.name}</span>
            <span className={weatherContext?.is_live ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>{isFetchingWeather ? 'Updating weather' : weatherContext?.is_live ? 'Live' : 'Sample data'}</span>
            <button type="button" onClick={() => setRefreshKey(key => key + 1)} disabled={isFetchingWeather} aria-label="Refresh weather" title="Refresh weather" className="rounded p-1 hover:text-[#CC5A2B] disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${isFetchingWeather ? 'animate-spin' : ''}`} />
            </button>
          </div>}
          {selectedCity && !weatherContext && <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">Loading current weather for {selectedCity.name}...</p>}

          {/* Current weather metrics fill the space below the location controls. */}
          {weatherContext && <div className="grid grid-cols-2 gap-3 pt-1 xl:grid-cols-4">
            <div className="min-w-0 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 dark:border-[#34312B] dark:bg-[#181715]">
              <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]"><span>Ambient Temp</span>{renderWeatherIcon()}</div>
              <div className="flex items-baseline gap-1"><span className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{effectiveTemp}</span><span className="font-mono text-xs text-[#78716C]">°C</span></div>
              <div className="mt-0.5 truncate text-[11px] text-[#78716C]">{weatherContext.weather_condition || 'Clear'}</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 dark:border-[#34312B] dark:bg-[#181715]">
              <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]"><span>Rel. Humidity</span><Droplets className="h-4 w-4 text-sky-500" /></div>
              <div className="flex items-baseline gap-1"><span className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{effectiveHumidity}</span><span className="font-mono text-xs text-[#78716C]">%</span></div>
              <div className="mt-0.5 truncate text-[11px] text-[#78716C]">{effectiveHumidity > 65 ? 'High Moisture' : 'Nominal'}</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 dark:border-[#34312B] dark:bg-[#181715]">
              <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]"><span>Barometric Press.</span><Gauge className="h-4 w-4 text-emerald-500" /></div>
              <div className="flex items-baseline gap-1"><span className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{effectivePressure}</span><span className="font-mono text-xs text-[#78716C]">hPa</span></div>
              <div className="mt-0.5 truncate text-[11px] text-[#78716C]">{effectivePressure < 1000 ? 'Low Pressure' : 'Standard'}</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 dark:border-[#34312B] dark:bg-[#181715]">
              <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]"><span>Wind / Airflow</span><Wind className="h-4 w-4 text-teal-500" /></div>
              <div className="flex items-baseline gap-1"><span className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{effectiveWind}</span><span className="font-mono text-xs text-[#78716C]">m/s</span></div>
              <div className="mt-0.5 truncate text-[11px] text-[#78716C]">Convective cooling</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 dark:border-[#34312B] dark:bg-[#181715]">
              <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]"><span>Precipitation</span><CloudRain className="h-4 w-4 text-sky-500" /></div>
              <div className="flex items-baseline gap-1"><span className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{effectivePrecipitation}</span><span className="font-mono text-xs text-[#78716C]">mm</span></div>
              <div className="mt-0.5 truncate text-[11px] text-[#78716C]">Current interval</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 dark:border-[#34312B] dark:bg-[#181715]">
              <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]"><span>Cloud cover</span><Cloud className="h-4 w-4 text-slate-500" /></div>
              <div className="flex items-baseline gap-1"><span className="font-serif text-xl font-bold text-[#1F1E1D] dark:text-[#EDE8E1]">{effectiveCloudCover}</span><span className="font-mono text-xs text-[#78716C]">%</span></div>
              <div className="mt-0.5 truncate text-[11px] text-[#78716C]">Sky coverage</div>
            </div>
          </div>}
        </div>
      </div>

      {/* ANOMALIES SECTION (Shows when mode === 'anomaly') */}
      <AnimatePresence>
        {mode === 'anomaly' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 pt-5 border-t border-[#E8E2D8] dark:border-[#34312B] space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#CC5A2B] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Choose an anomaly
              </span>
              <span className="text-[11px] text-[#78716C]">Scenarios are layered over observed weather</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="tablist" aria-label="Anomaly setup method">
              <button type="button" role="tab" aria-selected={anomalyEditor === 'presets'} onClick={() => {
                setAnomalyEditor('presets');
                setSelectedAnomaly(null);
                setDeltaTemp(0); setDeltaHumidity(0); setDeltaPressure(0); setDeltaWind(0); setDeltaPrecipitation(0); setDeltaCloudCover(0);
                updateContext(weatherContext, true, null, 0, 0, 0);
              }} className={`rounded-xl border px-4 py-3 text-left transition-colors ${anomalyEditor === 'presets' ? 'border-[#CC5A2B] bg-[#CC5A2B]/5' : 'border-[#E8E2D8] bg-white dark:border-[#34312B] dark:bg-[#22201D]'}`}>
                <span className="block text-sm font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">Predefined scenarios</span>
                <span className="mt-0.5 block text-xs text-[#78716C] dark:text-[#A8A29E]">Drought, flood, heatwave, cold wave and cyclone</span>
              </button>
              <button type="button" role="tab" aria-selected={anomalyEditor === 'custom'} onClick={() => {
                setAnomalyEditor('custom');
                setSelectedAnomaly(null);
                setDeltaTemp(0); setDeltaHumidity(0); setDeltaPressure(0); setDeltaWind(0); setDeltaPrecipitation(0); setDeltaCloudCover(0);
                updateContext(weatherContext, true, null, 0, 0, 0);
              }} className={`rounded-xl border px-4 py-3 text-left transition-colors ${anomalyEditor === 'custom' ? 'border-[#CC5A2B] bg-[#CC5A2B]/5' : 'border-[#E8E2D8] bg-white dark:border-[#34312B] dark:bg-[#22201D]'}`}>
                <span className="block text-sm font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">Custom conditions</span>
                <span className="mt-0.5 block text-xs text-[#78716C] dark:text-[#A8A29E]">Adjust weather values from the API reading</span>
              </button>
            </div>

            {/* Anomaly Preset Pills */}
            {anomalyEditor === 'presets' && <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-5 sm:gap-2.5">
              {ANOMALY_PRESETS.map((preset) => {
                const isSelected = selectedAnomaly?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectAnomalyPreset(preset)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#FAF8F5] dark:bg-[#292723] border-[#CC5A2B] shadow-sm'
                        : 'bg-white dark:bg-[#22201D] border-[#E8E2D8] dark:border-[#34312B] hover:border-[#CC5A2B]/40'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#1F1E1D] dark:text-[#EDE8E1]">
                      {preset.name}
                    </div>
                    <p className="text-xs leading-5 text-[#78716C] dark:text-[#A8A29E] mt-1">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>}

            {/* Fine-tune Anomaly Sliders */}
            {anomalyEditor === 'custom' && <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#181715] border border-[#E8E2D8] dark:border-[#34312B] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#1F1E1D] dark:text-[#EDE8E1]">
                <span>Adjust from observed conditions</span>
                <button type="button" onClick={() => { setDeltaTemp(0); setDeltaHumidity(0); setDeltaPressure(0); setDeltaWind(0); setDeltaPrecipitation(0); setDeltaCloudCover(0); updateContext(weatherContext, true, null, 0, 0, 0, 0, 0, 0); }} className="text-[11px] text-[#CC5A2B]">Reset adjustments</button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
                {/* Delta Temp */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#78716C]">Δ Temperature</span>
                    <span className="font-mono font-bold text-[#CC5A2B]">{deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp} °C</span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="1"
                    value={deltaTemp}
                    onChange={(e) => handleDeltaChange('temp', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Delta Humidity */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#78716C]">Δ Humidity</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{deltaHumidity > 0 ? `+${deltaHumidity}` : deltaHumidity} %</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="2"
                    value={deltaHumidity}
                    onChange={(e) => handleDeltaChange('humidity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1"><span className="text-[#78716C]">Wind speed change</span><span className="font-mono font-bold text-teal-600 dark:text-teal-400">{deltaWind > 0 ? `+${deltaWind}` : deltaWind} m/s</span></div>
                  <input type="range" min="-10" max="25" step="1" value={deltaWind} onChange={(e) => handleDeltaChange('wind', Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1"><span className="text-[#78716C]">Precipitation change</span><span className="font-mono font-bold text-sky-600 dark:text-sky-400">{deltaPrecipitation > 0 ? `+${deltaPrecipitation}` : deltaPrecipitation} mm</span></div>
                  <input type="range" min="-10" max="30" step="1" value={deltaPrecipitation} onChange={(e) => handleDeltaChange('precipitation', Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1"><span className="text-[#78716C]">Cloud cover change</span><span className="font-mono font-bold text-slate-600 dark:text-slate-300">{deltaCloudCover > 0 ? `+${deltaCloudCover}` : deltaCloudCover} %</span></div>
                  <input type="range" min="-100" max="100" step="5" value={deltaCloudCover} onChange={(e) => handleDeltaChange('cloud', Number(e.target.value))} className="w-full" />
                </div>
                {/* Delta Pressure */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#78716C]">Δ Barometric Pressure</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{deltaPressure > 0 ? `+${deltaPressure}` : deltaPressure} hPa</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="40"
                    step="2"
                    value={deltaPressure}
                    onChange={(e) => handleDeltaChange('pressure', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-[11px] leading-5 text-[#78716C] dark:text-[#A8A29E]">Wind, precipitation and cloud cover adjust the atmospheric stability score. Temperature, humidity, pressure and machine settings also shape the process target estimates.</p>
            </div>}

          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
