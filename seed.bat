@echo off
echo ==================================================
echo   Inkloom AI - Database Seeding
echo ==================================================
cd backend
venv\Scripts\python seed_data.py
cd ..
pause
