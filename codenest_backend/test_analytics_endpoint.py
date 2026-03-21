"""
Test the analytics endpoint to see what data it returns
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, Submission, UserStats, TopicProgress
from django.db.models import Count
from django.utils import timezone
import datetime

def test_analytics():
    print("=" * 60)
    print("TESTING ANALYTICS ENDPOINT DATA")
    print("=" * 60)
    
    # Get Balaji_Student
    try:
        user = User.objects.get(username='Balaji_Student')
    except User.DoesNotExist:
        print("❌ User Balaji_Student not found!")
        return
    
    print(f"\n✓ Testing for user: {user.username}")
    
    # Get user stats
    user_stats, _ = UserStats.objects.get_or_create(user=user)
    print(f"\n1. UserStats:")
    print(f"   Score: {user_stats.score}")
    print(f"   Problems Solved: {user_stats.problems_solved}")
    
    # Calculate total solved
    total_solved = Submission.objects.filter(
        user=user, 
        status='ACCEPTED'
    ).values('problem').distinct().count()
    print(f"\n2. Total Solved (calculated): {total_solved}")
    
    # Calculate acceptance rate
    total_submissions = Submission.objects.filter(user=user).count()
    accepted_submissions = Submission.objects.filter(user=user, status='ACCEPTED').count()
    acceptance_rate = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 0
    print(f"\n3. Acceptance Rate:")
    print(f"   Total Submissions: {total_submissions}")
    print(f"   Accepted: {accepted_submissions}")
    print(f"   Rate: {acceptance_rate}%")
    
    # Calculate global rank
    global_rank = UserStats.objects.filter(score__gt=user_stats.score).count() + 1
    print(f"\n4. Global Rank: #{global_rank}")
    
    # Get submission data for last 7 days
    today = timezone.now().date()
    submission_data = []
    for i in range(6, -1, -1):
        date = today - datetime.timedelta(days=i)
        day_name = date.strftime("%a")
        count = Submission.objects.filter(user=user, created_at__date=date).count()
        submission_data.append({"day": day_name, "count": count})
    
    print(f"\n5. Submission Data (last 7 days):")
    for sd in submission_data:
        print(f"   {sd['day']}: {sd['count']}")
    
    # Get topic breakdown
    topic_progress = TopicProgress.objects.filter(user=user)
    print(f"\n6. Topic Progress:")
    print(f"   Total entries: {topic_progress.count()}")
    
    topic_data = []
    for tp in topic_progress:
        topic_data.append({
            "name": tp.topic,
            "solved": tp.solved_count,
            "total": tp.total_problems
        })
        print(f"   {tp.topic}: {tp.solved_count}/{tp.total_problems}")
    
    print("\n" + "=" * 60)
    print("EXPECTED ANALYTICS RESPONSE:")
    print("=" * 60)
    print(f"totalSolved: {total_solved}")
    print(f"acceptanceRate: {acceptance_rate}%")
    print(f"globalRank: {global_rank}")
    print(f"points: {user_stats.score}")
    print(f"topicData: {len(topic_data)} topics")
    print(f"submissionData: {len(submission_data)} days")
    
    if total_solved == 0:
        print("\n⚠️  WARNING: totalSolved is 0!")
        print("   This means no distinct accepted problems found")
    elif len(topic_data) == 0:
        print("\n⚠️  WARNING: No topic data!")
        print("   Run: python backfill_topic_progress.py")
    else:
        print("\n✅ Data looks good!")

if __name__ == '__main__':
    test_analytics()
