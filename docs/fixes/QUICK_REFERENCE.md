# 🚀 Quick Reference Guide

## Essential Commands

### Backend (Django)

```bash
# Navigate to backend
cd CodeNest/codenest_backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Run server
python manage.py runserver

# Run on different port
python manage.py runserver 8001
```

### Frontend (React)

```bash
# Navigate to frontend
cd CodeNest/project2

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Quick Start Scripts

```bash
# Windows
quick-start.bat    # Initial setup
start-dev.bat      # Start both servers

# Linux/Mac
./quick-start.sh   # Initial setup
./start-dev.sh     # Start both servers
```

## Important URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/

## Database Commands

```sql
-- Create database
CREATE DATABASE codenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show databases
SHOW DATABASES;

-- Use database
USE codenest_db;

-- Show tables
SHOW TABLES;

-- Drop database (careful!)
DROP DATABASE codenest_db;
```

## Common Django Commands

```bash
# Create new app
python manage.py startapp app_name

# Shell
python manage.py shell

# Database shell
python manage.py dbshell

# Collect static files
python manage.py collectstatic

# Run tests
python manage.py test

# Create migrations for specific app
python manage.py makemigrations api

# Show migrations
python manage.py showmigrations

# Seed database
python manage.py seed_db
```

## Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull
git pull origin main

# Create branch
git checkout -b feature-name

# Switch branch
git checkout branch-name
```

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_NAME=codenest_db
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=3306
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Troubleshooting Commands

```bash
# Check Python version
python --version

# Check Node version
node --version

# Check npm version
npm --version

# Check MySQL status (Windows)
net start MySQL80

# Check MySQL status (Linux)
sudo systemctl status mysql

# Kill process on port (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port (Linux/Mac)
lsof -ti:8000 | xargs kill -9
```

## Package Management

```bash
# Backend - Install package
pip install package-name

# Backend - Update requirements.txt
pip freeze > requirements.txt

# Frontend - Install package
npm install package-name

# Frontend - Install dev dependency
npm install --save-dev package-name

# Frontend - Update packages
npm update
```

## Useful Django Management Commands

```bash
# Check for problems
python manage.py check

# Clear sessions
python manage.py clearsessions

# Change user password
python manage.py changepassword username

# Flush database (delete all data)
python manage.py flush

# Load data from fixture
python manage.py loaddata fixture.json

# Dump data to fixture
python manage.py dumpdata app_name > fixture.json
```

## API Testing with curl

```bash
# Register user
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get problems (with auth)
curl -X GET http://localhost:8000/api/problems/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## File Locations

```
Important Files:
├── Backend Settings: codenest_backend/codenest_backend/settings.py
├── Backend URLs: codenest_backend/codenest_backend/urls.py
├── API Views: codenest_backend/api/views.py
├── API Models: codenest_backend/api/models.py
├── Frontend App: project2/src/App.jsx
├── Frontend Config: project2/vite.config.js
├── Backend Env: codenest_backend/.env
└── Frontend Env: project2/.env
```

## Default Credentials

```
Teacher Registration Code: TEACHER2024
```

## Port Numbers

- Backend: 8000
- Frontend: 5173
- MySQL: 3306

## Keyboard Shortcuts (Frontend)

- `Ctrl+K` or `Cmd+K`: Open command palette
- `Ctrl+/` or `Cmd+/`: Toggle comment in editor

## Production Checklist

Before deploying:
- [ ] Set DEBUG=False
- [ ] Change SECRET_KEY
- [ ] Update ALLOWED_HOSTS
- [ ] Configure CORS properly
- [ ] Set up HTTPS
- [ ] Use environment variables
- [ ] Enable security headers
- [ ] Set up logging
- [ ] Configure static files
- [ ] Set up database backups

## Useful Links

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/
- MySQL Docs: https://dev.mysql.com/doc/

---

**Pro Tip**: Bookmark this page for quick access to common commands!
