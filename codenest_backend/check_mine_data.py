import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import User
from api.models import UserProfile
from api.views import user_dashboard_stats_by_username

def check_mine_data():
    try:
        user = User.objects.get(username='mine')
        print(f"User: {user.username} (ID: {user.id})")
        
        # Check profile manually
        profile, created = UserProfile.objects.get_or_create(user=user)
        print(f"Profile Rank: {profile.rank}")
        print(f"Verified LeetCode: {profile.is_leetcode_verified}")
        print(f"LeetCode Handle: {profile.leetcode_handle}")

        # Check API response
        factory = APIRequestFactory()
        request = factory.get(f'/api/dashboard-stats/user/{user.username}/')
        request.user = user # Simulate auth
        
        response = user_dashboard_stats_by_username(request, username=user.username)
        print(f"API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.data
            print(f"API Username: {data.get('username')}")
            print(f"API Full Name: {data.get('full_name')}")
            print(f"API Rank: {data.get('rank')}")
            print(f"API LeetCode Handle: {data.get('leetcode_handle')}")
        else:
            print("API Error")

    except User.DoesNotExist:
        print("User 'mine' not found.")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_mine_data()
