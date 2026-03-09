@echo off
echo.
echo ============================================================
echo   CodeNest - Problem Seeder
echo ============================================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the seeder
python seed_problems.py

REM Deactivate
deactivate

echo.
echo Press any key to exit...
pause > nul
