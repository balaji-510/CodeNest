import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codenest_backend.settings")
django.setup()

from api.models import Problem

def check_problems():
    problems = Problem.objects.all()
    count = problems.count()
    print(f"Total Problems Found: {count}")
    
    if count > 0:
        for p in problems[:5]:
            print(f"- [{p.id}] {p.title} ({p.difficulty})")
    else:
        print("No problems found in the database.")

if __name__ == '__main__':
    check_problems()
