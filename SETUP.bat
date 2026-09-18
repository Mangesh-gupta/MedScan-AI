@echo off
title MedScan AI - First Time Setup
color 0B
echo.
echo  =====================================================
echo   MEDSCAN AI - FIRST TIME SETUP
echo   AI-Powered Radiology Copilot
echo  =====================================================
echo.

REM ── Check Python ──────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python is not installed or not in PATH.
    echo.
    echo  Please install Python 3.10 or higher from:
    echo  https://www.python.org/downloads/
    echo.
    echo  IMPORTANT: During installation, check the box:
    echo  "Add Python to PATH"
    echo.
    pause
    exit /b 1
)
echo  [OK] Python found.

REM ── Check Node.js ─────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo.
    echo  Please install Node.js 18 or higher (LTS) from:
    echo  https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo  [OK] Node.js found.

REM ── Install Python dependencies ────────────────────────
echo.
echo  [1/3] Installing Python backend packages...
echo        (This may take a few minutes on first run)
echo.
cd /d "%~dp0backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo  [ERROR] Failed to install Python packages.
    echo  Try running this script as Administrator.
    pause
    exit /b 1
)
echo.
echo  [OK] Python packages installed.

REM ── Install Node dependencies ──────────────────────────
echo.
echo  [2/3] Installing frontend packages...
echo        (This may take a few minutes on first run)
echo.
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo.
    echo  [ERROR] Failed to install frontend packages.
    pause
    exit /b 1
)
echo.
echo  [OK] Frontend packages installed.

REM ── Seed demo data ────────────────────────────────────
echo.
echo  [3/3] Loading demo radiology cases into database...
echo.
cd /d "%~dp0backend"
python seed_data.py
echo  [OK] Demo cases loaded.

echo.
echo  =====================================================
echo   SETUP COMPLETE!
echo.
echo   Now run: START_APP.bat  to launch VisionGuard 360
echo  =====================================================
echo.
pause
