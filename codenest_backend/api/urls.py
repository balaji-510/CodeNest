from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProblemViewSet, SubmissionViewSet, user_dashboard_stats, 
    init_mock_data, RegisterView, CustomTokenObtainPairView, leaderboard,
    get_verification_token, verify_leetcode_account, ContextViewSet, NotificationViewSet,
    get_daily_challenge, verify_codeforces_account, verify_codechef_account,
    get_daily_challenge, verify_codeforces_account, verify_codechef_account,
    execute_code, get_mentor_stats, user_dashboard_stats_by_username,
    update_profile, get_roadmap, current_user_dashboard_stats
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'problems', ProblemViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'contexts', ContextViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

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
]
