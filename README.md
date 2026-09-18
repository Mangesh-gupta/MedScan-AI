# MedScan AI — AI Radiology Copilot

> AI-Powered Radiology Copilot for Faster and Smarter Diagnostic Reporting

---

## 🖥️ System Requirements (Other Laptop)

Before running the app, install these two tools:

| Tool | Version | Download |
|------|---------|----------|
| **Python** | 3.10 or higher | https://www.python.org/downloads/ |
| **Node.js** | 18 LTS or higher | https://nodejs.org/ |

> ⚠️ **Important:** During Python installation, check the box **"Add Python to PATH"**

---

## 🚀 How to Run (Step by Step)

### Step 1 — First Time Only: Run Setup
Double-click `SETUP.bat`

This will automatically:
- Install all Python backend packages
- Install all frontend npm packages
- Load demo radiology cases into the database

*(Takes ~2–5 minutes on first run depending on internet speed)*

### Step 2 — Every Time: Start the App
Double-click `START_APP.bat` (or `start_medscan.bat`)

This will:
- Start the backend API on `http://127.0.0.1:8000`
- Start the frontend UI on `http://localhost:5173`
- Open the app in your browser automatically

---

## 📁 Project Structure

```
MedScanAI/
├── SETUP.bat              ← Run first time only
├── START_APP.bat          ← Run every time to start app
├── backend/
│   ├── run.py             ← Backend entry point
│   ├── seed_data.py       ← Loads demo cases
│   ├── requirements.txt   ← Python dependencies
│   └── app/               ← FastAPI application
├── frontend/
│   ├── src/               ← React source code
│   ├── package.json       ← Node dependencies
│   └── vite.config.ts
└── README.md
```

---

## 🩻 Features

- Upload **MRI** (Brain / Lung) and **X-Ray** (Chest / Knee) scans
- AI validates image authenticity — rejects non-medical images
- Auto-detects anatomy type and cross-checks with exam selection
- Generates professional radiology reports with disease staging
- Radiologist can **edit findings, impression, and advice**
- **Approve & digitally verify** reports with a single click
- **Print** or **Download PDF** of any report
- **Report History** with search, quick-approve, and modal inspection

---

## 🔗 App URLs (after starting)

| Service | URL |
|---------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://127.0.0.1:8000 |
| API Documentation | http://127.0.0.1:8000/docs |

---

*Built with FastAPI + React + SQLite + ReportLab + OpenCV*
