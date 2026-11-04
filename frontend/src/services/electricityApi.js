import { getDefaultBackendUrl } from '../config';
import { optimizeWeather, predictElectricity } from './electricity';

const BACKEND_URL_KEY = 'microoptix_backend_url';

function getBackendUrl() {
  const configured = localStorage.getItem(BACKEND_URL_KEY);
  return (configured || getDefaultBackendUrl()).trim().replace(/\/$/, '');
}

export async function fetchElectricityPrediction(weather) {
  const local = predictElectricity(weather);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(`${getBackendUrl()}/api/electricity-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weather }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Electricity model returned HTTP ${response.status}`);
    const result = await response.json();
    return {
      consumption: result.consumption_mu,
      baseline: result.baseline_mu,
      variance: result.uncertainty_mu,
      stress: result.stress_status,
      modelLoaded: Boolean(result.model_loaded),
      modelName: result.model_name,
      predictionSource: result.source,
      trainingYearMax: result.training_year_max
    };
  } catch {
    return { ...local, modelLoaded: false, modelName: 'Local weather estimate', predictionSource: 'local_fallback' };
  }
}

async function postElectricity(path, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${getBackendUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Electricity API returned HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchElectricityTemperatureSweep(weather, temperatures) {
  try {
    const result = await postElectricity('/api/electricity-sensitivity', { weather, temperatures });
    return result.data;
  } catch {
    return null;
  }
}

export async function fetchElectricityWeatherOptimization(weather, target) {
  try {
    const result = await postElectricity('/api/electricity-optimize', { weather, target_mu: target });
    return {
      temperature: result.temperature,
      humidity: result.humidity,
      consumption: result.consumption_mu,
      error: result.error_mu,
      attainable: result.attainable,
      modelLoaded: result.model_loaded,
      modelName: result.model_name,
      predictionSource: result.source
    };
  } catch {
    return { ...optimizeWeather(weather, target), modelLoaded: false, predictionSource: 'local_fallback' };
  }
}
