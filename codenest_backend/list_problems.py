import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem

def list_problems():
    problems = Problem.objects.all()
    for p in problems:
        print(f"ID: {p.id}, Title: {p.title}, Topic: {p.topic}")

if __name__ == "__main__":
    list_problems()
