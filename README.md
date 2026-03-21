# 🚀 CodeNest — Competitive Programming Platform

> A full-stack competitive programming platform built for students and teachers, featuring AI-powered assistance, multi-platform stat sync, contests, achievements, and real-time analytics.

![Status](https://img.shields.io/badge/Status-Active-success)
![Django](https://img.shields.io/badge/Django-6.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Manual — Students](#user-manual--students)
- [User Manual — Teachers](#user-manual--teachers)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

### For Students
- **Code Editor** — Monaco-based editor with syntax highlighting for Python, C++, Java, JavaScript
- **Problem Library** — Filterable by difficulty (Easy / Medium / Hard) and topic
- **Submissions** — Full history with status, runtime, memory, and code viewer
- **Dashboard** — Unified stats aggregated from CodeNest + LeetCode + CodeChef + Codeforces + HackerRank
- **Platform Sync** — Verify and sync external platform accounts to your dashboard
- **Achievements** — Unlock badges for milestones; displayed on your profile
- **Activity Heatmap** — GitHub-style contribution graph
- **Contests** — Join teacher-created contests and compete on a live leaderboard
- **Discussion** — Problem-level forums with threaded replies
- **AI Assistant** — Context-aware hints, code explanation, complexity analysis, and debugging (Groq / Llama 3.3 70B)
- **Roadmap** — Curated learning paths by topic

### For Teachers
- **Analytics Page** — Class-wide performance overview with per-student drill-down
- **Scoreboard** — Horizontally scrollable table with all platform columns
- **Student Activity** — Detailed per-student submission and progress tracking
- **Contest Management** — Create, schedule, and manage contests
- **Problem Management** — Add problems with test cases, difficulty, and topic tags
- **Mentor Dashboard** — Monitor student progress and identify struggling learners

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6.0, Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Groq API — Llama 3.3 70B |
| Frontend | React 18, Vite |
| Styling | CSS3 (custom design system) |
| HTTP | Axios / Fetch API |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
CodeNest/
├── codenest_backend/           # Django backend
│   ├── api/
│   │   ├── models.py           # All database models
│   │   ├── views.py            # API endpoints
│   │   ├── serializers.py      # DRF serializers
│   │   ├── ai_service.py       # Groq AI integration
│   │   ├── compiler.py         # Code execution
│   │   ├── judge.py            # Test case judging
│   │   ├── discussion_views.py # Discussion API
│   │   ├── signals.py          # Achievement triggers
│   │   └── services/           # Business logic
│   └── codenest_backend/
│       └── settings.py
│
├── project2/                   # React frontend
│   └── src/
│       ├── Components/         # Shared components
│       ├── Pages/              # Page-level components
│       ├── services/           # API + external stats
│       └── styles1/            # CSS files
│
├── docs/                       # Documentation
│   ├── README.md               # Docs index
│   └── fixes/                  # Feature docs (130+ files)
│
├── .gitignore
└── README.md                   # This file
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone

```bash
git clone https://github.com/balaji-510/CodeNest.git
cd CodeNest
```

### 2. Backend

```bash
cd codenest_backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your SECRET_KEY and GROQ_API_KEY

# Run migrations
python manage.py migrate

# Seed data (optional but recommended)
python manage.py seed_db
python manage.py seed_achievements

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend: http://localhost:8000

### 3. Frontend

```bash
# New terminal
cd project2
npm install
npm run dev
```

Frontend: http://localhost:5173

### 4. Access

| URL | Purpose |
|---|---|
| http://localhost:5173 | Main application |
| http://localhost:8000/api | REST API |
| http://localhost:8000/admin | Django admin panel |

---

## Environment Variables

Create `codenest_backend/.env`:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# AI (free key at https://console.groq.com/)
GROQ_API_KEY=your-groq-api-key-here

# Optional AI fallbacks
OPENAI_API_KEY=your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

> Never commit `.env` files. The `.gitignore` already excludes them.

---

## API Reference

### Auth
```
POST /api/token/           Login → returns access + refresh tokens
POST /api/register/        Register new user
POST /api/token/refresh/   Refresh access token
```

### Problems
```
GET  /api/problems/                    List all problems
GET  /api/problems/{id}/               Get single problem
POST /api/submissions/submit_solution/ Submit code
GET  /api/submissions/?user={id}       Get user submissions
```

### User Stats
```
GET /api/user-stats/{id}/              Stats by user ID
GET /api/user-stats/by-username/{u}/   Stats by username
GET /api/current-user-stats/           Authenticated user stats
```

### Platform Verification
```
GET  /api/verification-token/          Get verification token
POST /api/verify-leetcode/             Verify LeetCode handle
POST /api/verify-codeforces/           Verify Codeforces handle
POST /api/verify-codechef/             Verify CodeChef handle
POST /api/verify-hackerrank/           Verify HackerRank handle
```

### Contests
```
GET  /api/contests/                    List contests
POST /api/contests/                    Create contest (teacher)
GET  /api/contests/{id}/               Contest details
POST /api/contests/{id}/join/          Join contest
```

### AI Assistant
```
POST /api/ai-assistant/
Headers: Authorization: Bearer <token>
Body: {
  "query": "Give me a hint",
  "context": { "code": "...", "language": "python", "problemTitle": "Two Sum" }
}
```

---

## User Manual — Students

### Getting Started

#### 1. Register / Login
1. Go to http://localhost:5173
2. Click **Get Started** or **Login**
3. Register with your name, email, and password
4. After login you land on your **Dashboard**

#### 2. Dashboard
Your dashboard shows:
- **Total Aggregate Solved** — problems solved across all linked platforms
- **Global Reliability** — acceptance rate
- **Active Discipline** — active days / streak
- **Peak Global Rank** — best rank across platforms
- **Global Platform Performance** — cards for LeetCode, CodeChef, Codeforces, HackerRank (after syncing)
- **Daily Challenge** — today's recommended problem
- **Activity Heatmap** — your coding activity over the past year
- **Skill Analysis** — radar chart of your topic strengths
- **Upcoming Contests** — next 3 contests from LeetCode, Codeforces, CodeChef

To sync external stats, click **Sync Global Stats** (you must verify accounts first — see below).

#### 3. Solving Problems
1. Go to **Problems** from the navbar
2. Filter by difficulty or search by name
3. Click a problem to open the **Editor**
4. Write your solution in the code editor (Python, C++, Java, JavaScript supported)
5. Click **Run** to test against sample cases
6. Click **Submit** to judge against all test cases
7. View result: Accepted / Failed / Runtime Error

**Points**: Easy = 10 pts, Medium = 15 pts, Hard = 20 pts

#### 4. Viewing Submissions
1. Go to **Submissions** from the navbar
2. See a summary bar: Total / Accepted / Failed / Accept Rate
3. Filter by status, language, or search by problem name
4. Click **View Code** on any submission to see your code and test results
5. Green left border = Accepted, Red = Failed

#### 5. Linking External Accounts

To sync stats from LeetCode, CodeChef, Codeforces, or HackerRank:

1. Go to **Settings** → **Linked Accounts** tab
2. Copy your **Verification Token** (click Copy)
3. Add the token to your profile on each platform:
   - **LeetCode** → leetcode.com/profile → Edit Profile → paste in *Summary/Bio* → Save
   - **CodeChef** → codechef.com/settings/profile → paste in *About* → Save
   - **Codeforces** → codeforces.com/settings/social → paste in *First name* → Save
   - **HackerRank** → enter your username and click Link (no token needed — HackerRank removed the About Me field)
4. Enter your username in the input field and click **Verify**
5. After verification, go to Dashboard and click **Sync Global Stats**
6. You can remove the token from your external profiles after verification

#### 6. Profile
- Go to **Profile** from the navbar or avatar
- View your stats, achievements, activity heatmap, and recent submissions
- Click **Edit Profile** to update your name, bio, avatar URL, and skills
- Your linked platform handles appear under **Coding Profiles**
- Click the edit icon to go to Settings and manage accounts

#### 7. Achievements
- Earned automatically when you hit milestones (first solve, 10 solves, streaks, etc.)
- View all achievements at **Achievements** page
- Top 6 unlocked achievements show on your Profile
- Toast notifications appear in real-time when you unlock one

#### 8. Contests
1. Go to **Contests** from the navbar
2. Browse upcoming and active contests
3. Click **Join** to enter a contest
4. Solve problems within the contest time window
5. View your rank on the live leaderboard during the contest

#### 9. Discussion
1. Open any problem in the editor
2. Click the **Discussion** tab
3. Post questions or tips
4. Reply to other students' posts

#### 10. AI Assistant
The AI Assistant is available inside the code editor:
1. Open a problem
2. Click the **AI** button (bottom right)
3. Use quick actions:
   - 💡 **Give me a hint** — guidance without spoiling the answer
   - 📝 **Explain my code** — understand what your code does
   - ⚡ **Analyze complexity** — Big O time and space
   - 🐛 **Debug help** — find errors in your code
   - 📚 **Explain the problem** — plain-language problem breakdown
4. Or type any question in the chat

> Use hints to learn, not to copy solutions.

#### 11. Settings
- **Profile Settings** — name, bio, avatar, skills, social links
- **Editor Preferences** — font size, autocomplete
- **Linked Accounts** — verify and manage external platform handles
- **Notifications / Security / Appearance** — coming soon

---

## User Manual — Teachers

### Getting Started

Teachers have the same login flow as students. Your account must have the **teacher/mentor role** set by an admin.

#### 1. Analytics Page
1. Go to **Analytics** from the navbar (teacher-only)
2. View class-wide statistics:
   - Total students, problems solved, average score
   - Difficulty breakdown (Easy / Medium / Hard)
   - Top performers
   - Per-student activity table
3. Click any student row to drill into their individual stats

#### 2. Scoreboard
1. Go to **Scoreboard** from the navbar
2. See all students ranked by total points
3. The table is **horizontally scrollable** — scroll right to see all platform columns (LeetCode, CodeChef, Codeforces, HackerRank)
4. Columns include: Rank, Student, CodeNest Solved, Points, LeetCode, CodeChef, Codeforces, HackerRank

#### 3. Student Activity
1. Go to **Student Activity** from the navbar
2. Filter by student name or date range
3. View each student's recent submissions, problems attempted, and solve rate
4. Identify students who haven't been active recently

#### 4. Mentor Dashboard
1. Go to **Mentor Dashboard** from the navbar
2. Overview of all students' progress
3. Topic-wise breakdown — see which topics students struggle with
4. Use this to plan lessons or assign targeted problems

#### 5. Creating a Contest
1. Go to **Contests** → **Create Contest**
2. Fill in:
   - **Title** — contest name
   - **Description** — instructions for students
   - **Start Time** and **End Time**
   - **Problems** — search and select problems from the library
3. Click **Create** to publish
4. Students can see and join the contest from the Contests page
5. Monitor live participation from **Contest Management**

#### 6. Managing Contests
1. Go to **Contests Management** from the navbar
2. View all your created contests
3. Edit or delete contests before they start
4. View participant list and scores during/after the contest

#### 7. Adding Problems
1. Go to **Add Problem** from the navbar (teacher-only)
2. Fill in:
   - **Title**, **Description**, **Difficulty** (Easy / Medium / Hard)
   - **Topic** (Arrays, DP, Graphs, etc.)
   - **Examples** — sample input/output shown to students
   - **Constraints** — problem constraints
   - **Points** — auto-set by difficulty (Easy=10, Medium=15, Hard=20)
3. Click **Save Problem**
4. Add test cases via **Manage Test Cases**

#### 8. Managing Test Cases
1. Go to **Manage Test Cases** from the navbar
2. Select a problem
3. Add input/output pairs for each test case
4. Mark test cases as hidden (not shown to students) or visible (sample cases)
5. Test cases are used for judging submissions

#### 9. Viewing Student Profiles
- Click any student's name in the Scoreboard or Analytics page
- View their full profile: stats, achievements, activity heatmap, recent submissions
- Useful for understanding individual student performance

#### 10. Context / Learning Paths
1. Go to **Context** from the navbar
2. Create learning contexts (curated problem sets with descriptions)
3. Assign contexts to guide students through specific topics
4. Edit or delete contexts as needed

---

## Security

- JWT authentication on all protected endpoints
- Passwords hashed with Django's PBKDF2 algorithm
- CORS restricted to configured origins
- All secrets stored in `.env` (never committed)
- SQL injection protection via Django ORM
- Platform account verification prevents impersonation

**The `.gitignore` excludes:**
- `.env` and all environment files
- `db.sqlite3` and database files
- `node_modules/`, `dist/`, `build/`
- `__pycache__/`, `*.pyc`
- Debug and utility scripts (`check_*.py`, `debug_*.py`, etc.)
- Log files
- IDE/OS files (`.vscode/`, `.DS_Store`, etc.)

---

## Deployment

### Render (Backend) + Vercel (Frontend) — Free

**Backend on Render:**
1. Push to GitHub
2. Create new Web Service on render.com
3. Set root directory to `codenest_backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn codenest_backend.wsgi`
6. Add all environment variables from `.env`

**Frontend on Vercel:**
1. Import repo on vercel.com
2. Set root directory to `project2`
3. Framework preset: Vite
4. Update `VITE_API_URL` to your Render backend URL
5. Deploy

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: describe your change'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Authors

- **Balaji** — [github.com/balaji-510](https://github.com/balaji-510)

---

## Acknowledgments

- [Groq](https://groq.com) — Free, fast AI API
- [Django](https://djangoproject.com) — Backend framework
- [React](https://react.dev) — Frontend library
- [Vite](https://vitejs.dev) — Build tool
- [Simple Icons CDN](https://simpleicons.org) — Platform logos

---

Made with ❤️ by the CodeNest Team
