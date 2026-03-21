# 📦 Git Setup & Commit Guide

## 🎯 Quick Start

### First Time Setup

```bash
# Navigate to project root
cd CodeNest

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: CodeNest platform with AI assistant"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/codenest.git
git branch -M main
git push -u origin main
```

---

## 📋 What's Included in Git

### ✅ Files That ARE Tracked:

#### Backend:
- ✅ All Python source code (`.py` files)
- ✅ Requirements file (`requirements.txt`)
- ✅ Django settings (with secrets in env vars)
- ✅ Models, views, serializers
- ✅ API endpoints
- ✅ Management commands
- ✅ Environment example (`.env.example`)

#### Frontend:
- ✅ All React components (`.jsx`, `.js`)
- ✅ All CSS/styling files
- ✅ Package files (`package.json`, `package-lock.json`)
- ✅ Vite configuration
- ✅ Public assets

#### Documentation:
- ✅ All markdown files (`.md`)
- ✅ Setup guides
- ✅ Feature documentation
- ✅ Deployment guides
- ✅ README files

#### Configuration:
- ✅ `.gitignore`
- ✅ `.env.example` (template)
- ✅ Configuration files

---

## ❌ Files That Are NOT Tracked:

### Excluded (in .gitignore):

#### Sensitive:
- ❌ `.env` (contains API keys!)
- ❌ `*.key`, `*.pem` (certificates)
- ❌ `secrets.json`
- ❌ API keys and passwords

#### Generated:
- ❌ `__pycache__/` (Python cache)
- ❌ `node_modules/` (npm packages)
- ❌ `venv/`, `env/` (virtual environment)
- ❌ `dist/`, `build/` (build output)
- ❌ `*.pyc`, `*.pyo` (compiled Python)

#### Database:
- ❌ `db.sqlite3` (local database)
- ❌ `*.sqlite3`

#### Logs:
- ❌ `*.log` (log files)
- ❌ `debug_log.txt`

#### OS/IDE:
- ❌ `.vscode/`, `.idea/` (IDE settings)
- ❌ `.DS_Store` (Mac)
- ❌ `Thumbs.db` (Windows)

---

## 🔐 Security Best Practices

### NEVER Commit:
1. **API Keys** (Groq, OpenAI, Gemini)
2. **Secret Keys** (Django SECRET_KEY)
3. **Passwords** (Database, admin)
4. **Tokens** (JWT, OAuth)
5. **Certificates** (SSL, private keys)
6. **Database files** (db.sqlite3)
7. **Environment files** (.env)

### Always Use:
1. **Environment variables** for secrets
2. **`.env.example`** as template
3. **`.gitignore`** to exclude sensitive files
4. **Separate configs** for dev/prod

---

## 📝 Commit Message Guide

### Format:
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, styling
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples:

```bash
# Feature
git commit -m "feat: Add AI chatbot assistant with Groq integration"

# Bug fix
git commit -m "fix: Resolve 500 error in submission analytics"

# Documentation
git commit -m "docs: Add deployment guide for Railway and Vercel"

# Multiple changes
git commit -m "feat: Implement contest participation and leaderboard

- Add contest join functionality
- Create live leaderboard component
- Update contest API endpoints
- Add real-time ranking updates"
```

---

## 🚀 Common Git Commands

### Daily Workflow:

```bash
# Check status
git status

# Add specific files
git add file1.py file2.jsx

# Add all changes
git add .

# Commit with message
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### Branching:

```bash
# Create new branch
git checkout -b feature/ai-assistant

# Switch branches
git checkout main

# Merge branch
git merge feature/ai-assistant

# Delete branch
git branch -d feature/ai-assistant
```

### Undo Changes:

```bash
# Discard changes in file
git checkout -- file.py

# Unstage file
git reset HEAD file.py

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### View History:

```bash
# View commit history
git log

# View compact history
git log --oneline

# View changes
git diff

# View specific file history
git log -- file.py
```

---

## 📦 Preparing for GitHub

### Step 1: Create .gitignore (Done! ✅)

Already created with proper exclusions.

### Step 2: Create README.md

```bash
# Create main README
touch README.md
```

Add project description, setup instructions, features, etc.

### Step 3: Remove Sensitive Data

```bash
# Check for accidentally committed secrets
git log --all --full-history -- "*.env"

# If found, remove from history (careful!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### Step 4: Initial Commit

```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit: CodeNest - Competitive Programming Platform

Features:
- User authentication and profiles
- Problem solving with code editor
- Contest creation and management
- Achievement system with notifications
- AI-powered coding assistant (Groq)
- Activity heatmap and analytics
- Leaderboard and rankings
- Profile integration with achievements"

# Push to GitHub
git push -u origin main
```

---

## 🌐 Connect to GitHub

### Method 1: GitHub CLI (Recommended)

```bash
# Install GitHub CLI: https://cli.github.com/

# Login
gh auth login

# Create repo and push
gh repo create codenest --public --source=. --remote=origin --push
```

### Method 2: Manual

```bash
# Create repo on GitHub.com first, then:

# Add remote
git remote add origin https://github.com/yourusername/codenest.git

# Push
git branch -M main
git push -u origin main
```

---

## 🔍 Verify Before Pushing

### Checklist:

```bash
# 1. Check .gitignore is working
git status
# Should NOT see: .env, venv/, node_modules/, db.sqlite3

# 2. Check for secrets
git diff --cached | grep -i "api_key\|secret\|password"
# Should return nothing or only .env.example

# 3. Verify files to commit
git status
# Should see: .py, .jsx, .css, .md, .json files

# 4. Test locally first
# Make sure app runs before committing

# 5. Review changes
git diff --cached
```

---

## 📊 Repository Structure

```
CodeNest/
├── .gitignore                    ✅ Tracked
├── README.md                     ✅ Tracked
├── GIT_GUIDE.md                  ✅ Tracked
├── DEPLOYMENT_GUIDE.md           ✅ Tracked
├── codenest_backend/
│   ├── .env.example              ✅ Tracked (template)
│   ├── .env                      ❌ Ignored (secrets)
│   ├── requirements.txt          ✅ Tracked
│   ├── manage.py                 ✅ Tracked
│   ├── db.sqlite3                ❌ Ignored
│   ├── venv/                     ❌ Ignored
│   ├── api/
│   │   ├── models.py             ✅ Tracked
│   │   ├── views.py              ✅ Tracked
│   │   ├── serializers.py        ✅ Tracked
│   │   ├── ai_service.py         ✅ Tracked
│   │   └── __pycache__/          ❌ Ignored
│   └── codenest_backend/
│       └── settings.py           ✅ Tracked
└── project2/
    ├── package.json              ✅ Tracked
    ├── package-lock.json         ✅ Tracked
    ├── vite.config.js            ✅ Tracked
    ├── node_modules/             ❌ Ignored
    ├── dist/                     ❌ Ignored
    └── src/
        ├── Components/
        │   └── AIAssistant.jsx   ✅ Tracked
        ├── Pages/                ✅ Tracked
        └── styles1/              ✅ Tracked
```

---

## 🎯 Quick Commands Reference

```bash
# First time setup
git init
git add .
git commit -m "Initial commit"
git remote add origin <url>
git push -u origin main

# Daily workflow
git status                    # Check changes
git add .                     # Stage all
git commit -m "message"       # Commit
git push                      # Push to GitHub

# Branching
git checkout -b feature-name  # New branch
git checkout main             # Switch to main
git merge feature-name        # Merge branch

# Undo
git reset HEAD file           # Unstage
git checkout -- file          # Discard changes
git reset --soft HEAD~1       # Undo commit

# View
git log --oneline             # History
git diff                      # Changes
git status                    # Status
```

---

## 🚨 Common Issues

### Issue 1: Accidentally Committed .env

```bash
# Remove from git but keep locally
git rm --cached .env
git commit -m "Remove .env from tracking"

# Add to .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
```

### Issue 2: Large Files

```bash
# Check file sizes
git ls-files | xargs ls -lh | sort -k5 -h

# Remove large file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch large-file.zip" \
  --prune-empty --tag-name-filter cat -- --all
```

### Issue 3: Merge Conflicts

```bash
# Pull latest
git pull origin main

# Fix conflicts in files
# Look for <<<<<<< HEAD markers

# After fixing
git add .
git commit -m "Resolve merge conflicts"
git push
```

---

## ✅ Final Checklist

Before pushing to GitHub:

- [ ] `.gitignore` is configured
- [ ] `.env.example` created (no secrets!)
- [ ] No `.env` file in git
- [ ] No `db.sqlite3` in git
- [ ] No `venv/` or `node_modules/` in git
- [ ] No API keys in code
- [ ] README.md created
- [ ] All tests pass
- [ ] App runs locally
- [ ] Commit messages are clear
- [ ] Sensitive data removed

---

## 🎉 Ready to Push!

Your repository is now properly configured and ready to push to GitHub!

```bash
# Final push
git add .
git commit -m "feat: Complete CodeNest platform with AI assistant"
git push -u origin main
```

**Your code is now safely on GitHub!** 🚀
