# MicroOptix AI

MicroOptix AI is a weather-aware electricity demand analysis application for Indian states. It combines live and daily weather inputs with a trained Ridge regression model to estimate regional daily electricity met (in MU, or Million Units), explore weather-response scenarios, and search hypothetical climate inputs for a target demand.

The application keeps a local JavaScript estimate available if the configured backend or trained model cannot be used. The interface identifies whether the displayed prediction came from the backend model or a fallback.

## Live deployment

- **Web app (Vercel):** [micro-project-ten-coral.vercel.app](https://micro-project-ten-coral.vercel.app/)
- **Backend API (Render):** [micro-project-ug85.onrender.com](https://micro-project-ug85.onrender.com/)
- **Interactive API docs:** [micro-project-ug85.onrender.com/docs](https://micro-project-ug85.onrender.com/docs)

## Application sections

- **Live Consumption Dashboard:** Regional demand estimate, baseline comparison, stress category, uncertainty estimate, and temperature-response chart.
- **Anomaly Simulator:** Apply weather event presets or custom offsets to the selected weather conditions and review the resulting demand estimate.
- **Weather-Energy Optimizer:** Search hypothetical temperature and humidity values that best match a target daily demand. The result is a model scenario, not a weather forecast or a controllable weather outcome.
- **Historical Analysis:** Save model readings to browser storage, review them as a chart and table, and clear the saved list.
- **Model Performance:** Review model comparison metrics, actual-versus-predicted examples, and the displayed feature attribution summary.

The frontend uses the existing MicroOptix theme, responsive layout, light/dark modes, and shared weather controls. Location search and weather data use Open-Meteo; an API key is not required by the current client.

## Electricity model

### Target and training data

The notebook trains a regression model for `daily_energy_met_y`, the dataset's daily electricity-met target, measured in MU. The source file `main_data_electricity.csv` contains **126,865 rows and 62 columns**. Its records cover **2013 through 2024** and include weather, calendar, and Indian state indicator fields.

The notebook removes the target and four related outcome/leakage columns before fitting:

```text
daily_energy_met_y
corr_daily_energy_met_y
corr_peak_met_y
peak_met_y
peak_unmet_y
```

That leaves **57 model features**:

- Weather aggregates: minimum, mean, and maximum U/V wind components; 2 m temperature; 2 m dew point; downward solar radiation; cloud cover; and UTCI, plus national UTCI.
- Calendar: year, month, and day.
- Region: one-hot encoded `State_*` indicator features.

The notebook fills missing feature and target values with their training-data medians. Because the dataset exceeds 30,000 rows, it samples 20,000 rows with `random_state=42`, then uses an 80/20 train/test split with `random_state=42` (16,000 training rows and 4,000 test rows).

The notebook does not standardize or scale the numeric columns before fitting. It fits directly on the prepared feature values, so inference must preserve the model's feature order and compatible units. The backend uses the artifact's `feature_names_in_` to build that order.

### Candidate models and evaluation

The notebook fits four supervised regressors on the same 20,000-row sample and its 80/20 random split. It also reports an ARIMA(1,1,1) univariate baseline. The notebook compares R-squared, mean absolute error (MAE), and root mean squared error (RMSE). R-squared was used to select the saved model among the four supervised regressors; ARIMA was excluded from that selection.

| Evaluated model | Notebook setup | What it tests |
| --- | --- | --- |
| **Random Forest Regressor** | 50 trees, maximum depth 12, `random_state=42`, all available CPU cores | A bagged tree ensemble that models nonlinear weather/state interactions and averages trees to reduce variance. |
| **Gradient Boosting Regressor** | 50 boosting stages, maximum depth 6, `random_state=42` | Trees are added sequentially to improve on the current ensemble's residual errors; tests a compact boosted-tree alternative. |
| **Ridge Regression** | `alpha=1.0` | Linear regression with an L2 coefficient penalty. It provides a regularized linear baseline across the weather, calendar, and state features. |
| **Extra Trees Regressor** | 50 trees, maximum depth 12, `random_state=42`, all available CPU cores | A randomized tree ensemble. It tests whether additional split randomness improves generalization relative to Random Forest. |
| **ARIMA(1,1,1) baseline** | One autoregressive term, one difference, one moving-average term | A univariate time-series comparison using only the target sequence; it does not use weather or state features. |

The four supervised models use the same held-out test split. The ARIMA score is **not directly comparable**: the notebook creates its own 80/20 sequence split for ARIMA, and that sequence comes from `y_sample`, which was created by random sampling rows. It is therefore not a chronological forecast test. The notebook also does not show a separate chronological holdout or cross-validation run.

The checked-in artifact is a **Ridge regression model with L2 regularization (`alpha=1.0`)**. Its R-squared is the highest among the four supervised candidates in this notebook run. The comparison values returned by the backend are:

| Model | R-squared | MAE (MU) | RMSE (MU) |
| --- | ---: | ---: | ---: |
| Ridge Regression (saved model) | 0.946807 | 19.037192 | 28.245960 |
| Gradient Boosting Regressor | 0.944631 | 21.352705 | 28.817943 |
| Extra Trees Regressor | 0.910072 | 24.952475 | 36.726177 |
| Random Forest Regressor | 0.909672 | 26.549918 | 36.807879 |
| ARIMA(1,1,1) baseline | -0.000621 | 97.284195 | 120.441801 |

Ridge narrowly leads Gradient Boosting on the recorded test metrics and has the lowest MAE and RMSE in this comparison. Its simpler linear form is also compact to load and evaluate. These results identify the best candidate in this notebook experiment; they do not establish that Ridge will outperform the other models on a future-year or location-based holdout.

The displayed `+/- 19.04 MU` uncertainty is the saved-model MAE used as a simple error indicator. It is not a calibrated per-prediction confidence interval.

### Runtime inference path

1. The frontend reads current and daily weather for the selected location and sends the state, date, and weather context to the backend.
2. The backend loads `overall_best_electricity_model.pkl` and arranges the inputs in the artifact's original 57-feature order.
3. `backend/app/electricity_feature_medians.json` supplies training-data medians for features that the live weather request does not provide.
4. The saved Ridge model predicts daily electricity met. The backend returns the estimate, a state reference baseline, demand stress category, model name, and model-load status.
5. The temperature response chart and reverse weather optimizer call separate backend endpoints that evaluate the same trained model. If a request fails, the frontend uses a local weather estimate instead.

The input conversion is approximate because the training data contains daily regional aggregates while the app receives current and daily weather for a selected location. Daily temperature, dew point, cloud cover, and solar radiation are populated from Open-Meteo where available; wind components are derived from wind speed and direction; apparent temperature is used as a UTCI proxy; and missing fields use saved training medians. The model's year feature is capped at 2024, the latest year in the training data. Treat outputs as regional estimates, not metered readings or guaranteed forecasts.

The backend reports `electricity_model_loaded` at `GET /health`. The frontend labels a local fallback estimate if the backend endpoint is unavailable. The Python dependency pins scikit-learn to 1.6.1 to match the serialized estimator.

### Training notebook

`Model_Train.ipynb` contains the data preparation, model fitting, metrics, comparison, and export workflow. The notebook was authored for Google Colab and reads `/content/main_data_electricity.csv`; when running it elsewhere, update that path to the local CSV. It uses pandas, NumPy, scikit-learn, statsmodels, matplotlib, and seaborn. The final cell uses Colab's `files.download`; replace that step with a local file copy when running outside Colab.

To reproduce the artifact:

1. Install the notebook dependencies in a separate notebook environment.
2. Place `main_data_electricity.csv` where the notebook expects it and run the notebook from the start.
3. Confirm that Ridge Regression is selected in the model comparison.
4. Export the selected model to `overall_best_electricity_model.pkl` and keep its feature order and training-data medians together with the artifact.

The browser's model performance view receives metrics and a small set of actual-versus-predicted examples from backend metadata. Those summary values and displayed examples are embedded in `backend/app/model.py`; the service does not rerun the training/evaluation notebook at startup.

## Technology and repository layout

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React |
| Backend | Python, FastAPI, Pydantic, NumPy, SciPy, scikit-learn, Uvicorn |
| Weather | Open-Meteo Geocoding and Forecast APIs |

```text
Micro_project/
|-- backend/
|   |-- app/
|   |   |-- main.py                         # FastAPI routes
|   |   |-- model.py                        # Saved model loading and inference
|   |   |-- electricity_feature_medians.json # Training feature medians
|   |   |-- schemas.py                      # API request/response schemas
|   |   `-- optimizer.py                    # Legacy process optimizer
|   |-- requirements.txt
|   |-- Procfile
|   `-- render.yaml
|-- frontend/
|   |-- src/
|   |   |-- App.jsx                         # Section navigation and dashboard
|   |   |-- components/                     # Weather, charts, model metrics
|   |   `-- services/                       # Weather and backend clients
|   |-- package.json
|   `-- vercel.json
|-- main_data_electricity.csv
|-- Model_Train.ipynb
`-- overall_best_electricity_model.pkl
```

## Run locally

Prerequisites: Python 3.11 or newer, Node.js with npm, and internet access for city/weather lookup.

### Backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000`; interactive docs are at `/docs`. In PowerShell, if activation is restricted, use `.venv\Scripts\python.exe -m pip install -r requirements.txt` and `.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000`.

### Frontend

In a second terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

To point Vite at the local backend, set `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env` and restart Vite. The app also supports a backend URL configured through Backend Connection Settings. The frontend defaults to the URL in `frontend/src/config.js` when neither setting is supplied.

Production frontend commands:

```bash
npm run build
npm run preview
```

## Electricity API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend health and trained electricity model load status |
| `GET` | `/api/ml-performance` | Model comparison metrics and validation examples |
| `POST` | `/api/electricity-predict` | Predict daily electricity met for a weather context |
| `POST` | `/api/electricity-sensitivity` | Evaluate model demand over a supplied temperature list |
| `POST` | `/api/electricity-optimize` | Search hypothetical temperature/humidity values for a target MU |

Example prediction request:

```json
{
  "weather": {
    "city_name": "Pune",
    "region_name": "Maharashtra",
    "country_name": "India",
    "timestamp": "2024-11-05T14:00",
    "temperature": 32.0,
    "relative_humidity": 65.0,
    "wind_speed": 2.4,
    "wind_direction": 270.0,
    "cloud_cover": 40.0,
    "temperature_min": 25.0,
    "temperature_mean": 30.0,
    "temperature_max": 34.0,
    "dew_point": 24.0,
    "solar_radiation_daily": 18.0
  }
}
```

The response includes `consumption_mu`, `baseline_mu`, `uncertainty_mu`, `stress_status`, `model_loaded`, `model_name`, and `source`. Consult `/docs` for the full schemas and current endpoint definitions.

## Deployment

The frontend and backend are deployed separately. Deploy the backend changes before expecting the hosted frontend to use the electricity prediction, sensitivity, and optimization routes. Set the Vite build variable `VITE_API_URL` to the deployed backend URL.

### Render backend

The repository includes `backend/render.yaml`. For manual setup use root directory `backend`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and health path `/health`. Keep the model artifact and feature medians file in the repository so the service can load them.

### Vercel frontend

Set the project root to `frontend`, use the Vite framework preset, and configure `VITE_API_URL` to the backend URL. Redeploy after changing the variable because Vite reads it at build time. Restrict backend CORS origins to the deployed frontend domain for production use.

## Limitations

- The target represents regional daily electricity met in MU, not individual household consumption, facility demand, or real-time grid telemetry.
- Weather inputs are converted to the training feature layout using available current/daily weather plus proxies and training medians; this is not identical to the full source dataset pipeline.
- The training/evaluation split is a random split of a 20,000-row sample, not a chronological holdout. The reported scores may not represent performance on future years or unseen locations.
- The model's training data ends in 2024. Runtime clamps the model year feature to 2024 for later dates; this does not add new training data.
- Performance metrics and the small calibration example set are backend metadata, not recomputed during application startup.
- Anomaly scenarios and reverse optimization are hypothetical weather what-if analyses. They do not forecast or control the weather.
- The browser's local fallback is a separate simplified estimate and can differ from the backend Ridge model.
