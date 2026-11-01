# MicroOptix AI

MicroOptix AI is a web application for exploring how machine settings and local atmospheric conditions may affect a precision machining process. The dashboard combines weather lookup, process target estimates, operating presets, sensitivity analysis, and parameter optimization.

The project has two parts:

- **Frontend:** React and Vite application for selecting weather, editing process inputs, and viewing predictions.
- **Backend:** FastAPI service that calculates predictions and runs optimization and sensitivity requests.

When the backend cannot be reached, the frontend uses a JavaScript surrogate to keep predictions available. Local optimization is approximate; see [Model behavior and limitations](#model-behavior-and-limitations).

## Contents

- [What the application does](#what-the-application-does)
- [Weather and anomaly workflow](#weather-and-anomaly-workflow)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Run locally](#run-locally)
- [Configure the backend connection](#configure-the-backend-connection)
- [API reference](#api-reference)
- [Example prediction request](#example-prediction-request)
- [Deployment](#deployment)
- [Model behavior and limitations](#model-behavior-and-limitations)

## What the application does

The dashboard estimates three process targets from five adjustable machine parameters:

| Target | Meaning | Typical direction |
| --- | --- | --- |
| Material removal rate (MRR) | Estimated rate of material removal | Higher is generally preferred for throughput |
| Surface roughness (Ra) | Estimated surface finish roughness | Lower is generally preferred for finish quality |
| Energy efficiency | Estimated process efficiency | Higher is generally preferred |

It also displays environmental indicators such as thermal drift, dielectric viscosity shift, oxidation risk, process stability, and an advisory. Prediction responses include confidence intervals and a composite score to help compare configurations.

The main workflow is:

1. Select an Indian state or union territory and a city.
2. Load the city's current weather or choose an anomaly scenario based on that reading.
3. Choose an operating preset or adjust machine parameters.
4. Review predicted targets, environmental impact, and parameter sensitivity.
5. Optionally optimize parameters for a selected objective and compare the proposed setup with the current one.

The interface includes light and dark themes, responsive layouts, a prediction history stored in browser local storage, and backend connection settings.

## Weather and anomaly workflow

The frontend uses the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) to resolve a selected city to coordinates, then requests current conditions from the [Open-Meteo Forecast API](https://open-meteo.com/en/docs). The forecast request uses the location's timezone and requests wind speed in metres per second. No API key is required by the current integration. Review Open-Meteo's terms for your intended use.

The application reads these current fields:

| API field | Application use |
| --- | --- |
| `temperature_2m` | Ambient temperature used in process calculations |
| `apparent_temperature` | Additional displayed weather context |
| `relative_humidity_2m` | Humidity used in process calculations |
| `surface_pressure` | Pressure used in process calculations |
| `wind_speed_10m` | Wind context and environmental stability |
| `precipitation` | Precipitation context and environmental stability |
| `cloud_cover` | Cloud context and environmental stability |
| `weather_code` | Human-readable condition and weather icon, mapped from WMO codes |

Weather refreshes when the selected city changes, can be refreshed manually, and is periodically updated while the city remains selected. The dashboard labels live readings separately from sample data. If a weather request fails, the weather service returns a clearly marked sample reading so that the interface can still be explored.

**Live weather** uses the fetched conditions as the baseline for a prediction. **Anomaly test** layers one of the available scenarios (drought, flood/extreme rain, heatwave, cold wave, or cyclone) or user-adjusted deltas over that baseline. These are simulated values; the app does not ask Open-Meteo for synthetic anomaly data. Temperature, humidity, and pressure affect the process target calculations. Wind, precipitation, and cloud cover affect environmental stability and related scores.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React |
| Backend | Python, FastAPI, Pydantic, NumPy, SciPy, scikit-learn, Uvicorn |
| Weather | Open-Meteo Geocoding and Forecast APIs |

## Repository layout

```text
Micro_project/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application and HTTP routes
│   │   ├── model.py          # Process and environmental calculations
│   │   ├── optimizer.py      # Backend parameter optimization
│   │   └── schemas.py        # Request and response validation models
│   ├── requirements.txt      # Python dependencies
│   ├── Procfile              # Production server command
│   └── render.yaml           # Render service configuration
├── frontend/
│   ├── src/
│   │   ├── components/       # Dashboard, weather, charts, and dialogs
│   │   ├── hooks/            # Prediction, health, and toast hooks
│   │   ├── services/         # Backend client, weather client, local surrogate
│   │   └── App.jsx           # Main application flow
│   ├── .env.example          # Optional backend URL setting
│   ├── package.json
│   └── vercel.json           # Vercel SPA routing and asset caching
├── main_data_electricity.csv
├── Model_Train.ipynb
└── overall_best_electricity_model.pkl
```

The CSV, notebook, and serialized electricity model are repository artifacts for the related electricity model work. The current process prediction route uses the implementation in `backend/app/model.py`; the frontend fallback is separately implemented in `frontend/src/services/surrogate.js`.

## Run locally

### Prerequisites

- Python 3.11 or newer
- Node.js and npm
- An internet connection for live weather lookup

### 1. Start the backend

From the repository root, create a virtual environment and install the Python dependencies:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

If PowerShell blocks virtual environment activation, you can invoke the environment's Python directly instead:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

On macOS or Linux, activate with `source .venv/bin/activate` and then run the `pip` and `uvicorn` commands above.

The API is available at `http://127.0.0.1:8000`. Interactive API documentation is at `http://127.0.0.1:8000/docs`; the alternative ReDoc page is at `http://127.0.0.1:8000/redoc`.

### 2. Start the frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To build the static frontend bundle:

```powershell
npm run build
```

To serve the built bundle locally for a deployment-style preview:

```powershell
npm run preview
```

### 3. Connect the frontend to the local backend

Copy `frontend/.env.example` to `frontend/.env` and set the backend URL:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Restart Vite after changing environment variables. You can also set the backend URL through **Backend Connection Settings** in the app; a saved URL is stored in the browser. If no custom URL or environment variable is provided, the frontend uses the default backend URL in `frontend/src/config.js`.

## Configure the backend connection

The frontend attempts to use the configured backend for predictions, optimization, sensitivity, presets, and model metadata. If a backend request fails or times out, prediction and sensitivity requests use local JavaScript calculations; optimization uses a randomized local search. Backend health and latency are displayed in the interface.

Configuration priority is:

1. A backend URL saved in **Backend Connection Settings** in the browser.
2. `VITE_API_URL` provided to the frontend build.
3. The default URL configured in `frontend/src/config.js`.

The backend currently allows cross-origin requests from any origin through its CORS configuration. For a restricted production deployment, replace this with the specific frontend domains you intend to allow.

## API reference

The following routes are exposed by the FastAPI service:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Service status and endpoint summary |
| `GET` | `/health` | Health check used by deployment platforms and the frontend |
| `GET` | `/api/info` | Model metadata, process parameter bounds, and target definitions |
| `GET` | `/api/presets` | Available operating parameter presets |
| `POST` | `/api/predict` | Process target estimates and environmental impact |
| `POST` | `/api/optimize` | Optimize process parameters for an objective |
| `POST` | `/api/sensitivity` | Sweep one process parameter and return target values |
| `GET` | `/api/ml-performance` | Electricity-model performance summary |
| `GET` | `/api/feature-importance` | Electricity and process feature importance data |

For full field definitions, defaults, and response schemas, use `/docs` while the backend is running. The `POST` endpoints validate input using the Pydantic models in `backend/app/schemas.py`.

## Example prediction request

The frontend sends the machine settings and weather context together. A minimal request looks like this:

```json
{
  "pulse_on_time": 35.0,
  "peak_current": 18.0,
  "gap_voltage": 60.0,
  "flushing_pressure": 0.8,
  "wire_feed_rate": 8.5,
  "weather": {
    "city_name": "Pune",
    "region_name": "Maharashtra",
    "country_name": "India",
    "temperature": 29.0,
    "relative_humidity": 55.0,
    "pressure": 950.0,
    "wind_speed": 2.5,
    "precipitation": 0.0,
    "cloud_cover": 20.0,
    "weather_condition": "Mainly Clear",
    "is_anomaly": false
  }
}
```

The weather fields represent the baseline reading. For a simulated scenario, set `is_anomaly` to `true` and provide one or more delta fields, such as `delta_temperature` or `delta_humidity`. The API response contains target metrics, confidence intervals, environmental indicators, feature contributions, a composite score, and a computation timestamp.

## Deployment

The frontend and backend are deployed as separate services. Set the frontend's `VITE_API_URL` to the public backend URL so browser requests reach the deployed API.

### Backend on Render

The repository includes `backend/render.yaml`. For a manually configured web service, use:

- **Root directory:** `backend`
- **Runtime:** Python
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health check path:** `/health`

After deployment, confirm the health endpoint responds, then copy the service URL for the frontend configuration.

### Frontend on Vercel

The repository includes `frontend/vercel.json` for SPA rewrites and long-lived caching of generated assets. Configure the Vercel project with:

- **Root directory:** `frontend`
- **Framework preset:** Vite
- **Environment variable:** `VITE_API_URL` set to the deployed backend URL

Deploy again after changing `VITE_API_URL`, since Vite reads it at build time. Also ensure the backend CORS policy allows the deployed frontend origin.

## Model behavior and limitations

- Predictions are estimates from a physics-informed surrogate implementation, not direct measurements from a machine.
- The backend model and local JavaScript fallback are separate implementations and can produce different results.
- Local optimization is approximate and uses randomized search; backend optimization is handled by the Python service.
- Confidence intervals and composite scores are comparison aids and should not be interpreted as guarantees.
- Live weather lookup requires browser network access. When it is unavailable, the dashboard identifies fallback weather as sample data.
- Anomaly presets and custom weather adjustments are what-if simulations over the selected city's weather, not meteorological forecasts.
- Validate any suggested process settings against the actual equipment, material, tooling, and safety procedures before use in production.
