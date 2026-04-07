# CodeNest - Key Code References

## Core Backend Files

### 1. **Models** (`CodeNest/codenest_backend/api/models.py`)
- User, UserProfile, UserStats
- Problem, TestCase, Submission
- Achievement, Analytics, TopicProgress
- Contest, Checkpoint, Notification

### 2. **Views/API** (`CodeNest/codenest_backend/api/views.py`)
- Authentication (RegisterView, login, OTP)
- Code execution (execute_code, submit_solution)
- Dashboard stats (user_dashboard_stats)
- Platform verification (verify_leetcode, verify_codechef)
- Mentor dashboard (mentor_dashboard_stats)
- Scoreboard, Analytics, Student Activity

### 3. **Serializers** (`CodeNest/codenest_backend/api/serializers.py`)
- UserSerializer, UserProfileSerializer
- ProblemSerializer, SubmissionSerializer
- AchievementSerializer, AnalyticsSerializer

### 4. **Code Execution** (`CodeNest/codenest_backend/api/compiler.py`)
- Local subprocess executor (Python, JS, C++, Java)
- Timeout handling, error detection

### 5. **Docker Executor** (`CodeNest/codenest_backend/api/docker_executor.py`)
- Secure sandboxed execution
- Resource limits (CPU, memory)

### 6. **AI Service** (`CodeNest/codenest_backend/api/ai_service.py`)
- Groq API integration
- Context-aware hints and debugging

## Core Frontend Files

### 7. **Dashboard** (`CodeNest/project2/src/Pages/Dashboard.jsx`)
- Unified stats (CodeNest + external platforms)
- Activity heatmap, topic progress
- Recent submissions, achievements

### 8. **Editor** (`CodeNest/project2/src/Pages/EditorPage.jsx`)
- Monaco editor integration
- Code submission, test case execution
- AI Assistant integration

### 9. **Login/Auth** (`CodeNest/project2/src/Pages/Login.jsx`)
- Registration with OTP verification
- Student/Teacher role selection
- JWT authentication

### 10. **Mentor Dashboard** (`CodeNest/project2/src/Pages/MentorDashboard.jsx`)
- Class statistics, student monitoring
- Topic mastery radar chart
- Submission trends

### 11. **Scoreboard** (`CodeNest/project2/src/Pages/Scoreboard.jsx`)
- Multi-platform score aggregation
- Sortable columns, CSV export

### 12. **Profile** (`CodeNest/project2/src/Pages/ProfilePage.jsx`)
- User stats, achievements
- Platform verification
- Edit profile, social links

### 13. **Submissions** (`CodeNest/project2/src/Pages/Submissions.jsx`)
- Submission history with code
- Filter by status, language
- View test results

## Configuration Files

### 14. **Settings** (`CodeNest/codenest_backend/codenest_backend/settings.py`)
- Database, JWT, CORS, Email
- AI API keys (Groq, OpenAI, Gemini)

### 15. **Environment** (`CodeNest/codenest_backend/.env`)
- Secret keys, API keys
- Email SMTP credentials
- Teacher registration code

### 16. **URLs** (`CodeNest/codenest_backend/api/urls.py`)
- API endpoint routing

### 17. **Package Dependencies**
- Backend: `CodeNest/codenest_backend/requirements.txt`
- Frontend: `CodeNest/project2/package.json`

---

**Total Files**: 17 core files + 30+ supporting components
**Lines of Code**: ~15,000+ (Backend: 8,000+, Frontend: 7,000+)
