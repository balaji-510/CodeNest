#!/usr/bin/env python
"""
Test teacher analytics endpoint
"""
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Submission, Problem, UserStats
from django.test import RequestFactory
from api.views import get_analytics
from rest_framework.test import force_authenticate

def test_teacher_analytics():
    print("=" * 70)
    print("TESTING TEACHER ANALYTICS")
    print("=" * 70)
    
    # Find teacher
    teacher = User.objects.filter(profile__role='teacher').first()
    if not teacher:
        print("❌ No teacher found")
        return
    
    print(f"✅ Testing with teacher: {teacher.username}")
    
    # Create request
    factory = RequestFactory()
    request = factory.get('/api/analytics/')
    force_authenticate(request, user=teacher)
    
    # Call the view
    response = get_analytics(request)
    data = response.data
    
    print(f"\n📊 Analytics Response:")
    print(f"   isTeacher: {data.get('isTeacher')}")
    print(f"   totalStudents: {data.get('totalStudents')}")
    print(f"   totalSolved: {data.get('totalSolved')}")
    print(f"   acceptanceRate: {data.get('acceptanceRate')}")
    print(f"   points: {data.get('points')}")
    
    print(f"\n📈 Submission Data:")
    if data.get('submissionData'):
        for item in data['submissionData']:
            print(f"      {item['day']}: {item['count']} submissions")
    else:
        print("      No submission data")
    
    print(f"\n📚 Topic Data:")
    if data.get('topicData'):
        for item in data['topicData'][:5]:  # Show first 5
            print(f"      {item['name']}: {item['solved']} avg solved")
    else:
        print("      No topic data")
    
    print(f"\n🎯 Topic Mastery (for radar chart):")
    if data.get('topicMastery'):
        for item in data['topicMastery'][:5]:  # Show first 5
            print(f"      {item['subject']}: {item['A']} / {item['fullMark']}")
        print(f"   ✅ Topic mastery data present ({len(data['topicMastery'])} topics)")
    else:
        print("      ❌ No topic mastery data")
    
    # Check if all required fields are present
    required_fields = [
        'isTeacher', 'totalStudents', 'totalSolved', 'acceptanceRate',
        'points', 'submissionData', 'topicData', 'topicMastery'
    ]
    
    print(f"\n✅ Required Fields Check:")
    all_present = True
    for field in required_fields:
        present = field in data
        status = "✅" if present else "❌"
        print(f"   {status} {field}: {'Present' if present else 'MISSING'}")
        if not present:
            all_present = False
    
    if all_present:
        print(f"\n" + "=" * 70)
        print("✅ ALL FIELDS PRESENT - ANALYTICS SHOULD WORK")
        print("=" * 70)
    else:
        print(f"\n" + "=" * 70)
        print("❌ SOME FIELDS MISSING - ANALYTICS MAY BE BLANK")
        print("=" * 70)
    
    return data

def check_student_data():
    print("\n" + "=" * 70)
    print("CHECKING STUDENT DATA")
    print("=" * 70)
    
    students = UserProfile.objects.filter(role='student')
    print(f"\n📊 Total Students: {students.count()}")
    
    if students.count() == 0:
        print("   ⚠️  No students found - analytics will be empty")
        return
    
    # Check submissions
    submissions = Submission.objects.filter(user__profile__role='student')
    print(f"📝 Total Submissions: {submissions.count()}")
    
    accepted = submissions.filter(status='ACCEPTED').count()
    print(f"✅ Accepted Submissions: {accepted}")
    
    # Check problems
    problems = Problem.objects.filter(is_deleted=False)
    print(f"📚 Total Problems: {problems.count()}")
    
    # Check topics
    topics = Problem.objects.values('topic').distinct()
    print(f"🎯 Topics: {topics.count()}")
    for topic in topics[:5]:
        print(f"      - {topic['topic']}")
    
    if submissions.count() > 0:
        print("\n✅ Student data exists - analytics should show data")
    else:
        print("\n⚠️  No submissions yet - analytics will be mostly empty")

if __name__ == '__main__':
    check_student_data()
    print("\n")
    test_teacher_analytics()
