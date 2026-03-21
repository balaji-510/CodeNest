import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, UserProfile, Submission, Problem, UserStats
from django.contrib.auth import get_user_model

print("=" * 60)
print("CHECKING USER DATA FOR DASHBOARD")
print("=" * 60)

# Check all users
users = User.objects.all()
print(f"\nTotal users: {users.count()}\n")

for user in users:
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"First name: {user.first_name}")
    print(f"Last name: {user.last_name}")
    
    # Check profile
    if hasattr(user, 'profile'):
        print(f"Role: {user.profile.role}")
        print(f"Branch: {user.profile.branch}")
    else:
        print("Profile: NOT FOUND")
    
    # Check stats
    if hasattr(user, 'stats'):
        print(f"Score: {user.stats.score}")
        print(f"Problems solved: {user.stats.problems_solved}")
    else:
        print("Stats: NOT FOUND")
    
    # Check submissions
    subs = Submission.objects.filter(user=user)
    accepted = subs.filter(status='ACCEPTED').count()
    print(f"Total submissions: {subs.count()}")
    print(f"Accepted submissions: {accepted}")
    
    print("-" * 60)

print("\n" + "=" * 60)
print("CHECKING SPECIFIC USER: Balaji_Student")
print("=" * 60)

try:
    student = User.objects.get(username='Balaji_Student')
    print(f"\n✓ User found: {student.username}")
    print(f"ID: {student.id}")
    print(f"Email: {student.email}")
    print(f"Name: {student.first_name} {student.last_name}")
    
    if hasattr(student, 'profile'):
        print(f"\n✓ Profile found")
        print(f"Role: {student.profile.role}")
        print(f"Branch: {student.profile.branch}")
    
    if hasattr(student, 'stats'):
        print(f"\n✓ Stats found")
        print(f"Score: {student.stats.score}")
        print(f"Problems solved: {student.stats.problems_solved}")
    
    # Check submissions in detail
    print(f"\n✓ Submissions:")
    subs = Submission.objects.filter(user=student).order_by('-created_at')
    for sub in subs:
        print(f"  - ID: {sub.id}")
        print(f"    Problem: {sub.problem.title}")
        print(f"    Status: {sub.status}")
        print(f"    Language: {sub.language}")
        print(f"    Code length: {len(sub.code)} chars")
        print(f"    Passed: {sub.passed_testcases}/{sub.total_testcases}")
        print(f"    Created: {sub.created_at}")
        print()
    
except User.DoesNotExist:
    print("\n✗ User 'Balaji_Student' NOT FOUND")

print("\n" + "=" * 60)
print("CHECKING TEACHER ACCESS")
print("=" * 60)

teachers = User.objects.filter(profile__role='teacher')
print(f"\nTotal teachers: {teachers.count()}")

for teacher in teachers:
    print(f"\nTeacher: {teacher.username}")
    print(f"Can access mentor dashboard: YES")
    print(f"Should see student stats: YES")
