from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

class ParameterSpec(BaseModel):
    name: str
    label: str
    unit: str
    min_val: float
    max_val: float
    step: float
    default_val: float
    description: str
    category: str = "Operating Parameters"

class WeatherContext(BaseModel):
    city_name: str = "Tokyo"
    region_name: str = ""
    country_name: str = ""
    temperature: float = Field(20.0, description="Ambient Temperature (°C)")
    relative_humidity: float = Field(50.0, description="Relative Humidity (%)")
    pressure: float = Field(1013.25, description="Barometric Pressure (hPa)")
    wind_speed: float = Field(3.5, description="Wind Speed (m/s)")
    precipitation: float = Field(0.0, description="Current precipitation (mm)")
    cloud_cover: float = Field(0.0, description="Cloud cover (%)")
    weather_condition: str = "Clear Sky"
    is_anomaly: bool = False
    anomaly_type: Optional[str] = None
    delta_temperature: float = 0.0
    delta_humidity: float = 0.0
    delta_pressure: float = 0.0
    delta_wind_speed: float = 0.0
    delta_precipitation: float = 0.0
    delta_cloud_cover: float = 0.0

class PredictionRequest(BaseModel):
    pulse_on_time: float = Field(35.0, description="Pulse-on Duration (µs)")
    peak_current: float = Field(18.0, description="Discharge Current (A)")
    gap_voltage: float = Field(60.0, description="Open Gap Voltage (V)")
    flushing_pressure: float = Field(0.8, description="Dielectric Flushing Pressure (MPa)")
    wire_feed_rate: float = Field(8.5, description="Wire Feed Velocity (mm/min)")
    weather: Optional[WeatherContext] = None
    custom_parameters: Optional[Dict[str, float]] = None

class MetricDetail(BaseModel):
    value: float
    unit: str
    label: str
    min_val: float
    max_val: float
    is_higher_better: bool
    confidence_interval: List[float]
    rating: str

class EnvironmentalImpact(BaseModel):
    thermal_drift_um: float
    dielectric_viscosity_shift: float
    oxidation_risk_factor: float
    stability_index: float
    advisory: str
    grid_demand_mu: Optional[float] = None
    grid_stress_status: Optional[str] = None

class PredictionResponse(BaseModel):
    targets: Dict[str, MetricDetail]
    environmental_impact: EnvironmentalImpact
    feature_contributions: Dict[str, float]
    composite_score: float
    status: str = "success"
    computed_at: str

class OptimizationObjective(BaseModel):
    goal: str = Field("balanced_pareto", description="'balanced_pareto' | 'maximize_mrr' | 'minimize_roughness' | 'target_roughness' | 'weather_resilience'")
    target_value: Optional[float] = None
    max_roughness_limit: Optional[float] = None
    min_mrr_limit: Optional[float] = None
    algorithm: str = Field("differential_evolution", description="'differential_evolution' | 'nelder_mead'")

class OptimizationRequest(BaseModel):
    current_parameters: Dict[str, float]
    objective: OptimizationObjective
    weather: Optional[WeatherContext] = None
    parameter_bounds: Optional[Dict[str, List[float]]] = None

class OptimizationHistoryPoint(BaseModel):
    iteration: int
    score: float
    mrr: float
    roughness: float

class OptimizationResponse(BaseModel):
    optimal_parameters: Dict[str, float]
    baseline_parameters: Dict[str, float]
    baseline_predictions: Dict[str, float]
    optimal_predictions: Dict[str, float]
    percentage_improvements: Dict[str, float]
    convergence_history: List[OptimizationHistoryPoint]
    iterations_count: int
    execution_time_ms: float
    objective_summary: str
    status: str = "success"

class SensitivityRequest(BaseModel):
    current_parameters: Dict[str, float]
    sweep_parameter: str
    weather: Optional[WeatherContext] = None
    steps: int = 25

class SensitivityPoint(BaseModel):
    param_value: float
    mrr: float
    roughness: float
    efficiency: float
    composite_score: float

class SensitivityResponse(BaseModel):
    param_name: str
    unit: str
    current_value: float
    data: List[SensitivityPoint]

class ModelMetadataResponse(BaseModel):
    model_name: str
    version: str
    domain: str
    description: str
    parameters: List[ParameterSpec]
    target_metrics: List[Dict[str, Any]]

class MLModelMetrics(BaseModel):
    model_name: str
    r2: float
    mae: float
    rmse: float
    is_best: bool = False
    model_type: str

class ActualVsPredictedPoint(BaseModel):
    sample_id: int
    actual: float
    predicted: float
    state: str

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    category: str
    description: str

class MLPerformanceResponse(BaseModel):
    target_variable: str
    target_unit: str
    dataset_name: str
    total_samples: int
    total_features: int
    primary_model_name: str
    models: List[MLModelMetrics]
    actual_vs_predicted: List[ActualVsPredictedPoint]
    feature_importances: List[FeatureImportanceItem]
    training_methodology: str

class FeatureImportanceResponse(BaseModel):
    electricity_model_features: List[FeatureImportanceItem]
    process_model_features: List[FeatureImportanceItem]

