# 🚀 Start CodeNest Servers - Quick Guide

## Step-by-Step Instructions

### Terminal 1: Start Backend (Django)

```bash
# Navigate to backend
cd CodeNest/codenest_backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Django server
python manage.py runserver
```

**Expected Output**:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
March 09, 2026 - 10:30:00
Django version 6.0.3, using settings 'codenest_backend.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ **Backend is running on**: http://localhost:8000

---

### Terminal 2: Start Frontend (React)

**Open a NEW terminal window**, then:

```bash
# Navigate to frontend
cd CodeNest/project2

# Start React dev server
npm run dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Frontend is running on**: http://localhost:5173

---

## Quick Test

1. **Open Browser**: http://localhost:5173/
2. **Login**: 
   - Username: `admin`
   - Password: `admin123`
3. **Test AI Assistant**:
   - Click any problem (e.g., "Two Sum")
   - Click the bot button (bottom-right corner)
   - Type: "Give me a hint"
   - Get AI response! 🎉

---

## Troubleshooting

### Backend Issues:

**Error: "No module named 'rest_framework'"**
```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Error: "Port 8000 is already in use"**
```bash
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
python manage.py runserver 8001
```

**Error: Virtual environment not found**
```bash
# Create new virtual environment
cd CodeNest/codenest_backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

### Frontend Issues:

**Error: "npm: command not found"**
- Install Node.js from: https://nodejs.org/

**Error: "Cannot find module"**
```bash
cd CodeNest/project2
npm install
npm run dev
```

**Error: "Port 5173 is already in use"**
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Or Vite will automatically use next available port (5174, 5175, etc.)
```

---

## Verify Both Are Running

### Check Backend:
Open browser: http://localhost:8000/api/problems/

**Expected**: JSON list of problems

### Check Frontend:
Open browser: http://localhost:5173/

**Expected**: CodeNest login page

---

## Stop Servers

**To stop either server**:
- Press `Ctrl + C` in the terminal

---

## Quick Commands Reference

```bash
# Backend
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Frontend (new terminal)
cd CodeNest/project2
npm run dev

# Test AI (new terminal, with backend running)
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python test_ai_endpoint_live.py
```

---

## All Set! 🎉

Once both servers are running:
1. Backend: http://localhost:8000 ✅
2. Frontend: http://localhost:5173 ✅
3. Ready to use AI Assistant! 🤖
