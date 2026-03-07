import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def list_users():
    users = User.objects.all()
    print(f"Total Users: {users.count()}")
    print("-" * 60)
    print(f"{'ID':<5} {'Username':<20} {'Email':<30} {'LeetCode':<15} {'Verified'}")
    print("-" * 60)
    
    for user in users:
        try:
            profile = user.profile
            lc_handle = profile.leetcode_handle or "N/A"
            is_verified = "Yes" if profile.is_leetcode_verified else "No"
        except UserProfile.DoesNotExist:
            lc_handle = "No Profile"
            is_verified = "-"
            
        print(f"{user.id:<5} {user.username:<20} {user.email:<30} {lc_handle:<15} {is_verified}")

if __name__ == "__main__":
    list_users()
