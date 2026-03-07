import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import User
from api.views import current_user_dashboard_stats, user_dashboard_stats, user_dashboard_stats_by_username

def debug():
    try:
        username = "raj"
        if not User.objects.filter(username=username).exists():
            user = User.objects.first()
            if not user:
                print("No users found.")
                return
        else:
            user = User.objects.get(username=username)

        print(f"Testing with user: {user.username} (ID: {user.id})")
        
        factory = APIRequestFactory()
        
        # Test 1: current_user_dashboard_stats
        print("\n--- Testing current_user_dashboard_stats ---")
        request = factory.get('/api/dashboard-stats/me/')
        request.user = user
        
        try:
            response = current_user_dashboard_stats(request)
            print(f"Status Code: {response.status_code}")
            if response.status_code != 200:
                print(f"Error: {response.data}")
        except Exception as e:
            print("Exception in current_user_dashboard_stats:")
            import traceback
            traceback.print_exc()

        # Test 2: user_dashboard_stats_by_username
        print("\n--- Testing user_dashboard_stats_by_username ---")
        request = factory.get(f'/api/dashboard-stats/user/{user.username}/')
        request.user = user
        try:
            response = user_dashboard_stats_by_username(request, username=user.username)
            print(f"Status Code: {response.status_code}")
            if response.status_code != 200:
                print(f"Error: {response.data}")
        except Exception as e:
            print("Exception in user_dashboard_stats_by_username:")
            import traceback
            traceback.print_exc()

        # Test 3: user_dashboard_stats (direct)
        print("\n--- Testing user_dashboard_stats (direct) ---")
        request = factory.get(f'/api/dashboard-stats/{user.id}/')
        request.user = user
        try:
            response = user_dashboard_stats(request, user_id=user.id)
            print(f"Status Code: {response.status_code}")
            if response.status_code != 200:
                print(f"Error: {response.data}")
        except Exception as e:
            print("Exception in user_dashboard_stats:")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print("Global Exception:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug()
