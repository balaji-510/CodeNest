# 🔧 Troubleshooting Server Error

## Quick Diagnostics

### Step 1: Check Django Server is Running

```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**Expected Output**:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**If you see errors**, check:
- Virtual environment is activated (you should see `(venv)` in prompt)
- No other process is using port 8000
- All dependencies are installed: `pip install -r requirements.txt`

---

### Step 2: Test AI Endpoint

**With server running**, open a NEW terminal:

```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python test_ai_endpoint_live.py
```

**Expected Output**:
```
✅ Login successful!
✅ Response Status: 200
✅ AI Response received!
🎉 AI Assistant endpoint is working perfectly!
```

**If you see errors**, note the error message and continue below.

---

### Step 3: Check Browser Console

1. Open browser (Chrome/Edge/Firefox)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try using AI Assistant
5. Look for red error messages

**Common Errors**:

#### Error: "Failed to fetch" or "Network Error"
**Cause**: Django server not running or CORS issue

**Solution**:
```bash
# Check Django is running on port 8000
# Check CORS settings in settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
]
```

#### Error: "401 Unauthorized"
**Cause**: Not logged in or token expired

**Solution**:
- Logout and login again
- Check localStorage has access_token
- Verify token in browser console: `localStorage.getItem('access_token')`

#### Error: "500 Internal Server Error"
**Cause**: Server-side error

**Solution**:
- Check Django terminal for error traceback
- Look for Python exceptions
- Check the specific error message

---

### Step 4: Check Django Logs

Look at the Django terminal where `runserver` is running.

**Look for**:
- Red error messages
- Traceback (Python stack trace)
- Specific error details

**Common Issues**:

#### ModuleNotFoundError: No module named 'rest_framework'
**Solution**:
```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### ImportError or AttributeError
**Solution**: Check the specific file mentioned in error

#### Database errors
**Solution**:
```bash
python manage.py migrate
```

---

### Step 5: Verify Configuration

#### Check API Key:
```bash
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python verify_groq_api.py
```

**Expected**: ✅ SUCCESS! Groq API is working!

**If failed**: API key might be incorrect

#### Check Settings:
```python
# In codenest_backend/settings.py
GROQ_API_KEY = 'your-groq-api-key-here'

# Should be in INSTALLED_APPS:
INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'api',
]

# Should be in MIDDLEWARE:
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]
```

---

### Step 6: Test Frontend Connection

#### Check Frontend is Running:
```bash
cd CodeNest/project2
npm run dev
```

**Expected**: Local: http://localhost:5173/

#### Check API URL in Frontend:
In `AIAssistant.jsx`, verify:
```javascript
const response = await fetch('http://localhost:8000/api/ai-assistant/', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, context })
});
```

---

## Common Error Solutions

### Error: "Server Error" (Generic)

**Check**:
1. Django terminal for specific error
2. Browser console for network errors
3. Django logs for Python exceptions

**Try**:
```bash
# Restart Django server
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Clear browser cache
# Logout and login again
```

---

### Error: AI Assistant Not Responding

**Check**:
1. Is Django server running?
2. Is user logged in?
3. Is Groq API key valid?

**Test**:
```bash
# Test API key
python verify_groq_api.py

# Test endpoint
python test_ai_endpoint_live.py
```

---

### Error: CORS Policy

**Symptoms**: 
```
Access to fetch at 'http://localhost:8000/api/ai-assistant/' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:
```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]
```

Restart Django server after changing.

---

### Error: Authentication Failed

**Symptoms**: 401 Unauthorized

**Solution**:
1. Logout from application
2. Login again with admin/admin123
3. Check token is saved: Open browser console, type:
   ```javascript
   localStorage.getItem('access_token')
   ```
4. Should show a long token string

---

### Error: Groq API Failed

**Symptoms**: AI returns fallback responses

**Check**:
```bash
python verify_groq_api.py
```

**If failed**:
- Check API key in settings.py
- Verify internet connection
- Check Groq service status

---

## Step-by-Step Debug Process

1. **Start Django**:
   ```bash
   cd CodeNest/codenest_backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver
   ```
   ✅ Should see "Starting development server..."

2. **Test Endpoint**:
   ```bash
   # New terminal
   cd CodeNest/codenest_backend
   .\venv\Scripts\Activate.ps1
   python test_ai_endpoint_live.py
   ```
   ✅ Should see "AI Assistant endpoint is working perfectly!"

3. **Start Frontend**:
   ```bash
   cd CodeNest/project2
   npm run dev
   ```
   ✅ Should see "Local: http://localhost:5173/"

4. **Test in Browser**:
   - Open http://localhost:5173/
   - Login: admin / admin123
   - Open any problem
   - Click AI Assistant
   - Send a message
   ✅ Should get AI response

5. **Check Logs**:
   - Django terminal: Look for errors
   - Browser console (F12): Look for errors
   - Note any error messages

---

## Still Having Issues?

**Provide these details**:

1. **Error Message**: Exact text of error
2. **Where**: Browser console, Django terminal, or frontend?
3. **When**: What action triggers it?
4. **Django Logs**: Copy error from Django terminal
5. **Browser Console**: Copy error from browser F12 console
6. **Test Results**: Output from `test_ai_endpoint_live.py`

**Quick Checks**:
```bash
# Check Django
python manage.py check

# Check API key
python verify_groq_api.py

# Check endpoint
python test_ai_endpoint_live.py

# Check dependencies
pip list | grep -E "django|rest"
```

---

## Emergency Reset

If nothing works:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Reinstall dependencies
cd CodeNest/codenest_backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 3. Check database
python manage.py migrate

# 4. Restart Django
python manage.py runserver

# 5. In new terminal, restart frontend
cd CodeNest/project2
npm run dev

# 6. Test
python test_ai_endpoint_live.py
```

---

**Most Common Issue**: Virtual environment not activated!

**Solution**: Always run `.\venv\Scripts\Activate.ps1` first!
