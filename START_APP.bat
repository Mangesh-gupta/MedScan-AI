@echo off
title MedScan AI - AI Radiology Copilot
color 0B
echo.
echo  =====================================================
echo   MEDSCAN AI - Starting Application...
echo   AI-Powered Radiology Copilot
echo  =====================================================
echo.

REM ── Start Backend ──────────────────────────────────────
echo  Starting Backend API server  (http://127.0.0.1:8000)
start "MedScan AI - Backend API" cmd /k "cd /d "%~dp0backend" && python run.py"

REM Small delay so backend can initialize
timeout /t 3 /nobreak >nul

REM ── Start Frontend ─────────────────────────────────────
echo  Starting Frontend Dev server (http://localhost:5173)
start "MedScan AI - Frontend UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM Wait for frontend to boot
timeout /t 4 /nobreak >nul

REM ── Open Browser ───────────────────────────────────────
echo  Opening MedScan AI in your browser...
start http://localhost:5173

echo.
echo  =====================================================
echo   MedScan AI is running!
echo.
echo   Frontend  ->  http://localhost:5173
echo   Backend   ->  http://127.0.0.1:8000
echo   API Docs  ->  http://127.0.0.1:8000/docs
echo.
echo   Close the two server windows to stop the app.
echo  =====================================================
echo.
