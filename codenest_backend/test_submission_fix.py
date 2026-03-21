"""
Test script to verify submission fix
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem, TestCase, User, Submission

def test_submission_constraint():
    """Test that multiple submissions are now allowed"""
    
    # Get a test user and problem
    user = User.objects.first()
    problem = Problem.objects.first()
    
    if not user or not problem:
        print("❌ No user or problem found in database")
        return
    
    print(f"✓ Testing with user: {user.username}")
    print(f"✓ Testing with problem: {problem.title}")
    
    # Check existing submissions
    existing = Submission.objects.filter(user=user, problem=problem, status='ACCEPTED').count()
    print(f"✓ Existing ACCEPTED submissions: {existing}")
    
    # Try to create multiple ACCEPTED submissions
    try:
        submission1 = Submission.objects.create(
            user=user,
            problem=problem,
            code="print('test1')",
            language='python',
            status='ACCEPTED',
            passed_testcases=1,
            total_testcases=1
        )
        print(f"✓ Created first ACCEPTED submission: {submission1.id}")
        
        submission2 = Submission.objects.create(
            user=user,
            problem=problem,
            code="print('test2')",
            language='python',
            status='ACCEPTED',
            passed_testcases=1,
            total_testcases=1
        )
        print(f"✓ Created second ACCEPTED submission: {submission2.id}")
        
        print("\n✅ SUCCESS! Multiple ACCEPTED submissions are now allowed!")
        print("The unique constraint has been successfully removed.")
        
        # Clean up test submissions
        submission1.delete()
        submission2.delete()
        print("\n✓ Test submissions cleaned up")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("The constraint might still be in place. Run: python manage.py migrate")

if __name__ == '__main__':
    test_submission_constraint()
