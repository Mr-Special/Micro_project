# MicroOptix AI frontend

React and Vite web client for the weather-aware electricity dashboard. It provides live consumption estimates, anomaly scenarios, a reverse weather-energy optimizer, local historical readings, and model performance charts.

For the trained model, data preparation, evaluation metrics, backend API, and full project setup, see the [project README](../README.md).

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL, typically `http://localhost:5173`.

To connect to a local backend, set the following in `frontend/.env` and restart Vite:

```env
VITE_API_URL=http://127.0.0.1:8000
```

You can also configure the backend URL in the app. If an electricity endpoint is unavailable, the client uses a simplified local weather estimate for the affected dashboard feature.

## Production build

```bash
npm run build
npm run preview
```

For Vercel, set the project root to `frontend`, select Vite, and configure `VITE_API_URL` as the deployed backend URL. Redeploy after changing the environment variable.
