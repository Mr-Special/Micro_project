# MicroOptix AI - Backend API (Render Ready)

High-performance FastAPI prediction and Scipy multi-objective optimization service.

---

## 🚀 Quick Start (Local Development)

### 1. Setup Virtual Environment
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Open **http://127.0.0.1:8000/docs** to test the interactive Swagger UI!

---

## 🌐 Deploy to Render (Step-by-Step)

1. Push this repository to **GitHub** or **GitLab**.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **"New +" -> "Web Service"**.
3. Select your repository.
4. Configure service settings:
   - **Name**: `microoptix-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. (Optional) In **Advanced Settings**, set **Health Check Path** to `/health`.
6. Click **"Deploy Web Service"**.
7. Once deployed, copy your Render URL (e.g. `https://microoptix-ai-backend.onrender.com`).
8. Paste this URL into the frontend `.env` or in the frontend UI's **Backend Connection Settings** modal!

