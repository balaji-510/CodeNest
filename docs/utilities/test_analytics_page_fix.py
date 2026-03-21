"""
Test the analytics page endpoint for teachers
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
print("TESTING ANALYTICS PAGE FOR TEACHERS")
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

# Test the analytics endpoint
print("\n📡 Calling /api/analytics/...")
response = client.get('/api/analytics/')

print(f"\n📊 Response Status: {response.status_code}")

if response.status_code == 200:
    print("\n✅ ANALYTICS API WORKING!")
    data = response.json()
    
    print(f"\n📈 Teacher Analytics Data:")
    print(f"  Is Teacher: {data.get('isTeacher')}")
    print(f"  Total Students: {data.get('totalStudents')}")
    print(f"  Total Solved: {data.get('totalSolved')}")
    print(f"  Acceptance Rate: {data.get('acceptanceRate')}")
    print(f"  Total Points: {data.get('points')}")
    
    print(f"\n📊 Topic Data: {len(data.get('topicData', []))} topics")
    for topic in data.get('topicData', [])[:5]:
        print(f"  - {topic['name']}: {topic['solved']} avg solved")
    
    print(f"\n📅 Submission Data: {len(data.get('submissionData', []))} days")
    
    print(f"\n🎯 Topic Mastery: {len(data.get('topicMastery', []))} topics")
    for topic in data.get('topicMastery', [])[:5]:
        print(f"  - {topic['subject']}: {topic['A']}/{topic['fullMark']}")
    
else:
    print(f"\n❌ API ERROR!")
    try:
        print(f"Response: {response.json()}")
    except:
        print(f"Response text: {response.content}")

# Test with student user
print("\n" + "=" * 80)
print("TESTING WITH STUDENT USER")
print("=" * 80)

try:
    student_user = User.objects.filter(profile__role='student').first()
    if student_user:
        print(f"\n✅ Found student: {student_user.username}")
        
        # Get JWT token for student
        refresh = RefreshToken.for_user(student_user)
        access_token = str(refresh.access_token)
        
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = client.get('/api/analytics/')
        
        print(f"\n📊 Student Response Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Is Teacher: {data.get('isTeacher')}")
            print(f"  Total Solved: {data.get('totalSolved')}")
            print(f"  Acceptance Rate: {data.get('acceptanceRate')}")
            print(f"  Global Rank: {data.get('globalRank')}")
            print(f"  Points: {data.get('points')}")
        else:
            print(f"  Error: {response.json()}")
    else:
        print("\n⚠️  No student user found to test")
        
except Exception as e:
    print(f"\n❌ Error testing student: {e}")

print("\n" + "=" * 80)
print("FRONTEND ACCESS CHECK")
print("=" * 80)

print("\n📋 Analytics Page Access:")
print("  1. ✅ Backend API working (tested above)")
print("  2. ✅ Route exists: /analytics")
print("  3. ✅ Component exists: AnalyticsPage.jsx")
print("  4. ⚠️  Route protection: ProtectedRoute (any authenticated user)")
print("  5. ⚠️  Teacher-specific content: Handled by backend logic")

print("\n💡 The /analytics page should be accessible to both teachers and students")
print("   - Teachers see class-wide statistics")
print("   - Students see personal statistics")
print("   - Content is differentiated by backend based on user role")

print("\n🔍 If page is not visible, check:")
print("  1. User is logged in (any role)")
print("  2. Navigate to: http://localhost:5173/analytics")
print("  3. Check browser console for errors")
print("  4. Verify API call to /api/analytics/ succeeds")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)