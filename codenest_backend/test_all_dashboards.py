import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, UserProfile, Submission, Problem, UserStats, TopicProgress, Analytics
from django.db.models import Count
from django.utils import timezone
import datetime

print("=" * 80)
print("COMPREHENSIVE DASHBOARD & ANALYTICS TEST")
print("=" * 80)

# Get test users
student = User.objects.filter(username='Balaji_Student').first()
teacher = User.objects.filter(username='Teacher_Balaji').first()

if not student:
    print("\n❌ ERROR: Balaji_Student not found!")
    exit(1)

print(f"\n✓ Test User: {student.username}")
print(f"✓ Teacher User: {teacher.username if teacher else 'NOT FOUND'}")

# ============================================================================
# TEST 1: USER DASHBOARD STATS
# ============================================================================
print("\n" + "=" * 80)
print("TEST 1: USER DASHBOARD STATS (/api/dashboard-stats/)")
print("=" * 80)

profile = student.profile
user_stats, _ = UserStats.objects.get_or_create(user=student)

# Calculate actual problems solved
problems_solved = Submission.objects.filter(
    user=student, 
    status='ACCEPTED'
).values('problem').distinct().count()

print(f"\n📊 Profile Data:")
print(f"  Rank: {profile.rank}")
print(f"  Accuracy: {profile.accuracy}%")
print(f"  Active Days: {profile.active_days}")

print(f"\n📊 UserStats Data:")
print(f"  Score: {user_stats.score}")
print(f"  Problems Solved (DB): {user_stats.problems_solved}")
print(f"  Problems Solved (Actual): {problems_solved}")

if user_stats.problems_solved != problems_solved:
    print(f"  ⚠️  MISMATCH! Updating...")
    user_stats.problems_solved = problems_solved
    user_stats.save()
    print(f"  ✓ Updated to {problems_solved}")
else:
    print(f"  ✓ Stats are correct")

# Recent submissions
recent_subs = Submission.objects.filter(user=student).order_by('-created_at')[:5]
print(f"\n📊 Recent Submissions: {recent_subs.count()}")
for sub in recent_subs:
    print(f"  - {sub.problem.title}: {sub.status} ({sub.created_at.strftime('%Y-%m-%d')})")

# Topic Progress
topic_progress = TopicProgress.objects.filter(user=student)
print(f"\n📊 Topic Progress: {topic_progress.count()} topics")
for tp in topic_progress:
    print(f"  - {tp.topic}: {tp.solved_count}/{tp.total_problems}")

# ============================================================================
# TEST 2: ANALYTICS ENDPOINT
# ============================================================================
print("\n" + "=" * 80)
print("TEST 2: ANALYTICS (/api/analytics/)")
print("=" * 80)

# Total solved
total_solved = Submission.objects.filter(
    user=student, 
    status='ACCEPTED'
).values('problem').distinct().count()

# Acceptance rate
total_submissions = Submission.objects.filter(user=student).count()
accepted_submissions = Submission.objects.filter(user=student, status='ACCEPTED').count()
acceptance_rate = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 0

# Global rank
global_rank = UserStats.objects.filter(score__gt=user_stats.score).count() + 1

print(f"\n📊 Analytics Summary:")
print(f"  Total Solved: {total_solved}")
print(f"  Acceptance Rate: {acceptance_rate}%")
print(f"  Global Rank: #{global_rank}")
print(f"  Points: {user_stats.score}")

# Submission data (last 7 days)
today = timezone.now().date()
print(f"\n📊 Submission Activity (Last 7 Days):")
for i in range(6, -1, -1):
    date = today - datetime.timedelta(days=i)
    day_name = date.strftime("%a %m/%d")
    count = Submission.objects.filter(user=student, created_at__date=date).count()
    print(f"  {day_name}: {count} submissions")

# Topic breakdown
print(f"\n📊 Topic Breakdown:")
for tp in topic_progress:
    progress_pct = (tp.solved_count / tp.total_problems * 100) if tp.total_problems > 0 else 0
    print(f"  {tp.topic}: {tp.solved_count}/{tp.total_problems} ({progress_pct:.1f}%)")

# ============================================================================
# TEST 3: MENTOR DASHBOARD
# ============================================================================
print("\n" + "=" * 80)
print("TEST 3: MENTOR DASHBOARD (/api/mentor-stats/)")
print("=" * 80)

students = UserProfile.objects.filter(role='student')
total_students = students.count()

print(f"\n📊 Mentor Stats:")
print(f"  Total Students: {total_students}")

# Calculate stats for each student
print(f"\n📊 Student Details:")
for s in students:
    solved = Submission.objects.filter(
        user=s.user, 
        status='ACCEPTED'
    ).values('problem').distinct().count()
    
    stats = getattr(s.user, 'stats', None)
    points = stats.score if stats else 0
    
    total_subs = Submission.objects.filter(user=s.user).count()
    
    print(f"\n  {s.user.username}:")
    print(f"    Name: {s.user.first_name} {s.user.last_name}")
    print(f"    Branch: {s.branch}")
    print(f"    Solved: {solved}")
    print(f"    Points: {points}")
    print(f"    Total Submissions: {total_subs}")

# Branch stats
print(f"\n📊 Branch Statistics:")
branch_stats = students.values('branch').annotate(
    students=Count('id')
).order_by('branch')

for b in branch_stats:
    branch_users = User.objects.filter(profile__branch=b['branch'])
    solved_count = Submission.objects.filter(user__in=branch_users, status='ACCEPTED').count()
    avg_solved = solved_count / b['students'] if b['students'] > 0 else 0
    
    print(f"  {b['branch']}: {b['students']} students, {avg_solved:.1f} avg solved")

# Topic mastery
print(f"\n📊 Topic Mastery:")
problem_topics = Problem.objects.values('topic').annotate(
    total_problems=Count('id')
).filter(total_problems__gt=0).order_by('-total_problems')[:5]

for pt in problem_topics:
    topic = pt['topic']
    total_problems = pt['total_problems']
    
    unique_solves = Submission.objects.filter(
        problem__topic=topic,
        status='ACCEPTED'
    ).values('user', 'problem').distinct().count()
    
    avg_per_student = unique_solves / total_students if total_students > 0 else 0
    
    print(f"  {topic}: {avg_per_student:.1f} avg (out of {total_problems} problems)")

# ============================================================================
# TEST 4: PLATFORM STATS
# ============================================================================
print("\n" + "=" * 80)
print("TEST 4: PLATFORM STATS (/api/platform-stats/)")
print("=" * 80)

total_accepted = Submission.objects.filter(status='ACCEPTED').count()
active_users = User.objects.filter(submissions__isnull=False).distinct().count()
total_users = User.objects.count()
total_problems = Problem.objects.filter(is_deleted=False).count()
total_all_subs = Submission.objects.count()
platform_accuracy = (total_accepted / total_all_subs * 100) if total_all_subs > 0 else 0

print(f"\n📊 Platform Statistics:")
print(f"  Total Problems Solved: {total_accepted}")
print(f"  Active Users: {active_users}")
print(f"  Total Users: {total_users}")
print(f"  Total Problems: {total_problems}")
print(f"  Platform Accuracy: {platform_accuracy:.1f}%")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)

issues = []

# Check if stats are correct
if user_stats.problems_solved != problems_solved:
    issues.append(f"UserStats.problems_solved mismatch: {user_stats.problems_solved} vs {problems_solved}")

# Check if topic progress exists
if topic_progress.count() == 0:
    issues.append("No topic progress data")

# Check if analytics data exists
analytics_count = Analytics.objects.filter(user=student).count()
if analytics_count == 0:
    issues.append("No analytics data")

if issues:
    print("\n⚠️  ISSUES FOUND:")
    for issue in issues:
        print(f"  - {issue}")
else:
    print("\n✅ ALL CHECKS PASSED!")

print("\n📊 Data Summary:")
print(f"  User: {student.username}")
print(f"  Problems Solved: {problems_solved}")
print(f"  Total Submissions: {total_submissions}")
print(f"  Acceptance Rate: {acceptance_rate}%")
print(f"  Points: {user_stats.score}")
print(f"  Global Rank: #{global_rank}")
print(f"  Topic Progress Entries: {topic_progress.count()}")
print(f"  Analytics Entries: {analytics_count}")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
