Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "STARTING DRAIN-X SYSTEM (FASTAPI BACKEND + REACT VITE FRONTEND)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host "[1/2] Launching FastAPI Backend on port 8001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"

Write-Host "[2/2] Launching React Vite Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173/"

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "DRAIN-X System is now running!" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173/"
Write-Host "  Backend:  http://127.0.0.1:8001/"
Write-Host "  Swagger:  http://127.0.0.1:8001/docs"
Write-Host "==============================================================================" -ForegroundColor Cyan
