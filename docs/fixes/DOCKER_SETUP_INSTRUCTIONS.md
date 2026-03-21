# 🚀 Docker Execution Setup - Step by Step

## Quick Start (5 Minutes)

### Step 1: Install Docker Desktop

**Windows/Mac:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Run the installer
3. Start Docker Desktop
4. Wait for "Docker Desktop is running" message

**Linux:**
```bash
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in
```

### Step 2: Verify Docker

```bash
docker --version
docker ps
```

You should see Docker version and an empty container list.

### Step 3: Install Python Docker SDK

```bash
cd CodeNest/codenest_backend
.\venv\Scripts\activate
pip install docker
```

### Step 4: Run Setup Script (Windows)

```bash
.\setup_docker.bat
```

This will:
- Install Docker SDK
- Pull required images
- Test the installation

### Step 5: Test Docker Execution

```bash
python manage.py test_docker
```

Expected output:
```
✅ Docker is available
Docker version 24.0.0

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

### Step 6: Start Backend

```bash
python manage.py runserver
```

### Step 7: Test in Browser

1. Go to http://localhost:5173
2. Login
3. Open any problem
4. Write code and click "Run Code"
5. Check console for execution metrics

---

## Manual Setup (If Script Fails)

### 1. Install Docker SDK

```bash
cd CodeNest/codenest_backend
.\venv\Scripts\activate
pip install docker
```

### 2. Pull Docker Images

```bash
docker pull python:3.11-slim
docker pull node:18-slim
docker pull openjdk:17-slim
docker pull gcc:11
```

### 3. Test

```bash
python manage.py test_docker
```

---

## Troubleshooting

### "Docker is not available"

**Cause**: Docker Desktop not running

**Fix**:
1. Open Docker Desktop
2. Wait for it to start
3. Run `docker ps` to verify
4. Retry

### "Permission denied" (Linux)

**Cause**: User not in docker group

**Fix**:
```bash
sudo usermod -aG docker $USER
# Log out and back in
newgrp docker
```

### "Failed to pull image"

**Cause**: Network issue or Docker Hub down

**Fix**:
1. Check internet connection
2. Try again later
3. Or continue - images will be pulled when needed

### "Module 'docker' not found"

**Cause**: Docker SDK not installed

**Fix**:
```bash
pip install docker
```

---

## Verification Checklist

- [ ] Docker Desktop installed and running
- [ ] `docker --version` shows version
- [ ] `docker ps` works without errors
- [ ] Python Docker SDK installed (`pip list | grep docker`)
- [ ] Images pulled (check with `docker images`)
- [ ] Test command passes (`python manage.py test_docker`)
- [ ] Backend starts without errors
- [ ] Code execution works in UI

---

## What Happens Next?

Once setup is complete:

1. **Code Execution** uses Docker automatically
2. **Faster execution** (100-200ms vs 500-1000ms)
3. **Better security** (isolated containers)
4. **Detailed metrics** (time and memory)
5. **Automatic fallback** to Piston if Docker fails

---

## Need Help?

- **Full Guide**: See `DOCKER_EXECUTION_GUIDE.md`
- **Quick Reference**: See `DOCKER_QUICK_REFERENCE.md`
- **Implementation Details**: See `DOCKER_EXECUTION_COMPLETE.md`

---

## Alternative: Use Without Docker

If you can't install Docker, the system will automatically use Piston API:

1. Skip Docker installation
2. Start backend normally
3. System detects Docker unavailable
4. Falls back to Piston API
5. Everything still works (just slower)

---

**Estimated Setup Time**: 5-10 minutes  
**Difficulty**: Easy  
**Required**: Docker Desktop, Python

---

*Ready to go? Run `.\setup_docker.bat` and you're done!* 🚀
