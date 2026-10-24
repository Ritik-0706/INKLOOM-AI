@echo off
echo ==================================================
echo   Running Inkloom AI Test Suite (Pytest)
echo ==================================================
cd backend
venv\Scripts\pytest tests\test_api.py -v
cd ..
pause
