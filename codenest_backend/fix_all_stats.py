import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, UserProfile, Submission, Problem, UserStats, TopicProgress, Analytics
from django.db.models import Count
from django.utils import timezone
import datetime

print("=" * 80)
print("FIXING ALL DASHBOARD & ANALYTICS STATISTICS")
print("=" * 80)

# Get all users
users = User.objects.all()

for user in users:
    print(f"\n{'=' * 80}")
    print(f"Processing: {user.username}")
    print('=' * 80)
    
    # Get or create profile and stats
    profile, _ = UserProfile.objects.get_or_create(user=user)
    user_stats, _ = UserStats.objects.get_or_create(user=user)
    
    # ========================================================================
    # FIX 1: Calculate actual problems solved
    # ========================================================================
    problems_solved = Submission.objects.filter(
        user=user, 
        status='ACCEPTED'
    ).values('problem').distinct().count()
    
    print(f"\n1. Problems Solved:")
    print(f"   Old: {user_stats.problems_solved}")
    print(f"   New: {problems_solved}")
    
    user_stats.problems_solved = problems_solved
    user_stats.save()
    
    # ========================================================================
    # FIX 2: Calculate accuracy
    # ========================================================================
    total_submissions = Submission.objects.filter(user=user).count()
    accepted_submissions = Submission.objects.filter(user=user, status='ACCEPTED').count()
    accuracy = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 0
    
    print(f"\n2. Accuracy:")
    print(f"   Old: {profile.accuracy}%")
    print(f"   New: {accuracy}%")
    print(f"   ({accepted_submissions} accepted / {total_submissions} total)")
    
    profile.accuracy = accuracy
    
    # ========================================================================
    # FIX 3: Calculate rank based on score
    # ========================================================================
    rank = UserStats.objects.filter(score__gt=user_stats.score).count() + 1
    
    print(f"\n3. Rank:")
    print(f"   Old: {profile.rank}")
    print(f"   New: {rank}")
    
    profile.rank = rank
    
    # ========================================================================
    # FIX 4: Calculate active days from submissions
    # ========================================================================
    # Get unique dates when user made submissions
    submission_dates = Submission.objects.filter(user=user).values_list('created_at__date', flat=True).distinct()
    active_days = len(set(submission_dates))
    
    print(f"\n4. Active Days:")
    print(f"   Old: {profile.active_days}")
    print(f"   New: {active_days}")
    
    profile.active_days = active_days
    profile.save()
    
    # ========================================================================
    # FIX 5: Create Analytics entries for each day with submissions
    # ========================================================================
    print(f"\n5. Analytics Data:")
    
    # Get all submission dates
    submissions_by_date = Submission.objects.filter(user=user).values('created_at__date').annotate(
        count=Count('id')
    ).order_by('created_at__date')
    
    analytics_created = 0
    analytics_updated = 0
    
    for entry in submissions_by_date:
        date = entry['created_at__date']
        
        # Count accepted submissions on this date
        accepted_on_date = Submission.objects.filter(
            user=user,
            created_at__date=date,
            status='ACCEPTED'
        ).values('problem').distinct().count()
        
        # Get or create analytics entry
        analytics, created = Analytics.objects.get_or_create(
            user=user,
            date=date,
            defaults={'problems_solved': accepted_on_date}
        )
        
        if not created and analytics.problems_solved != accepted_on_date:
            analytics.problems_solved = accepted_on_date
            analytics.save()
            analytics_updated += 1
        elif created:
            analytics_created += 1
    
    print(f"   Created: {analytics_created} entries")
    print(f"   Updated: {analytics_updated} entries")
    print(f"   Total: {Analytics.objects.filter(user=user).count()} entries")
    
    # ========================================================================
    # FIX 6: Ensure TopicProgress is up to date
    # ========================================================================
    print(f"\n6. Topic Progress:")
    
    # Get all topics the user has solved problems in
    solved_topics = Submission.objects.filter(
        user=user,
        status='ACCEPTED'
    ).values('problem__topic').annotate(
        solved=Count('problem', distinct=True)
    )
    
    topic_progress_updated = 0
    topic_progress_created = 0
    
    for topic_data in solved_topics:
        topic = topic_data['problem__topic']
        solved_count = topic_data['solved']
        total_problems = Problem.objects.filter(topic=topic).count()
        
        tp, created = TopicProgress.objects.get_or_create(
            user=user,
            topic=topic,
            defaults={
                'solved_count': solved_count,
                'total_problems': total_problems
            }
        )
        
        if not created:
            if tp.solved_count != solved_count or tp.total_problems != total_problems:
                tp.solved_count = solved_count
                tp.total_problems = total_problems
                tp.save()
                topic_progress_updated += 1
        else:
            topic_progress_created += 1
    
    print(f"   Created: {topic_progress_created} entries")
    print(f"   Updated: {topic_progress_updated} entries")
    print(f"   Total: {TopicProgress.objects.filter(user=user).count()} entries")
    
    print(f"\n✅ {user.username} - All stats updated!")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("FINAL SUMMARY")
print("=" * 80)

for user in users:
    profile = user.profile
    stats = user.stats
    
    print(f"\n{user.username}:")
    print(f"  Problems Solved: {stats.problems_solved}")
    print(f"  Score: {stats.score}")
    print(f"  Accuracy: {profile.accuracy}%")
    print(f"  Rank: #{profile.rank}")
    print(f"  Active Days: {profile.active_days}")
    print(f"  Topic Progress: {TopicProgress.objects.filter(user=user).count()} topics")
    print(f"  Analytics Entries: {Analytics.objects.filter(user=user).count()} days")

print("\n" + "=" * 80)
print("✅ ALL STATISTICS FIXED!")
print("=" * 80)
