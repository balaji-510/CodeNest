"""
Test script to diagnose:
1. LeetCode stats fetching issue
2. Admin dashboard (mentor stats) visibility issue
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Submission, Problem, Analytics
from django.utils import timezone
import datetime

print("=" * 80)
print("DIAGNOSING DASHBOARD ISSUES")
print("=" * 80)

# Issue 1: Check LeetCode Stats Fetching
print("\n" + "=" * 80)
print("ISSUE 1: LEETCODE STATS FETCHING")
print("=" * 80)

# Check if users have LeetCode handles
users_with_leetcode = UserProfile.objects.filter(leetcode_handle__isnull=False).exclude(leetcode_handle='')
print(f"\n📊 Users with LeetCode handles: {users_with_leetcode.count()}")

for profile in users_with_leetcode[:5]:
    print(f"\n  User: {profile.user.username}")
    print(f"  LeetCode Handle: {profile.leetcode_handle}")
    print(f"  Verified: {profile.is_leetcode_verified}")
    print(f"  Verification Token: {profile.verification_token}")

# Test LeetCode API
print("\n🔍 Testing LeetCode API...")
try:
    import requests
    
    # Test with a known LeetCode user
    test_handle = "tourist"  # Famous competitive programmer
    
    query = """
    query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                aboutMe
                ranking
            }
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
    }
    """
    
    response = requests.post(
        'https://leetcode.com/graphql',
        json={'query': query, 'variables': {'username': test_handle}},
        headers={'Content-Type': 'application/json', 'Referer': 'https://leetcode.com'},
        timeout=10
    )
    
    print(f"  Status Code: {response.status_code}")
    data = response.json()
    
    if 'errors' in data:
        print(f"  ❌ API Error: {data['errors']}")
    else:
        matched_user = data.get('data', {}).get('matchedUser', {})
        if matched_user:
            print(f"  ✅ API Working!")
            print(f"  Username: {matched_user.get('username')}")
            print(f"  Ranking: {matched_user.get('profile', {}).get('ranking')}")
        else:
            print(f"  ⚠️  No user data returned")
            
except Exception as e:
    print(f"  ❌ Error: {e}")

# Issue 2: Check Mentor Dashboard Data
print("\n" + "=" * 80)
print("ISSUE 2: MENTOR DASHBOARD (ANALYTICS) VISIBILITY")
print("=" * 80)

# Check if there are teachers
teachers = UserProfile.objects.filter(role='teacher')
print(f"\n👨‍🏫 Teachers in system: {teachers.count()}")

for teacher in teachers[:3]:
    print(f"  - {teacher.user.username} (ID: {teacher.user.id})")

# Check if there are students
students = UserProfile.objects.filter(role='student')
print(f"\n👨‍🎓 Students in system: {students.count()}")

# Check submissions
total_submissions = Submission.objects.count()
print(f"\n📝 Total Submissions: {total_submissions}")

accepted_submissions = Submission.objects.filter(status='ACCEPTED').count()
print(f"✅ Accepted Submissions: {accepted_submissions}")

# Check problems
total_problems = Problem.objects.count()
print(f"\n📚 Total Problems: {total_problems}")

# Check if problems have topics
problems_with_topics = Problem.objects.exclude(topic='').exclude(topic__isnull=True)
print(f"🏷️  Problems with topics: {problems_with_topics.count()}")

# Sample topics
topics = Problem.objects.values_list('topic', flat=True).distinct()
print(f"\n📋 Available Topics: {list(topics)[:10]}")

# Test mentor stats calculation
print("\n" + "=" * 80)
print("TESTING MENTOR STATS CALCULATION")
print("=" * 80)

if students.count() > 0:
    print("\n✅ Students exist - calculating stats...")
    
    # Calculate branch stats
    branch_stats = students.values('branch').distinct()
    print(f"\n🏢 Branches: {list(branch_stats)}")
    
    # Calculate submission history (last 7 days)
    today = timezone.now().date()
    print(f"\n📅 Submission History (Last 7 days):")
    for i in range(6, -1, -1):
        date = today - datetime.timedelta(days=i)
        count = Submission.objects.filter(created_at__date=date).count()
        print(f"  {date.strftime('%a %Y-%m-%d')}: {count} submissions")
    
    # Calculate topic mastery
    print(f"\n🎯 Topic Mastery:")
    problem_topics = Problem.objects.values('topic').distinct()
    for pt in problem_topics[:5]:
        topic = pt['topic']
        if topic:
            total_problems = Problem.objects.filter(topic=topic).count()
            solved_count = Submission.objects.filter(
                problem__topic=topic,
                status='ACCEPTED'
            ).values('problem').distinct().count()
            print(f"  {topic}: {solved_count}/{total_problems} problems solved")
else:
    print("\n❌ No students found - mentor dashboard will be empty!")

# Check Analytics table
print("\n" + "=" * 80)
print("CHECKING ANALYTICS TABLE")
print("=" * 80)

analytics_count = Analytics.objects.count()
print(f"\n📊 Analytics records: {analytics_count}")

if analytics_count > 0:
    recent_analytics = Analytics.objects.order_by('-date')[:5]
    print("\n📈 Recent Analytics:")
    for a in recent_analytics:
        print(f"  Date: {a.date}, User: {a.user.username}, Problems Solved: {a.problems_solved}")

# Recommendations
print("\n" + "=" * 80)
print("RECOMMENDATIONS")
print("=" * 80)

issues = []

if users_with_leetcode.count() == 0:
    issues.append("❌ No users have linked LeetCode accounts")
else:
    unverified = users_with_leetcode.filter(is_leetcode_verified=False).count()
    if unverified > 0:
        issues.append(f"⚠️  {unverified} LeetCode accounts are not verified")

if teachers.count() == 0:
    issues.append("❌ No teacher accounts exist")

if students.count() == 0:
    issues.append("❌ No student accounts exist - mentor dashboard will be empty")

if total_submissions == 0:
    issues.append("❌ No submissions exist - dashboard will show zero activity")

if problems_with_topics.count() == 0:
    issues.append("❌ Problems don't have topics - topic mastery chart will be empty")

if issues:
    print("\n🔧 Issues Found:")
    for issue in issues:
        print(f"  {issue}")
    
    print("\n💡 Solutions:")
    if "No users have linked LeetCode accounts" in str(issues):
        print("  1. Go to Settings page and link LeetCode account")
        print("  2. Add verification token to LeetCode bio")
        print("  3. Click 'Verify' button")
    
    if "No teacher accounts exist" in str(issues):
        print("  1. Create a teacher account:")
        print("     python manage.py shell")
        print("     from django.contrib.auth.models import User")
        print("     from api.models import UserProfile")
        print("     user = User.objects.create_user('teacher1', 'teacher@test.com', 'password')")
        print("     profile = UserProfile.objects.create(user=user, role='teacher')")
    
    if "No student accounts exist" in str(issues):
        print("  1. Register student accounts through the UI")
        print("  2. Or run: python manage.py seed_db")
    
    if "No submissions exist" in str(issues):
        print("  1. Students need to solve problems")
        print("  2. Or run: python populate_users.py to create test data")
    
    if "Problems don't have topics" in str(issues):
        print("  1. Update problems with topics:")
        print("     python update_all_problems.py")
else:
    print("\n✅ No major issues found!")

print("\n" + "=" * 80)
print("DIAGNOSIS COMPLETE")
print("=" * 80)
