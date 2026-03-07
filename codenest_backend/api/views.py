from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Problem, Submission, UserProfile, TopicProgress, Analytics, Context, ContextProblem, Notification
from .serializers import (
    UserSerializer, ProblemSerializer, SubmissionSerializer, 
    UserProfileSerializer, TopicProgressSerializer, AnalyticsSerializer,
    CustomTokenObtainPairSerializer, ContextSerializer, NotificationSerializer,
    CodeExecutionSerializer
)
from datetime import datetime
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [AllowAny] # Allow viewing problems without auth for now if needed

    def get_queryset(self):
        queryset = Problem.objects.filter(is_deleted=False)
        difficulty = self.request.query_params.get('difficulty')
        topic = self.request.query_params.get('topic')
        search = self.request.query_params.get('search')

        if difficulty and difficulty != 'All':
            queryset = queryset.filter(difficulty=difficulty)
        if topic and topic != 'All':
            queryset = queryset.filter(topic=topic)
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        return queryset

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    
    def get_queryset(self):
        queryset = self.queryset.select_related('user', 'problem')
        user = self.request.query_params.get('user')
        if user:
            return queryset.filter(user_id=user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    from .models import UserStats
    # Leverage indexed score field for leaderboard ordering and select_related 'user'
    stats = UserStats.objects.select_related('user', 'user__profile').filter(user__profile__role='student').order_by('-score')[:50]
    
    leaderboard_data = []
    for index, stat in enumerate(stats):
        avatar = stat.user.profile.avatar if hasattr(stat.user, 'profile') else f"https://api.dicebear.com/7.x/avataaars/svg?seed={stat.user.username}"
        leaderboard_data.append({
            "name": stat.user.username,
            "points": stat.score,
            "solved": stat.problems_solved,
            "avatar": avatar,
            "isCurrentUser": request.user.is_authenticated and request.user.id == stat.user.id,
            "rank": index + 1
        })
        
    return Response(leaderboard_data)

def _get_user_dashboard_stats_data(user):
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    # Get recent submissions (limit 5)
    recent_submissions = Submission.objects.filter(user=user).order_by('-created_at')[:5]
    
    # Get topic progress
    topic_progress = TopicProgress.objects.filter(user=user)
    
    # Get analytics (last 365 days or similar, for heatmap)
    analytics = Analytics.objects.filter(user=user)
    heatmap_data = [
        {
            "date": entry.date.strftime("%Y-%m-%d"),
            "count": entry.problems_solved
        } for entry in analytics
    ]
    
    skill_stats = [
        {
            "topic": tp.topic,
            "solved": tp.solved_count,
            "total": tp.total_problems
        } for tp in topic_progress
    ]

    skills_list = []
    if profile.skills:
        skills_list = [s.strip() for s in profile.skills.split(',') if s.strip()]

    data = {
        "username": user.username,
        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "email": user.email,
        "rank": profile.rank,
        "accuracy": profile.accuracy,
        "activeDays": profile.active_days,
        
        # Profile Fields
        "bio": profile.bio,
        "avatar": profile.avatar,
        "skills": skills_list,
        "github_link": profile.github_link,
        "linkedin_link": profile.linkedin_link,
        "twitter_link": profile.twitter_link,
        
        "leetcode_handle": profile.leetcode_handle,
        "is_leetcode_verified": profile.is_leetcode_verified,
        "codechef_handle": profile.codechef_handle,
        "is_codechef_verified": profile.is_codechef_verified,
        "codeforces_handle": profile.codeforces_handle,
        "is_codeforces_verified": profile.is_codeforces_verified,
        "problemsSolved": sum([tp.solved_count for tp in topic_progress]), # Calculate total solved
        "recentSubmissions": [
            {
                "id": sub.id, 
                "title": sub.problem.title, 
                "status": sub.status, 
                "difficulty": sub.problem.difficulty,
                "date": sub.created_at.strftime("%Y-%m-%d")
            } for sub in recent_submissions
        ],
        "topicProgress": [
            {
                "topic": tp.topic,
                "solved": tp.solved_count,
                "total": tp.total_problems
            } for tp in topic_progress
        ],
        "heatmapData": heatmap_data,
        "skillStats": skill_stats
    }
    return data

@api_view(['GET'])
def user_dashboard_stats(request, user_id):
    try:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        data = _get_user_dashboard_stats_data(user)
        return Response(data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)

@api_view(['GET'])
def user_dashboard_stats_by_username(request, username):
    try:
        user = User.objects.get(username=username)
        # Call helper directly to avoid double-wrapping request
        data = _get_user_dashboard_stats_data(user) 
        return Response(data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_dashboard_stats(request):
    try:
        data = _get_user_dashboard_stats_data(request.user)
        return Response(data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        data = request.data
        
        if 'name' in data:
            parts = data['name'].split(' ', 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
            user.save()
            
        if 'bio' in data: profile.bio = data['bio']
        if 'skills' in data:
            if isinstance(data['skills'], list):
                profile.skills = ",".join(data['skills'])
            else:
                profile.skills = data['skills']
        if 'avatar' in data: profile.avatar = data['avatar']
        
        if 'github_link' in data: profile.github_link = data['github_link']
        if 'linkedin_link' in data: profile.linkedin_link = data['linkedin_link']
        if 'twitter_link' in data: profile.twitter_link = data['twitter_link']
        
        profile.save()
        return Response({"message": "Profile updated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_verification_token(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if not profile.verification_token:
        import uuid
        profile.verification_token = f"CN-{str(uuid.uuid4())[:8]}"
        profile.save()
    return Response({
        "token": profile.verification_token, 
        "leetcode_verified": profile.is_leetcode_verified,
        "codechef_verified": profile.is_codechef_verified,
        "codeforces_verified": profile.is_codeforces_verified
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_daily_challenge(request):
    # Simple logic: Get a random problem based on date seed or just random
    count = Problem.objects.count()
    if count == 0:
        return Response({"error": "No problems found"}, status=404)
    
    import random
    # specific seed for "daily" consistency could be used, e.g.
    # random.seed(datetime.now().date().toordinal())
    # but for now let's just pick one
    
    random_index = random.randint(0, count - 1)
    problem = Problem.objects.all()[random_index]
    
    return Response({
        "id": problem.id,
        "title": problem.title,
        "difficulty": problem.difficulty,
        "topic": problem.topic,
        "url": problem.url,
        "acceptanceRate": "Wait for submissions" # or calculate
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_leetcode_account(request):
    handle = request.data.get('handle')
    if not handle:
        return Response({"error": "Handle is required"}, status=400)
    
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    token = profile.verification_token
    
    if not token:
        return Response({"error": "No verification token found for user"}, status=400)

    try:
        import requests
    except ImportError:
        return Response({"error": "Server configuration error: 'requests' library is missing. Please install it to use this feature."}, status=503)

    query = """
    query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
            profile {
                aboutMe
            }
        }
    }
    """
    
    try:
        print(f"DEBUG: Verifying LeetCode for {handle}. Token: {token}")
        response = requests.post(
            'https://leetcode.com/graphql',
            json={'query': query, 'variables': {'username': handle}},
            headers={'Content-Type': 'application/json', 'Referer': 'https://leetcode.com'},
            timeout=10
        )
        
        data = response.json()
        print(f"DEBUG: LeetCode Response: {data}")
        
        if 'errors' in data:
             return Response({"error": "User not found on LeetCode"}, status=404)
             
        about_me = data.get('data', {}).get('matchedUser', {}).get('profile', {}).get('aboutMe', '')
        print(f"DEBUG: About Me: '{about_me}'")
        
        if token in about_me:
            profile.leetcode_handle = handle
            profile.is_leetcode_verified = True
            profile.save()
            return Response({"success": True, "message": "LeetCode account verified successfully!"})
        else:
            return Response({
                "success": False, 
                "error": f"Verification token '{token}' not found in LeetCode bio. Found: '{about_me[:50]}...'"
            }, status=400)
            
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Network error connecting to LeetCode: {str(e)}"}, status=503)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Internal error during verification: {str(e)}"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_codeforces_account(request):
    handle = request.data.get('handle')
    if not handle:
        return Response({"error": "Handle is required"}, status=400)
        
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    token = profile.verification_token
    
    if not token:
        return Response({"error": "No verification token found"}, status=400)
        
    try:
        import requests
    except ImportError:
        return Response({"error": "Server configuration error: 'requests' library is missing."}, status=503)

    try:
        # Codeforces API: https://codeforces.com/api/user.info?handles=Fefer_Ivan
        response = requests.get(f"https://codeforces.com/api/user.info?handles={handle}", timeout=10)
        data = response.json()
        
        if data['status'] != 'OK':
            return Response({"error": "User not found on Codeforces"}, status=404)
            
        user_info = data['result'][0]
        # Check firstName field for the token
        first_name = user_info.get('firstName', '')
        # organization = user_info.get('organization', '')
        
        print(f"DEBUG: Codeforces {handle} firstName: {first_name}")
        
        if token in first_name:
            profile.codeforces_handle = handle
            profile.is_codeforces_verified = True
            profile.save()
            return Response({"success": True, "message": "Codeforces account verified!"})
        else:
             return Response({
                "success": False, 
                "error": f"Token '{token}' not found in First Name. Found: '{first_name}'"
            }, status=400)
            
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Network error connecting to Codeforces: {str(e)}"}, status=503)
    except Exception as e:
        return Response({"error": f"Codeforces API error: {str(e)}"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_codechef_account(request):
    # CodeChef has no public API for bio. We will rely on trusted input for now 
    # OR try to scrape if possible. For safety/stability, let's allow "Manual" verification 
    # effectively by just saving the handle if they confirm they added it (honor system) 
    # OR we can try to fetch the profile page.
    
    handle = request.data.get('handle')
    if not handle:
        return Response({"error": "Handle is required"}, status=400)
        
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Simulating verification for CodeChef to avoid complex scraping
    # In a real production app, we'd use a backend worker with Selenium or authorized API.
    # For this project, we'll verify if the user simply exists.
    
    try:
        import requests
    except ImportError:
        return Response({"error": "Server configuration error: 'requests' library is missing."}, status=503)

    try:
        # Check if user profile exists
        response = requests.get(f"https://www.codechef.com/users/{handle}", timeout=10)
        if response.status_code != 200:
             return Response({"error": "User not found on CodeChef"}, status=404)
        
        # We can't easily check bio without parsing HTML and handling dynamic content.
        # We will assume verified if they click verify (Honor System for CodeChef)
        # OR we can ask them to change their Name temporarily if we parsed HTML.
        
        profile.codechef_handle = handle
        profile.is_codechef_verified = True
        profile.save()
        
        return Response({"success": True, "message": "CodeChef handle linked successfully!"})
        
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Network error connecting to CodeChef: {str(e)}"}, status=503)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def init_mock_data(request):
    try:
        if request.user.is_authenticated:
            user = request.user
        else:
            user, created = User.objects.get_or_create(username='testuser', defaults={'email': 'test@example.com'})
            if created:
                user.set_password('password')
                user.save()

        # Create Profile if not exists
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user, rank=1200, accuracy=85.5, active_days=10)

        # Create some problems
        if Problem.objects.count() == 0:
            import json
            
            # Two Sum
            Problem.objects.create(
                title="Two Sum", 
                difficulty="Easy", 
                topic="Arrays", 
                platform="LeetCode", 
                url="https://leetcode.com/problems/two-sum",
                description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
                examples=json.dumps([
                    { "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]" },
                    { "input": "nums = [3,2,4], target = 6", "output": "[1,2]" }
                ]),
                constraints=json.dumps([
                    "2 <= nums.length <= 10^4",
                    "-10^9 <= nums[i] <= 10^9",
                    "-10^9 <= target <= 10^9",
                    "Only one valid answer exists."
                ]),
                starter_code=json.dumps({
                    "javascript": "function twoSum(nums, target) {\n  // Write your code here\n};",
                    "python": "def two_sum(nums, target):\n    # Write your code here\n    pass"
                })
            )
            
            # Valid Palindrome
            Problem.objects.create(
                title="Valid Palindrome", 
                difficulty="Easy", 
                topic="Strings", 
                platform="LeetCode", 
                url="https://leetcode.com/problems/valid-palindrome",
                description="A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
                examples=json.dumps([
                    { "input": 's = "A man, a plan, a canal: Panama"', "output": "true" }
                ]),
                constraints=json.dumps([
                    "1 <= s.length <= 2 * 10^5",
                    "s consists only of printable ASCII characters."
                ]),
                starter_code=json.dumps({
                    "javascript": "function isPalindrome(s) {\n  // Write your code here\n};",
                    "python": "def is_palindrome(s):\n    # Write your code here\n    pass"
                })
            )
            
            # 3Sum
            Problem.objects.create(
                title="3Sum", 
                difficulty="Medium", 
                topic="Arrays", 
                platform="LeetCode", 
                url="https://leetcode.com/problems/3sum",
                description="Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
                examples=json.dumps([
                    { "input": 'nums = [-1,0,1,2,-1,-4]', "output": "[[-1,-1,2],[-1,0,1]]" }
                ]),
                constraints=json.dumps([
                    "0 <= nums.length <= 3000",
                    "-10^5 <= nums[i] <= 10^5"
                ]),
                starter_code=json.dumps({
                    "javascript": "function threeSum(nums) {\n  // Write your code here\n};",
                    "python": "def three_sum(nums):\n    # Write your code here\n    pass"
                })
            )
        
        # Create some submissions
        if Submission.objects.count() == 0 and Problem.objects.exists():
            probls = Problem.objects.all()
            Submission.objects.create(user=user, problem=probls[0], status="Solved")
            Submission.objects.create(user=user, problem=probls[1], status="Wrong Answer")
            if len(probls) > 2:
                Submission.objects.create(user=user, problem=probls[2], status="Solved")
            
            # Create Topic Progress
            TopicProgress.objects.create(user=user, topic="Arrays", solved_count=2, total_problems=10)
            TopicProgress.objects.create(user=user, topic="Strings", solved_count=0, total_problems=5)
            
            # Create Analytics (Dummy data for heatmap)
            Analytics.objects.create(user=user, problems_solved=2, date=datetime.now().date())
        
        return Response({"message": "Mock data initialized successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

from rest_framework.throttling import UserRateThrottle
from django.utils.html import escape

class SubmissionRateThrottle(UserRateThrottle):
    rate = '15/minute'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([SubmissionRateThrottle])
def execute_code(request):
    serializer = CodeExecutionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)
        
    language = serializer.validated_data.get('language')
    code = serializer.validated_data.get('code')
    stdin = serializer.validated_data.get('stdin', '')

    # Map frontend languages to Piston
    lang_map = {
        'javascript': 'javascript',
        'js': 'javascript',
        'python': 'python',
        'py': 'python',
        'c++': 'cpp',
        'cpp': 'cpp',
        'java': 'java',
    }
    
    piston_lang = lang_map.get(language.lower())
    if not piston_lang:
        return Response({"error": f"Unsupported language: {language}"}, status=400)

    try:
        from .compiler import execute_code_piston
        result = execute_code_piston(piston_lang, code, stdin)
        
        if "error" in result:
             return Response(result, status=500)
             
        # Sanitize stdout
        if "stdout" in result and result["stdout"]:
            result["stdout"] = escape(result["stdout"])
             
        return Response(result)
    except ImportError:
        return Response({"error": "Compiler module not found"}, status=500)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mentor_stats(request):
    try:
        from django.db.models import Count, Avg, Sum, Q
        from django.utils import timezone
        import datetime

        # Check if user is a teacher
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'teacher':
             return Response({"error": "Unauthorized. Only teachers can access this."}, status=403)

        # 1. Total Students
        students = UserProfile.objects.filter(role='student')
        total_students = students.count()
        
        # 2. Avg Solve Rate (Accuracy)
        avg_accuracy = students.aggregate(Avg('accuracy'))['accuracy__avg'] or 0
        
        # 3. Active Today
        today = timezone.now().date()
        # Assuming we track login or submission as activity. Let's use Analytics or Submissions.
        active_today = Analytics.objects.filter(date=today).count()
        # OR count users who submitted today
        active_today_submissions = Submission.objects.filter(created_at__date=today).values('user').distinct().count()
        active_count = max(active_today, active_today_submissions)

        # 4. Total Submissions
        total_submissions = Submission.objects.count()

        # 5. Branch Comparison
        branch_stats = students.values('branch').annotate(
            students=Count('id'),
            avgSolved=Avg('rank') # Using rank as proxy for solved count for now, or use annotation
        ).order_by('branch')
        
        # Calculate real avgSolved
        valid_branches = []
        for b in branch_stats:
            # Calculate average submissions for users in this branch
            branch_users = User.objects.filter(profile__branch=b['branch'])
            solved_count = Submission.objects.filter(user__in=branch_users, status='Solved').count()
            avg_solved = solved_count / b['students'] if b['students'] > 0 else 0
            
            valid_branches.append({
                "name": b['branch'],
                "students": b['students'],
                "avgSolved": round(avg_solved, 1),
                "activity": 50 + (b['students'] % 40) # Mock activity score for now
            })

        # 6. Submission History (Last 7 days)
        submission_history = []
        for i in range(6, -1, -1):
            date = today - datetime.timedelta(days=i)
            day_name = date.strftime("%a")
            count = Submission.objects.filter(created_at__date=date).count()
            submission_history.append({"day": day_name, "count": count})

        # 7. Student List
        student_list = []
        for s in students:
            # Calculate solved count
            solved = Submission.objects.filter(user=s.user, status='Solved').count()
            
            # Last active
            last_sub = Submission.objects.filter(user=s.user).order_by('-created_at').first()
            last_active = "Never"
            if last_sub:
                days_ago = (timezone.now() - last_sub.created_at).days
                if days_ago == 0:
                    last_active = "Today"
                elif days_ago == 1:
                    last_active = "Yesterday"
                else:
                    last_active = f"{days_ago} days ago"
            
            status = "Active" if last_active in ["Today", "Yesterday"] or (last_sub and (timezone.now() - last_sub.created_at).days < 7) else "Inactive"
            
            student_list.append({
                "id": s.user.id,
                "name": s.user.first_name + " " + s.user.last_name if s.user.first_name else s.user.username,
                "username": s.user.username,
                "branch": s.branch,
                "solved": solved,
                "points": s.rank, # Using rank as points
                "status": status,
                "lastActive": last_active
            })

        # 8. Topic Mastery (Aggregate)
        topics = ["Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs"]
        topic_mastery = []
        for t in topics:
            # Mock data for Class Avg (A) and Global/Target (B)
            # Real implementation would aggregate TopicProgress
            topic_mastery.append({
                "subject": t,
                "A": 50 + (len(t) * 5),
                "B": 80,
                "fullMark": 100
            })

        data = {
            "stats": [
                { "label": "Total Students", "value": str(total_students), "trend": "+0 new", "icon": "👥" },
                { "label": "Avg. Accuracy", "value": f"{int(avg_accuracy)}%", "trend": "~0%", "icon": "🎯" },
                { "label": "Active Today", "value": str(active_count), "trend": "Normal", "icon": "🔥" },
                { "label": "Total Submissions", "value": str(total_submissions), "trend": "+0", "icon": "📝" },
            ],
            "branchData": valid_branches,
            "submissionHistory": submission_history,
            "studentStats": student_list,
            "topicMastery": topic_mastery
        }
        
        return Response(data)
    except Exception as e:
        print(f"Error in get_mentor_stats: {e}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roadmap(request):
    user = request.user
    
    # 1. Define Roadmap Structure
    roadmaps = [
        {
            "id": 1,
            "title": "Data Structures Mastery",
            "level": "Beginner to Intermediate",
            # "progress": 0, # Calculated dynamically
            "nodes": [
                { "id": 1, "label": "Arrays & Strings", "topic_key": "Arrays" },
                { "id": 2, "label": "Linked Lists", "topic_key": "Linked Lists" },
                { "id": 3, "label": "Stacks & Queues", "topic_key": "Stacks" },
                { "id": 4, "label": "Hashing", "topic_key": "Hashing" },
                { "id": 5, "label": "Trees & Graphs", "topic_key": "Trees" }
            ]
        },
        {
            "id": 2,
            "title": "Dynamic Programming Specialist",
            "level": "Advanced",
            # "progress": 0,
            "nodes": [
                { "id": 1, "label": "Recursion & Memoization", "topic_key": "Recursion" },
                { "id": 2, "label": "1D Array DP", "topic_key": "DP" },
                { "id": 3, "label": "2D Grid DP", "topic_key": "DP" },
                { "id": 4, "label": "DP on Trees", "topic_key": "DP" }
            ]
        }
    ]
    
    response_data = []
    
    for roadmap in roadmaps:
        nodes_data = []
        total_solved = 0
        total_required = 0 
        
        # Logic: Node N is unlocked if Node N-1 is "Completed" (Mastered)
        # OR simplified: Node N is unlocked if (N-1) is unlocked AND (N-1) is "Current" or "Completed"?
        # Actually, traditionally: locked until previous is completed.
        
        previous_node_completed = True # First node is always unlocked
        
        for node in roadmap['nodes']:
            topic_key = node['topic_key']
            
            # Simple aggregation
            progress = TopicProgress.objects.filter(user=user, topic__icontains=topic_key).first()
            
            solved = progress.solved_count if progress else 0
            total = Problem.objects.filter(topic__icontains=topic_key).count()
            
            # Handling 0 problems in DB for a topic
            if total == 0:
                 # If no problems exist, we can't solve anything. 
                 # Should we mark it as completed or auto-skip?
                 # Let's count it as 0 progress but unlocked if previous was done.
                 pass

            status = "locked"
            is_completed = False
            
            if previous_node_completed:
                if total > 0:
                    match_percentage = (solved / total) * 100
                    if match_percentage >= 80:
                         status = "completed"
                         is_completed = True
                    else:
                        status = "current"
                else:
                     # No problems to solve. 
                     status = "current"
                     # is_completed = True? No, let's keep it open or it might confuse.
            
            nodes_data.append({
                "id": node['id'],
                "label": node['label'],
                "status": status,
                "solved": solved,
                "total": total
            })
            
            total_solved += solved
            total_required += total
            
            if is_completed:
                previous_node_completed = True
            else:
                previous_node_completed = False

        roadmap_progress = 0
        if total_required > 0:
            roadmap_progress = int((total_solved / total_required) * 100)
            
        response_data.append({
            "id": roadmap['id'],
            "title": roadmap['title'],
            "level": roadmap['level'],
            "progress": roadmap_progress,
            "nodes": nodes_data
        })

    return Response(response_data)

class ContextViewSet(viewsets.ModelViewSet):
    queryset = Context.objects.all()
    serializer_class = ContextSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'teacher':
             # Teachers see contexts they created
             return Context.objects.filter(mentor=user).order_by('-created_at')
        else:
             # Students see active contexts
             # TODO: Filter by batch/branch if needed
             return Context.objects.filter(is_active=True).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # 1. Validate Data
        # 2. Create Context
        # 3. Add Problems
        # 4. Create Notifications
        
        from .models import Context, ContextProblem, Notification, UserProfile
        
        data = request.data
        user = request.user
        
        if not hasattr(user, 'profile') or user.profile.role != 'teacher':
            return Response({"error": "Only mentors can create contexts."}, status=403)
            
        try:
            # Basic Fields
            context = Context.objects.create(
                title=data['title'],
                description=data.get('description', ''),
                mentor=user,
                start_time=data['start_time'],
                end_time=data['end_time'],
                duration_minutes=data.get('duration_minutes', 60),
                difficulty=data.get('difficulty', 'Medium'),
                target_batch=data.get('target_batch', 'All'),
                target_branch=data.get('target_branch', 'All')
            )
            
            # Add Problems
            problems = data.get('problems', [])
            for index, prob_id in enumerate(problems):
                try:
                    problem = Problem.objects.get(id=prob_id)
                    ContextProblem.objects.create(
                        context=context,
                        problem=problem,
                        order_index=index
                    )
                except Problem.DoesNotExist:
                    continue # Skip invalid problems
            
            # Create Notifications for Target Audience
            target_students = UserProfile.objects.filter(role='student')
            
            if context.target_branch and context.target_branch != 'All':
                target_students = target_students.filter(branch=context.target_branch)
            
            if context.target_batch and context.target_batch != 'All':
                target_students = target_students.filter(batch=context.target_batch)
                
            notifications = []
            for student_profile in target_students:
                notifications.append(Notification(
                    recipient=student_profile.user,
                    title=f"New Context: {context.title}",
                    message=f"A new {context.difficulty} context has been assigned by {user.username}.",
                    link=f"/context/{context.id}"
                ))
            Notification.objects.bulk_create(notifications)
            
            serializer = self.get_serializer(context)
            return Response(serializer.data, status=201)
            
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Verify ownership
        if instance.mentor != request.user:
            return Response({"error": "You can only edit contexts you created."}, status=403)
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Update Problems if provided
        if 'problems' in request.data:
            # Clear existing and re-add
            from .models import ContextProblem
            ContextProblem.objects.filter(context=instance).delete()
            
            problems = request.data.get('problems', [])
            for index, prob_id in enumerate(problems):
                try:
                    problem = Problem.objects.get(id=prob_id)
                    ContextProblem.objects.create(
                        context=instance,
                        problem=problem,
                        order_index=index
                    )
                except Problem.DoesNotExist:
                    continue

        return Response(serializer.data)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
