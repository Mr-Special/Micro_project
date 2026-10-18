import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    OptimizationRequest,
    OptimizationResponse,
    SensitivityRequest,
    SensitivityResponse,
    SensitivityPoint,
    ModelMetadataResponse
)
from app.model import surrogate_model, PARAMETER_SPECS, PARAM_DICT
from app.optimizer import optimize_parameters

app = FastAPI(
    title="MicroOptix Process AI",
    description="High-precision ML surrogate prediction and multi-objective optimization engine coupled with real-time weather & atmospheric anomaly dynamics.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Vercel deployment and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRESETS = [
    {
        "id": "balanced_standard",
        "name": "Balanced Production",
        "description": "Standard industrial baseline balancing throughput and surface finish under normal ambient atmosphere.",
        "badge": "Default",
        "params": {
            "pulse_on_time": 35.0,
            "peak_current": 18.0,
            "gap_voltage": 60.0,
            "flushing_pressure": 0.8,
            "wire_feed_rate": 8.5
        }
    },
    {
        "id": "high_speed_roughing",
        "name": "Peak Throughput Roughing",
        "description": "Maximized discharge energy and current for rapid bulk material removal.",
        "badge": "High MRR",
        "params": {
            "pulse_on_time": 75.0,
            "peak_current": 38.0,
            "gap_voltage": 90.0,
            "flushing_pressure": 1.6,
            "wire_feed_rate": 14.0
        }
    },
    {
        "id": "fine_finish_polishing",
        "name": "Mirror Finish / Super-Fine",
        "description": "Short pulse duration and low spark amperage yielding ultra-smooth optical finish.",
        "badge": "Ultra Smooth",
        "params": {
            "pulse_on_time": 8.0,
            "peak_current": 4.5,
            "gap_voltage": 35.0,
            "flushing_pressure": 1.9,
            "wire_feed_rate": 6.0
        }
    },
    {
        "id": "eco_energy_efficient",
        "name": "Eco-Green High Efficiency",
        "description": "Optimized fluid dynamics and duty cycle to minimize electrical waste.",
        "badge": "Eco Efficiency",
        "params": {
            "pulse_on_time": 22.0,
            "peak_current": 12.0,
            "gap_voltage": 50.0,
            "flushing_pressure": 1.4,
            "wire_feed_rate": 9.5
        }
    }
]

@app.get("/")
def root():
    return {
        "service": "MicroOptix AI Backend (Weather-Coupled)",
        "status": "online",
        "version": "1.1.0",
        "environment": "Render Production Ready",
        "documentation": "/docs",
        "endpoints": ["/health", "/api/info", "/api/predict", "/api/optimize", "/api/sensitivity", "/api/presets"]
    }

@app.get("/health")
def health_check():
    """Render health check endpoint"""
    return {"status": "healthy", "service": "microoptix-backend", "ready": True}

@app.get("/api/info", response_model=ModelMetadataResponse)
def get_metadata():
    """Returns parameter constraints, descriptions, and model configuration"""
    return ModelMetadataResponse(
        model_name="MicroOptix-WeatherSurrogate-RF",
        version="1.1.0",
        domain="Micro-Manufacturing & Weather-Coupled Precision Process AI",
        description="Ensemble Random Forest & semi-empirical plasma erosion model predicting Material Removal Rate (MRR), Surface Roughness (Ra), and Process Efficiency under real-time weather & atmospheric anomaly stress-testing.",
        parameters=PARAMETER_SPECS,
        target_metrics=[
            {"key": "mrr", "label": "Material Removal Rate", "unit": "mm³/min", "goal": "maximize", "optimal_direction": "higher"},
            {"key": "surface_roughness", "label": "Surface Roughness Ra", "unit": "µm", "goal": "minimize", "optimal_direction": "lower"},
            {"key": "energy_efficiency", "label": "Process Efficiency", "unit": "%", "goal": "maximize", "optimal_direction": "higher"}
        ]
    )

@app.get("/api/presets")
def get_presets():
    """Get domain presets"""
    return {"presets": PRESETS}

@app.post("/api/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest):
    """Predict process targets, confidence intervals, and weather impact"""
    try:
        params = payload.model_dump(exclude={"weather", "custom_parameters"})
        if payload.custom_parameters:
            params.update(payload.custom_parameters)
        return surrogate_model.build_full_response(params, payload.weather)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/optimize", response_model=OptimizationResponse)
def optimize(payload: OptimizationRequest):
    """Run Scipy optimization (Differential Evolution or Nelder-Mead) with weather conditions"""
    try:
        return optimize_parameters(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

@app.post("/api/sensitivity", response_model=SensitivityResponse)
def calculate_sensitivity(payload: SensitivityRequest):
    """Calculate target variation as a single parameter is swept across its bounds"""
    param_name = payload.sweep_parameter
    if param_name not in PARAM_DICT:
        raise HTTPException(status_code=400, detail=f"Invalid sweep parameter: '{param_name}'")

    spec = PARAM_DICT[param_name]
    steps = max(10, min(50, payload.steps))
    values = np.linspace(spec.min_val, spec.max_val, steps)

    base_params = payload.current_parameters.copy()
    current_val = float(base_params.get(param_name, spec.default_val))

    points: List[SensitivityPoint] = []
    for val in values:
        test_params = base_params.copy()
        test_params[param_name] = float(val)
        preds, _, env = surrogate_model.predict(test_params, payload.weather)
        score = surrogate_model.compute_composite_score(preds["mrr"], preds["surface_roughness"], preds["energy_efficiency"], env.stability_index)
        points.append(SensitivityPoint(
            param_value=round(float(val), 2),
            mrr=preds["mrr"],
            roughness=preds["surface_roughness"],
            efficiency=preds["energy_efficiency"],
            composite_score=score
        ))

    return SensitivityResponse(
        param_name=spec.label,
        unit=spec.unit,
        current_value=current_val,
        data=points
    )
