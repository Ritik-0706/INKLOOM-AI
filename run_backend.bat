@echo off
echo ==================================================
echo   Starting Inkloom AI Backend (FastAPI on Port 8000)
echo ==================================================
cd backend
venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
