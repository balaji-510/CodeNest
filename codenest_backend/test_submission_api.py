import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()
from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import Problem, Submission

def test_submission_api():
    print("Testing Submission API...")
    
    # Setup User and Problem
    user, _ = User.objects.get_or_create(username='api_test_user')
    user.set_password('password')
    user.save()
    
    problem, _ = Problem.objects.get_or_create(title="API Test Problem", difficulty="Easy", topic="API Test", platform="LeetCode")
    
    # Setup Client
    client = APIClient()
    client.force_authenticate(user=user)
    
    # Test POST /api/submissions/
    data = {
        "problem": problem.id,
        "status": "Solved"
    }
    
    response = client.post('/api/submissions/', data, format='json')
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")
    
    if response.status_code == 201:
        print("SUCCESS: Submission created via API.")
        # Verify database
        assert Submission.objects.filter(user=user, problem=problem).exists()
    else:
        print("FAILURE: API call failed.")
        print(response.content)

if __name__ == "__main__":
    test_submission_api()
