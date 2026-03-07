from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Submission, TopicProgress, Analytics, Problem
from django.utils import timezone
from django.db import models

@receiver(post_save, sender=Submission)
def update_progress_on_submission(sender, instance, created, **kwargs):
    if instance.status == 'Solved':
        user = instance.user
        problem = instance.problem
        topic = problem.topic
        
        # 1. Update Topic Progress
        topic_progress, _ = TopicProgress.objects.get_or_create(user=user, topic=topic)
        
        # Recalculate solved count for this topic to be accurate
        # We count distinct problems solved by this user for this topic
        solved_count = Submission.objects.filter(
            user=user, 
            problem__topic=topic, 
            status='Solved'
        ).values('problem').distinct().count()
        
        # Update total problems for this topic
        total_problems = Problem.objects.filter(topic=topic).count()
        
        topic_progress.solved_count = solved_count
        topic_progress.total_problems = total_problems
        topic_progress.save()
        
        # 2. Update Analytics (Active Days & Daily Solved)
        today = timezone.now().date()
        analytics, _ = Analytics.objects.get_or_create(user=user, date=today)
        
        # Recalculate daily solved
        daily_solved = Submission.objects.filter(
            user=user,
            created_at__date=today,
            status='Solved'
        ).values('problem').distinct().count()
        
        analytics.problems_solved = daily_solved
        analytics.save()
        
        # Update User Profile Active Days
        # This is a bit expensive to calculate every time, maybe optimize later
        # active_days = Analytics.objects.filter(user=user).count()
        # profile = user.profile
        # profile.active_days = active_days
        # profile.save()
