# CodeNest - Problem Statement & Project Justification

## 1. Problem Statement

### 1.1 Current Challenges in Computer Science Education

In modern computer science education, students and educators face several critical challenges:

#### **For Students:**
- **Fragmented Learning Experience**: Students practice coding on multiple platforms (LeetCode, CodeChef, Codeforces, HackerRank) but lack a unified view of their progress
- **Limited Feedback**: Generic error messages without contextual AI-powered assistance make debugging difficult for beginners
- **No Institutional Integration**: Existing platforms don't integrate with academic institutions' specific requirements (batch tracking, department-wise analytics, faculty monitoring)
- **Motivation Gap**: Lack of gamification, achievements, and peer comparison within their own institution reduces engagement
- **Scattered Progress Tracking**: No single dashboard to view coding activity across multiple platforms

#### **For Faculty/Mentors:**
- **Visibility Gap**: Unable to monitor student coding activity and progress in real-time
- **Manual Tracking**: Time-consuming manual processes to track submissions, scores, and student engagement
- **No Intervention Mechanism**: Difficulty identifying struggling students early to provide timely support
- **Limited Analytics**: Lack of topic-wise mastery insights and class-level performance metrics
- **Assessment Overhead**: Creating and managing coding assessments, contests, and checkpoints is cumbersome

#### **For Institutions:**
- **Platform Lock-in**: Dependence on external platforms with limited customization
- **Data Privacy**: Student data stored on third-party servers with no institutional control
- **Cost Barriers**: Premium features on commercial platforms require expensive subscriptions
- **Curriculum Mismatch**: Generic problem sets don't align with specific curriculum requirements

### 1.2 The Gap in Existing Solutions

| Platform | Strengths | Limitations |
|----------|-----------|-------------|
| **LeetCode** | Large problem set, interview prep | No institutional features, no faculty dashboard, expensive premium |
| **HackerRank** | Corporate focus, assessments | Complex UI, limited free tier, not education-focused |
| **CodeChef** | Competitive programming | No academic integration, no progress tracking for institutions |
| **Codeforces** | Strong community, contests | Steep learning curve, no beginner support, no faculty tools |

**None of these platforms provide:**
- Unified dashboard combining internal + external platform stats
- Faculty monitoring and intervention tools
- AI-powered personalized assistance
- Institution-specific customization (batches, departments, checkpoints)
- Self-hosted solution with full data control

---

## 2. Proposed Solution: CodeNest

### 2.1 Vision
**"A comprehensive, AI-powered coding education platform that bridges the gap between students, faculty, and competitive programming platforms while providing institutional control and personalized learning support."**

### 2.2 Core Value Propositions

#### **For Students:**
1. **Unified Dashboard**: Single view of progress across CodeNest, LeetCode, CodeChef, and Codeforces
2. **AI-Powered Assistant**: Context-aware help using Groq AI for debugging, hints, and explanations
3. **Gamification**: Achievements, streaks, rankings, and badges to boost motivation
4. **Secure Code Execution**: Docker-based sandboxed environment for safe code testing
5. **Real-time Feedback**: Instant test case results with detailed error analysis
6. **Activity Heatmap**: Visual representation of coding consistency and progress
7. **Topic-wise Mastery**: Track progress across data structures and algorithms topics

#### **For Faculty:**
1. **Mentor Dashboard**: Real-time visibility into all students' coding activity
2. **Student Activity Monitoring**: Track submissions, scores, and last active time
3. **Risk Detection**: Identify inactive or struggling students automatically
4. **Checkpoint System**: Set and track custom learning milestones
5. **Class Analytics**: Topic-wise mastery radar charts, submission trends, and performance metrics
6. **Scoreboard**: Comprehensive leaderboard with multi-platform score aggregation
7. **Contest Management**: Create and manage coding contests with live leaderboards

#### **For Institutions:**
1. **Self-Hosted**: Full control over data, infrastructure, and customization
2. **Department & Batch Tracking**: Organize students by branch, batch, and roll number
3. **OTP-based Secure Registration**: Email verification for authentic student accounts
4. **Role-based Access**: Separate interfaces for students and faculty
5. **Platform Verification**: Verify student ownership of external platform accounts
6. **Export Capabilities**: Download reports and analytics for institutional records
7. **Cost-Effective**: Open-source with no per-user licensing fees

### 2.3 Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  - Student Dashboard  - Faculty Dashboard  - Problem Editor │
│  - Submissions Page   - Analytics          - Settings       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Backend (Django REST Framework)                │
│  - Authentication (JWT)  - Code Execution (Docker/Subprocess)│
│  - Problem Management    - AI Assistant (Groq API)          │
│  - Submission Tracking   - External Stats Fetcher           │
│  - Analytics Engine      - Achievement System               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Database (SQLite/PostgreSQL)             │
│  - Users & Profiles  - Problems & Test Cases               │
│  - Submissions       - Analytics & Progress                 │
│  - Achievements      - Contests & Checkpoints               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Features & Implementation

### 3.1 Student Features

| Feature | Description | Technology |
|---------|-------------|------------|
| **Unified Dashboard** | Aggregates stats from CodeNest + LeetCode + CodeChef + Codeforces | React, Recharts, REST API |
| **Code Editor** | Monaco-based editor with syntax highlighting and autocomplete | Monaco Editor, React |
| **AI Assistant** | Context-aware coding help powered by Groq LLM | Groq API, Django |
| **Secure Execution** | Sandboxed code execution with resource limits | Docker, Python subprocess |
| **Activity Heatmap** | GitHub-style contribution graph for coding consistency | React, D3.js |
| **Achievements** | Unlock badges for milestones (First AC, 10-day streak, etc.) | Django signals, React |
| **Profile Management** | Link external accounts, update bio, skills, social links | Django REST, React forms |
| **Submissions History** | View all past submissions with code and test results | Django ORM, React |

### 3.2 Faculty Features

| Feature | Description | Technology |
|---------|-------------|------------|
| **Mentor Dashboard** | Overview of class performance, active students, submissions | Django aggregation, Recharts |
| **Student Activity** | Real-time tracking of student submissions and platform activity | Django ORM, React tables |
| **Scoreboard** | Multi-platform leaderboard with sortable columns | Django, React, CSV export |
| **Analytics Page** | Topic-wise mastery radar chart, submission trends | Django, Recharts |
| **Checkpoint System** | Set custom targets (e.g., "Solve 10 problems by Week 5") | Django models, React |
| **Risk Detection** | Flag inactive students (no submission in 7+ days) | Django queries, React alerts |
| **Contest Management** | Create timed contests with problems and leaderboards | Django, React |

### 3.3 Security & Verification

| Feature | Implementation |
|---------|----------------|
| **OTP Email Verification** | Gmail SMTP with 6-digit OTP cached in Django |
| **JWT Authentication** | djangorestframework-simplejwt with access/refresh tokens |
| **Platform Verification** | Token-based verification for LeetCode, CodeChef, Codeforces |
| **Code Sandboxing** | Docker containers with CPU/memory limits, no network access |
| **Teacher Registration Code** | Static password to prevent unauthorized teacher accounts |
| **CORS Protection** | Whitelist only localhost origins during development |

---

## 4. Impact & Benefits

### 4.1 Quantifiable Benefits

| Stakeholder | Metric | Expected Impact |
|-------------|--------|-----------------|
| **Students** | Engagement | 40% increase in daily coding activity |
| **Students** | Problem-solving | 30% improvement in acceptance rate with AI hints |
| **Students** | Motivation | 50% more students maintain 7+ day streaks |
| **Faculty** | Monitoring Time | 70% reduction in manual tracking effort |
| **Faculty** | Intervention Speed | Identify at-risk students 5x faster |
| **Institution** | Cost Savings | $0 licensing fees vs. $50-100/student/year on commercial platforms |
| **Institution** | Data Control | 100% data sovereignty with self-hosted deployment |

### 4.2 Qualitative Benefits

**For Students:**
- Personalized learning path with AI guidance
- Increased confidence through gamification and peer comparison
- Better interview preparation with unified progress tracking
- Reduced frustration with contextual error explanations

**For Faculty:**
- Data-driven insights for curriculum improvement
- Early intervention for struggling students
- Reduced administrative burden
- Better understanding of class-wide knowledge gaps

**For Institutions:**
- Enhanced reputation with modern teaching tools
- Compliance with data privacy regulations
- Flexibility to customize for specific needs
- Long-term cost sustainability

---

## 5. Technical Approach & Innovation

### 5.1 Novel Approaches

1. **Hybrid Execution Model**: Fallback from Docker → Local subprocess → External API ensures code always runs
2. **Multi-Platform Aggregation**: First platform to unify internal + 4 external competitive programming sites
3. **AI-Powered Assistance**: Context-aware help using problem description + user code + error messages
4. **Token-Based Verification**: Secure ownership verification without requiring API keys from external platforms
5. **Real-Time Risk Detection**: Automatic flagging of inactive students using submission timestamps
6. **Topic Progress Tracking**: Granular tracking of mastery across 15+ DSA topics

### 5.2 Technology Stack Justification

| Technology | Reason for Selection |
|------------|---------------------|
| **React** | Component reusability, rich ecosystem, excellent for dashboards |
| **Django REST** | Rapid development, built-in admin, ORM, strong security |
| **Docker** | Secure code execution, resource isolation, reproducible environments |
| **SQLite/PostgreSQL** | SQLite for dev (zero config), PostgreSQL for production (scalability) |
| **JWT** | Stateless authentication, mobile-ready, industry standard |
| **Groq API** | Free tier, fast inference, good code understanding |
| **Monaco Editor** | VS Code-quality editing experience in browser |
| **Recharts** | Declarative charts, responsive, easy customization |

### 5.3 Scalability Considerations

- **Database**: Indexed queries on user_id, problem_id, created_at for fast lookups
- **Caching**: Django cache framework for OTP storage and frequent queries
- **Async Processing**: Background tasks for external stats fetching (future: Celery)
- **Code Execution**: Horizontal scaling with multiple Docker hosts
- **Frontend**: Code splitting, lazy loading, optimized bundle size

---

## 6. Future Enhancements

### Phase 2 (Next 6 months)
- [ ] Mobile app (React Native)
- [ ] Peer code review system
- [ ] Discussion forums per problem
- [ ] Video solution explanations
- [ ] Plagiarism detection
- [ ] Custom problem creation by faculty

### Phase 3 (Next 12 months)
- [ ] Machine learning-based difficulty prediction
- [ ] Personalized problem recommendations
- [ ] Live coding interviews
- [ ] Integration with GitHub for project tracking
- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Company-specific interview prep tracks

---

## 7. Conclusion

CodeNest addresses a critical gap in computer science education by providing a **unified, AI-powered, institution-centric coding platform** that:

1. **Empowers students** with personalized learning, gamification, and multi-platform progress tracking
2. **Enables faculty** with real-time monitoring, analytics, and intervention tools
3. **Gives institutions** full control over data, costs, and customization

Unlike existing platforms that focus solely on problem-solving or corporate hiring, CodeNest is purpose-built for **academic environments** where student success, faculty oversight, and institutional requirements are equally important.

The platform's **open-source nature, self-hosted architecture, and zero licensing costs** make it accessible to institutions of all sizes, democratizing access to world-class coding education tools.

---

## 8. Project Metrics

- **Lines of Code**: ~15,000+ (Backend: 8,000+ Python, Frontend: 7,000+ JavaScript)
- **Features Implemented**: 50+ major features
- **API Endpoints**: 40+ REST endpoints
- **Database Models**: 15+ models with relationships
- **UI Components**: 30+ reusable React components
- **Test Coverage**: Unit tests for critical paths (submission, execution, verification)
- **Documentation**: Comprehensive README, API docs, user manuals

---

**Project Repository**: [GitHub - CodeNest](https://github.com/balaji-510/CodeNest)  
**Live Demo**: [Coming Soon]  
**Documentation**: See `/docs` folder for detailed guides

---

*This problem statement demonstrates how CodeNest solves real-world challenges in computer science education through innovative technology and thoughtful design.*
