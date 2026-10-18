import time
import numpy as np
from scipy.optimize import differential_evolution, minimize
from typing import Dict, List, Any, Tuple
from app.model import surrogate_model, PARAMETER_SPECS, PARAM_DICT
from app.schemas import OptimizationRequest, OptimizationResponse, OptimizationHistoryPoint

def optimize_parameters(req: OptimizationRequest) -> OptimizationResponse:
    start_time = time.perf_counter()
    current_params = req.current_parameters
    objective = req.objective
    weather = req.weather

    # Baseline predictions under current weather
    baseline_pred, _, baseline_env = surrogate_model.predict(current_params, weather)
    baseline_score = surrogate_model.compute_composite_score(
        baseline_pred["mrr"], baseline_pred["surface_roughness"], baseline_pred["energy_efficiency"], baseline_env.stability_index
    )
    baseline_pred["composite_score"] = baseline_score

    # Setup parameter ordering and bounds
    param_keys = ["pulse_on_time", "peak_current", "gap_voltage", "flushing_pressure", "wire_feed_rate"]
    bounds_list = []
    custom_bounds = req.parameter_bounds or {}

    for key in param_keys:
        spec = PARAM_DICT[key]
        if key in custom_bounds and len(custom_bounds[key]) == 2:
            low, high = custom_bounds[key]
            bounds_list.append((max(spec.min_val, low), min(spec.max_val, high)))
        else:
            bounds_list.append((spec.min_val, spec.max_val))

    history: List[OptimizationHistoryPoint] = []
    iteration_counter = [0]

    # Objective loss function
    def loss_function(x):
        params_dict = {
            "pulse_on_time": float(x[0]),
            "peak_current": float(x[1]),
            "gap_voltage": float(x[2]),
            "flushing_pressure": float(x[3]),
            "wire_feed_rate": float(x[4])
        }
        pred, _, env = surrogate_model.predict(params_dict, weather)
        mrr = pred["mrr"]
        ra = pred["surface_roughness"]
        eff = pred["energy_efficiency"]
        score = surrogate_model.compute_composite_score(mrr, ra, eff, env.stability_index)

        goal = objective.goal
        loss = 0.0

        if goal == "maximize_mrr":
            loss = -mrr
            if objective.max_roughness_limit and ra > objective.max_roughness_limit:
                loss += 15.0 * (ra - objective.max_roughness_limit) ** 2

        elif goal == "minimize_roughness":
            loss = ra * 10.0
            if objective.min_mrr_limit and mrr < objective.min_mrr_limit:
                loss += 5.0 * (objective.min_mrr_limit - mrr) ** 2

        elif goal == "target_roughness":
            target = objective.target_value if objective.target_value is not None else 0.8
            loss = 35.0 * (ra - target) ** 2 - 0.2 * mrr

        elif goal == "weather_resilience":
            # Counteract atmospheric anomalies: penalize roughness heavily and reward high flushing & thermal stability
            loss = -score + 8.0 * env.thermal_drift_um + 4.0 * env.oxidation_risk_factor

        else: # "balanced_pareto"
            loss = -score

        iteration_counter[0] += 1
        if iteration_counter[0] % 3 == 0 or iteration_counter[0] <= 5:
            history.append(OptimizationHistoryPoint(
                iteration=len(history) + 1,
                score=round(score, 1),
                mrr=round(mrr, 2),
                roughness=round(ra, 3)
            ))

        return loss

    # Run selected algorithm
    if objective.algorithm == "differential_evolution":
        res = differential_evolution(
            loss_function,
            bounds=bounds_list,
            strategy='best1bin',
            maxiter=30,
            popsize=10,
            mutation=(0.5, 1.0),
            recombination=0.7,
            seed=42,
            polish=True
        )
        opt_x = res.x
        n_iters = res.nit
    else:
        x0 = [float(current_params.get(k, PARAM_DICT[k].default_val)) for k in param_keys]
        res = minimize(
            loss_function,
            x0=x0,
            method='Nelder-Mead',
            bounds=bounds_list,
            options={'maxiter': 130, 'adaptive': True}
        )
        opt_x = res.x
        n_iters = res.nit if hasattr(res, 'nit') else len(history)

    # Format optimal parameters
    optimal_params = {}
    for i, key in enumerate(param_keys):
        spec = PARAM_DICT[key]
        raw_val = float(opt_x[i])
        clamped = max(spec.min_val, min(spec.max_val, raw_val))
        step = spec.step
        snapped = round(round(clamped / step) * step, 2)
        optimal_params[key] = snapped

    # Optimal predictions under weather
    optimal_pred, _, optimal_env = surrogate_model.predict(optimal_params, weather)
    optimal_score = surrogate_model.compute_composite_score(
        optimal_pred["mrr"], optimal_pred["surface_roughness"], optimal_pred["energy_efficiency"], optimal_env.stability_index
    )
    optimal_pred["composite_score"] = optimal_score

    # Compute improvements
    improvements = {
        "mrr": round(((optimal_pred["mrr"] - baseline_pred["mrr"]) / max(0.1, baseline_pred["mrr"])) * 100.0, 1),
        "surface_roughness": round(((baseline_pred["surface_roughness"] - optimal_pred["surface_roughness"]) / max(0.1, baseline_pred["surface_roughness"])) * 100.0, 1),
        "energy_efficiency": round(((optimal_pred["energy_efficiency"] - baseline_pred["energy_efficiency"]) / max(0.1, baseline_pred["energy_efficiency"])) * 100.0, 1),
        "composite_score": round(optimal_score - baseline_score, 1)
    }

    if not history or history[-1].score != optimal_score:
        history.append(OptimizationHistoryPoint(
            iteration=len(history) + 1,
            score=round(optimal_score, 1),
            mrr=round(optimal_pred["mrr"], 2),
            roughness=round(optimal_pred["surface_roughness"], 3)
        ))

    if len(history) > 20:
        step = len(history) / 20.0
        sampled_history = [history[int(i * step)] for i in range(19)]
        sampled_history.append(history[-1])
        history = sampled_history
        for idx, pt in enumerate(history):
            pt.iteration = idx + 1

    execution_ms = round((time.perf_counter() - start_time) * 1000.0, 1)

    weather_desc = f" under {weather.city_name} {weather.weather_condition}" if weather else ""
    if weather and weather.is_anomaly:
        weather_desc = f" counteracting {weather.anomaly_type or 'Weather Anomaly'}"

    summary_map = {
        "balanced_pareto": f"Balanced Pareto{weather_desc}: Score gained {improvements['composite_score']:+0.1f} pts (MRR: {improvements['mrr']:+0.1f}%, Ra: {improvements['surface_roughness']:+0.1f}% better).",
        "weather_resilience": f"Weather Resilience{weather_desc}: Process stabilized with {improvements['surface_roughness']:+0.1f}% finer finish and mitigation of environmental drift.",
        "maximize_mrr": f"Productivity Maximized{weather_desc}: MRR boosted by {improvements['mrr']:+0.1f}% ({baseline_pred['mrr']} -> {optimal_pred['mrr']} mm³/min).",
        "minimize_roughness": f"Ultra-Finish Optimization{weather_desc}: Surface Roughness reduced by {improvements['surface_roughness']:+0.1f}% ({baseline_pred['surface_roughness']} -> {optimal_pred['surface_roughness']} µm Ra).",
        "target_roughness": f"Target Roughness Reached{weather_desc}: {optimal_pred['surface_roughness']} µm Ra attained."
    }

    return OptimizationResponse(
        optimal_parameters=optimal_params,
        baseline_parameters=current_params,
        baseline_predictions=baseline_pred,
        optimal_predictions=optimal_pred,
        percentage_improvements=improvements,
        convergence_history=history,
        iterations_count=n_iters,
        execution_time_ms=execution_ms,
        objective_summary=summary_map.get(objective.goal, "Optimization converged successfully."),
        status="success"
    )
