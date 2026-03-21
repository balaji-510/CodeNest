@echo off
REM CodeNest Quick Start Script for Windows

echo ================================
echo CodeNest Quick Start
echo ================================

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)
echo [OK] Python found

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Backend Setup
echo.
echo Setting up Backend...
cd codenest_backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env
        echo [WARNING] Please update .env with your database credentials
    )
)

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Ask about superuser
set /p create_super="Do you want to create a superuser? (y/n): "
if /i "%create_super%"=="y" (
    python manage.py createsuperuser
)

REM Frontend Setup
echo.
echo Setting up Frontend...
cd ..\project2

REM Install dependencies
echo Installing Node dependencies...
call npm install

REM Check for .env file
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env
    )
)

REM Done
echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the application:
echo 1. Backend:  cd codenest_backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo 2. Frontend: cd project2 ^&^& npm run dev
echo.
echo Or use: start-dev.bat
echo.
pause
