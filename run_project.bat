@echo off
title DRAIN-X Project Launcher
echo ==============================================================================
echo STARTING DRAIN-X SYSTEM (FASTAPI BACKEND + REACT VITE FRONTEND)
echo ==============================================================================
echo.

echo [1/2] Starting FastAPI Backend on port 8001...
start "DRAIN-X FastAPI Backend (Port 8001)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"

echo [2/2] Starting Vite Frontend on port 5173...
start "DRAIN-X Vite Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 >nul

echo Opening browser...
start http://localhost:5173/

echo.
echo ==============================================================================
echo DRAIN-X System is now running!
echo   Frontend: http://localhost:5173/
echo   Backend:  http://127.0.0.1:8001/
echo   API Docs: http://127.0.0.1:8001/docs
echo ==============================================================================
pause
