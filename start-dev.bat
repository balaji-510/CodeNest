@echo off
REM Start both backend and frontend in development mode

echo ================================
echo Starting CodeNest Development Servers
echo ================================

REM Start backend in new window
echo Starting Django backend...
start "CodeNest Backend" cmd /k "cd codenest_backend && venv\Scripts\activate && python manage.py runserver"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting React frontend...
start "CodeNest Frontend" cmd /k "cd project2 && npm run dev"

echo.
echo ================================
echo Servers Started!
echo ================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close the terminal windows to stop the servers
echo.
pause
