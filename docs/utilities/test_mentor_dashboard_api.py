"""
Test the mentor-stats API endpoint directly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

print("=" * 80)
print("TESTING MENTOR STATS API ENDPOINT")
print("=" * 80)

# Get teacher user
try:
    teacher_user = User.objects.get(profile__role='teacher')
    print(f"\n✅ Found teacher: {teacher_user.username}")
except User.DoesNotExist:
    print("\n❌ No teacher user found!")
    exit(1)

# Create API client
client = APIClient()
client.defaults['SERVER_NAME'] = 'localhost:8000'

# Get JWT token for teacher
refresh = RefreshToken.for_user(teacher_user)
access_token = str(refresh.access_token)

print(f"\n🔑 Generated JWT token: {access_token[:50]}...")

# Set authorization header
client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

# Test the endpoint
print("\n📡 Calling /api/mentor-stats/...")
response = client.get('/api/mentor-stats/')

print(f"\n📊 Response Status: {response.status_code}")

if response.status_code == 200:
    print("\n✅ API WORKING!")
    data = response.json()
    
    print(f"\n📈 Stats:")
    for stat in data.get('stats', []):
        print(f"  {stat['icon']} {stat['label']}: {stat['value']} ({stat['trend']})")
    
    print(f"\n🏢 Branch Data:")
    for branch in data.get('branchData', []):
        print(f"  {branch['name']}: {branch['avgSolved']} avg solved ({branch['students']} students)")
    
    print(f"\n👨‍🎓 Student Stats: {len(data.get('studentStats', []))} students")
    for student in data.get('studentStats', [])[:3]:
        print(f"  - {student['name']} ({student['branch']}): {student['solved']} solved, {student['points']} points")
    
    print(f"\n🎯 Topic Mastery: {len(data.get('topicMastery', []))} topics")
    for topic in data.get('topicMastery', [])[:5]:
        print(f"  - {topic['subject']}: {topic['A']}/{topic['fullMark']}")
    
    print(f"\n📅 Submission History: {len(data.get('submissionHistory', []))} days")
    
else:
    print(f"\n❌ API ERROR!")
    print(f"Response: {response.json()}")

# Test with student user (should fail)
print("\n" + "=" * 80)
print("TESTING WITH STUDENT USER (Should Fail)")
print("=" * 80)

try:
    student_user = User.objects.get(profile__role='student')
    print(f"\n✅ Found student: {student_user.username}")
    
    # Get JWT token for student
    refresh = RefreshToken.for_user(student_user)
    access_token = str(refresh.access_token)
    
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = client.get('/api/mentor-stats/')
    
    print(f"\n📊 Response Status: {response.status_code}")
    if response.status_code == 403:
        print("✅ Correctly blocked student access!")
    else:
        print(f"⚠️  Unexpected response: {response.json()}")
        
except User.DoesNotExist:
    print("\n⚠️  No student user found to test")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
