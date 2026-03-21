from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Problem, Submission, UserProfile, TopicProgress, Analytics, Context, ContextProblem, Notification, UserStats, TestCase, Achievement, AchievementDefinition, Contest, ContestParticipant, ContestSubmission
from .serializers import (
    UserSerializer, ProblemSerializer, SubmissionSerializer, 
    UserProfileSerializer, TopicProgressSerializer, AnalyticsSerializer,
    CustomTokenObtainPairSerializer, ContextSerializer, NotificationSerializer,
    CodeExecutionSerializer, TestCaseSerializer, AchievementSerializer, 
    AchievementDefinitionSerializer, AchievementProgressSerializer,
    ContestSerializer, ContestDetailSerializer, ContestParticipantSerializer,
    ContestSubmissionSerializer, ContestLeaderboardSerializer
)
from datetime import datetime
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        from django.core.cache import cache
        email = request.data.get('email', '').strip().lower()
        verified = cache.get(f"otp_verified_{email}")
        if not verified:
            return Response(
                {"error": "Email not verified. Please complete OTP verification first."},
                status=400
            )
        response = super().create(request, *args, **kwargs)
        # Clear the verified flag after successful registration
        cache.delete(f"otp_verified_{email}")
        return response

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
        problem = self.request.query_params.get('problem')
        if user:
            queryset = queryset.filter(user_id=user)
        if problem:
            queryset = queryset.filter(problem_id=problem)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def solved_problems(self, request):
        """Return list of problem IDs the current user has accepted submissions for."""
        user_id = request.query_params.get('user', request.user.id)
        solved_ids = Submission.objects.filter(
            user_id=user_id,
            status='ACCEPTED'
        ).values_list('problem_id', flat=True).distinct()
        return Response(list(solved_ids))

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def submit_solution(self, request):
        """
        Submit a solution with code execution and test case validation.
        
        Expected payload:
        {
            "problem_id": int,
            "language": str,
            "code": str
        }
        """
        problem_id = request.data.get('problem_id')
        language = request.data.get('language')
        code = request.data.get('code')
        
        if not all([problem_id, language, code]):
            return Response(
                {"error": "problem_id, language, and code are required"},
                status=400
            )
        
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({"error": "Problem not found"}, status=404)
        
        # Check if user already has an accepted submission
        already_accepted = Submission.objects.filter(
            user=request.user,
            problem=problem,
            status='ACCEPTED'
        ).exists()
        
        # Get test cases
        testcases = TestCase.objects.filter(problem=problem)
        
        if not testcases.exists():
            return Response(
                {"error": "No test cases available for this problem"},
                status=400
            )
        
        # Prepare test cases for execution
        test_data = [
            {
                'input': tc.input_data,
                'expected_output': tc.expected_output
            }
            for tc in testcases
        ]
        
        # Execute code with Docker
        from .docker_executor import get_executor
        executor = get_executor()
        
        # Normalize language
        lang_map = {
            'javascript': 'javascript',
            'js': 'javascript',
            'python': 'python',
            'py': 'python',
            'c++': 'cpp',
            'cpp': 'cpp',
            'java': 'java',
            'c': 'c',
        }
        normalized_lang = lang_map.get(language.lower(), language.lower())
        
        if executor.is_available():
            result = executor.execute_with_testcases(
                language=normalized_lang,
                code=code,
                testcases=test_data
            )
        else:
            # Fallback: Execute with Piston for each test case
            logger.info("Docker not available, using Piston for submission")
            from .compiler import execute_code_piston
            
            results = []
            passed = 0
            
            for i, tc in enumerate(test_data):
                exec_result = execute_code_piston(
                    normalized_lang,
                    code,
                    tc['input']
                )
                
                if exec_result.get('is_error') or 'error' in exec_result:
                    results.append({
                        'testcase': i + 1,
                        'passed': False,
                        'input': tc['input'],
                        'expected': tc['expected_output'],
                        'actual': exec_result.get('stderr', ''),
                        'error': exec_result.get('error', 'Execution failed')
                    })
                else:
                    actual = exec_result.get('stdout', '').strip()
                    expected = tc['expected_output'].strip()
                    
                    # Normalize
                    actual_norm = '\n'.join(line.rstrip() for line in actual.split('\n')).rstrip()
                    expected_norm = '\n'.join(line.rstrip() for line in expected.split('\n')).rstrip()
                    
                    is_passed = actual_norm == expected_norm
                    if is_passed:
                        passed += 1
                    
                    results.append({
                        'testcase': i + 1,
                        'passed': is_passed,
                        'input': tc['input'],
                        'expected': expected,
                        'actual': actual
                    })
            
            result = {
                'passed': passed,
                'total': len(test_data),
                'all_passed': passed == len(test_data),
                'results': results
            }
        
        # Determine status
        if result['all_passed']:
            if already_accepted:
                submission_status = 'ACCEPTED'  # Still mark as accepted
                logger.info(f"User {request.user.id} re-submitted accepted problem {problem_id}")
            else:
                submission_status = 'ACCEPTED'
        else:
            submission_status = 'FAILED'
        
        # Calculate execution metrics
        avg_time = sum(r.get('execution_time', 0) for r in result['results']) / len(result['results']) if result['results'] else 0
        avg_memory = sum(r.get('memory_used', 0) for r in result['results']) / len(result['results']) if result['results'] else 0
        
        # Create submission record
        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            code=code,
            language=normalized_lang,
            status=submission_status,
            passed_testcases=result['passed'],
            total_testcases=result['total'],
            execution_time_ms=int(avg_time * 1000),
            memory_used_kb=int(avg_memory / 1024) if avg_memory > 0 else 0,
            test_results=result['results']
        )
        
        # Update user stats if newly accepted
        if submission_status == 'ACCEPTED' and not already_accepted:
            from django.db.models import Sum
            # Sum points of all uniquely solved problems (source of truth)
            new_problems_solved = Submission.objects.filter(
                user=request.user,
                status='ACCEPTED'
            ).values('problem').distinct().count()

            new_score = (
                Submission.objects.filter(user=request.user, status='ACCEPTED')
                .values('problem')
                .distinct()
                .aggregate(total=Sum('problem__points'))['total'] or 0
            )

            user_stats_obj, _ = UserStats.objects.get_or_create(user=request.user)
            user_stats_obj.problems_solved = new_problems_solved
            user_stats_obj.score = new_score
            user_stats_obj.save()
            
            # Update TopicProgress for the problem's topic
            topic = problem.topic
            topic_progress, created = TopicProgress.objects.get_or_create(
                user=request.user,
                topic=topic,
                defaults={
                    'solved_count': 0,
                    'total_problems': Problem.objects.filter(topic=topic).count()
                }
            )
            # Increment solved count
            topic_progress.solved_count = F('solved_count') + 1
            topic_progress.total_problems = Problem.objects.filter(topic=topic).count()
            topic_progress.save()
            
            # Update analytics
            from django.utils import timezone
            analytics, created = Analytics.objects.get_or_create(
                user=request.user,
                date=timezone.now().date(),
                defaults={'problems_solved': 1}
            )
            if not created:
                analytics.problems_solved = F('problems_solved') + 1
                analytics.save()
            
            # Update profile stats (accuracy, rank, active days)
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
            # Calculate accuracy
            total_subs = Submission.objects.filter(user=request.user).count()
            accepted_subs = Submission.objects.filter(user=request.user, status='ACCEPTED').count()
            profile.accuracy = round((accepted_subs / total_subs * 100), 1) if total_subs > 0 else 0
            
            # Calculate active days
            submission_dates = Submission.objects.filter(user=request.user).values_list('created_at__date', flat=True).distinct()
            profile.active_days = len(set(submission_dates))
            
            # Calculate rank
            profile.rank = UserStats.objects.filter(score__gt=user_stats_obj.score).count() + 1
            
            profile.save()
            
            # Check and award achievements
            from .services.achievement_service import AchievementService
            newly_earned = AchievementService.check_and_award_achievements(request.user, submission)
            logger.info(f"User {request.user.id} earned {len(newly_earned)} new achievements")
            
            # Serialize newly earned achievements
            newly_earned_data = []
            if newly_earned:
                for achievement in newly_earned:
                    newly_earned_data.append({
                        'id': achievement.id,
                        'title': achievement.title,
                        'description': achievement.description,
                        'icon': achievement.icon,
                        'points': achievement.achievement_def.points if hasattr(achievement, 'achievement_def') else 0
                    })
        else:
            newly_earned_data = []
            
            # Still update analytics for failed submissions (to track activity)
            from django.utils import timezone
            analytics, created = Analytics.objects.get_or_create(
                user=request.user,
                date=timezone.now().date(),
                defaults={'problems_solved': 0}
            )
            
            # Update profile accuracy even for failed submissions
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            total_subs = Submission.objects.filter(user=request.user).count()
            accepted_subs = Submission.objects.filter(user=request.user, status='ACCEPTED').count()
            profile.accuracy = round((accepted_subs / total_subs * 100), 1) if total_subs > 0 else 0
            
            # Update active days
            submission_dates = Submission.objects.filter(user=request.user).values_list('created_at__date', flat=True).distinct()
            profile.active_days = len(set(submission_dates))
            
            profile.save()
        
        # Return response
        return Response({
            'submission_id': submission.id,
            'status': submission_status,
            'passed': result['passed'],
            'total': result['total'],
            'all_passed': result['all_passed'],
            'execution_time_ms': submission.execution_time_ms,
            'memory_used_kb': submission.memory_used_kb,
            'test_results': result['results'],
            'newly_earned_achievements': newly_earned_data
        }, status=201)


class TestCaseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing test cases"""
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        problem_id = self.request.query_params.get('problem')
        if problem_id:
            queryset = queryset.filter(problem_id=problem_id)
        
        # Teachers can see all test cases, students only see non-hidden ones
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'teacher':
            return queryset
        else:
            return queryset.filter(is_hidden=False)
    
    def perform_create(self, serializer):
        # Only teachers can create test cases
        if not hasattr(self.request.user, 'profile') or self.request.user.profile.role != 'teacher':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only teachers can create test cases")
        serializer.save()
    
    def perform_update(self, serializer):
        # Only teachers can update test cases
        if not hasattr(self.request.user, 'profile') or self.request.user.profile.role != 'teacher':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only teachers can update test cases")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only teachers can delete test cases
        if not hasattr(self.request.user, 'profile') or self.request.user.profile.role != 'teacher':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only teachers can delete test cases")
        instance.delete()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_problem_testcases(request, problem_id):
    """Get test cases for a specific problem"""
    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response({"error": "Problem not found"}, status=404)
    
    testcases = TestCase.objects.filter(problem=problem)
    
    # Teachers see all, students only see non-hidden
    if not (hasattr(request.user, 'profile') and request.user.profile.role == 'teacher'):
        testcases = testcases.filter(is_hidden=False)
    
    serializer = TestCaseSerializer(testcases, many=True)
    return Response(serializer.data)


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
    
    # Get or create UserStats
    user_stats, _ = UserStats.objects.get_or_create(user=user)
    
    # Get recent submissions (limit 5)
    recent_submissions = Submission.objects.filter(user=user).order_by('-created_at')[:5]
    
    # Calculate actual problems solved (distinct accepted submissions)
    problems_solved = Submission.objects.filter(
        user=user,
        status='ACCEPTED'
    ).values('problem').distinct().count()

    # Recalculate score: sum points of each uniquely solved problem
    from django.db.models import Sum
    correct_score = (
        Submission.objects.filter(user=user, status='ACCEPTED')
        .values('problem')
        .distinct()
        .aggregate(total=Sum('problem__points'))['total'] or 0
    )

    # Update UserStats if out of sync
    if user_stats.problems_solved != problems_solved or user_stats.score != correct_score:
        user_stats.problems_solved = problems_solved
        user_stats.score = correct_score
        user_stats.save()
    
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
        "hackerrank_handle": profile.hackerrank_handle,
        "is_hackerrank_verified": profile.is_hackerrank_verified,
        
        # Real problems solved count
        "problemsSolved": problems_solved,
        
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
        "codeforces_verified": profile.is_codeforces_verified,
        "hackerrank_verified": profile.is_hackerrank_verified,
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
    logger.info(f"Execute code request from user: {request.user.username}")
    logger.info(f"Request data: language={request.data.get('language')}, code_length={len(request.data.get('code', ''))}")
    
    serializer = CodeExecutionSerializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Serializer validation failed: {serializer.errors}")
        return Response(serializer.errors, status=400)
        
    language = serializer.validated_data.get('language')
    code = serializer.validated_data.get('code')
    stdin = serializer.validated_data.get('stdin', '')

    # Map frontend languages
    lang_map = {
        'javascript': 'javascript',
        'js': 'javascript',
        'python': 'python',
        'py': 'python',
        'c++': 'cpp',
        'cpp': 'cpp',
        'java': 'java',
        'c': 'c',
    }
    
    normalized_lang = lang_map.get(language.lower())
    if not normalized_lang:
        logger.error(f"Unsupported language: {language}")
        return Response({"error": f"Unsupported language: {language}"}, status=400)

    try:
        # Try Docker execution first (more secure and feature-rich)
        from .docker_executor import get_executor
        executor = get_executor()
        
        if executor.is_available():
            logger.info(f"Using Docker executor for {normalized_lang}")
            result = executor.execute_code(normalized_lang, code, stdin)
            logger.info(f"Docker execution result: is_error={result.get('is_error')}, has_output={bool(result.get('stdout') or result.get('stderr'))}")
            
            if result.get('is_error') and 'error' in result:
                # Docker execution failed, try Piston as fallback
                logger.warning(f"Docker execution failed: {result.get('error')}, falling back to Piston")
                from .compiler import execute_code_piston
                piston_result = execute_code_piston(normalized_lang, code, stdin)
                
                if "error" in piston_result:
                    logger.error(f"Piston also failed: {piston_result.get('error')}")
                    return Response(piston_result, status=500)
                
                # Sanitize and return Piston result
                if "stdout" in piston_result and piston_result["stdout"]:
                    piston_result["stdout"] = escape(piston_result["stdout"])
                
                logger.info("Piston fallback successful")
                return Response(piston_result)
            
            # Docker execution successful
            # Format response to match expected structure
            response_data = {
                'stdout': result.get('stdout', ''),
                'stderr': result.get('stderr', ''),
                'output': result.get('stdout', '') or result.get('stderr', ''),
                'is_error': result.get('is_error', False),
                'execution_time': result.get('execution_time', 0),
                'memory_used': result.get('memory_used', 0),
            }
            
            # Sanitize output
            if response_data['stdout']:
                response_data['stdout'] = escape(response_data['stdout'])
            if response_data['output']:
                response_data['output'] = escape(response_data['output'])
            
            logger.info("Returning Docker execution result")
            return Response(response_data)
        else:
            # Docker not available, use Piston
            logger.info("Docker not available, using Piston API")
            from .compiler import execute_code_piston
            result = execute_code_piston(normalized_lang, code, stdin)
            
            if "error" in result:
                logger.error(f"Piston execution failed: {result.get('error')}")
                return Response(result, status=500)
                 
            # Sanitize stdout
            if "stdout" in result and result["stdout"]:
                result["stdout"] = escape(result["stdout"])
            
            logger.info("Piston execution successful")
            return Response(result)
            
    except ImportError as e:
        logger.error(f"Import error: {e}")
        return Response({"error": "Execution module not found"}, status=500)
    except Exception as e:
        logger.error(f"Execution error: {e}", exc_info=True)
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
            solved_count = Submission.objects.filter(user__in=branch_users, status='ACCEPTED').count()
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
            # Calculate solved count (unique problems)
            solved = Submission.objects.filter(user=s.user, status='ACCEPTED').values('problem').distinct().count()
            
            # Get actual points from UserStats
            user_stats = getattr(s.user, 'stats', None)
            points = user_stats.score if user_stats else 0
            
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
                "points": points,
                "status": status,
                "lastActive": last_active
            })

        # 8. Topic Mastery (Aggregate) - Calculate from actual problem data
        from django.db.models import Count, Q
        
        # Get all problems grouped by topic
        problem_topics = Problem.objects.values('topic').annotate(
            total_problems=Count('id')
        ).filter(total_problems__gt=0).order_by('-total_problems')
        
        topic_mastery = []
        for pt in problem_topics:
            topic = pt['topic']
            total_problems = pt['total_problems']
            
            # Count total ACCEPTED submissions in this topic (across all students)
            total_solved = Submission.objects.filter(
                problem__topic=topic,
                status='ACCEPTED'
            ).values('problem').distinct().count()
            
            # Calculate average problems solved per student in this topic
            # This gives us: how many problems on average each student solved in this topic
            if total_students > 0:
                # Count unique problem-user combinations
                unique_solves = Submission.objects.filter(
                    problem__topic=topic,
                    status='ACCEPTED'
                ).values('user', 'problem').distinct().count()
                
                avg_solved_per_student = unique_solves / total_students
            else:
                avg_solved_per_student = 0
            
            topic_mastery.append({
                "subject": topic,
                "A": round(avg_solved_per_student, 1),  # Average problems solved per student
                "fullMark": total_problems  # Total problems available in topic
            })
        
        # Limit to top 5 topics for better visualization
        topic_mastery = topic_mastery[:5]
        
        # If no topic data, show default topics with sample data
        if not topic_mastery:
            default_topics = ["Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs"]
            topic_mastery = [
                {"subject": t, "A": 0, "fullMark": 100}
                for t in default_topics
            ]

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


class AchievementDefinitionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for achievement definitions (read-only)"""
    queryset = AchievementDefinition.objects.filter(is_active=True)
    serializer_class = AchievementDefinitionSerializer
    permission_classes = [IsAuthenticated]


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user achievements"""
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get achievements for the current user or specified user
        user_id = self.request.query_params.get('user')
        if user_id:
            return Achievement.objects.filter(user_id=user_id)
        return Achievement.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Get user's progress towards all achievements"""
        from .services.achievement_service import AchievementService
        
        user_id = request.query_params.get('user')
        if user_id:
            try:
                from django.contrib.auth.models import User
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        else:
            user = request.user
        
        progress_data = AchievementService.get_user_progress(user)
        serializer = AchievementProgressSerializer(progress_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def check(self, request):
        """Manually trigger achievement check (for testing)"""
        from .services.achievement_service import AchievementService
        
        newly_earned = AchievementService.check_and_award_achievements(request.user)
        serializer = AchievementSerializer(newly_earned, many=True)
        return Response({
            'newly_earned': serializer.data,
            'count': len(newly_earned)
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def platform_stats(request):
    """Get platform-wide statistics for homepage"""
    from django.db.models import Sum, Count
    from django.contrib.auth.models import User
    
    # Total problems solved across all users
    total_submissions = Submission.objects.filter(status='ACCEPTED').count()
    
    # Active users (users who have made at least one submission)
    active_users = User.objects.filter(submissions__isnull=False).distinct().count()
    
    # Total users registered
    total_users = User.objects.count()
    
    # Total problems available
    total_problems = Problem.objects.filter(is_deleted=False).count()
    
    # Calculate accuracy (accepted / total submissions)
    total_all_submissions = Submission.objects.count()
    accuracy = (total_submissions / total_all_submissions * 100) if total_all_submissions > 0 else 0
    
    return Response({
        'total_problems_solved': total_submissions,
        'active_users': active_users,
        'total_users': total_users,
        'total_problems': total_problems,
        'platform_accuracy': round(accuracy, 1),
        'success_rate': round(accuracy, 1)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leetcode_stats_proxy(request):
    """Proxy LeetCode GraphQL API to avoid CORS issues in the browser"""
    import requests as req

    username = request.query_params.get('username')
    if not username:
        return Response({'error': 'username is required'}, status=400)

    # Combined query: profile stats + contest ranking
    query = """
    query getUserData($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                ranking
            }
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
        userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
        }
    }
    """

    try:
        response = req.post(
            'https://leetcode.com/graphql',
            json={'query': query, 'variables': {'username': username}},
            headers={
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
                'User-Agent': 'Mozilla/5.0',
            },
            timeout=10
        )
        data = response.json()

        if 'errors' in data or not data.get('data', {}).get('matchedUser'):
            return Response({'error': 'LeetCode user not found'}, status=404)

        matched = data['data']['matchedUser']
        contest = data['data'].get('userContestRanking') or {}
        submit_stats = matched.get('submitStats', {}).get('acSubmissionNum', [])

        total_solved = easy = medium = hard = 0
        for s in submit_stats:
            if s['difficulty'] == 'All':
                total_solved = s['count']
            elif s['difficulty'] == 'Easy':
                easy = s['count']
            elif s['difficulty'] == 'Medium':
                medium = s['count']
            elif s['difficulty'] == 'Hard':
                hard = s['count']

        return Response({
            'platform': 'LeetCode',
            'totalSolved': total_solved,
            'easySolved': easy,
            'mediumSolved': medium,
            'hardSolved': hard,
            'ranking': matched.get('profile', {}).get('ranking', 0),
            'acceptanceRate': round((total_solved / (total_solved + 100)) * 100) if total_solved > 0 else 0,
            'contestRating': round(contest.get('rating', 0)) if contest.get('rating') else 0,
            'contestGlobalRanking': contest.get('globalRanking', 0),
            'contestsAttended': contest.get('attendedContestsCount', 0),
            'topPercentage': round(contest.get('topPercentage', 0), 2) if contest.get('topPercentage') else 0,
        })

    except req.exceptions.Timeout:
        return Response({'error': 'LeetCode API timed out'}, status=504)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def codechef_stats_proxy(request):
    """Scrape CodeChef profile page server-side to avoid CORS issues"""
    import requests as req
    import re

    username = request.query_params.get('username')
    if not username:
        return Response({'error': 'username is required'}, status=400)

    try:
        response = req.get(
            f'https://www.codechef.com/users/{username}',
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout=10
        )

        if response.status_code == 404:
            return Response({'error': 'CodeChef user not found'}, status=404)
        if response.status_code != 200:
            return Response({'error': f'CodeChef returned {response.status_code}'}, status=502)

        html = response.text

        # Current rating
        rating_match = re.search(r'<div class="rating-number">(\d+)</div>', html)
        current_rating = int(rating_match.group(1)) if rating_match else 0

        # Stars — count ★ symbols inside rating-star div
        stars_match = re.search(r'<div class="rating-star">(.*?)</div>', html, re.DOTALL)
        stars_count = stars_match.group(1).count('&#9733;') if stars_match else 0
        stars_str = '★' * stars_count if stars_count else 'Unrated'

        # Global rank
        rank_match = re.search(r"<strong class='global-rank'>([^<]+)</strong>", html)
        global_rank = rank_match.group(1).strip() if rank_match else 'N/A'

        # Country rank
        country_rank_match = re.search(r"<strong class='country-rank'>([^<]+)</strong>", html)
        country_rank = country_rank_match.group(1).strip() if country_rank_match else 'N/A'

        # Highest rating
        highest_match = re.search(r'highest_rating["\s:]+(\d+)', html)
        highest_rating = int(highest_match.group(1)) if highest_match else current_rating

        # Contests participated — from the contest-participated-count div
        contests_match = re.search(
            r'contest-participated-count">\s*No\. of Contests Participated:\s*<b>(\d+)',
            html
        )
        contests = int(contests_match.group(1)) if contests_match else 0

        # Total problems solved — from "Total Problems Solved: N" h3 inside problems section
        total_solved_match = re.search(r'Total Problems Solved:\s*(\d+)', html)
        fully_solved = int(total_solved_match.group(1)) if total_solved_match else 0

        # If not found, count individual problem spans in the problems-solved section
        if fully_solved == 0:
            ps_idx = html.find('rating-data-section problems-solved')
            if ps_idx > 0:
                section = html[ps_idx:ps_idx + 100000]
                end_idx = section.find('rating-data-section', 20)
                if end_idx > 0:
                    section = section[:end_idx]
                problems = re.findall(r'font-size: 12px["\s;]+>([^<]+)</span>', section)
                fully_solved = len(problems)

        return Response({
            'platform': 'CodeChef',
            'currentRating': current_rating,
            'highestRating': highest_rating,
            'stars': stars_str,
            'globalRank': global_rank,
            'countryRank': country_rank,
            'totalSolved': fully_solved,
            'contestsParticipated': contests,
        })

    except req.exceptions.Timeout:
        return Response({'error': 'CodeChef request timed out'}, status=504)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    """Get detailed analytics data - for teachers shows class stats, for students shows personal stats"""
    from django.db.models import Count, Sum, Avg
    from django.utils import timezone
    import datetime
    
    user = request.user
    
    # Check if user is a teacher
    is_teacher = hasattr(user, 'profile') and user.profile.role == 'teacher'
    
    if is_teacher:
        # TEACHER VIEW: Show class-wide statistics
        students = UserProfile.objects.filter(role='student')
        total_students = students.count()
        
        # Calculate total problems solved by all students
        total_solved = Submission.objects.filter(
            user__profile__role='student',
            status='ACCEPTED'
        ).values('problem', 'user').distinct().count()
        
        # Calculate class-wide acceptance rate
        total_submissions = Submission.objects.filter(user__profile__role='student').count()
        accepted_submissions = Submission.objects.filter(user__profile__role='student', status='ACCEPTED').count()
        acceptance_rate = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 0
        
        # Calculate total points across all students
        total_points = UserStats.objects.filter(user__profile__role='student').aggregate(Sum('score'))['score__sum'] or 0
        
        # Get submission data for the last 7 days (all students)
        today = timezone.now().date()
        submission_data = []
        for i in range(6, -1, -1):
            date = today - datetime.timedelta(days=i)
            day_name = date.strftime("%a")
            count = Submission.objects.filter(
                user__profile__role='student',
                created_at__date=date
            ).count()
            submission_data.append({"day": day_name, "count": count})
        
        # Get topic breakdown (aggregated across all students)
        problem_topics = Problem.objects.values('topic').annotate(
            total_problems=Count('id')
        ).filter(total_problems__gt=0).order_by('-total_problems')
        
        topic_data = []
        topic_breakdown = []
        
        for pt in problem_topics:
            topic = pt['topic']
            total_problems = pt['total_problems']
            
            # Count unique student-problem combinations for this topic
            solved_count = Submission.objects.filter(
                user__profile__role='student',
                problem__topic=topic,
                status='ACCEPTED'
            ).values('user', 'problem').distinct().count()
            
            # Average solved per student
            avg_solved = solved_count / total_students if total_students > 0 else 0
            
            topic_data.append({
                "name": topic,
                "solved": round(avg_solved, 1),
                "total": total_problems
            })
            
            # Calculate color based on progress
            progress_pct = (avg_solved / total_problems * 100) if total_problems > 0 else 0
            if progress_pct >= 80:
                color = "#38bdf8"
            elif progress_pct >= 60:
                color = "#818cf8"
            elif progress_pct >= 40:
                color = "#c084fc"
            elif progress_pct >= 20:
                color = "#f472b6"
            else:
                color = "#fb7185"
            
            topic_breakdown.append({
                "topic": topic,
                "solved": round(avg_solved, 1),
                "total": total_problems,
                "color": color
            })
        
        # Get submission stats over time (last 6 months) - all students
        submission_stats = []
        for i in range(5, -1, -1):
            month_date = today - datetime.timedelta(days=i*30)
            month_name = month_date.strftime("%b")
            
            # Count submissions in that month
            start_date = month_date.replace(day=1)
            if i == 0:
                end_date = today
            else:
                next_month = start_date + datetime.timedelta(days=32)
                end_date = next_month.replace(day=1) - datetime.timedelta(days=1)
            
            count = Submission.objects.filter(
                user__profile__role='student',
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count()
            
            submission_stats.append({"month": month_name, "count": count})
        
        # Add topic mastery for radar chart (class-wide average)
        topic_mastery = []
        for pt in problem_topics:
            topic = pt['topic']
            total_problems = pt['total_problems']
            
            # Count unique student-problem combinations for this topic
            solved_count = Submission.objects.filter(
                user__profile__role='student',
                problem__topic=topic,
                status='ACCEPTED'
            ).values('user', 'problem').distinct().count()
            
            # Average solved per student
            avg_solved = solved_count / total_students if total_students > 0 else 0
            
            topic_mastery.append({
                "subject": topic,
                "A": round(avg_solved, 1),  # Average solved per student
                "fullMark": total_problems  # Total available
            })
        
        return Response({
            "isTeacher": True,
            "totalStudents": total_students,
            "totalSolved": total_solved,
            "acceptanceRate": f"{acceptance_rate}%",
            "globalRank": 1,  # Not applicable for teachers
            "points": total_points,
            "submissionData": submission_data,
            "topicData": topic_data,
            "topicBreakdown": topic_breakdown,
            "topicMastery": topic_mastery,
            "submissionStats": submission_stats
        })
    
    else:
        # STUDENT VIEW: Show personal statistics
        # Get user stats
        user_stats, _ = UserStats.objects.get_or_create(user=user)
        
        # Calculate total solved (distinct accepted submissions)
        total_solved = Submission.objects.filter(
            user=user, 
            status='ACCEPTED'
        ).values('problem').distinct().count()
        
        # Calculate acceptance rate
        total_submissions = Submission.objects.filter(user=user).count()
        accepted_submissions = Submission.objects.filter(user=user, status='ACCEPTED').count()
        acceptance_rate = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 0
        
        # Calculate global rank (based on score)
        global_rank = UserStats.objects.filter(score__gt=user_stats.score).count() + 1
        
        # Get submission data for the last 7 days
        today = timezone.now().date()
        submission_data = []
        for i in range(6, -1, -1):
            date = today - datetime.timedelta(days=i)
            day_name = date.strftime("%a")
            count = Submission.objects.filter(user=user, created_at__date=date).count()
            submission_data.append({"day": day_name, "count": count})
        
        # Get topic breakdown from TopicProgress
        topic_progress = TopicProgress.objects.filter(user=user)
        topic_data = []
        topic_breakdown = []
        topic_mastery = []
        
        for tp in topic_progress:
            topic_data.append({
                "name": tp.topic,
                "solved": tp.solved_count,
                "total": tp.total_problems
            })
            
            # Calculate color based on progress
            progress_pct = (tp.solved_count / tp.total_problems * 100) if tp.total_problems > 0 else 0
            if progress_pct >= 80:
                color = "#38bdf8"
            elif progress_pct >= 60:
                color = "#818cf8"
            elif progress_pct >= 40:
                color = "#c084fc"
            elif progress_pct >= 20:
                color = "#f472b6"
            else:
                color = "#fb7185"
            
            topic_breakdown.append({
                "topic": tp.topic,
                "solved": tp.solved_count,
                "total": tp.total_problems,
                "color": color
            })
            
            # For radar chart
            topic_mastery.append({
                "subject": tp.topic,
                "A": tp.solved_count,  # Your solved count
                "fullMark": tp.total_problems  # Total available
            })
        
        # Get submission stats over time (last 6 months)
        submission_stats = []
        for i in range(5, -1, -1):
            month_date = today - datetime.timedelta(days=i*30)
            month_name = month_date.strftime("%b")
            
            # Count submissions in that month
            start_date = month_date.replace(day=1)
            if i == 0:
                end_date = today
            else:
                next_month = start_date + datetime.timedelta(days=32)
                end_date = next_month.replace(day=1) - datetime.timedelta(days=1)
            
            count = Submission.objects.filter(
                user=user,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count()
            
            submission_stats.append({"month": month_name, "count": count})
        
        return Response({
            "isTeacher": False,
            "totalSolved": total_solved,
            "acceptanceRate": f"{acceptance_rate}%",
            "globalRank": global_rank,
            "points": user_stats.score,
            "submissionData": submission_data,
            "topicData": topic_data,
            "topicBreakdown": topic_breakdown,
            "topicMastery": topic_mastery,
            "submissionStats": submission_stats
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activity_heatmap(request):
    """Get activity heatmap data for the authenticated user"""
    from django.db.models import Count
    from django.utils import timezone
    from datetime import datetime, timedelta
    
    user_id = request.query_params.get('user')
    if user_id:
        try:
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    else:
        user = request.user
    
    # Get date range (last 365 days)
    today = timezone.now().date()
    start_date = today - timedelta(days=364)
    
    # Get all submissions grouped by date
    submissions_by_date = Submission.objects.filter(
        user=user,
        created_at__date__gte=start_date,
        created_at__date__lte=today
    ).values('created_at__date').annotate(
        count=Count('id'),
        accepted=Count('id', filter=Q(status='ACCEPTED'))
    ).order_by('created_at__date')
    
    # Create a dictionary for quick lookup
    activity_dict = {
        item['created_at__date']: {
            'count': item['count'],
            'accepted': item['accepted']
        }
        for item in submissions_by_date
    }
    
    # Generate all dates in range
    activity_data = []
    current_date = start_date
    while current_date <= today:
        activity = activity_dict.get(current_date, {'count': 0, 'accepted': 0})
        activity_data.append({
            'date': current_date.isoformat(),
            'count': activity['count'],
            'accepted': activity['accepted'],
            'level': min(4, activity['count'])  # 0-4 intensity levels
        })
        current_date += timedelta(days=1)
    
    # Calculate streaks
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    # Check from today backwards for current streak
    check_date = today
    while True:
        has_activity = Submission.objects.filter(
            user=user,
            status='ACCEPTED',
            created_at__date=check_date
        ).exists()
        
        if has_activity:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    # Calculate longest streak
    for i in range(len(activity_data)):
        if activity_data[i]['accepted'] > 0:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 0
    
    # Calculate total activity
    total_submissions = sum(item['count'] for item in activity_data)
    total_accepted = sum(item['accepted'] for item in activity_data)
    active_days = sum(1 for item in activity_data if item['count'] > 0)
    
    # Calculate most active day of week
    day_stats = {}
    for item in activity_data:
        date_obj = datetime.fromisoformat(item['date'])
        day_name = date_obj.strftime('%A')
        day_stats[day_name] = day_stats.get(day_name, 0) + item['count']
    
    most_active_day = max(day_stats.items(), key=lambda x: x[1])[0] if day_stats else 'N/A'
    
    # Calculate most active hour
    hour_stats = {}
    submissions_with_hour = Submission.objects.filter(
        user=user,
        created_at__date__gte=start_date
    ).values_list('created_at', flat=True)
    
    for submission_time in submissions_with_hour:
        hour = submission_time.hour
        hour_stats[hour] = hour_stats.get(hour, 0) + 1
    
    most_active_hour = max(hour_stats.items(), key=lambda x: x[1])[0] if hour_stats else 0
    
    # Format hour for display
    if most_active_hour == 0:
        most_active_hour_str = '12 AM'
    elif most_active_hour < 12:
        most_active_hour_str = f'{most_active_hour} AM'
    elif most_active_hour == 12:
        most_active_hour_str = '12 PM'
    else:
        most_active_hour_str = f'{most_active_hour - 12} PM'
    
    return Response({
        'activity_data': activity_data,
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'total_submissions': total_submissions,
        'total_accepted': total_accepted,
        'active_days': active_days,
        'most_active_day': most_active_day,
        'most_active_hour': most_active_hour_str,
        'start_date': start_date.isoformat(),
        'end_date': today.isoformat()
    })



class ContestViewSet(viewsets.ModelViewSet):
    """ViewSet for Contest management"""
    queryset = Contest.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ContestDetailSerializer
        return ContestSerializer
    
    def get_queryset(self):
        queryset = Contest.objects.all()
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            from django.utils import timezone
            now = timezone.now()
            if status == 'upcoming':
                queryset = queryset.filter(start_time__gt=now)
            elif status == 'ongoing':
                queryset = queryset.filter(start_time__lte=now, end_time__gte=now)
            elif status == 'completed':
                queryset = queryset.filter(end_time__lt=now)
        
        # Filter by creator
        creator_id = self.request.query_params.get('creator')
        if creator_id:
            queryset = queryset.filter(creator_id=creator_id)
        
        return queryset
    
    def perform_create(self, serializer):
        # Only teachers can create contests
        if not hasattr(self.request.user, 'profile') or self.request.user.profile.role != 'teacher':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only teachers can create contests")
        serializer.save(creator=self.request.user)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a contest"""
        contest = self.get_object()
        
        # Check if contest is ongoing or upcoming
        if contest.status == 'completed':
            return Response({'error': 'Contest has ended'}, status=400)
        
        # Check if already joined
        if ContestParticipant.objects.filter(contest=contest, user=request.user).exists():
            return Response({'message': 'Already joined'}, status=200)
        
        # Create participant
        participant = ContestParticipant.objects.create(
            contest=contest,
            user=request.user
        )
        
        return Response({
            'message': 'Successfully joined contest',
            'participant_id': participant.id
        }, status=201)
    
    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        """Get contest leaderboard"""
        contest = self.get_object()
        
        participants = ContestParticipant.objects.filter(contest=contest).select_related('user').order_by('-score', 'penalty', 'last_submission_time')
        
        leaderboard_data = []
        for rank, participant in enumerate(participants, start=1):
            leaderboard_data.append({
                'rank': rank,
                'user_id': participant.user.id,
                'username': participant.user.username,
                'score': participant.score,
                'problems_solved': participant.problems_solved,
                'penalty': participant.penalty,
                'last_submission_time': participant.last_submission_time
            })
        
        serializer = ContestLeaderboardSerializer(leaderboard_data, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a solution during contest"""
        contest = self.get_object()
        
        # Check if contest is ongoing
        if contest.status != 'ongoing':
            return Response({'error': 'Contest is not ongoing'}, status=400)
        
        # Check if user is a participant
        try:
            participant = ContestParticipant.objects.get(contest=contest, user=request.user)
        except ContestParticipant.DoesNotExist:
            return Response({'error': 'You must join the contest first'}, status=400)
        
        # Get problem and code
        problem_id = request.data.get('problem_id')
        language = request.data.get('language')
        code = request.data.get('code')
        
        if not all([problem_id, language, code]):
            return Response({'error': 'problem_id, language, and code are required'}, status=400)
        
        # Check if problem is in contest
        try:
            problem = contest.problems.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not in this contest'}, status=400)
        
        # Create regular submission first
        from django.utils import timezone
        
        # Get test cases
        testcases = TestCase.objects.filter(problem=problem)
        if not testcases.exists():
            return Response({'error': 'No test cases available'}, status=400)
        
        # Execute code (simplified - reuse submission logic)
        test_data = [{'input': tc.input_data, 'expected_output': tc.expected_output} for tc in testcases]
        
        from .docker_executor import get_executor
        executor = get_executor()
        
        lang_map = {'javascript': 'javascript', 'js': 'javascript', 'python': 'python', 'py': 'python', 'c++': 'cpp', 'cpp': 'cpp', 'java': 'java', 'c': 'c'}
        normalized_lang = lang_map.get(language.lower(), language.lower())
        
        if executor.is_available():
            result = executor.execute_with_testcases(language=normalized_lang, code=code, testcases=test_data)
        else:
            return Response({'error': 'Execution service unavailable'}, status=503)
        
        # Create submission
        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            code=code,
            language=normalized_lang,
            status='ACCEPTED' if result['all_passed'] else 'FAILED',
            passed_testcases=result['passed'],
            total_testcases=result['total'],
            test_results=result['results']
        )
        
        # Calculate time taken (minutes from contest start)
        time_taken = int((timezone.now() - contest.start_time).total_seconds() / 60)
        
        # Create contest submission
        contest_submission = ContestSubmission.objects.create(
            contest=contest,
            participant=participant,
            problem=problem,
            submission=submission,
            points=100 if result['all_passed'] else 0,
            time_taken=time_taken,
            is_accepted=result['all_passed']
        )
        
        # Update participant stats if accepted
        if result['all_passed']:
            # Check if first accepted submission for this problem
            previous_accepted = ContestSubmission.objects.filter(
                contest=contest,
                participant=participant,
                problem=problem,
                is_accepted=True
            ).exclude(id=contest_submission.id).exists()
            
            if not previous_accepted:
                participant.score += 100
                participant.problems_solved += 1
                participant.penalty += time_taken
                participant.last_submission_time = timezone.now()
                participant.save()
        
        return Response({
            'submission_id': submission.id,
            'contest_submission_id': contest_submission.id,
            'status': submission.status,
            'passed': result['passed'],
            'total': result['total'],
            'points': contest_submission.points,
            'time_taken': time_taken
        }, status=201)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_assistant(request):
    """
    AI Assistant endpoint for helping users with coding problems
    Provides hints, explanations, complexity analysis, and doubt clearing
    Uses real AI APIs (Groq, OpenAI, Gemini) for intelligent responses
    """
    try:
        query = request.data.get('query', '')
        context = request.data.get('context', {})
        
        if not query:
            return Response({'error': 'Query is required'}, status=400)
        
        # Use AI Service to get intelligent response
        from .ai_service import AIService
        response_text = AIService.get_ai_response(query, context)
        
        return Response({
            'response': response_text,
            'timestamp': timezone.now()
        })
        
    except Exception as e:
        logger.error(f"AI Assistant error: {str(e)}")
        return Response({'error': 'Failed to process request'}, status=500)


def generate_ai_response(query, code, language, problem_title, problem_description):
    """
    Generate intelligent responses based on query type
    This is a rule-based system that can be enhanced with actual AI/LLM integration
    """
    query_lower = query.lower()
    
    # Hint request
    if 'hint' in query_lower or 'guide' in query_lower or 'stuck' in query_lower:
        return f"""💡 **Hint for "{problem_title}":**

Here's a step-by-step approach without giving away the solution:

1. **Understand the Problem:**
   - Read the problem statement carefully
   - Identify the input and output format
   - Note any constraints

2. **Think About Data Structures:**
   - What data structure would be most efficient?
   - Arrays, Hash Maps, Sets, Trees, or Graphs?

3. **Consider the Algorithm:**
   - Can you solve it with a simple loop?
   - Do you need nested loops?
   - Is there a pattern you've seen before?

4. **Start Simple:**
   - Write a brute force solution first
   - Then optimize if needed

**Common Patterns to Consider:**
- Two Pointers
- Sliding Window
- Hash Map for O(1) lookups
- Sorting for easier processing

Would you like me to explain any specific approach in more detail?"""
    
    # Complexity analysis
    elif 'complexity' in query_lower or 'time' in query_lower or 'space' in query_lower:
        if code:
            # Analyze the code structure
            has_nested_loops = code.count('for') >= 2 or code.count('while') >= 2
            has_recursion = 'def ' in code and (code.count('def') > 1 or 'return' in code)
            has_hashmap = 'dict' in code or 'Map' in code or 'HashMap' in code or '{}' in code
            
            if has_nested_loops:
                time_complexity = "O(n²)"
                time_explanation = "Your code uses nested loops, resulting in quadratic time complexity."
                optimization = "Consider using a Hash Map to reduce this to O(n) by trading space for time."
            elif has_recursion:
                time_complexity = "O(2ⁿ) or O(n)"
                time_explanation = "Recursive solutions can vary. Without memoization, it might be exponential."
                optimization = "Use dynamic programming or memoization to optimize recursive solutions."
            else:
                time_complexity = "O(n)"
                time_explanation = "Your code appears to iterate through the data once."
                optimization = "This is already efficient for most cases!"
            
            space_complexity = "O(n)" if has_hashmap else "O(1)"
            space_explanation = "Using a Hash Map" if has_hashmap else "Using constant extra space"
            
            return f"""⚡ **Complexity Analysis:**

**Time Complexity:** {time_complexity}
{time_explanation}

**Space Complexity:** {space_complexity}
{space_explanation}

**Optimization Suggestion:**
{optimization}

**Big O Notation Guide:**
- O(1): Constant - Best
- O(log n): Logarithmic - Excellent
- O(n): Linear - Good
- O(n log n): Linearithmic - Acceptable
- O(n²): Quadratic - Can be improved
- O(2ⁿ): Exponential - Needs optimization

Would you like me to suggest a more efficient approach?"""
        else:
            return "Please share your code so I can analyze its time and space complexity!"
    
    # Code explanation
    elif ('explain' in query_lower or 'understand' in query_lower or 'how' in query_lower) and code:
        return f"""📝 **Code Explanation:**

Let me break down your {language} code:

**1. Structure Overview:**
Your code follows a structured approach to solve the problem.

**2. Key Components:**
- **Variables:** Stores necessary data
- **Logic:** Processes the input step by step
- **Return:** Provides the final result

**3. How It Works:**
```
Step 1: Initialize variables and data structures
Step 2: Process the input using loops/conditions
Step 3: Apply the algorithm logic
Step 4: Return the computed result
```

**4. Important Points:**
- The algorithm iterates through the data
- Uses conditional logic for decision making
- Handles edge cases appropriately

**5. Potential Improvements:**
- Consider edge cases (empty input, single element, etc.)
- Add comments for clarity
- Think about optimization opportunities

Would you like me to explain any specific part in more detail?"""
    
    # Problem explanation
    elif 'problem' in query_lower or 'what' in query_lower:
        return f"""📚 **Problem: "{problem_title}"**

**Understanding the Problem:**
{problem_description[:200] + '...' if len(problem_description) > 200 else problem_description}

**Breaking It Down:**

1. **Input Format:**
   - Understand what data you're given
   - Note the data types and constraints

2. **Output Format:**
   - What should your solution return?
   - What format is expected?

3. **Constraints:**
   - Time limits
   - Space limits
   - Input size ranges

**Common Approaches:**

**Approach 1: Brute Force**
- Try all possible solutions
- Time: Usually O(n²) or worse
- Good for: Small inputs, understanding the problem

**Approach 2: Optimized**
- Use efficient data structures
- Time: O(n) or O(n log n)
- Good for: Most cases

**Approach 3: Advanced**
- Dynamic Programming
- Greedy Algorithms
- Graph Algorithms
- Good for: Complex problems

**Next Steps:**
1. Try to solve it yourself first
2. Start with a simple approach
3. Test with examples
4. Optimize if needed

What specific part would you like me to clarify?"""
    
    # Debugging help
    elif 'error' in query_lower or 'bug' in query_lower or 'wrong' in query_lower or 'debug' in query_lower:
        return """🐛 **Debugging Help:**

Let's troubleshoot your code together!

**Common Issues to Check:**

1. **Syntax Errors:**
   - Missing brackets, parentheses, or semicolons
   - Incorrect indentation (especially in Python)
   - Typos in variable names

2. **Logic Errors:**
   - Off-by-one errors in loops
   - Wrong comparison operators (< vs <=)
   - Incorrect loop conditions

3. **Runtime Errors:**
   - Array index out of bounds
   - Null/undefined references
   - Division by zero

4. **Edge Cases:**
   - Empty input
   - Single element
   - All same elements
   - Maximum/minimum values

**Debugging Strategy:**
1. Add print statements to track values
2. Test with simple examples first
3. Check boundary conditions
4. Verify your algorithm logic

Share the specific error message or unexpected behavior, and I'll help you fix it!"""
    
    # Concept explanation
    elif 'what is' in query_lower or 'explain' in query_lower:
        return """📖 **Concept Explanation:**

I can help explain various programming concepts:

**Data Structures:**
- Arrays, Linked Lists, Stacks, Queues
- Hash Maps, Sets, Trees, Graphs
- Heaps, Tries, etc.

**Algorithms:**
- Sorting (Quick, Merge, Heap, etc.)
- Searching (Binary Search, DFS, BFS)
- Dynamic Programming
- Greedy Algorithms
- Divide and Conquer

**Complexity:**
- Time Complexity (Big O notation)
- Space Complexity
- Trade-offs between time and space

**Patterns:**
- Two Pointers
- Sliding Window
- Fast & Slow Pointers
- Backtracking
- Recursion

What specific concept would you like me to explain?"""
    
    # General help
    else:
        return """👋 **I'm here to help!**

I can assist you with:

🎯 **Hints & Guidance:**
- Get hints without spoilers
- Step-by-step approach
- Problem-solving strategies

💡 **Code Analysis:**
- Explain how your code works
- Identify potential issues
- Suggest improvements

⚡ **Complexity Analysis:**
- Time complexity (Big O)
- Space complexity
- Optimization suggestions

📚 **Concept Clarification:**
- Data structures
- Algorithms
- Design patterns

🐛 **Debugging:**
- Find and fix errors
- Handle edge cases
- Test strategies

**How to ask:**
- "Give me a hint for this problem"
- "Explain my code"
- "What's the time complexity?"
- "How do I solve this?"
- "What is [concept]?"

What would you like help with?"""




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hackerrank_stats_proxy(request):
    """Fetch HackerRank public profile stats server-side to avoid CORS."""
    import requests as req
    import re

    username = request.query_params.get('username')
    if not username:
        return Response({'error': 'username is required'}, status=400)

    try:
        # HackerRank public profile API
        response = req.get(
            f'https://www.hackerrank.com/rest/hackers/{username}/scores_elo',
            headers={'User-Agent': 'Mozilla/5.0'},
            timeout=10
        )
        if response.status_code == 404:
            return Response({'error': 'HackerRank user not found'}, status=404)

        scores_data = response.json() if response.status_code == 200 else {}

        # Also fetch profile page for badges/stars
        profile_resp = req.get(
            f'https://www.hackerrank.com/rest/hackers/{username}/profile',
            headers={'User-Agent': 'Mozilla/5.0'},
            timeout=10
        )
        profile_data = {}
        if profile_resp.status_code == 200:
            profile_data = profile_resp.json().get('model', {})

        # Extract scores per track
        tracks = []
        total_score = 0
        if isinstance(scores_data, list):
            for item in scores_data:
                track = item.get('track', '')
                score = item.get('score', 0)
                total_score += score
                tracks.append({'track': track, 'score': score})
        elif isinstance(scores_data, dict):
            for track, score in scores_data.items():
                total_score += score if isinstance(score, (int, float)) else 0
                tracks.append({'track': track, 'score': score})

        return Response({
            'platform': 'HackerRank',
            'username': username,
            'totalScore': total_score,
            'tracks': tracks,
            'stars': profile_data.get('stars', 0),
            'level': profile_data.get('level', 0),
            'country': profile_data.get('country', ''),
            'badges': profile_data.get('badges_count', 0),
        })

    except req.exceptions.Timeout:
        return Response({'error': 'HackerRank request timed out'}, status=504)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_hackerrank_account(request):
    """
    Verify HackerRank account by checking the user's 'About' section for the verification token.
    HackerRank profile About: https://www.hackerrank.com/rest/hackers/<handle>/profile
    """
    import requests as req

    handle = request.data.get('handle')
    if not handle:
        return Response({'error': 'Handle is required'}, status=400)

    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    token = profile.verification_token
    if not token:
        return Response({'error': 'No verification token found'}, status=400)

    try:
        response = req.get(
            f'https://www.hackerrank.com/rest/hackers/{handle}/profile',
            headers={'User-Agent': 'Mozilla/5.0'},
            timeout=10
        )
        if response.status_code == 404:
            return Response({'error': 'HackerRank user not found'}, status=404)
        if response.status_code != 200:
            return Response({'error': f'HackerRank returned {response.status_code}'}, status=502)

        data = response.json().get('model', {})
        about = data.get('about', '') or ''

        if token in about:
            profile.hackerrank_handle = handle
            profile.is_hackerrank_verified = True
            profile.save()
            return Response({'success': True, 'message': 'HackerRank account verified!'})
        else:
            return Response({
                'success': False,
                'error': f"Token '{token}' not found in HackerRank About section. Please add it and try again."
            }, status=400)

    except req.exceptions.RequestException as e:
        return Response({'error': f'Network error: {str(e)}'}, status=503)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    Send a 6-digit OTP to the provided email for signup verification.
    POST { "email": "user@example.com" }
    """
    import random
    from django.core.cache import cache
    from django.core.mail import send_mail
    from django.contrib.auth.models import User

    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"error": "Email is required"}, status=400)

    # Check if email already registered
    if User.objects.filter(email__iexact=email).exists():
        return Response({"error": "An account with this email already exists."}, status=400)

    otp = str(random.randint(100000, 999999))
    cache_key = f"otp_{email}"
    cache.set(cache_key, otp, timeout=600)  # 10 minutes

    subject = "Your CodeNest Verification Code"
    message = (
        f"Hi,\n\n"
        f"Your CodeNest email verification code is:\n\n"
        f"  {otp}\n\n"
        f"This code expires in 10 minutes. Do not share it with anyone.\n\n"
        f"— The CodeNest Team"
    )

    try:
        send_mail(subject, message, None, [email], fail_silently=False)
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {e}")
        return Response({"error": "Failed to send email. Please try again."}, status=500)

    return Response({"message": "OTP sent successfully."})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify the OTP entered by the user.
    POST { "email": "user@example.com", "otp": "123456" }
    Returns { "verified": true } on success.
    """
    from django.core.cache import cache

    email = request.data.get('email', '').strip().lower()
    otp_input = request.data.get('otp', '').strip()

    if not email or not otp_input:
        return Response({"error": "Email and OTP are required"}, status=400)

    cache_key = f"otp_{email}"
    stored_otp = cache.get(cache_key)

    if stored_otp is None:
        return Response({"error": "OTP expired or not found. Please request a new one."}, status=400)

    if stored_otp != otp_input:
        return Response({"error": "Invalid OTP. Please try again."}, status=400)

    # Mark email as verified in cache so registration can proceed
    cache.delete(cache_key)
    cache.set(f"otp_verified_{email}", True, timeout=600)

    return Response({"verified": True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scoreboard_data(request):
    """
    Returns all students with their CoderNest stats + platform handles.
    Platform stats (LeetCode, CodeChef, Codeforces) are fetched live on the frontend.
    Composite score formula:
      CoderNest:   direct from UserStats.score
      LeetCode:    easy*5 + medium*10 + hard*20 + floor(rating/100)*5
      CodeChef:    problems_solved*8 + floor(rating/100)*6
      Codeforces:  problems_solved*8 + floor(rating/100)*7
      Total = sum of all platform scores
    """
    if not (hasattr(request.user, 'profile') and request.user.profile.role == 'teacher'):
        return Response({'error': 'Only teachers can access scoreboard'}, status=403)

    students = (
        UserProfile.objects
        .filter(role='student')
        .select_related('user', 'user__stats')
    )

    result = []
    for profile in students:
        user = profile.user
        stats = getattr(user, 'stats', None)

        # CoderNest stats
        codenest_score = stats.score if stats else 0
        codenest_solved = stats.problems_solved if stats else 0

        # Difficulty breakdown on CoderNest
        from django.db.models import Count
        diff_qs = (
            Submission.objects
            .filter(user=user, status='ACCEPTED')
            .values('problem__difficulty')
            .annotate(cnt=Count('problem', distinct=True))
        )
        diff_map = {row['problem__difficulty']: row['cnt'] for row in diff_qs}

        result.append({
            'id': user.id,
            'username': user.username,
            'name': (f"{user.first_name} {user.last_name}".strip()) or user.username,
            'branch': profile.branch,
            'batch': profile.batch,
            'avatar': profile.avatar,
            # CoderNest
            'codenest': {
                'score': codenest_score,
                'solved': codenest_solved,
                'easy': diff_map.get('Easy', 0),
                'medium': diff_map.get('Medium', 0),
                'hard': diff_map.get('Hard', 0),
            },
            # Platform handles (frontend fetches live stats using these)
            'leetcode_handle': profile.leetcode_handle or '',
            'leetcode_verified': profile.is_leetcode_verified,
            'codechef_handle': profile.codechef_handle or '',
            'codechef_verified': profile.is_codechef_verified,
            'codeforces_handle': profile.codeforces_handle or '',
            'codeforces_verified': profile.is_codeforces_verified,
            'hackerrank_handle': profile.hackerrank_handle or '',
            'hackerrank_verified': profile.is_hackerrank_verified,
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_activity(request):
    """
    Returns all students with their last CoderNest submission time.
    Inactivity is determined on the frontend (combining CoderNest + platform data).
    CoderNest last_submission is returned here; platform last-activity is checked client-side.
    """
    if not (hasattr(request.user, 'profile') and request.user.profile.role == 'teacher'):
        return Response({'error': 'Only teachers can access student activity'}, status=403)

    from django.utils import timezone as tz
    from django.db.models import Max

    students = (
        UserProfile.objects
        .filter(role='student')
        .select_related('user', 'user__stats')
    )

    now = tz.now()
    result = []
    for profile in students:
        user = profile.user
        stats = getattr(user, 'stats', None)

        last_sub = (
            Submission.objects
            .filter(user=user)
            .order_by('-created_at')
            .values_list('created_at', flat=True)
            .first()
        )

        hours_since = None
        if last_sub:
            delta = now - last_sub
            hours_since = round(delta.total_seconds() / 3600, 1)

        result.append({
            'id': user.id,
            'username': user.username,
            'name': (f"{user.first_name} {user.last_name}".strip()) or user.username,
            'branch': profile.branch,
            'batch': profile.batch,
            'avatar': profile.avatar,
            'codenest_solved': stats.problems_solved if stats else 0,
            'codenest_score': stats.score if stats else 0,
            'last_codenest_submission': last_sub.isoformat() if last_sub else None,
            'hours_since_codenest': hours_since,
            # Platform handles for frontend to check live activity
            'leetcode_handle': profile.leetcode_handle or '',
            'leetcode_verified': profile.is_leetcode_verified,
            'codechef_handle': profile.codechef_handle or '',
            'codechef_verified': profile.is_codechef_verified,
            'codeforces_handle': profile.codeforces_handle or '',
            'codeforces_verified': profile.is_codeforces_verified,
            'hackerrank_handle': profile.hackerrank_handle or '',
            'hackerrank_verified': profile.is_hackerrank_verified,
        })

    return Response(result)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def checkpoints(request):
    """GET: list all active checkpoints. POST: create a new checkpoint."""
    from .models import Checkpoint

    if not (hasattr(request.user, 'profile') and request.user.profile.role == 'teacher'):
        return Response({'error': 'Only teachers can manage checkpoints'}, status=403)

    if request.method == 'GET':
        qs = Checkpoint.objects.filter(created_by=request.user, is_active=True)
        data = [{
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'cn_problems': c.cn_problems,
            'cn_score': c.cn_score,
            'lc_problems': c.lc_problems,
            'lc_rating': c.lc_rating,
            'cc_problems': c.cc_problems,
            'cc_rating': c.cc_rating,
            'cf_problems': c.cf_problems,
            'cf_rating': c.cf_rating,
            'target_batch': c.target_batch,
            'target_branch': c.target_branch,
            'deadline': c.deadline.isoformat() if c.deadline else None,
            'created_at': c.created_at.isoformat(),
        } for c in qs]
        return Response(data)

    # POST
    d = request.data
    from .models import Checkpoint
    cp = Checkpoint.objects.create(
        created_by=request.user,
        title=d.get('title', 'Checkpoint'),
        description=d.get('description', ''),
        cn_problems=int(d.get('cn_problems', 0)),
        cn_score=int(d.get('cn_score', 0)),
        lc_problems=int(d.get('lc_problems', 0)),
        lc_rating=int(d.get('lc_rating', 0)),
        cc_problems=int(d.get('cc_problems', 0)),
        cc_rating=int(d.get('cc_rating', 0)),
        cf_problems=int(d.get('cf_problems', 0)),
        cf_rating=int(d.get('cf_rating', 0)),
        target_batch=d.get('target_batch', 'All'),
        target_branch=d.get('target_branch', 'All'),
        deadline=d.get('deadline') or None,
    )
    return Response({'id': cp.id, 'title': cp.title}, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def checkpoint_delete(request, pk):
    from .models import Checkpoint
    if not (hasattr(request.user, 'profile') and request.user.profile.role == 'teacher'):
        return Response({'error': 'Only teachers'}, status=403)
    try:
        cp = Checkpoint.objects.get(id=pk, created_by=request.user)
        cp.is_active = False
        cp.save()
        return Response({'deleted': True})
    except Checkpoint.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
