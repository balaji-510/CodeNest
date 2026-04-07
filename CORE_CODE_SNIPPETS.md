# CodeNest - Core Code Snippets & Implementation

## 1. User Authentication with OTP

**File**: `CodeNest/codenest_backend/api/views.py`

```python
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email', '').strip().lower()
    otp = str(random.randint(100000, 999999))
    cache.set(f"otp_{email}", otp, timeout=300)  # 5 min expiry
    
    send_mail(
        subject='CodeNest - Email Verification',
        message=f'Your OTP is: {otp}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email]
    )
    return Response({"success": True})
```

---

## 2. Code Execution Engine

**File**: `CodeNest/codenest_backend/api/compiler.py`

```python
def execute_code_piston(language, code, stdin=""):
    config = LANGUAGE_MAP[language]
    
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = os.path.join(tmpdir, f"solution{config['ext']}")
        with open(filepath, "w") as f:
            f.write(code)
        
        # Compile if needed
        if config["compile"]:
            subprocess.run(config["compile"], cwd=tmpdir, timeout=10)
        
        # Execute
        result = subprocess.run(
            config["run"],
            cwd=tmpdir,
            input=stdin,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "is_error": result.returncode != 0
        }
```

---

## 3. Submission Scoring (No Duplicate Points)

**File**: `CodeNest/codenest_backend/api/views.py`

```python
# Check if already accepted
already_accepted = Submission.objects.filter(
    user=request.user,
    problem=problem,
    status='ACCEPTED'
).exists()

# Only award points for first acceptance
if submission_status == 'ACCEPTED' and not already_accepted:
    new_score = (
        Submission.objects.filter(user=request.user, status='ACCEPTED')
        .values('problem')
        .distinct()
        .aggregate(total=Sum('problem__points'))['total'] or 0
    )
    user_stats.score = new_score
    user_stats.save()
```

---

## 4. Platform Verification (CodeChef)

**File**: `CodeNest/codenest_backend/api/views.py`

```python
@api_view(['POST'])
def verify_codechef_account(request):
    handle = request.data.get('handle')
    profile = UserProfile.objects.get(user=request.user)
    
    # Fetch profile page
    response = requests.get(f"https://www.codechef.com/users/{handle}")
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Check for verification token
    if profile.verification_token.lower() in soup.get_text().lower():
        profile.codechef_handle = handle
        profile.is_codechef_verified = True
        profile.save()
        return Response({"success": True})
    else:
        return Response({"error": "Token not found"}, status=400)
```

---

## 5. Unified Dashboard Stats

**File**: `CodeNest/codenest_backend/api/views.py`

```python
def _get_user_dashboard_stats_data(user):
    # Calculate actual problems solved
    problems_solved = Submission.objects.filter(
        user=user, status='ACCEPTED'
    ).values('problem').distinct().count()
    
    # Recalculate score from distinct problems
    correct_score = (
        Submission.objects.filter(user=user, status='ACCEPTED')
        .values('problem').distinct()
        .aggregate(total=Sum('problem__points'))['total'] or 0
    )
    
    return {
        "problemsSolved": problems_solved,
        "score": correct_score,
        "rank": profile.rank,
        "activeDays": profile.active_days,
        "topicProgress": [...],
        "heatmapData": [...]
    }
```

---

## 6. AI Assistant Integration

**File**: `CodeNest/codenest_backend/api/ai_service.py`

```python
@staticmethod
def _get_groq_response(query, context, api_key):
    headers = {"Authorization": f"Bearer {api_key}"}
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{
            "role": "system",
            "content": "You are a coding tutor..."
        }, {
            "role": "user",
            "content": f"Problem: {context['problem']}\nCode: {context['code']}\nQuestion: {query}"
        }]
    }
    
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload
    )
    return response.json()['choices'][0]['message']['content']
```


---

## 7. React Dashboard Component

**File**: `CodeNest/project2/src/Pages/Dashboard.jsx`

```javascript
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [externalStats, setExternalStats] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch CodeNest stats
      const userId = localStorage.getItem('user_id');
      const codenestStats = await getUserStats(userId);
      setStats(codenestStats);
      
      // Fetch external platform stats
      const external = await fetchExternalStats(userId);
      setExternalStats(external);
    };
    fetchData();
  }, []);
  
  // Combine stats from all platforms
  const totalSolved = (stats?.problemsSolved || 0) + 
                      (externalStats?.leetcode?.totalSolved || 0) +
                      (externalStats?.codechef?.totalSolved || 0);
  
  return (
    <div className="dashboard">
      <StatCard label="Total Solved" value={totalSolved} />
      <StatCard label="Score" value={stats?.score} />
      <ActivityHeatmap data={stats?.heatmapData} />
      <TopicProgress topics={stats?.topicProgress} />
    </div>
  );
}
```

---

## 8. Monaco Code Editor Integration

**File**: `CodeNest/project2/src/Pages/EditorPage.jsx`

```javascript
import Editor from '@monaco-editor/react';

function EditorPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  
  const handleSubmit = async () => {
    const response = await api.post('/submissions/submit_solution/', {
      problem_id: problemId,
      language: language,
      code: code
    });
    
    if (response.data.status === 'ACCEPTED') {
      toast.success('All test cases passed!');
    } else {
      toast.error(`Failed: ${response.data.passed}/${response.data.total} passed`);
    }
  };
  
  return (
    <Editor
      height="60vh"
      language={language}
      value={code}
      onChange={setCode}
      theme={isDarkMode ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on'
      }}
    />
  );
}
```

---

## 9. Mentor Dashboard with Analytics

**File**: `CodeNest/project2/src/Pages/MentorDashboard.jsx`

```javascript
function MentorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get('/mentor-dashboard-stats/');
      setDashboardData(response.data);
    };
    fetchData();
  }, []);
  
  return (
    <div className="mentor-dashboard">
      {/* Summary Stats */}
      <div className="stats-grid">
        {dashboardData.stats.map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      
      {/* Topic Mastery Radar Chart */}
      <RadarChart data={dashboardData.topicMastery}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <Radar dataKey="A" fill="var(--primary-color)" />
      </RadarChart>
      
      {/* Student Activity Table */}
      <StudentActivityTable students={dashboardData.studentStats} />
    </div>
  );
}
```

---

## 10. Scoreboard with Multi-Platform Aggregation

**File**: `CodeNest/project2/src/Pages/Scoreboard.jsx`

```javascript
function Scoreboard() {
  const [students, setStudents] = useState([]);
  
  // Calculate total score from all platforms
  const enrichedStudents = students.map(s => {
    const lcScore = calcLeetCodeScore(s.platformStats.lc);
    const ccScore = calcCodeChefScore(s.platformStats.cc);
    const cfScore = calcCodeforcesScore(s.platformStats.cf);
    
    return {
      ...s,
      total: s.codenest.score + lcScore + ccScore + cfScore
    };
  });
  
  // Sort by total score
  const sorted = enrichedStudents.sort((a, b) => b.total - a.total);
  
  return (
    <table className="scoreboard">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>CodeNest</th>
          <th>LeetCode</th>
          <th>CodeChef</th>
          <th>Codeforces</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((student, idx) => (
          <tr key={student.id}>
            <td>{idx + 1}</td>
            <td>{student.name}</td>
            <td>{student.codenest.score}</td>
            <td>{student.platformStats.lc?.totalSolved || 0}</td>
            <td>{student.platformStats.cc?.totalSolved || 0}</td>
            <td>{student.platformStats.cf?.rating || 0}</td>
            <td className="total-score">{student.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 11. Activity Heatmap Component

**File**: `CodeNest/project2/src/Components/ActivityHeatmap.jsx`

```javascript
function ActivityHeatmap({ userId }) {
  const [heatmapData, setHeatmapData] = useState([]);
  
  const getColor = (count) => {
    const isDark = document.body.classList.contains('dark-theme');
    if (count === 0) return isDark ? '#1e293b' : '#ebedf0';
    if (count <= 2) return isDark ? '#0e4429' : '#9be9a8';
    if (count <= 4) return isDark ? '#006d32' : '#40c463';
    if (count <= 6) return isDark ? '#26a641' : '#30a14e';
    return isDark ? '#39d353' : '#216e39';
  };
  
  return (
    <div className="heatmap">
      {heatmapData.map(day => (
        <div
          key={day.date}
          className="heatmap-cell"
          style={{ backgroundColor: getColor(day.count) }}
          title={`${day.date}: ${day.count} problems`}
        />
      ))}
    </div>
  );
}
```

---

## 12. JWT Authentication Service

**File**: `CodeNest/project2/src/services/api.js`

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add JWT token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/token/refresh/', {
        refresh: refreshToken
      });
      localStorage.setItem('access_token', response.data.access);
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await api.post('/login/', { username, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
};
```

---

## 13. Database Models

**File**: `CodeNest/codenest_backend/api/models.py`

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=[('student', 'Student'), ('teacher', 'Teacher')])
    branch = models.CharField(max_length=20, default='CSE', blank=True)
    batch = models.CharField(max_length=10, default='2024', blank=True)
    rank = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    active_days = models.IntegerField(default=0)
    verification_token = models.CharField(max_length=50, blank=True, null=True)

class Problem(models.Model):
    title = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=10, choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')])
    points = models.IntegerField(default=10)
    topic = models.CharField(max_length=50)
    description = models.TextField()
    examples = models.JSONField(default=list)
    constraints = models.TextField(blank=True)

class Submission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField(default='')
    language = models.CharField(max_length=20)
    status = models.CharField(max_length=25, choices=[('ACCEPTED', 'ACCEPTED'), ('FAILED', 'FAILED')])
    passed_testcases = models.IntegerField(default=0)
    total_testcases = models.IntegerField(default=0)
    test_results = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 14. Settings Configuration

**File**: `CodeNest/codenest_backend/codenest_backend/settings.py`

```python
# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')

# AI Service Configuration
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

---

## File Structure Summary

```
CodeNest/
├── codenest_backend/          # Django Backend
│   ├── api/
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints (2000+ lines)
│   │   ├── serializers.py     # Data serialization
│   │   ├── compiler.py        # Code execution
│   │   ├── docker_executor.py # Docker sandboxing
│   │   ├── ai_service.py      # AI integration
│   │   └── urls.py            # API routing
│   ├── codenest_backend/
│   │   └── settings.py        # Configuration
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
└── project2/                  # React Frontend
    ├── src/
    │   ├── Pages/
    │   │   ├── Dashboard.jsx       # Student dashboard
    │   │   ├── EditorPage.jsx      # Code editor
    │   │   ├── Login.jsx           # Authentication
    │   │   ├── MentorDashboard.jsx # Faculty dashboard
    │   │   ├── Scoreboard.jsx      # Rankings
    │   │   ├── ProfilePage.jsx     # User profile
    │   │   └── Submissions.jsx     # Submission history
    │   ├── Components/
    │   │   ├── Navbar.jsx          # Navigation
    │   │   ├── ActivityHeatmap.jsx # Contribution graph
    │   │   └── AIAssistant.jsx     # AI chatbot
    │   ├── services/
    │   │   └── api.js              # API client
    │   └── styles1/                # CSS files
    └── package.json                # Node dependencies
```

---

**Total Core Files**: 17 main files  
**Supporting Files**: 30+ components, utilities, styles  
**Total Lines of Code**: ~15,000+  
**Backend**: ~8,000 lines (Python)  
**Frontend**: ~7,000 lines (JavaScript/JSX)

---

*These are the most critical code implementations that power the CodeNest platform.*
