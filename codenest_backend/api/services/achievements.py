"""
Achievement Service
Handles awarding and tracking user achievements
"""
from django.contrib.auth.models import User
from api.models import Achievement, UserStats
from datetime import date, timedelta


class AchievementService:
    """Service for managing user achievements"""
    
    ACHIEVEMENTS = {
        # First Steps
        'first_solve': {
            'title': 'First Blood 🎯',
            'description': 'Solved your first problem!',
            'icon': '🎯',
            'type': 'problems'
        },
        'first_submission': {
            'title': 'Getting Started 🚀',
            'description': 'Made your first submission!',
            'icon': '🚀',
            'type': 'problems'
        },
        
        # Problem Milestones
        'solve_10': {
            'title': 'Problem Solver 💪',
            'description': 'Solved 10 problems!',
            'icon': '💪',
            'type': 'problems'
        },
        'solve_50': {
            'title': 'Half Century 🏏',
            'description': 'Solved 50 problems!',
            'icon': '🏏',
            'type': 'problems'
        },
        'solve_100': {
            'title': 'Century 💯',
            'description': 'Solved 100 problems!',
            'icon': '💯',
            'type': 'problems'
        },
        'solve_250': {
            'title': 'Problem Crusher ⚡',
            'description': 'Solved 250 problems!',
            'icon': '⚡',
            'type': 'problems'
        },
        'solve_500': {
            'title': 'Coding Master 👑',
            'description': 'Solved 500 problems!',
            'icon': '👑',
            'type': 'problems'
        },
        
        # Streaks
        'streak_3': {
            'title': '3 Day Streak 🔥',
            'description': 'Solved problems for 3 days in a row!',
            'icon': '🔥',
            'type': 'streak'
        },
        'streak_7': {
            'title': 'Week Warrior 🔥🔥',
            'description': 'Solved problems for 7 days in a row!',
            'icon': '🔥🔥',
            'type': 'streak'
        },
        'streak_30': {
            'title': 'Monthly Master 🔥🔥🔥',
            'description': 'Solved problems for 30 days in a row!',
            'icon': '🔥🔥🔥',
            'type': 'streak'
        },
        'streak_100': {
            'title': 'Unstoppable 🌟',
            'description': 'Solved problems for 100 days in a row!',
            'icon': '🌟',
            'type': 'streak'
        },
        
        # Topic Mastery
        'topic_master_arrays': {
            'title': 'Array Master 📊',
            'description': 'Solved 20+ array problems!',
            'icon': '📊',
            'type': 'topic'
        },
        'topic_master_dp': {
            'title': 'DP Expert 🧠',
            'description': 'Solved 20+ dynamic programming problems!',
            'icon': '🧠',
            'type': 'topic'
        },
        'topic_master_graphs': {
            'title': 'Graph Guru 🕸️',
            'description': 'Solved 20+ graph problems!',
            'icon': '🕸️',
            'type': 'topic'
        },
        
        # Speed
        'speed_demon': {
            'title': 'Speed Demon ⚡',
            'description': 'Solved a problem in under 5 minutes!',
            'icon': '⚡',
            'type': 'speed'
        },
        'marathon_runner': {
            'title': 'Marathon Runner 🏃',
            'description': 'Solved 10 problems in one day!',
            'icon': '🏃',
            'type': 'speed'
        },
        
        # Special
        'night_owl': {
            'title': 'Night Owl 🦉',
            'description': 'Solved a problem after midnight!',
            'icon': '🦉',
            'type': 'special'
        },
        'early_bird': {
            'title': 'Early Bird 🐦',
            'description': 'Solved a problem before 6 AM!',
            'icon': '🐦',
            'type': 'special'
        },
    }
    
    @classmethod
    def award_achievement(cls, user, achievement_key):
        """Award an achievement to a user"""
        if achievement_key not in cls.ACHIEVEMENTS:
            return None
        
        # Check if already awarded
        achievement_data = cls.ACHIEVEMENTS[achievement_key]
        existing = Achievement.objects.filter(
            user=user,
            title=achievement_data['title']
        ).first()
        
        if existing:
            return None  # Already has this achievement
        
        # Create achievement
        achievement = Achievement.objects.create(
            user=user,
            type=achievement_data['type'],
            title=achievement_data['title'],
            description=achievement_data['description'],
            icon=achievement_data['icon']
        )
        
        return achievement
    
    @classmethod
    def check_and_award_achievements(cls, user):
        """Check and award all applicable achievements for a user"""
        awarded = []
        
        # Get user stats
        stats = getattr(user, 'stats', None)
        if not stats:
            return awarded
        
        problems_solved = stats.problems_solved
        
        # Check problem milestones
        milestones = {
            1: 'first_solve',
            10: 'solve_10',
            50: 'solve_50',
            100: 'solve_100',
            250: 'solve_250',
            500: 'solve_500',
        }
        
        for count, key in milestones.items():
            if problems_solved >= count:
                achievement = cls.award_achievement(user, key)
                if achievement:
                    awarded.append(achievement)
        
        # Check streak
        from api.models import Analytics
        today = date.today()
        streak = 0
        current_date = today
        
        while True:
            has_activity = Analytics.objects.filter(
                user=user,
                date=current_date,
                problems_solved__gt=0
            ).exists()
            
            if not has_activity:
                break
            
            streak += 1
            current_date -= timedelta(days=1)
        
        # Award streak achievements
        streak_milestones = {
            3: 'streak_3',
            7: 'streak_7',
            30: 'streak_30',
            100: 'streak_100',
        }
        
        for count, key in streak_milestones.items():
            if streak >= count:
                achievement = cls.award_achievement(user, key)
                if achievement:
                    awarded.append(achievement)
        
        # Check topic mastery
        from api.models import TopicProgress
        topic_progress = TopicProgress.objects.filter(user=user)
        
        for tp in topic_progress:
            if tp.topic.lower() == 'arrays' and tp.solved_count >= 20:
                achievement = cls.award_achievement(user, 'topic_master_arrays')
                if achievement:
                    awarded.append(achievement)
            elif tp.topic.lower() in ['dynamic programming', 'dp'] and tp.solved_count >= 20:
                achievement = cls.award_achievement(user, 'topic_master_dp')
                if achievement:
                    awarded.append(achievement)
            elif tp.topic.lower() == 'graphs' and tp.solved_count >= 20:
                achievement = cls.award_achievement(user, 'topic_master_graphs')
                if achievement:
                    awarded.append(achievement)
        
        return awarded
    
    @classmethod
    def get_user_achievements(cls, user):
        """Get all achievements for a user"""
        return Achievement.objects.filter(user=user).order_by('-earned_at')
    
    @classmethod
    def get_achievement_progress(cls, user):
        """Get progress towards next achievements"""
        stats = getattr(user, 'stats', None)
        if not stats:
            return []
        
        progress = []
        problems_solved = stats.problems_solved
        
        # Next problem milestone
        milestones = [1, 10, 50, 100, 250, 500, 1000]
        next_milestone = next((m for m in milestones if m > problems_solved), None)
        
        if next_milestone:
            progress.append({
                'type': 'problems',
                'title': f'Solve {next_milestone} problems',
                'current': problems_solved,
                'target': next_milestone,
                'percentage': (problems_solved / next_milestone) * 100
            })
        
        return progress
