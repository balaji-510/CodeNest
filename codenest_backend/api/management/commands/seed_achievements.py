from django.core.management.base import BaseCommand
from api.models import AchievementDefinition


class Command(BaseCommand):
    help = 'Seed achievement definitions'

    def handle(self, *args, **kwargs):
        achievements = [
            # Problem Solving
            {
                'name': 'First Blood',
                'description': 'Solve your first problem',
                'icon': '🏆',
                'category': 'problems',
                'requirement': {'type': 'problems_solved', 'count': 1},
                'points': 50
            },
            {
                'name': 'Getting Started',
                'description': 'Solve 10 problems',
                'icon': '🎯',
                'category': 'problems',
                'requirement': {'type': 'problems_solved', 'count': 10},
                'points': 100
            },
            {
                'name': 'Problem Solver',
                'description': 'Solve 50 problems',
                'icon': '💪',
                'category': 'problems',
                'requirement': {'type': 'problems_solved', 'count': 50},
                'points': 200
            },
            {
                'name': 'Master Coder',
                'description': 'Solve 100 problems',
                'icon': '👑',
                'category': 'problems',
                'requirement': {'type': 'problems_solved', 'count': 100},
                'points': 500
            },
            
            # Difficulty Mastery
            {
                'name': 'Easy Peasy',
                'description': 'Solve all Easy problems',
                'icon': '🟢',
                'category': 'difficulty',
                'requirement': {'type': 'difficulty_complete', 'difficulty': 'Easy'},
                'points': 150
            },
            {
                'name': 'Medium Rare',
                'description': 'Solve all Medium problems',
                'icon': '🟡',
                'category': 'difficulty',
                'requirement': {'type': 'difficulty_complete', 'difficulty': 'Medium'},
                'points': 300
            },
            {
                'name': 'Hard Core',
                'description': 'Solve all Hard problems',
                'icon': '🔴',
                'category': 'difficulty',
                'requirement': {'type': 'difficulty_complete', 'difficulty': 'Hard'},
                'points': 500
            },
            
            # Topic Mastery
            {
                'name': 'Array Master',
                'description': 'Solve all Array problems',
                'icon': '📊',
                'category': 'topic',
                'requirement': {'type': 'topic_complete', 'topic': 'Arrays'},
                'points': 150
            },
            {
                'name': 'String Wizard',
                'description': 'Solve all String problems',
                'icon': '📝',
                'category': 'topic',
                'requirement': {'type': 'topic_complete', 'topic': 'Strings'},
                'points': 150
            },
            {
                'name': 'Tree Climber',
                'description': 'Solve all Tree problems',
                'icon': '🌳',
                'category': 'topic',
                'requirement': {'type': 'topic_complete', 'topic': 'Trees'},
                'points': 150
            },
            {
                'name': 'Graph Explorer',
                'description': 'Solve all Graph problems',
                'icon': '🗺️',
                'category': 'topic',
                'requirement': {'type': 'topic_complete', 'topic': 'Graphs'},
                'points': 150
            },
            {
                'name': 'DP Dynamo',
                'description': 'Solve all Dynamic Programming problems',
                'icon': '⚡',
                'category': 'topic',
                'requirement': {'type': 'topic_complete', 'topic': 'Dynamic Programming'},
                'points': 200
            },
            {
                'name': 'Linked List Legend',
                'description': 'Solve all Linked List problems',
                'icon': '🔗',
                'category': 'topic',
                'requirement': {'type': 'topic_complete', 'topic': 'Linked Lists'},
                'points': 150
            },
            
            # Streaks
            {
                'name': 'Week Warrior',
                'description': 'Maintain a 7-day streak',
                'icon': '🔥',
                'category': 'streak',
                'requirement': {'type': 'streak', 'days': 7},
                'points': 100
            },
            {
                'name': 'Month Master',
                'description': 'Maintain a 30-day streak',
                'icon': '🌟',
                'category': 'streak',
                'requirement': {'type': 'streak', 'days': 30},
                'points': 300
            },
            {
                'name': 'Century Streak',
                'description': 'Maintain a 100-day streak',
                'icon': '💎',
                'category': 'streak',
                'requirement': {'type': 'streak', 'days': 100},
                'points': 1000
            },
            
            # Speed
            {
                'name': 'Speed Demon',
                'description': 'Solve a problem in under 1 minute',
                'icon': '⚡',
                'category': 'speed',
                'requirement': {'type': 'solve_time', 'seconds': 60},
                'points': 100
            },
            {
                'name': 'Lightning Fast',
                'description': 'Solve a problem in under 30 seconds',
                'icon': '⚡',
                'category': 'speed',
                'requirement': {'type': 'solve_time', 'seconds': 30},
                'points': 200
            },
            
            # Time-based
            {
                'name': 'Night Owl',
                'description': 'Solve a problem between 12am-6am',
                'icon': '🌙',
                'category': 'time',
                'requirement': {'type': 'time_range', 'start': 0, 'end': 6},
                'points': 50
            },
            {
                'name': 'Early Bird',
                'description': 'Solve a problem between 6am-9am',
                'icon': '🌅',
                'category': 'time',
                'requirement': {'type': 'time_range', 'start': 6, 'end': 9},
                'points': 50
            },
            
            # Special
            {
                'name': 'First Submission',
                'description': 'Submit your first solution',
                'icon': '🎉',
                'category': 'special',
                'requirement': {'type': 'submissions', 'count': 1},
                'points': 25
            },
            {
                'name': 'Perfect Week',
                'description': 'Solve at least one problem every day for 7 days',
                'icon': '✨',
                'category': 'special',
                'requirement': {'type': 'perfect_week'},
                'points': 150
            },
            {
                'name': 'Language Polyglot',
                'description': 'Solve problems in all 4 languages',
                'icon': '🌐',
                'category': 'special',
                'requirement': {'type': 'languages', 'count': 4},
                'points': 200
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for achievement_data in achievements:
            achievement, created = AchievementDefinition.objects.update_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {achievement.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'↻ Updated: {achievement.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Seeding complete!'))
        self.stdout.write(self.style.SUCCESS(f'Created: {created_count} achievements'))
        self.stdout.write(self.style.SUCCESS(f'Updated: {updated_count} achievements'))
        self.stdout.write(self.style.SUCCESS(f'Total: {AchievementDefinition.objects.count()} achievements'))
