import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import User, Submission, Achievement, AchievementDefinition
from api.services.achievement_service import AchievementService

print("=" * 60)
print("ACHIEVEMENT SYSTEM TEST")
print("=" * 60)

# Check achievement definitions
print(f"\n✓ Achievement Definitions: {AchievementDefinition.objects.count()}")

# Check submissions
total_submissions = Submission.objects.count()
accepted_submissions = Submission.objects.filter(status='ACCEPTED').count()
print(f"✓ Total Submissions: {total_submissions}")
print(f"✓ Accepted Submissions: {accepted_submissions}")

# Check current achievements
current_achievements = Achievement.objects.count()
print(f"✓ Current Achievements Earned: {current_achievements}")

# Test achievement awarding for users with accepted submissions
users_with_accepted = User.objects.filter(submissions__status='ACCEPTED').distinct()
print(f"\n✓ Users with accepted submissions: {users_with_accepted.count()}")

if users_with_accepted.exists():
    print("\n" + "=" * 60)
    print("TESTING ACHIEVEMENT AWARDING")
    print("=" * 60)
    
    for user in users_with_accepted:
        print(f"\n→ Testing for user: {user.username}")
        
        # Get user stats
        problems_solved = Submission.objects.filter(
            user=user,
            status='ACCEPTED'
        ).values('problem').distinct().count()
        print(f"  Problems solved: {problems_solved}")
        
        # Check and award achievements
        newly_earned = AchievementService.check_and_award_achievements(user)
        
        if newly_earned:
            print(f"  ✓ Newly earned: {len(newly_earned)} achievements")
            for achievement in newly_earned:
                print(f"    🏆 {achievement.title}: {achievement.description}")
        else:
            print(f"  ℹ No new achievements earned")
        
        # Show all achievements for this user
        all_achievements = Achievement.objects.filter(user=user)
        print(f"  Total achievements: {all_achievements.count()}")
else:
    print("\n⚠ No users with accepted submissions found")
    print("  Submit a solution to test achievement awarding!")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
