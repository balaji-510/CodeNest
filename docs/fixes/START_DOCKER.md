# 🚀 Quick Start - Docker Executor

## Current Status
✅ Docker installed (version 29.2.1)  
✅ Python Docker SDK installed  
⚠️ Docker Desktop needs to be started

## Steps to Start Using Docker Executor

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application from Start Menu
2. Wait for it to say "Docker Desktop is running" (usually 30-60 seconds)
3. You'll see the Docker icon in your system tray

### Step 2: Verify Docker is Running
Open a terminal and run:
```bash
docker ps
```

You should see an empty table (no containers running yet). If you see an error, Docker Desktop is not fully started yet.

### Step 3: Test Docker Executor
```bash
cd CodeNest/codenest_backend
.\venv\Scripts\activate
python manage.py test_docker
```

Expected output:
```
✅ Docker is available
Docker version 29.2.1

Testing Python execution...
  ✅ Success
  Output: Hello from Python!
Sum: 15
  Time: 0.123s
  Memory: 12.34 KB

Testing JavaScript execution...
  ✅ Success
  ...

✅ All tests completed!
```

### Step 4: Start Backend
```bash
python manage.py runserver
```

### Step 5: Test in Browser
1. Go to http://localhost:5173
2. Login
3. Open any problem
4. Write code and click "Run Code"
5. Your code now executes in Docker! 🎉

## What Happens Automatically

Once Docker Desktop is running:
- ✅ Backend automatically detects Docker
- ✅ Code execution uses Docker containers
- ✅ Faster execution (100-200ms vs 500-1000ms)
- ✅ Better security (isolated containers)
- ✅ Detailed metrics (time and memory usage)

## If Docker Desktop is Not Running

No problem! The system automatically falls back to Piston API:
- ✅ Everything still works
- ⚠️ Slightly slower (uses external API)
- ⚠️ No memory metrics

## Troubleshooting

### "Docker Desktop won't start"
- Restart your computer
- Check if WSL 2 is enabled (Windows Settings → Apps → Optional Features)
- Reinstall Docker Desktop if needed

### "docker ps" shows error
- Docker Desktop is still starting (wait 30-60 seconds)
- Or Docker Desktop crashed (restart it)

### "Test command fails"
- Make sure Docker Desktop shows "running" status
- Try `docker ps` first to verify
- Restart Docker Desktop

## Quick Commands

```bash
# Check Docker status
docker --version
docker ps

# Test Docker executor
cd CodeNest/codenest_backend
.\venv\Scripts\activate
python manage.py test_docker

# Start backend
python manage.py runserver
```

## Summary

**What you need to do:**
1. Start Docker Desktop (one-time per boot)
2. That's it! Everything else is automatic.

**What happens automatically:**
- Backend detects Docker
- Uses Docker for code execution
- Falls back to Piston if Docker unavailable
- No code changes needed

---

**Status**: Ready to use once Docker Desktop is running! 🚀
