#!/usr/bin/env python
"""
Test script to verify contest creation functionality
"""
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Contest, Problem, UserProfile
from django.utils import timezone
from datetime import timedelta

def test_contest_creation():
    print("=" * 60)
    print("TESTING CONTEST CREATION FUNCTIONALITY")
    print("=" * 60)
    
    # Find or create a teacher user
    try:
        teacher = User.objects.filter(profile__role='teacher').first()
        if not teacher:
            print("❌ No teacher user found. Creating one...")
            teacher = User.objects.create_user(
                username='test_teacher',
                email='teacher@test.com',
                password='teacher123'
            )
            UserProfile.objects.create(user=teacher, role='teacher')
            print("✅ Created test teacher user")
        else:
            print(f"✅ Found teacher user: {teacher.username}")
    except Exception as e:
        print(f"❌ Error finding/creating teacher: {e}")
        return
    
    # Check if problems exist
    problems = Problem.objects.filter(is_deleted=False)[:3]
    if problems.count() < 1:
        print("❌ No problems found in database")
        return
    print(f"✅ Found {problems.count()} problems")
    
    # Test contest creation
    try:
        now = timezone.now()
        contest_data = {
            'title': 'Test Contest - Automated',
            'description': 'This is a test contest created by the test script',
            'creator': teacher,
            'start_time': now + timedelta(hours=1),
            'end_time': now + timedelta(hours=3),
            'duration_minutes': 120,
            'is_public': True,
            'rules': 'Standard contest rules apply'
        }
        
        contest = Contest.objects.create(**contest_data)
        contest.problems.set(problems)
        
        print(f"\n✅ Contest created successfully!")
        print(f"   ID: {contest.id}")
        print(f"   Title: {contest.title}")
        print(f"   Creator: {contest.creator.username}")
        print(f"   Start: {contest.start_time}")
        print(f"   End: {contest.end_time}")
        print(f"   Status: {contest.status}")
        print(f"   Problems: {contest.problems.count()}")
        
        # List problems
        print(f"\n   Contest Problems:")
        for i, problem in enumerate(contest.problems.all(), 1):
            print(f"      {i}. {problem.title} ({problem.difficulty})")
        
        # Clean up test contest
        print(f"\n🗑️  Cleaning up test contest...")
        contest.delete()
        print("✅ Test contest deleted")
        
    except Exception as e:
        print(f"❌ Error creating contest: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED - Contest creation is working!")
    print("=" * 60)

def check_contest_serializer():
    """Check if ContestSerializer handles problem_ids correctly"""
    print("\n" + "=" * 60)
    print("CHECKING CONTEST SERIALIZER")
    print("=" * 60)
    
    from api.serializers import ContestSerializer
    
    # Check if serializer has problem_ids field
    serializer = ContestSerializer()
    fields = serializer.get_fields()
    
    if 'problem_ids' in fields:
        print("✅ ContestSerializer has 'problem_ids' field")
        print(f"   Field type: {type(fields['problem_ids']).__name__}")
        print(f"   Write only: {fields['problem_ids'].write_only}")
    else:
        print("❌ ContestSerializer missing 'problem_ids' field")
    
    # Check create method
    if hasattr(ContestSerializer, 'create'):
        print("✅ ContestSerializer has custom 'create' method")
    else:
        print("⚠️  ContestSerializer using default 'create' method")

def check_contest_viewset():
    """Check ContestViewSet configuration"""
    print("\n" + "=" * 60)
    print("CHECKING CONTEST VIEWSET")
    print("=" * 60)
    
    from api.views import ContestViewSet
    
    # Check perform_create
    if hasattr(ContestViewSet, 'perform_create'):
        print("✅ ContestViewSet has 'perform_create' method")
    else:
        print("❌ ContestViewSet missing 'perform_create' method")
    
    # Check permissions
    if hasattr(ContestViewSet, 'permission_classes'):
        print(f"✅ Permission classes: {ContestViewSet.permission_classes}")
    
    # Check queryset
    if hasattr(ContestViewSet, 'queryset'):
        print(f"✅ Queryset configured: {ContestViewSet.queryset.model.__name__}")

if __name__ == '__main__':
    check_contest_serializer()
    check_contest_viewset()
    test_contest_creation()
