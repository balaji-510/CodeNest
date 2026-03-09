@echo off
echo ========================================
echo CodeNest Docker Execution Setup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run this from codenest_backend directory
    echo and ensure venv exists.
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if Docker is installed
echo.
echo Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: Docker is not installed or not running!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo Docker found!
docker --version

REM Install Docker SDK
echo.
echo Installing Python Docker SDK...
pip install docker

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Docker SDK
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.

REM Pull Docker images
echo Pulling Docker images (this may take a few minutes)...
echo.

echo [1/4] Pulling Python image...
docker pull python:3.11-slim

echo [2/4] Pulling Node.js image...
docker pull node:18-slim

echo [3/4] Pulling Java image...
docker pull openjdk:17-slim

echo [4/4] Pulling GCC image...
docker pull gcc:11

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: python manage.py test_docker
echo 2. Start backend: python manage.py runserver
echo.
pause
