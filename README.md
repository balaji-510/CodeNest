# CodeNest

CodeNest is a full-stack coding practice platform with a React frontend and a Django REST backend. It includes authentication, dashboards, coding challenges, submissions, leaderboard, mentor features, and profile integrations.

## Repository Structure

- `codenest_backend/` - Django + DRF backend
- `project2/` - React + Vite frontend
- `create_db.py`, `verify_api.py` - utility scripts

## Tech Stack

- Frontend: React, Vite, Axios, Monaco Editor, Recharts
- Backend: Django, Django REST Framework, SimpleJWT
- Database: MySQL (configurable)

## Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL

## Local Setup

### 1. Backend

```bash
cd codenest_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend default URL: `http://127.0.0.1:8000`

### 2. Frontend

```bash
cd project2
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Notes

- Update Django database settings before first run.
- Keep secrets and environment-specific values out of version control.

## License

Add your preferred license here.
