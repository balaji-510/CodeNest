# Project Status & Roadmap

This document captures the current state of the **frontend** and **backend** for the CodeNest project, highlights which portions are static vs. dynamic, outlines the database schema and generates recommendations for taking the application to a production‑quality level.

---

## 1. Overview

- **Workspace structure**: a Django backend (`codenest_backend/` plus utility scripts) and a React/Vite frontend (`project2/`).
- Backend exposes RESTful APIs using Django REST Framework and JWT authentication.
- Frontend consumes APIs using `axios` and stores tokens in `localStorage`.

---

## 2. Backend schema (Django models)

### Core models & fields

| Model | Fields & types | Notes |
|-------|----------------|-------|
| `User` (built‑in) | username, email, first_name, last_name, password, etc. | auth user |
| `UserProfile` | `OneToOne` → User, rank (int), accuracy (float), active_days (int), role (char, student/teacher), branch, batch, bio, avatar, skills (text), github_link, linkedin_link, twitter_link, leetcode_handle, is_leetcode_verified, verification_token, codechef_handle, is_codechef_verified, codeforces_handle, is_codeforces_verified | profile + verification state |
| `Problem` | title, difficulty, topic, platform, url, leetcode_url, description, examples (json string), constraints (json string), starter_code (json string), created_at | coding challenge |
| `Submission` | FK → User, FK → Problem, status (Solved/Attempted), submitted_at | user attempts |
| `Analytics` | FK → User, date, problems_solved | heatmap data |
| `TopicProgress` | FK → User, topic, solved_count, total_problems | per‑topic progress |
| `Context` | title, description, mentor (FK → User), start_time, end_time, duration_minutes, difficulty, target_batch, target_branch, is_active, created_at | group session info |
| `ContextProblem` | FK → Context, FK → Problem, order_index | problems list for a context |
| `Notification` | recipient (FK → User), title, message, link, is_read, created_at | simple notifications |

Additional helper functions/snippets live in various management scripts (`populate_*`, `verify_api.py`, etc.).

---

## 3. Backend API endpoints

- **Authentication**: `/token/` (CustomTokenObtainPairView), `/register/`.
- **Problems**: CRUD via `ProblemViewSet` with filtering (difficulty/topic/search).
- **Submissions**: CRUD via `SubmissionViewSet` with user query param; creates auto‑associate to current user.
- `/leaderboard/` – calculates top 50 students.
- `/dashboard-stats/<id>/`, `/dashboard-stats/user/<username>/`, `/dashboard-stats/me/` – return aggregated user stats.
- `/profile/update/` – PUT to update profile data.
- `/get-verification-token/` – GET current token and verification status.
- `/get-daily-challenge/` – returns a random problem.
- `/verify-leetcode/`, `/verify-codeforces/`, `/verify-codechef/` – handle external account verification.
- `/init-mock-data/` – populates the database with test records.
- `/execute-code/` – proxies to Piston via `compiler.execute_code_piston`.
- `/mentor-stats/` – teacher dashboard statistics.
- `/roadmap/` – returns static roadmap structure with computed progress.

(A number of utility scripts under top level manage DB, create users, check uploads, etc.)

---

## 4. Frontend structure and dynamic/static features

### Static pages (no backend calls)

- `Home.jsx` – marketing landing page with hero, feature cards, static stats.
- `About.jsx`, `Contact.jsx` – simple content pages.
- Potential others: `AIAssistant`, `CommandPalette` (although CP does poll local state), etc. basically UI components only.  

### Dynamic pages/components (use API/service layer)

The following pages/components fetch data or perform actions via `services/api.js` or other network calls:

- **AuthLogin** (`Login.jsx`) – login & registration flow with `/token/` and `/register/`.
- **Dashboard** – numerous endpoints: stats, daily challenge, contest API, sync external stats, simulate solve.  
- **Problems.jsx** – likely lists problems and filters using `/problems/`.
- **EditorPage.jsx** – code editor with `/execute-code/` and submission logic (`submitCode` service).
- **ProfilePage.jsx** – GET/PUT to `/profile/update/`, verification flows, handles linking handles.
- **RoadmapPage.jsx** – calls `/roadmap/`.
- **MentorDashboard.jsx** – calls `/mentor-stats/`.
- **LeaderboardPage.jsx** – calls `/leaderboard/`.
- **AnalyticsPage.jsx** – visualization of stats (likely uses dashboard stats or similar).
- **ContestsPage.jsx** – fetches contests from external API (`kontests.net`).
- **ContextPage/CreateContext/EditContext** – interact with context endpoints (not detailed but likely exists in backend).  

Other components like `Navbar`, `Footer`, `ContributionHeatmap`, `CommandPalette` subscribe to user state or localStorage.

**Static assets**: images under `src/images`, CSS files under `styles1`, etc.

### Service layer

- `src/services/api.js` – central axios instance, request interceptor adds JWT, and functions for every backend endpoint as shown above.
- `src/services/externalStats.js` – syncs LeetCode/CodeChef/Codeforces via scraping or APIs.

### Authentication state

- Tokens & user info stored in `localStorage`: `access_token`, `refresh_token`, `isLoggedIn`, `userRole`, `username`, etc.
- Interceptor attaches `Authorization` header.
- Role-based navigation (student vs teacher) is implemented in login logic.

---

## 5. Current static vs dynamic status

1. **Fully dynamic features implemented**
   * User authentication and registration with JWT.
   * Profile management and external account verification.
   * Problem listing with search/filter, single problem details (implicit).
   * Dashboard with aggregated user statistics, heatmap, and contest data.
   * Code execution via Piston backend and basic submission tracking.
   * Leaderboard calculation and display.
   * Mentors dashboard (teacher‑specific stats).
   * Roadmap computation using topic progress.
   * Notification model exists but UI may not be fully wired.
   * Context creation/editing flows with problems; backend models and serializer exist.
   * Daily challenge endpoint.

2. **Partially dynamic or placeholder**
   * `submitCode()` always marks as solved – no judge or test case evaluation.
   * Roadmap nodes use hard‑coded structure and simplistic progress logic; continues to be static for now.
   * Notifications appear to be stored but no frontend list component unless inside MentorDashboard.
   * Some pages (AnalyticsPage) may reuse local stats or mock data.
   * External contest API: fetched from third‑party service, not stored.
   * Editor page may not have in‑app test cases or challenge navigation.
   * Backend verification flows for CodeChef are honor‑system; not robust.
   * Many filtering/sorting, pagination, and error states are unhandled.

3. **Static assets / CSS** – all branding, layout, and visuals are static files.

---

## 6. Backend database schema summary (for DBA)

```text
django_user (auth_user)
userprofile
problem
submission
analytics
topicprogress
context
contextproblem
notification
```

Each model has the fields described in section 3; foreign keys link to `auth_user`.  Migrations are under `codenest_backend/api/migrations/`.

---

## 7. Gaps & suggestions for raising to product level

### Architecture & deployment
1. **Configuration & secrets**
   * Move database settings, JWT secrets, external‑API keys, teacher code, etc. into environment variables and `settings.py` via `django-environ`.
   * Separate development vs production settings; enable `DEBUG=False` in prod.
   * Add CORS settings (currently probably open to localhost).  Use `django-cors-headers`.
2. **Deployment**
   * Containerize backend and frontend (Dockerfiles + docker-compose) or deploy to Heroku/Render/Vercel.
   * Build frontend to static bundle (`npm run build` with Vite) and serve via CDN or host behind nginx.
   * Use a reverse proxy to route `/api/` to Django and static assets to built files.
3. **Database**
   * Ensure migrations are run automatically.  Add configuration for PostgreSQL (or managed DB) instead of SQLite.
   * Add indexes on frequently queried fields (e.g. `Problem.topic`, `Submission.user`, etc.).

### Security & authentication
4. **Authentication**
   * Use refresh token rotation and store JWTs in httpOnly cookies to avoid XSS attacks.
   * Add CSRF protection for any cookie‑based flow.
   * Rate‑limit login and registration endpoints to prevent brute‑force.
   * Enforce strong password policy and email verification.
   * Properly protect teacher‑only endpoints and confirm `teacher_code` securely.
5. **Validation & sanitization**
   * Add serializer validations for all fields, e.g. ensure `problem.url` is valid, string lengths, etc.
   * Sanitize user input before executing or storing code.
   * Escape any dangerous HTML to prevent XSS from rich text in descriptions, bios, etc.

### APIs & scalability
6. **Pagination**
   * Problems, submissions, notifications, leaderboards should support pagination via DRF `PageNumberPagination`.
7. **Caching**
   * Cache leaderboard, roadmaps, and heavy queries using Redis or in‑memory cache.
8. **Asynchronous work**
   * Offload external syncs/verification to background tasks (Celery/RQ) rather than blocking HTTP requests.
9. **Logging & monitoring**
   * Use structured logging, Sentry/Azure/AWS CloudWatch for error tracking.
10. **Rate limiting**
   * Throttle API endpoints to prevent abuse.

### Frontend enhancements
11. **State management**
   * Consider using Redux or Zustand to centralize auth and user data instead of scattered localStorage.
   * Handle refresh token automatically and logout on expiry.
12. **Routing & guards**
   * Protect routes with role/authorization checks; redirect for unauthenticated users.
13. **Error handling and UX**
   * Display loading spinners, error messages, retry options consistently.
   * Form validation on client side before sending requests.
14. **Tests**
   * Add unit tests and e2e tests (Jest, React Testing Library, Cypress) to frontend components and API mocks.
15. **Performance**
   * Lazy‑load heavy pages; optimize images; use a CDN for static assets.

### Features to complete
16. **Submission evaluation**
   * Integrate a proper judge engine: run user code against predefined test cases, store result statuses.
   * Allow custom test case input on Editor page.
17. **Real notifications**
   * Build a UI for notifications; send them on events (new context, results, messages).
18. **Contexts & collaborative sessions**
   * Finish context creation/editing endpoints, add real‑time features (WebSockets) for live coding sessions.
19. **Mentor workflows**
   * Allow teachers to create roadmaps, assign problems, message students.
20. **Analytics & reporting**
   * Add more detailed reports (topic mastery through time, branch comparisons) and export options.
21. **Account management**
   * Password reset flows, email change, two‑factor authentication.
22. **Internationalization**
   * Prepare for multi‑language support (Django `i18n`, React `react-i18next`).

### Documentation & maintenance
23. **API documentation**
   * Use Swagger/OpenAPI (drf_yasg) to auto‑generate docs.
24. **Code quality**
   * Lint backend (flake8, black), add pre‑commit hooks; frontend ESLint/Prettier configured (some lint files already present).
25. **CI/CD**
   * Configure GitHub Actions or similar to run tests, build frontend, migrate DB, and deploy on push to main.

---

## 8. Summary

The project already has a rich set of dynamic features connecting the React frontend to a Django backend with JWT auth and many domain models. Many pages already fetch real data and display analytics. However, a number of placeholders, simplistic implementations and lack of production practices remain. Moving to a product‑level application will require completing the judge system, securing authentication, adding robust validation, pagination, caching, testing, and setting up proper deployment pipelines.

This document can serve as a baseline for tracking remaining work and communicating the current status to stakeholders.

*Generated: 28 February 2026, by GitHub Copilot.*
esting, and setting up proper deployment pipelines.

This document can serve as a baseline for tracking remaining work and communicating the current status to stakeholders.

*Generated: 28 February 2026, by GitHub Copilot.*
