import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, UserProfile, Submission, Problem, UserStats
from django.db.models import Count, Avg
from django.utils import timezone
import datetime

print("=" * 60)
print("TESTING MENTOR STATS API DATA")
print("=" * 60)

# Get teacher user
teacher = User.objects.filter(profile__role='teacher').first()
print(f"\nTeacher: {teacher.username if teacher else 'NOT FOUND'}")

# Get all students
students = UserProfile.objects.filter(role='student')
print(f"\nTotal Students: {students.count()}")

print("\n" + "=" * 60)
print("STUDENT DETAILS")
print("=" * 60)

for s in students:
    print(f"\nStudent: {s.user.username}")
    print(f"Name: {s.user.first_name} {s.user.last_name}")
    print(f"Branch: {s.branch}")
    
    # Calculate solved count
    solved = Submission.objects.filter(user=s.user, status='ACCEPTED').count()
    print(f"Solved problems: {solved}")
    
    # Get actual points from UserStats
    user_stats = getattr(s.user, 'stats', None)
    points = user_stats.score if user_stats else 0
    print(f"Points: {points}")
    
    # Get all submissions
    total_subs = Submission.objects.filter(user=s.user).count()
    print(f"Total submissions: {total_subs}")
    
    # Last active
    last_sub = Submission.objects.filter(user=s.user).order_by('-created_at').first()
    if last_sub:
        print(f"Last submission: {last_sub.created_at}")
        days_ago = (timezone.now() - last_sub.created_at).days
        print(f"Days ago: {days_ago}")
    else:
        print("Last submission: Never")
    
    print("-" * 60)

print("\n" + "=" * 60)
print("BRANCH STATISTICS")
print("=" * 60)

branch_stats = students.values('branch').annotate(
    students=Count('id')
).order_by('branch')

for b in branch_stats:
    print(f"\nBranch: {b['branch']}")
    print(f"Students: {b['students']}")
    
    # Calculate average submissions for users in this branch
    branch_users = User.objects.filter(profile__branch=b['branch'])
    solved_count = Submission.objects.filter(user__in=branch_users, status='ACCEPTED').count()
    avg_solved = solved_count / b['students'] if b['students'] > 0 else 0
    
    print(f"Total ACCEPTED submissions: {solved_count}")
    print(f"Average solved per student: {avg_solved:.1f}")

print("\n" + "=" * 60)
print("TOPIC MASTERY")
print("=" * 60)

# Get all problems grouped by topic
problem_topics = Problem.objects.values('topic').annotate(
    total_problems=Count('id')
).filter(total_problems__gt=0).order_by('-total_problems')

total_students = students.count()

for pt in problem_topics:
    topic = pt['topic']
    total_problems = pt['total_problems']
    
    print(f"\nTopic: {topic}")
    print(f"Total problems: {total_problems}")
    
    # Count unique problem-user combinations
    unique_solves = Submission.objects.filter(
        problem__topic=topic,
        status='ACCEPTED'
    ).values('user', 'problem').distinct().count()
    
    print(f"Unique solves (user-problem pairs): {unique_solves}")
    
    if total_students > 0:
        avg_solved_per_student = unique_solves / total_students
        print(f"Average per student: {avg_solved_per_student:.1f}")
    else:
        print("Average per student: 0")

print("\n" + "=" * 60)
print("SUBMISSION HISTORY (Last 7 days)")
print("=" * 60)

today = timezone.now().date()
for i in range(6, -1, -1):
    date = today - datetime.timedelta(days=i)
    day_name = date.strftime("%a %Y-%m-%d")
    count = Submission.objects.filter(created_at__date=date).count()
    print(f"{day_name}: {count} submissions")
