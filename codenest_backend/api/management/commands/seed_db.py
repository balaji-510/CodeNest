from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, Problem, Submission, Analytics, TopicProgress
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # 1. Create Users
        # Superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            self.stdout.write('Created superuser: admin')

        # Test User
        user, created = User.objects.get_or_create(username='testuser')
        if created:
            user.set_password('password')
            user.save()
            self.stdout.write('Created test user: testuser')
        
        # Profile
        UserProfile.objects.get_or_create(
            user=user,
            defaults={'rank': 1205, 'accuracy': 87.5, 'active_days': 45}
        )

        # 2. Create Topics
        topics_data = [
            ("Arrays", 45, 100),
            ("Strings", 32, 80),
            ("Dynamic Programming", 25, 150),
            ("Graphs", 15, 120),
            ("Trees", 20, 100),
            ("Sorting", 40, 50),
        ]
        
        for name, solved, total in topics_data:
            TopicProgress.objects.get_or_create(
                user=user, 
                topic=name, 
                defaults={"solved_count": solved, "total_problems": total}
            )

        # 3. Create Analytics (Heatmap Data)
        # Generate data for the last 365 days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)
        
        current_date = start_date
        while current_date <= end_date:
            # Randomly decide if problems were solved this day
            if random.random() > 0.6: # 40% chance of activity
                solved = random.randint(1, 10)
                Analytics.objects.get_or_create(
                    user=user,
                    date=current_date,
                    defaults={'problems_solved': solved}
                )
            current_date += timedelta(days=1)
            
        self.stdout.write('Created analytics data')

        # 4. Create Problems & Submissions
        problems = [
            ("Two Sum", "Easy", "Arrays"),
            ("Longest Substring Without Repeating Characters", "Medium", "Strings"),
            ("Median of Two Sorted Arrays", "Hard", "Arrays"),
            ("Valid Parentheses", "Easy", "Strings"),
            ("Merge k Sorted Lists", "Hard", "Linked List"),
            ("Climbing Stairs", "Easy", "Dynamic Programming"),
        ]

        for i, (title, diff, topic) in enumerate(problems):
            p, _ = Problem.objects.get_or_create(
                title=title,
                defaults={
                    "difficulty": diff,
                    "topic": topic,
                    "platform": "LeetCode",
                    "url": f"https://leetcode.com/problems/{title.lower().replace(' ', '-')}/"
                }
            )
            
            # Create a submission for this problem
            Submission.objects.get_or_create(
                user=user,
                problem=p,
                defaults={
                    "status": "Solved" if i % 2 == 0 else "Attempted"
                }
            )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
