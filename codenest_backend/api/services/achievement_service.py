from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from api.models import Achievement, AchievementDefinition, Submission, Problem, Notification
from django.contrib.auth.models import User


class AchievementService:
    """Service to check and award achievements"""
    
    @staticmethod
    def check_and_award_achievements(user, submission=None):
        """
        Check all achievements for a user and award new ones
        Returns list of newly earned achievements
        """
        newly_earned = []
        
        try:
            # Get all active achievement definitions
            achievement_defs = AchievementDefinition.objects.filter(is_active=True)
            
            for achievement_def in achievement_defs:
                try:
                    # Skip if user already has this achievement
                    if Achievement.objects.filter(user=user, achievement_def=achievement_def).exists():
                        continue
                    
                    # Check if user qualifies for this achievement
                    if AchievementService._check_achievement(user, achievement_def, submission):
                        # Award the achievement
                        achievement = Achievement.objects.create(
                            user=user,
                            achievement_def=achievement_def,
                            type=achievement_def.category,
                            title=achievement_def.name,
                            description=achievement_def.description,
                            icon=achievement_def.icon,
                            progress=100,
                            target=100
                        )
                        newly_earned.append(achievement)
                        
                        # Create notification
                        Notification.objects.create(
                            recipient=user,
                            title='🏆 Achievement Unlocked!',
                            message=f'You earned "{achievement_def.name}": {achievement_def.description}',
                            link=f'/achievements'
                        )
                except Exception as e:
                    # Log error but continue checking other achievements
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error checking achievement {achievement_def.name}: {str(e)}")
                    continue
        except Exception as e:
            # Log error but don't fail the submission
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in check_and_award_achievements: {str(e)}")
        
        return newly_earned
    
    @staticmethod
    def _check_achievement(user, achievement_def, submission=None):
        """Check if user qualifies for a specific achievement"""
        req = achievement_def.requirement
        req_type = req.get('type')
        
        # Problem Solving Achievements
        if req_type == 'problems_solved':
            count = Submission.objects.filter(
                user=user,
                status='ACCEPTED'
            ).values('problem').distinct().count()
            return count >= req.get('count', 0)
        
        # Difficulty Complete
        elif req_type == 'difficulty_complete':
            difficulty = req.get('difficulty')
            total_problems = Problem.objects.filter(difficulty=difficulty).count()
            solved_problems = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                problem__difficulty=difficulty
            ).values('problem').distinct().count()
            return solved_problems >= total_problems and total_problems > 0
        
        # Topic Complete
        elif req_type == 'topic_complete':
            topic = req.get('topic')
            total_problems = Problem.objects.filter(topic=topic).count()
            solved_problems = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                problem__topic=topic
            ).values('problem').distinct().count()
            return solved_problems >= total_problems and total_problems > 0
        
        # Streak
        elif req_type == 'streak':
            target_days = req.get('days', 7)
            return AchievementService._check_streak(user, target_days)
        
        # Solve Time (Speed)
        elif req_type == 'solve_time':
            if not submission:
                return False
            max_seconds = req.get('seconds', 60)
            # Check if submission was solved in under max_seconds
            # Assuming execution_time_ms is in milliseconds
            if submission.execution_time_ms:
                return submission.execution_time_ms / 1000 <= max_seconds
            return False
        
        # Time Range (Night Owl, Early Bird)
        elif req_type == 'time_range':
            if not submission:
                return False
            start_hour = req.get('start', 0)
            end_hour = req.get('end', 24)
            submission_hour = submission.created_at.hour
            return start_hour <= submission_hour < end_hour
        
        # Submissions Count
        elif req_type == 'submissions':
            count = Submission.objects.filter(user=user).count()
            return count >= req.get('count', 1)
        
        # Perfect Week
        elif req_type == 'perfect_week':
            return AchievementService._check_perfect_week(user)
        
        # Languages
        elif req_type == 'languages':
            languages_used = Submission.objects.filter(
                user=user,
                status='ACCEPTED'
            ).values('language').distinct().count()
            return languages_used >= req.get('count', 4)
        
        return False
    
    @staticmethod
    def _check_streak(user, target_days):
        """Check if user has a streak of target_days"""
        today = timezone.now().date()
        current_streak = 0
        
        for i in range(target_days):
            check_date = today - timedelta(days=i)
            has_submission = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                created_at__date=check_date
            ).exists()
            
            if has_submission:
                current_streak += 1
            else:
                break
        
        return current_streak >= target_days
    
    @staticmethod
    def _check_perfect_week(user):
        """Check if user solved at least one problem every day for 7 days"""
        today = timezone.now().date()
        
        for i in range(7):
            check_date = today - timedelta(days=i)
            has_submission = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                created_at__date=check_date
            ).exists()
            
            if not has_submission:
                return False
        
        return True
    
    @staticmethod
    def get_user_progress(user):
        """Get user's progress towards all achievements"""
        achievement_defs = AchievementDefinition.objects.filter(is_active=True)
        progress_data = []
        
        for achievement_def in achievement_defs:
            # Check if already earned
            earned = Achievement.objects.filter(
                user=user,
                achievement_def=achievement_def
            ).first()
            
            if earned:
                progress_data.append({
                    'achievement': achievement_def,
                    'earned': True,
                    'earned_at': earned.earned_at,
                    'progress': 100,
                    'target': 100
                })
            else:
                # Calculate progress
                progress = AchievementService._calculate_progress(user, achievement_def)
                progress_data.append({
                    'achievement': achievement_def,
                    'earned': False,
                    'earned_at': None,
                    'progress': progress['current'],
                    'target': progress['target']
                })
        
        return progress_data
    
    @staticmethod
    def _calculate_progress(user, achievement_def):
        """Calculate current progress towards an achievement"""
        req = achievement_def.requirement
        req_type = req.get('type')
        
        if req_type == 'problems_solved':
            current = Submission.objects.filter(
                user=user,
                status='ACCEPTED'
            ).values('problem').distinct().count()
            target = req.get('count', 0)
            return {'current': current, 'target': target}
        
        elif req_type == 'difficulty_complete':
            difficulty = req.get('difficulty')
            current = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                problem__difficulty=difficulty
            ).values('problem').distinct().count()
            target = Problem.objects.filter(difficulty=difficulty).count()
            return {'current': current, 'target': target}
        
        elif req_type == 'topic_complete':
            topic = req.get('topic')
            current = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                problem__topic=topic
            ).values('problem').distinct().count()
            target = Problem.objects.filter(topic=topic).count()
            return {'current': current, 'target': target}
        
        elif req_type == 'streak':
            current = AchievementService._get_current_streak(user)
            target = req.get('days', 7)
            return {'current': current, 'target': target}
        
        elif req_type == 'submissions':
            current = Submission.objects.filter(user=user).count()
            target = req.get('count', 1)
            return {'current': current, 'target': target}
        
        elif req_type == 'languages':
            current = Submission.objects.filter(
                user=user,
                status='ACCEPTED'
            ).values('language').distinct().count()
            target = req.get('count', 4)
            return {'current': current, 'target': target}
        
        # For achievements without progress tracking
        return {'current': 0, 'target': 1}
    
    @staticmethod
    def _get_current_streak(user):
        """Get user's current streak"""
        today = timezone.now().date()
        current_streak = 0
        
        i = 0
        while True:
            check_date = today - timedelta(days=i)
            has_submission = Submission.objects.filter(
                user=user,
                status='ACCEPTED',
                created_at__date=check_date
            ).exists()
            
            if has_submission:
                current_streak += 1
                i += 1
            else:
                break
        
        return current_streak
