@echo off
echo ===================================================
echo   STARTING BHARATNET AIOPS NOC COMMANDER
echo ===================================================
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ===================================================
echo   NOC COMMAND CENTER RUNNING!
echo   Open your browser at: http://localhost:5173
echo ===================================================
pause