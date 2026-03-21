@echo off
echo ========================================
echo   CodeNest Application Startup
echo ========================================
echo.

echo Starting Backend Server...
start "CodeNest Backend" cmd /k "cd codenest_backend && python manage.py runserver"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "CodeNest Frontend" cmd /k "cd project2 && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
