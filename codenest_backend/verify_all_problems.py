
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem

def verify_problems():
    problems = Problem.objects.all()
    print(f"{'Title':<40} | {'Examples':<10} | {'Constraints':<10}")
    print("-" * 70)
    for p in problems:
        ex_count = 0
        try:
            ex = json.loads(p.examples)
            ex_count = len(ex)
        except:
            pass
            
        const_count = 0
        try:
            const = json.loads(p.constraints)
            const_count = len(const)
        except:
            pass
            
        print(f"{p.title:<40} | {ex_count:<10} | {const_count:<10}")

if __name__ == "__main__":
    verify_problems()
