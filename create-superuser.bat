@echo off
echo ================================
echo Creating Django Superuser
echo ================================
echo.
cd codenest_backend
call venv\Scripts\activate.bat
python manage.py createsuperuser
echo.
echo Superuser created successfully!
pause
