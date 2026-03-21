# 🔍 Server Status Check

## ✅ Current Status

### Backend (Django):
- **Status**: ✅ Running
- **URL**: http://localhost:8000
- **Port**: 8000

### Frontend (React/Vite):
- **Status**: ✅ Running  
- **URL**: http://localhost:5174
- **Port**: 5174 (Note: 5174, not 5173)

---

## 🧪 Quick Tests

### Test 1: Check Backend API
Open in browser: http://localhost:8000/api/problems/

**Expected**: JSON list of problems

**If error**: Backend not working properly

### Test 2: Check Frontend
Open in browser: http://localhost:5174/

**Expected**: CodeNest login page

**If error**: Frontend not working properly

### Test 3: Check AI Endpoint
Run this in a new terminal:
```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python test_ai_endpoint_live.py
```

**Expected**: ✅ AI Assistant endpoint is working perfectly!

---

## 🐛 Common "Server Error" Causes

### 1. CORS Error
**Symptom**: "CORS policy" error in browser console

**Fix**: Update CORS settings in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",  # Add this!
    "http://localhost:5175",
]
```

### 2. Authentication Error
**Symptom**: 401 Unauthorized

**Fix**: 
- Logout and login again
- Check token exists: `localStorage.getItem('access_token')`

### 3. API Endpoint Not Found
**Symptom**: 404 Not Found

**Fix**: Check URL in frontend matches backend endpoint

### 4. Database Error
**Symptom**: 500 Internal Server Error with database message

**Fix**:
```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
```

### 5. AI Service Error
**Symptom**: AI Assistant returns error

**Fix**: Check Groq API key is set correctly

---

## 📋 Debugging Steps

1. **Check Browser Console** (F12 → Console):
   - Look for red errors
   - Note the error message
   - Check which API call failed

2. **Check Backend Logs**:
   - Look at Django terminal
   - Check for Python exceptions
   - Note the error traceback

3. **Check Network Tab** (F12 → Network):
   - See which requests fail
   - Check status codes (404, 500, etc.)
   - View request/response details

4. **Test Specific Endpoint**:
   ```bash
   # Test login
   curl -X POST http://localhost:8000/api/token/ \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # Should return access token
   ```

---

## 🔧 Quick Fixes

### Fix 1: Restart Servers
```bash
# Stop both servers (Ctrl+C in terminals)
# Then restart:

# Terminal 1 - Backend
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - Frontend
cd CodeNest/project2
npm run dev
```

### Fix 2: Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cache and cookies
- Reload page

### Fix 3: Logout and Login
- Logout from application
- Clear localStorage
- Login again with admin/admin123

### Fix 4: Check Environment
```bash
# Verify virtual environment
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python -c "import django; print(django.__version__)"
# Should print: 6.0.3
```

---

## 📞 Need More Help?

Please provide:

1. **Error Message**: Exact text of the error
2. **Browser Console**: Screenshot or copy of errors (F12)
3. **Django Logs**: Copy from backend terminal
4. **What You Were Doing**: Which page, what action
5. **Test Results**: Output from test_ai_endpoint_live.py

---

## ✅ Servers Are Running!

Both servers are currently running and ready to use:
- Backend: http://localhost:8000 ✅
- Frontend: http://localhost:5174 ✅

**Try accessing the frontend now and let me know what specific error you see!**
