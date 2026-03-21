# CodeNest Setup Guide

## Project Overview
CodeNest is a competitive programming platform with Django backend and React frontend.

## Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Git

## Backend Setup (Django)

### 1. Navigate to backend directory
```bash
cd CodeNest/codenest_backend
```

### 2. Create virtual environment
```bash
python -m venv venv
```

### 3. Activate virtual environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure MySQL Database
- Open MySQL and create database:
```sql
CREATE DATABASE codenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- Update `codenest_backend/settings.py` with your MySQL credentials:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'codenest_db',
        'USER': 'your_mysql_user',
        'PASSWORD': 'your_mysql_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 6. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create superuser
```bash
python manage.py createsuperuser
```

### 8. Seed database (optional)
```bash
python manage.py seed_db
```

### 9. Run development server
```bash
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

## Frontend Setup (React + Vite)

### 1. Navigate to frontend directory
```bash
cd CodeNest/project2
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API endpoint
Create `.env` file in `project2` directory:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Run development server
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Environment Variables

### Backend (.env in codenest_backend/)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_NAME=codenest_db
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=3306
TEACHER_REGISTRATION_CODE=TEACHER2024
```

### Frontend (.env in project2/)
```env
VITE_API_URL=http://localhost:8000
```

## Common Issues & Solutions

### MySQL Connection Error
- Ensure MySQL service is running
- Verify credentials in settings.py
- Check if database exists

### Port Already in Use
- Backend: Use `python manage.py runserver 8001`
- Frontend: Vite will auto-increment port (5174, 5175, etc.)

### CORS Issues
- Verify CORS_ALLOWED_ORIGINS in settings.py includes your frontend URL
- Default: `http://localhost:5173`

### Missing Dependencies
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

## Testing the Application

1. Access frontend: `http://localhost:5173`
2. Register a new account
3. Login and explore features
4. Admin panel: `http://localhost:8000/admin`

## Project Structure

```
CodeNest/
├── codenest_backend/          # Django backend
│   ├── api/                   # Main API app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py    # DRF serializers
│   │   ├── urls.py           # API routes
│   │   └── compiler.py       # Code execution engine
│   ├── codenest_backend/     # Project settings
│   └── manage.py             # Django management
└── project2/                  # React frontend
    ├── src/
    │   ├── Pages/            # Route components
    │   ├── Components/       # Reusable components
    │   └── context/          # React context
    └── package.json
```

## Features

- User authentication with JWT
- Problem solving with code editor (Monaco)
- Real-time code execution
- Analytics and progress tracking
- Leaderboard system
- Contest management
- Mentor dashboard for teachers
- Platform verification (LeetCode, CodeChef, Codeforces)
- Discussion forum
- Personalized roadmaps

## Next Steps

1. Configure email backend for notifications
2. Set up code execution sandbox (Docker recommended)
3. Configure production settings
4. Set up CI/CD pipeline
5. Add comprehensive test coverage
