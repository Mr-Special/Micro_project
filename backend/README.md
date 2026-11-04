# MicroOptix AI backend

FastAPI service for weather-aware regional electricity demand estimates, model sensitivity analysis, and reverse weather scenario search.

For model training, dataset details, evaluation scores, feature engineering, API examples, and full project setup, see the [project README](../README.md#electricity-model).

## Run locally

From this directory:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The interactive API documentation is available at `http://127.0.0.1:8000/docs`.

## Electricity model files

- `../overall_best_electricity_model.pkl`: trained Ridge Regression estimator, serialized with scikit-learn 1.6.1.
- `app/electricity_feature_medians.json`: training medians used to fill model inputs not available from live weather.
- `../main_data_electricity.csv`: source training dataset.
- `../Model_Train.ipynb`: data prep, model comparison, evaluation, and export workflow.

At startup, `GET /health` reports `electricity_model_loaded`. The dashboard's inference path uses:

- `POST /api/electricity-predict`
- `POST /api/electricity-sensitivity`
- `POST /api/electricity-optimize`
- `GET /api/ml-performance`

The first three routes use the saved model when it loads. Demand and scenario outputs are regional estimates based on weather inputs; the reverse search returns hypothetical climate values, not a weather forecast.

## Render deployment

Use this directory as the service root, install with `pip install -r requirements.txt`, and start with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set the health check path to `/health`. Keep the model artifact and feature medians JSON in the repository at their documented relative paths. The frontend must point `VITE_API_URL` to the deployed service. Deploy the updated backend before expecting the hosted frontend to use the electricity routes.
