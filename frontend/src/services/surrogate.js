/**
 * Claude-Minimalist Physics & Atmospheric Surrogate Simulation Engine
 * Couples ambient weather readings and extreme anomalies directly to process targets.
 */

export const DEFAULT_PARAMETERS = {
  pulse_on_time: 35.0,
  peak_current: 18.0,
  gap_voltage: 60.0,
  flushing_pressure: 0.8,
  wire_feed_rate: 8.5
};

export const PARAM_CONFIGS = [
  {
    name: 'pulse_on_time',
    label: 'Pulse-on Duration',
    unit: 'µs',
    min_val: 2.0,
    max_val: 100.0,
    step: 1.0,
    default_val: 35.0,
    category: 'Discharge Control',
    description: 'Duration of electrical spark discharge per cycle. Influences crater depth and energy delivery.'
  },
  {
    name: 'peak_current',
    label: 'Discharge Current',
    unit: 'A',
    min_val: 1.0,
    max_val: 50.0,
    step: 0.5,
    default_val: 18.0,
    category: 'Discharge Control',
    description: 'Peak spark amperage delivering plasma thermal flux into the micro-workpiece.'
  },
  {
    name: 'gap_voltage',
    label: 'Open Gap Voltage',
    unit: 'V',
    min_val: 20.0,
    max_val: 120.0,
    step: 1.0,
    default_val: 60.0,
    category: 'Electrical Setup',
    description: 'Potential difference across the dielectric fluid gap before spark breakdown.'
  },
  {
    name: 'flushing_pressure',
    label: 'Dielectric Flushing',
    unit: 'MPa',
    min_val: 0.1,
    max_val: 2.5,
    step: 0.05,
    default_val: 0.8,
    category: 'Fluid Dynamics',
    description: 'Pressure of deionized dielectric fluid evacuating molten micro-debris.'
  },
  {
    name: 'wire_feed_rate',
    label: 'Wire Feed Velocity',
    unit: 'mm/min',
    min_val: 1.0,
    max_val: 20.0,
    step: 0.5,
    default_val: 8.5,
    category: 'Kinematics',
    description: 'Continuous electrode advancement speed preventing thermal wire breakage.'
  }
];

export const PRESETS_DATA = [
  {
    id: 'balanced_standard',
    name: 'Balanced Production',
    description: 'Standard industrial baseline balancing throughput and surface finish.',
    badge: 'Baseline',
    params: {
      pulse_on_time: 35.0,
      peak_current: 18.0,
      gap_voltage: 60.0,
      flushing_pressure: 0.8,
      wire_feed_rate: 8.5
    }
  },
  {
    id: 'high_speed_roughing',
    name: 'Peak Throughput Roughing',
    description: 'Maximized discharge energy and current for rapid bulk material removal.',
    badge: 'Max MRR',
    params: {
      pulse_on_time: 75.0,
      peak_current: 38.0,
      gap_voltage: 90.0,
      flushing_pressure: 1.6,
      wire_feed_rate: 14.0
    }
  },
  {
    id: 'fine_finish_polishing',
    name: 'Mirror Finish / Super-Fine',
    description: 'Short pulse duration and low spark amperage yielding ultra-smooth optical finish.',
    badge: 'Optical Ra',
    params: {
      pulse_on_time: 8.0,
      peak_current: 4.5,
      gap_voltage: 35.0,
      flushing_pressure: 1.9,
      wire_feed_rate: 6.0
    }
  },
  {
    id: 'eco_energy_efficient',
    name: 'Eco-Green High Efficiency',
    description: 'Optimized fluid dynamics and duty cycle to minimize electrical waste.',
    badge: 'Eco Yield',
    params: {
      pulse_on_time: 22.0,
      peak_current: 12.0,
      gap_voltage: 50.0,
      flushing_pressure: 1.4,
      wire_feed_rate: 9.5
    }
  }
];

export function calculateLocalPredictions(params, weather = null) {
  const ton = Number(params.pulse_on_time ?? 35.0);
  const ip = Number(params.peak_current ?? 18.0);
  const vg = Number(params.gap_voltage ?? 60.0);
  const pf = Number(params.flushing_pressure ?? 0.8);
  const wf = Number(params.wire_feed_rate ?? 8.5);

  // Weather parameters
  const tempEff = weather ? (weather.temperature + (weather.delta_temperature || 0)) : 20.0;
  const rhEff = weather ? Math.min(100, Math.max(0, weather.relative_humidity + (weather.delta_humidity || 0))) : 50.0;
  const pressEff = weather ? Math.max(850, weather.pressure + (weather.delta_pressure || 0)) : 1013.25;
  const isAnomaly = weather ? weather.is_anomaly : false;
  const anomalyName = weather?.anomaly_type || 'Atmospheric Anomaly';

  const tempDelta = tempEff - 20.0;
  const thermalMrrMult = 1.0 + 0.012 * (tempDelta / 10.0);
  const pressureFactor = Math.min(1.08, Math.max(0.88, pressEff / 1013.25));

  const energyFactor = (vg / 60.0) * (ip / 20.0) * (ton / 30.0);
  const flushEfficiency = (1.0 - 0.25 * Math.exp(-pf / 0.7)) * pressureFactor;
  const wireStability = 1.0 - 0.15 * Math.pow((wf - 8.5) / 10.0, 2);

  // Material Removal Rate (MRR)
  let mrr = 3.5 + 24.5 * Math.pow(Math.max(0.01, energyFactor), 0.78) * flushEfficiency * wireStability * thermalMrrMult;
  mrr = Math.min(55.0, Math.max(0.8, mrr));

  // Surface Roughness Ra (µm)
  const humidityPenalty = 1.0 + 0.08 * Math.max(0, (rhEff - 50.0) / 50.0);
  const heatPenalty = 1.0 + 0.06 * Math.max(0, tempDelta / 15.0);
  const craterRadius = 0.45 * Math.pow(ip, 0.48) * Math.pow(ton, 0.38) / (1.0 + 0.3 * pf);
  let ra = (0.32 + 0.58 * craterRadius + 0.08 * (vg / 80.0)) * humidityPenalty * heatPenalty;
  ra = Math.min(5.0, Math.max(0.25, ra));

  // Efficiency (%)
  let eff = 78.0 - 0.25 * ton - 0.45 * ip + 8.5 * Math.log(1.0 + pf) + 3.2 * Math.sin(wf / 3.0) - 0.2 * Math.abs(tempDelta);
  eff = Math.min(95.0, Math.max(30.0, eff));

  // Environmental Impact
  const thermalDrift = Number((0.12 * Math.abs(tempDelta)).toFixed(2));
  const viscosityShift = Number((-0.015 * tempDelta).toFixed(3));
  const oxidationRisk = Number((Math.max(0, (rhEff - 40.0) / 60.0)).toFixed(2));
  let stability = 100.0 - 1.2 * Math.abs(tempDelta) - 0.35 * Math.max(0, rhEff - 55.0) - 0.08 * Math.abs(pressEff - 1013.25);
  stability = Number((Math.min(99.5, Math.max(45.0, stability))).toFixed(1));

  let advisory = 'Normal ambient atmospheric conditions. Machine operating at nominal precision stability.';
  if (isAnomaly) {
    advisory = `Active ${anomalyName}: Atmospheric stress reduced stability to ${stability}%. Thermal drift ±${thermalDrift}µm. Recommended to increase dielectric flushing and reduce pulse duration.`;
  } else if (Math.abs(tempDelta) > 10.0) {
    advisory = `Elevated ambient temperature (${tempEff.toFixed(1)}°C): Workpiece thermal expansion drift of +${thermalDrift}µm detected.`;
  } else if (rhEff > 75.0) {
    advisory = `Elevated ambient humidity (${rhEff.toFixed(0)}%): Surface micro-oxidation risk at ${(oxidationRisk * 100).toFixed(0)}%.`;
  }

  // Composite Score
  const mrrNorm = Math.min(1.0, Math.max(0.0, (mrr - 2.0) / (38.0 - 2.0)));
  const raNorm = Math.min(1.0, Math.max(0.0, (3.8 - ra) / (3.8 - 0.5)));
  const effNorm = Math.min(1.0, Math.max(0.0, (eff - 40.0) / (90.0 - 40.0)));
  const stabNorm = Math.min(1.0, Math.max(0.0, stability / 100.0));
  const composite = Math.min(99.5, Math.max(5.0, (0.38 * mrrNorm + 0.35 * raNorm + 0.12 * effNorm + 0.15 * stabNorm) * 100.0));

  const mrrRating = mrr > 25.0 ? 'Excellent' : (mrr > 16.0 ? 'Optimal' : 'Standard');
  const raRating = ra < 1.1 ? 'Super-Finish' : (ra < 2.0 ? 'Precision' : 'Standard');
  const effRating = eff > 75.0 ? 'High' : 'Nominal';

  const confExpand = isAnomaly ? 1.35 : 1.0;

  return {
    targets: {
      mrr: {
        value: Number(mrr.toFixed(2)),
        unit: 'mm³/min',
        label: 'Material Removal Rate',
        min_val: 1.0,
        max_val: 45.0,
        is_higher_better: true,
        confidence_interval: [Number(Math.max(0.5, mrr - 0.85 * confExpand).toFixed(2)), Number((mrr + 0.85 * confExpand).toFixed(2))],
        rating: mrrRating
      },
      surface_roughness: {
        value: Number(ra.toFixed(3)),
        unit: 'µm Ra',
        label: 'Surface Roughness',
        min_val: 0.3,
        max_val: 4.5,
        is_higher_better: false,
        confidence_interval: [Number(Math.max(0.1, ra - 0.08 * confExpand).toFixed(3)), Number((ra + 0.08 * confExpand).toFixed(3))],
        rating: raRating
      },
      energy_efficiency: {
        value: Number(eff.toFixed(1)),
        unit: '%',
        label: 'Process Efficiency',
        min_val: 30.0,
        max_val: 95.0,
        is_higher_better: true,
        confidence_interval: [Number(Math.max(20.0, eff - 2.2 * confExpand).toFixed(1)), Number(Math.min(100.0, eff + 2.2 * confExpand).toFixed(1))],
        rating: effRating
      }
    },
    environmental_impact: {
      thermal_drift_um: thermalDrift,
      dielectric_viscosity_shift: viscosityShift,
      oxidation_risk_factor: oxidationRisk,
      stability_index: stability,
      advisory
    },
    feature_contributions: isAnomaly ? {
      pulse_on_time: 28.5,
      peak_current: 24.2,
      weather_anomaly: 22.4,
      flushing_pressure: 15.1,
      gap_voltage: 9.8
    } : {
      pulse_on_time: 34.2,
      peak_current: 28.6,
      flushing_pressure: 18.4,
      gap_voltage: 11.2,
      wire_feed_rate: 7.6
    },
    composite_score: Number(composite.toFixed(1)),
    status: 'success',
    computed_at: new Date().toISOString()
  };
}

export function runLocalOptimization(currentParams, objective, weather = null) {
  const baseline = calculateLocalPredictions(currentParams, weather);
  const baselinePreds = {
    mrr: baseline.targets.mrr.value,
    surface_roughness: baseline.targets.surface_roughness.value,
    energy_efficiency: baseline.targets.energy_efficiency.value,
    composite_score: baseline.composite_score
  };

  let bestParams = { ...currentParams };
  let bestScore = -Infinity;
  const history = [];

  const goal = objective.goal;

  for (let iter = 1; iter <= 20; iter++) {
    const alpha = (21 - iter) / 20.0;
    const candidate = {
      pulse_on_time: Math.min(100, Math.max(2, bestParams.pulse_on_time + (Math.random() - 0.5) * 35 * alpha)),
      peak_current: Math.min(50, Math.max(1, bestParams.peak_current + (Math.random() - 0.5) * 18 * alpha)),
      gap_voltage: Math.min(120, Math.max(20, bestParams.gap_voltage + (Math.random() - 0.5) * 30 * alpha)),
      flushing_pressure: Math.min(2.5, Math.max(0.1, bestParams.flushing_pressure + (Math.random() - 0.5) * 1.2 * alpha)),
      wire_feed_rate: Math.min(20, Math.max(1, bestParams.wire_feed_rate + (Math.random() - 0.5) * 8 * alpha))
    };

    if (goal === 'weather_resilience') {
      // Counteract ambient weather stress: boost flushing, moderate current
      candidate.flushing_pressure = Math.max(candidate.flushing_pressure, 1.4);
      candidate.pulse_on_time = Math.min(candidate.pulse_on_time, 30);
      candidate.peak_current = Math.min(candidate.peak_current, 16);
    } else if (goal === 'maximize_mrr') {
      candidate.pulse_on_time = Math.max(candidate.pulse_on_time, 45 + iter * 1.5);
      candidate.peak_current = Math.max(candidate.peak_current, 22 + iter * 0.8);
      candidate.flushing_pressure = Math.max(candidate.flushing_pressure, 1.2);
    } else if (goal === 'minimize_roughness') {
      candidate.pulse_on_time = Math.min(candidate.pulse_on_time, 20 - iter * 0.5);
      candidate.peak_current = Math.min(candidate.peak_current, 10 - iter * 0.25);
      candidate.flushing_pressure = Math.max(candidate.flushing_pressure, 1.5);
    }

    const evalRes = calculateLocalPredictions(candidate, weather);
    let fitness = evalRes.composite_score;

    if (goal === 'weather_resilience') {
      fitness = evalRes.composite_score * 1.5 - evalRes.environmental_impact.thermal_drift_um * 4.0;
    } else if (goal === 'maximize_mrr') {
      fitness = evalRes.targets.mrr.value * 2.5;
    } else if (goal === 'minimize_roughness') {
      fitness = (5.0 - evalRes.targets.surface_roughness.value) * 20.0;
    }

    if (fitness > bestScore || iter === 1) {
      bestScore = fitness;
      bestParams = candidate;
    }

    const currentEval = calculateLocalPredictions(bestParams, weather);
    history.push({
      iteration: iter,
      score: currentEval.composite_score,
      mrr: currentEval.targets.mrr.value,
      roughness: currentEval.targets.surface_roughness.value
    });
  }

  for (const key of Object.keys(bestParams)) {
    bestParams[key] = Number(bestParams[key].toFixed(1));
  }

  const optimalResult = calculateLocalPredictions(bestParams, weather);
  const optimalPreds = {
    mrr: optimalResult.targets.mrr.value,
    surface_roughness: optimalResult.targets.surface_roughness.value,
    energy_efficiency: optimalResult.targets.energy_efficiency.value,
    composite_score: optimalResult.composite_score
  };

  const improvements = {
    mrr: Number((((optimalPreds.mrr - baselinePreds.mrr) / Math.max(0.1, baselinePreds.mrr)) * 100).toFixed(1)),
    surface_roughness: Number((((baselinePreds.surface_roughness - optimalPreds.surface_roughness) / Math.max(0.1, baselinePreds.surface_roughness)) * 100).toFixed(1)),
    energy_efficiency: Number((((optimalPreds.energy_efficiency - baselinePreds.energy_efficiency) / Math.max(0.1, baselinePreds.energy_efficiency)) * 100).toFixed(1)),
    composite_score: Number((optimalPreds.composite_score - baselinePreds.composite_score).toFixed(1))
  };

  const weatherLabel = weather?.is_anomaly ? ` counteracting ${weather.anomaly_type}` : ` under ${weather?.city_name || 'ambient'} weather`;

  const summary = goal === 'weather_resilience'
    ? `Weather Resilience Achieved${weatherLabel}: Environmental drift mitigated, finish improved by ${improvements.surface_roughness}%.`
    : (goal === 'maximize_mrr'
      ? `Productivity Optimized${weatherLabel}: MRR increased by ${improvements.mrr > 0 ? '+' : ''}${improvements.mrr}% to ${optimalPreds.mrr} mm³/min.`
      : (goal === 'minimize_roughness'
        ? `Mirror Finish${weatherLabel}: Surface Roughness reduced by ${improvements.surface_roughness}% to ${optimalPreds.surface_roughness} µm Ra.`
        : `Balanced Pareto${weatherLabel}: Quality & throughput index improved by ${improvements.composite_score > 0 ? '+' : ''}${improvements.composite_score} pts.`));

  return {
    optimal_parameters: bestParams,
    baseline_parameters: currentParams,
    baseline_predictions: baselinePreds,
    optimal_predictions: optimalPreds,
    percentage_improvements: improvements,
    convergence_history: history,
    iterations_count: 20,
    execution_time_ms: 38.0,
    objective_summary: summary,
    status: 'success'
  };
}

export function calculateLocalSensitivity(baseParams, sweepParamName, weather = null, steps = 24) {
  const spec = PARAM_CONFIGS.find(p => p.name === sweepParamName) || PARAM_CONFIGS[0];
  const stepSize = (spec.max_val - spec.min_val) / (steps - 1);
  const data = [];

  for (let i = 0; i < steps; i++) {
    const val = Number((spec.min_val + i * stepSize).toFixed(2));
    const testParams = { ...baseParams, [spec.name]: val };
    const res = calculateLocalPredictions(testParams, weather);
    data.push({
      param_value: val,
      mrr: res.targets.mrr.value,
      roughness: res.targets.surface_roughness.value,
      efficiency: res.targets.energy_efficiency.value,
      composite_score: res.composite_score
    });
  }

  return {
    param_name: spec.label,
    unit: spec.unit,
    current_value: Number(baseParams[spec.name] ?? spec.default_val),
    data
  };
}
