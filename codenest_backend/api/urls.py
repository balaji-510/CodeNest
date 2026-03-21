from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProblemViewSet, SubmissionViewSet, user_dashboard_stats, 
    init_mock_data, RegisterView, CustomTokenObtainPairView, leaderboard,
    get_verification_token, verify_leetcode_account, ContextViewSet, NotificationViewSet,
    get_daily_challenge, verify_codeforces_account, verify_codechef_account,
    execute_code, get_mentor_stats, user_dashboard_stats_by_username,
    update_profile, get_roadmap, current_user_dashboard_stats, platform_stats,
    get_analytics, TestCaseViewSet, get_problem_testcases, AchievementViewSet,
    AchievementDefinitionViewSet, get_activity_heatmap, ContestViewSet, ai_assistant,
    leetcode_stats_proxy, codechef_stats_proxy, send_otp, verify_otp,
    scoreboard_data, student_activity, checkpoints, checkpoint_delete,
    hackerrank_stats_proxy, verify_hackerrank_account
)
from .discussion_views import DiscussionViewSet, DiscussionReplyViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'problems', ProblemViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'contexts', ContextViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'testcases', TestCaseViewSet)
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'achievement-definitions', AchievementDefinitionViewSet, basename='achievement-definition')
router.register(r'contests', ContestViewSet, basename='contest')
router.register(r'discussions', DiscussionViewSet, basename='discussion')
router.register(r'discussion-replies', DiscussionReplyViewSet, basename='discussion-reply')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/<int:user_id>/', user_dashboard_stats, name='dashboard-stats'),
    path('dashboard-stats/user/<str:username>/', user_dashboard_stats_by_username, name='dashboard-stats-by-username'),
    path('dashboard-stats/me/', current_user_dashboard_stats, name='current-dashboard-stats'),
    path('init-mock-data/', init_mock_data, name='init-mock-data'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('profile/update/', update_profile, name='update-profile'),
    
    # Verification Endpoints
    path('get-verification-token/', get_verification_token, name='get-verification-token'),
    path('verify-leetcode/', verify_leetcode_account, name='verify-leetcode'),
    path('verify-codeforces/', verify_codeforces_account, name='verify-codeforces'),
    path('verify-codechef/', verify_codechef_account, name='verify-codechef'),
    
    # Daily Challenge
    path('daily-challenge/', get_daily_challenge, name='daily-challenge'),
    
    # Compiler
    path('execute-code/', execute_code, name='execute-code'),
    
    # Mentor
    path('mentor-stats/', get_mentor_stats, name='mentor-stats'),
    path('roadmap/', get_roadmap, name='get-roadmap'),
    
    # Platform Stats
    path('platform-stats/', platform_stats, name='platform-stats'),
    
    # Analytics
    path('analytics/', get_analytics, name='analytics'),
    
    # LeetCode Stats Proxy (avoids CORS)
    path('leetcode-stats/', leetcode_stats_proxy, name='leetcode-stats'),

    # CodeChef Stats Proxy (avoids CORS)
    path('codechef-stats/', codechef_stats_proxy, name='codechef-stats'),
    
    # Activity Heatmap
    path('activity-heatmap/', get_activity_heatmap, name='activity-heatmap'),
    
    # Test Cases
    path('problems/<int:problem_id>/testcases/', get_problem_testcases, name='problem-testcases'),
    
    # AI Assistant
    path('ai-assistant/', ai_assistant, name='ai-assistant'),

    # OTP Email Verification
    path('send-otp/', send_otp, name='send-otp'),
    path('verify-otp/', verify_otp, name='verify-otp'),

    # Scoreboard
    path('scoreboard/', scoreboard_data, name='scoreboard'),

    # Student Activity & Checkpoints
    path('student-activity/', student_activity, name='student-activity'),
    path('checkpoints/', checkpoints, name='checkpoints'),
    path('checkpoints/<int:pk>/delete/', checkpoint_delete, name='checkpoint-delete'),

    # HackerRank
    path('hackerrank-stats/', hackerrank_stats_proxy, name='hackerrank-stats'),
    path('verify-hackerrank/', verify_hackerrank_account, name='verify-hackerrank'),
]
