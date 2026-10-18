# MicroOptix AI

MicroOptix AI is a web application for analyzing micro-manufacturing process settings under varying atmospheric conditions. It combines process predictions, weather context, sensitivity analysis, and parameter optimization in an interactive dashboard.

## Overview

The application estimates material removal rate (MRR), surface roughness (Ra), and energy efficiency from five process parameters. Environmental indicators provide additional context, including thermal drift, process stability, and advisories. Users can explore live weather, simulate atmospheric anomalies, compare predefined operating presets, and optimize settings against selected objectives.

The system consists of a React frontend and a FastAPI backend. When the backend is unavailable, the frontend uses a local JavaScript surrogate for predictions and approximate optimization.

## Capabilities

- Process predictions with confidence intervals and a composite score.
- Weather lookup using Open-Meteo, with no API key required.
- Simulated weather anomalies and custom temperature, humidity, and pressure adjustments.
- Operating presets and parameter sensitivity charts.
- Optimization for balanced performance, higher MRR, lower roughness, target roughness, and weather resilience.
- Light and dark themes with responsive layouts.

## Weather data integration

The frontend uses the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) to search Indian cities and obtain their coordinates. City searches include the selected state and filter results to India. It then requests current conditions from the [Open-Meteo Forecast API](https://open-meteo.com/en/docs) using the coordinates and the `timezone=auto` option. No API key is required for this project's non-commercial use.

The current-conditions request includes:

| Field | Use in the application |
| --- | --- |
| `temperature_2m` | Ambient temperature |
| `apparent_temperature` | Displayed apparent temperature |
| `relative_humidity_2m` | Humidity context and process impact |
| `surface_pressure` | Pressure context and process impact |
| `wind_speed_10m` | Wind context |
| `weather_code` | Human-readable condition and icon, mapped from WMO codes |

The weather context passed to the process model uses temperature, humidity, and pressure, plus optional user-selected deltas. Wind speed and the weather condition are shown as context. The anomaly presets and custom atmospheric adjustments are simulations performed in the app; they do not modify or request synthetic weather from Open-Meteo. If a live request fails, the weather service returns a clearly marked sample condition set instead.

**Unit note:** Open-Meteo's forecast endpoint defaults wind speed to km/h. The current frontend labels wind speed as m/s without specifying `wind_speed_unit=ms` in the request. The displayed wind value may therefore be mislabeled until that is corrected.

## Technology stack

| Component | Technologies |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React |
| Backend | Python, FastAPI, Pydantic, NumPy, SciPy, scikit-learn, Uvicorn |
| Weather data | Open-Meteo |

## Repository structure

```text
backend/
├── app/
│   ├── main.py              # FastAPI routes
│   ├── model.py             # Prediction model
│   ├── optimizer.py         # Parameter optimization
│   └── schemas.py           # Request and response schemas
├── requirements.txt
├── Procfile
└── render.yaml
frontend/
├── src/
│   ├── components/          # Dashboard and interface components
│   └── services/            # API, weather, and local surrogate logic
└── package.json
main_data_electricity.csv
Model_Train.ipynb
overall_best_electricity_model.pkl
```

## Getting started

### Requirements

- Python 3.11 or later
- Node.js and npm

### 1. Run the backend

From the repository root, create and activate a virtual environment, then install the dependencies:

```bash
cd backend
python -m venv .venv
```

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On macOS or Linux, activate the environment with `source .venv/bin/activate`, then run the same install and server commands.

The API is served at `http://127.0.0.1:8000`. Interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Run the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite (typically `http://localhost:5173`).

To connect to a local backend, create `frontend/.env` with:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The frontend uses this value when set. The backend URL can also be changed in the application's **Backend Connection Settings**.

## API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/info` | Model metadata and parameter definitions |
| `GET` | `/api/presets` | Available process presets |
| `POST` | `/api/predict` | Predict process and environmental metrics |
| `POST` | `/api/optimize` | Optimize process parameters |
| `POST` | `/api/sensitivity` | Evaluate a parameter sensitivity sweep |

Full request and response schemas are documented in the interactive API documentation at `/docs`.

## Deployment

Deploy the frontend and backend as separate services from this repository.

### Backend — Render

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

### Frontend — Vercel

- Root directory: `frontend`
- Framework preset: Vite
- Environment variable: `VITE_API_URL` set to the deployed backend URL

## Data and model limitations

- Live weather lookup requires an internet connection in the browser.
- The repository includes the training dataset, notebook, and a serialized model artifact. The frontend fallback is implemented separately in JavaScript.
- Local fallback optimization uses a randomized search and is approximate.
- Predictions are estimates for exploration and should be validated against the actual equipment and process before operational use.
