from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db.models import Sum
from api.models import Submission, UserStats, Problem


class Command(BaseCommand):
    help = 'Recalculate scores for all students based on difficulty points (Easy=10, Medium=15, Hard=20)'

    def handle(self, *args, **options):
        # First backfill points on all problems based on difficulty
        POINTS = {'Easy': 10, 'Medium': 15, 'Hard': 20}
        updated_problems = 0
        for problem in Problem.objects.all():
            correct_pts = POINTS.get(problem.difficulty, 10)
            if problem.points != correct_pts:
                problem.points = correct_pts
                problem.save(update_fields=['points'])
                updated_problems += 1
        self.stdout.write(f'Backfilled points on {updated_problems} problems.')

        # Now recalculate each student's score
        students = User.objects.filter(profile__role='student').select_related('profile')
        fixed = 0

        for user in students:
            distinct_solved = (
                Submission.objects
                .filter(user=user, status='ACCEPTED')
                .values('problem')
                .distinct()
                .count()
            )
            correct_score = (
                Submission.objects
                .filter(user=user, status='ACCEPTED')
                .values('problem')
                .distinct()
                .aggregate(total=Sum('problem__points'))['total'] or 0
            )

            stats, _ = UserStats.objects.get_or_create(user=user)
            old_score = stats.score
            old_solved = stats.problems_solved

            if stats.score != correct_score or stats.problems_solved != distinct_solved:
                stats.score = correct_score
                stats.problems_solved = distinct_solved
                stats.save()
                fixed += 1
                self.stdout.write(
                    f'  {user.username}: score {old_score} → {correct_score}, '
                    f'solved {old_solved} → {distinct_solved}'
                )

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. Fixed {fixed} / {students.count()} student accounts.'
        ))
