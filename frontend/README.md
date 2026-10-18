# MicroOptix AI - Executive Frontend (Vercel Ready)

Modern, classy, and responsive web frontend with executive aesthetics and 60fps Framer Motion animations. Built with React, Vite, Tailwind CSS, Recharts, and Canvas Confetti.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Vite Dev Server
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🌐 Deploy to Vercel (1-Click Deployment)

The project includes `vercel.json` pre-configured for single-page routing and caching.

### Option A: Using the Vercel Dashboard (Easiest)
1. Push your repository to **GitHub** or **GitLab**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
3. Import your repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset: **Vite** (auto-detected).
6. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://microoptix-ai-backend.onrender.com`)
7. Click **"Deploy"**.

### Option B: Using Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel
```

---

## 🎨 Features & Highlights
- **Clean Minimalist Executive Aesthetic**: Switchable Dark/Light themes with subtle luxury shadows, frosted glass panels, and typography.
- **Buttery 60fps Animations**: Powered by Framer Motion, with spring number lerping, rotating icons, glowing indicators, and particle celebration confetti.
- **Smart Backend Fallback**: Built-in physics-informed surrogate guarantees zero latency and 100% availability even while Render is waking up.
- **Dynamic Response Surface Sweeps**: Dual-axis sensitivity curve with current-point indicator.
- **Multi-Objective Optimization Engine**: Choose between Balanced Pareto, Peak MRR, Ultra-Fine Ra, or Custom Target, running Scipy Differential Evolution.

