import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, UserProfile, Submission, Problem, UserStats
from django.db.models import Count, Sum
from django.utils import timezone
import datetime

print("=" * 80)
print("TESTING TEACHER ANALYTICS")
print("=" * 80)

# Get teacher user
teacher = User.objects.filter(username='Teacher_Balaji').first()
if not teacher:
    print("\n❌ ERROR: Teacher_Balaji not found!")
    exit(1)

print(f"\n✓ Teacher: {teacher.username}")
print(f"✓ Role: {teacher.profile.role}")

# ============================================================================
# SIMULATE TEACHER ANALYTICS ENDPOINT
# ============================================================================
print("\n" + "=" * 80)
print("TEACHER ANALYTICS DATA")
print("=" * 80)

students = UserProfile.objects.filter(role='student')
total_students = students.count()

print(f"\n📊 Basic Stats:")
print(f"  Total Students: {total_students}")

# Calculate total problems solved by all students
total_solved = Submission.objects.filter(
    user__profile__role='student',
    status='ACCEPTED'
).values('problem', 'user').distinct().count()

print(f"  Total Problems Solved (all students): {total_solved}")

# Calculate class-wide acceptance rate
total_submissions = Submission.objects.filter(user__profile__role='student').count()
accepted_submissions = Submission.objects.filter(user__profile__role='student', status='ACCEPTED').count()
acceptance_rate = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 0

print(f"  Total Submissions: {total_submissions}")
print(f"  Accepted Submissions: {accepted_submissions}")
print(f"  Class Acceptance Rate: {acceptance_rate}%")

# Calculate total points across all students
total_points = UserStats.objects.filter(user__profile__role='student').aggregate(Sum('score'))['score__sum'] or 0

print(f"  Total Points (all students): {total_points}")

# Get submission data for the last 7 days (all students)
print(f"\n📊 Submission Activity (Last 7 Days - All Students):")
today = timezone.now().date()
for i in range(6, -1, -1):
    date = today - datetime.timedelta(days=i)
    day_name = date.strftime("%a %m/%d")
    count = Submission.objects.filter(
        user__profile__role='student',
        created_at__date=date
    ).count()
    print(f"  {day_name}: {count} submissions")

# Get topic breakdown (aggregated across all students)
print(f"\n📊 Topic Breakdown (Average per Student):")
problem_topics = Problem.objects.values('topic').annotate(
    total_problems=Count('id')
).filter(total_problems__gt=0).order_by('-total_problems')

for pt in problem_topics:
    topic = pt['topic']
    total_problems = pt['total_problems']
    
    # Count unique student-problem combinations for this topic
    solved_count = Submission.objects.filter(
        user__profile__role='student',
        problem__topic=topic,
        status='ACCEPTED'
    ).values('user', 'problem').distinct().count()
    
    # Average solved per student
    avg_solved = solved_count / total_students if total_students > 0 else 0
    
    print(f"  {topic}: {avg_solved:.1f} avg (out of {total_problems} problems)")

# ============================================================================
# COMPARE WITH STUDENT VIEW
# ============================================================================
print("\n" + "=" * 80)
print("COMPARISON: TEACHER VIEW vs STUDENT VIEW")
print("=" * 80)

student = User.objects.filter(username='Balaji_Student').first()
if student:
    student_stats = student.stats
    
    # Student's personal stats
    student_solved = Submission.objects.filter(
        user=student, 
        status='ACCEPTED'
    ).values('problem').distinct().count()
    
    student_total_subs = Submission.objects.filter(user=student).count()
    student_accepted_subs = Submission.objects.filter(user=student, status='ACCEPTED').count()
    student_accuracy = round((student_accepted_subs / student_total_subs * 100), 1) if student_total_subs > 0 else 0
    
    print(f"\n📊 Student View (Balaji_Student):")
    print(f"  Total Solved: {student_solved}")
    print(f"  Acceptance Rate: {student_accuracy}%")
    print(f"  Points: {student_stats.score}")
    print(f"  Global Rank: #{UserStats.objects.filter(score__gt=student_stats.score).count() + 1}")
    
    print(f"\n📊 Teacher View (Class-wide):")
    print(f"  Total Problems Solved: {total_solved}")
    print(f"  Class Acceptance Rate: {acceptance_rate}%")
    print(f"  Total Points: {total_points}")
    print(f"  Total Students: {total_students}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)

print(f"\n✅ Teacher Analytics Endpoint Will Show:")
print(f"  - Total Students: {total_students}")
print(f"  - Total Problems Solved: {total_solved}")
print(f"  - Class Acceptance Rate: {acceptance_rate}%")
print(f"  - Total Points: {total_points}")
print(f"  - Topic breakdown with averages per student")
print(f"  - Submission activity for all students")

print(f"\n✅ Student Analytics Endpoint Will Show:")
print(f"  - Personal problems solved")
print(f"  - Personal acceptance rate")
print(f"  - Personal points")
print(f"  - Personal global rank")
print(f"  - Personal topic progress")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
