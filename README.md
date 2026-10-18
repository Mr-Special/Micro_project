# MicroOptix AI

MicroOptix AI is a web application for exploring micro-manufacturing process settings under changing atmospheric conditions. Adjust process parameters, view predicted production and quality metrics, compare weather scenarios, inspect parameter sensitivity, and run optimization objectives.

The project has a React/Vite frontend and a FastAPI backend. The frontend can use the backend API or fall back to a local JavaScript surrogate when the API is unavailable.

## Features

- Predictions for material removal rate (MRR), surface roughness (Ra), and energy efficiency.
- Environmental indicators including thermal drift, process stability, and weather advisories.
- Live weather lookup through Open-Meteo; no API key is required.
- Weather anomaly scenarios and custom changes to temperature, humidity, and pressure.
- Parameter presets, sensitivity charts, and optimization objectives for balanced performance, throughput, surface finish, and weather resilience.
- Responsive interface with light and dark themes.

## Technology

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **Backend:** Python, FastAPI, Pydantic, NumPy, SciPy, scikit-learn, Uvicorn
- **Weather data:** Open-Meteo

## Repository layout

```text
backend/
├── app/                  # API, prediction model, schemas, optimizer
├── requirements.txt
├── Procfile
└── render.yaml
frontend/
├── src/                  # React application and local fallback model
└── package.json
main_data_electricity.csv
Model_Train.ipynb
overall_best_electricity_model.pkl
```

## Run locally

You need Python 3.11 or later and Node.js with npm.

### Backend

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the environment, install dependencies, and start the API:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux (use this activation command instead)
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000`; interactive documentation is at `http://127.0.0.1:8000/docs`.

### Frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The frontend uses `VITE_API_URL` when set; otherwise it uses the hosted backend URL configured in the frontend. You can also change the backend URL in **Backend Connection Settings** in the app.

To point the frontend at your local backend, create `frontend/.env` with:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `GET` | `/api/info` | Model metadata and parameter ranges |
| `GET` | `/api/presets` | Available process presets |
| `POST` | `/api/predict` | Generate process predictions |
| `POST` | `/api/optimize` | Optimize process parameters |
| `POST` | `/api/sensitivity` | Calculate a parameter sensitivity sweep |

## Deployment

Deploy the backend and frontend as separate services from this GitHub repository:

- **Backend on Render:** root directory `backend`; build command `pip install -r requirements.txt`; start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; health check path `/health`.
- **Frontend on Vercel:** root directory `frontend`; framework preset Vite; set `VITE_API_URL` to your deployed backend URL.

The backend currently allows cross-origin requests from any origin. If the API cannot be reached, the frontend falls back to local calculations; its optimization fallback uses a randomized search and is approximate.

## Notes

- Live weather lookup requires an internet connection in the user's browser.
- The repository includes a model artifact and dataset. The frontend fallback uses a separate JavaScript surrogate implementation.
- Model outputs are estimates. Validate process settings on the actual equipment before production use.
