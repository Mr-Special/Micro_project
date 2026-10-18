import {
  calculateLocalPredictions,
  runLocalOptimization,
  calculateLocalSensitivity,
  PARAM_CONFIGS,
  PRESETS_DATA
} from './surrogate';

const STORAGE_KEY_BACKEND_URL = 'microoptix_backend_url';

export function getStoredBackendUrl() {
  const custom = localStorage.getItem(STORAGE_KEY_BACKEND_URL);
  if (custom) return custom.trim().replace(/\/$/, '');
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.trim().replace(/\/$/, '');
  return 'https://microoptix-ai-backend.onrender.com';
}

export function setStoredBackendUrl(url) {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_BACKEND_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_BACKEND_URL, url.trim().replace(/\/$/, ''));
  }
}

export async function pingBackend(baseUrl = getStoredBackendUrl(), timeoutMs = 4500) {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const latency = Math.round(performance.now() - start);
      return { online: true, latency, data };
    }
    return { online: false, latency: null, error: `HTTP ${res.status}` };
  } catch (err) {
    return { online: false, latency: null, error: err.name === 'AbortError' ? 'Timeout' : err.message };
  }
}

export async function fetchPrediction(params, weather = null, backendUrl = getStoredBackendUrl()) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${backendUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        weather: weather
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { data, source: 'remote' };
    }
    throw new Error(`API returned ${res.status}`);
  } catch (err) {
    const local = calculateLocalPredictions(params, weather);
    return { data: local, source: 'local' };
  }
}

export async function fetchOptimization(currentParams, objective, weather = null, backendUrl = getStoredBackendUrl()) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${backendUrl}/api/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_parameters: currentParams,
        objective: objective,
        weather: weather
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { data, source: 'remote' };
    }
    throw new Error(`API returned ${res.status}`);
  } catch (err) {
    const local = runLocalOptimization(currentParams, objective, weather);
    return { data: local, source: 'local' };
  }
}

export async function fetchSensitivity(currentParams, sweepParam, weather = null, backendUrl = getStoredBackendUrl()) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${backendUrl}/api/sensitivity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_parameters: currentParams,
        sweep_parameter: sweepParam,
        weather: weather,
        steps: 25
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { data, source: 'remote' };
    }
    throw new Error(`API returned ${res.status}`);
  } catch (err) {
    const local = calculateLocalSensitivity(currentParams, sweepParam, weather, 25);
    return { data: local, source: 'local' };
  }
}

export async function fetchPresets(backendUrl = getStoredBackendUrl()) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${backendUrl}/api/presets`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.presets;
    }
    return PRESETS_DATA;
  } catch {
    return PRESETS_DATA;
  }
}
