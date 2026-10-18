import React, { useEffect, useMemo, useState } from 'react';
import { INDIAN_STATES_AND_UTS } from '../services/weatherApi';

const BOUNDARIES_URL = '/india_states.geojson';
const WIDTH = 360;
const HEIGHT = 390;
const PADDING = 10;

function normalizeName(value = '') {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
  if (normalized === 'orissa') return 'odisha';
  if (normalized === 'uttaranchal') return 'uttarakhand';
  if (normalized === 'nct of delhi') return 'delhi';
  if (normalized === 'andaman and nicobar') return 'andaman and nicobar islands';
  if (normalized === 'dadra and nagar haveli' || normalized === 'daman and diu') return 'dadra and nagar haveli and daman and diu';
  return normalized;
}

function getFeatureName(feature) {
  const properties = feature.properties || {};
  return properties.shapeName || properties.NAME_1 || properties.ST_NM || properties.state_name || properties.admin1 || properties.state || properties.name || properties.NAME || '';
}

function collectPositions(value, positions) {
  if (!Array.isArray(value)) return;
  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    positions.push(value);
    return;
  }
  value.forEach(child => collectPositions(child, positions));
}

function getRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  return [];
}

export default function IndiaStateMap({ selectedState, onSelectState }) {
  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, 12000);
    fetch(BOUNDARIES_URL, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Map request failed: ${response.status}`);
        return response.json();
      })
      .then(data => {
        clearTimeout(timeout);
        if (!Array.isArray(data.features)) throw new Error('Map data is unavailable');
        setFeatures(data.features);
        setStatus('ready');
      })
      .catch(error => {
        clearTimeout(timeout);
        if (error.name !== 'AbortError' || didTimeout) setStatus('error');
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const mapFeatures = useMemo(() => {
    if (!features.length) return [];
    const positions = [];
    features.forEach(feature => collectPositions(feature.geometry?.coordinates, positions));
    if (!positions.length) return [];

    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    positions.forEach(([longitude, latitude]) => {
      minLon = Math.min(minLon, longitude);
      maxLon = Math.max(maxLon, longitude);
      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
    });
    const spanLon = Math.max(maxLon - minLon, 1);
    const spanLat = Math.max(maxLat - minLat, 1);
    const scale = Math.min((WIDTH - PADDING * 2) / spanLon, (HEIGHT - PADDING * 2) / spanLat);
    const mapWidth = spanLon * scale;
    const mapHeight = spanLat * scale;
    const offsetX = (WIDTH - mapWidth) / 2;
    const offsetY = (HEIGHT - mapHeight) / 2;
    const project = ([longitude, latitude]) => [
      offsetX + (longitude - minLon) * scale,
      HEIGHT - offsetY - (latitude - minLat) * scale
    ];

    return features.map((feature, index) => {
      const name = getFeatureName(feature);
      const rings = getRings(feature.geometry);
      const d = rings.map(ring => ring.map((point, pointIndex) => {
        const [x, y] = project(point);
        return `${pointIndex === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ') + ' Z').join(' ');
      return { id: feature.id || index, name, normalizedName: normalizeName(name), d };
    }).filter(feature => feature.name && feature.d);
  }, [features]);

  return (
    <section className="rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3 dark:border-[#34312B] dark:bg-[#181715]" aria-label="Select an Indian state on the map">
      <div className="flex items-baseline justify-between px-1">
        <h4 className="text-sm font-semibold">India</h4>
        <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">Select a state</span>
      </div>

      {status === 'loading' && <div className="flex h-56 items-center justify-center text-xs text-[#78716C]">Loading state map…</div>}
      {status === 'error' && <div className="flex h-56 items-center justify-center px-5 text-center text-xs text-[#78716C]">State boundaries could not be loaded. Choose a state from the list.</div>}
      {status === 'ready' && (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto block h-56 w-full max-w-[260px] overflow-visible sm:h-64" role="group" aria-label="Map of India states and union territories">
          {mapFeatures.map(feature => {
            const active = normalizeName(selectedState) === feature.normalizedName;
            const matchingState = INDIAN_STATES_AND_UTS.find(state => normalizeName(state) === feature.normalizedName);
            const stateValue = matchingState || feature.name;
            return (
              <path
                key={feature.id}
                d={feature.d}
                fill={active ? '#CC5A2B' : '#E8E2D8'}
                stroke={active ? '#9F3F1C' : '#A8A29E'}
                strokeWidth={active ? 1.5 : 0.8}
                strokeLinejoin="round"
                fillRule="evenodd"
                className="cursor-pointer transition-colors hover:fill-[#D98766] focus:outline-none focus:stroke-[#9F3F1C]"
                role="button"
                tabIndex={0}
                aria-label={`Select ${stateValue}`}
                aria-pressed={active}
                onClick={() => onSelectState(stateValue)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectState(stateValue);
                  }
                }}
              >
                <title>{feature.name}</title>
              </path>
            );
          })}
        </svg>
      )}
      <p className="px-1 text-[10px] leading-4 text-[#78716C] dark:text-[#A8A29E]">
        State boundary data: <a href="https://github.com/srisbalyan/India-Administrative-Maps/blob/main/india_states.json" target="_blank" rel="noreferrer" className="underline underline-offset-2">India Administrative Maps</a>
      </p>
    </section>
  );
}
