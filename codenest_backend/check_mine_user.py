
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def check_users():
    print("--- Checking Users ---")
    users = User.objects.all()
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}")
        if hasattr(u, 'profile'):
            print(f"  Profile: Confirmed")
        else:
            print(f"  Profile: Missing")

    print("\n--- Checking for user 'mine' ---")
    if User.objects.filter(username='mine').exists():
        print("User 'mine' EXISTS.")
        u = User.objects.get(username='mine')
        print(f"Details: ID={u.id}, Email={u.email}")
    else:
        print("User 'mine' does NOT exist.")

if __name__ == "__main__":
    check_users()
