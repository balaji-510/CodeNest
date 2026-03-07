import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

print("--- User Debug Info ---")
users = User.objects.all()
for u in users:
    print(f"User: {u.username} (ID: {u.id})")
    print(f"  Email: {u.email}")
    print(f"  Is Active: {u.is_active}")
    print(f"  Is Staff: {u.is_staff}")
    if hasattr(u, 'profile'):
        print(f"  Profile Role: {u.profile.role}")
    else:
        print("  No Profile!")
    print("-" * 20)

# Check specifically for the test users
test_users = ['234g5a0516', 'yashraj', 'admin']
print("\n--- Password Check (Resetting if needed) ---")
for username in test_users:
    try:
        u = User.objects.get(username=username)
        u.set_password('1234') # Set a known password
        u.save()
        print(f"Reset password for {username} to '1234'")
    except User.DoesNotExist:
        print(f"User {username} not found")
