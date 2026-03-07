import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Submission, TopicProgress, Analytics
from api.views import user_dashboard_stats
from rest_framework.request import Request
from django.test import RequestFactory

def debug_dashboard(username):
    print(f"Debugging dashboard view for user: {username}")
    try:
        user = User.objects.get(username=username)
        print(f"User found: {user.id}")
        
        factory = RequestFactory()
        request = factory.get(f'/api/dashboard-stats/{user.id}/')
        request.user = user # Mock authentication if needed, though view uses user_id param
        
        print("Calling view function...")
        response = user_dashboard_stats(request, user_id=user.id)
        
        print(f"Response Status Code: {response.status_code}")
        if response.status_code != 200:
            print("Response Data (Error):")
            # print(response.data) # response.data might be available for DRF Response
            if hasattr(response, 'data'):
                print(response.data)
            else:
                print(response.content)
        else:
            print("View execution successful!")
            # print(response.data) 
            
    except Exception as e:
        print("Error caught during view execution!")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
        username = "yash" # Default from screenshot
    debug_dashboard(username)
