@echo off
title MedScan AI - AI Radiology Copilot Launcher
echo =====================================================================
echo                MEDSCAN AI HEALTHCARE PLATFORM
echo   AI-Powered Radiology Copilot for Faster and Smarter Diagnostic Reporting
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying and Seeding Database...
python backend/seed_data.py
if errorlevel 1 (
    echo [ERROR] Failed to seed database.
    pause
    exit /b 1
)

echo.
echo [2/3] Starting FastAPI Backend on http://localhost:8000 ...
start "MedScan AI Backend" cmd /k "cd backend && python run.py"

timeout /t 2 >nul

echo.
echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
start "MedScan AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================================
echo   MedScan AI is successfully running!
echo.
echo   Frontend UI:  http://localhost:5173
echo   Backend API:   http://localhost:8000
echo   OpenAPI Docs:  http://localhost:8000/docs
echo =====================================================================
echo.
pause
