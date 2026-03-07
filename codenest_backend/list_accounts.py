import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def list_users():
    users = User.objects.all()
    output_lines = []
    output_lines.append(f"Total Users: {users.count()}")
    output_lines.append("-" * 120)
    output_lines.append(f"{'ID':<5} {'Username':<20} {'Email':<30} {'Token':<15} {'LeetCode':<15} {'Verified'} {'CodeChef'} {'Codeforces'}")
    output_lines.append("-" * 120)
    
    for user in users:
        try:
            profile = user.profile
            token = profile.verification_token or "N/A"
            lc_handle = profile.leetcode_handle or "N/A"
            lc_ver = "Yes" if profile.is_leetcode_verified else "No"
            cc_handle = profile.codechef_handle or "N/A"
            cf_handle = profile.codeforces_handle or "N/A"
        except UserProfile.DoesNotExist:
            token = "No Profile"
            lc_handle = "-"
            lc_ver = "-"
            cc_handle = "-"
            cf_handle = "-"
            
        output_lines.append(f"{user.id:<5} {user.username:<20} {user.email:<30} {token:<15} {lc_handle:<15} {lc_ver:<8} {cc_handle:<10} {cf_handle}")

    with open('user_list.txt', 'w') as f:
        f.write('\n'.join(output_lines))
    print("User list written to user_list.txt")

if __name__ == "__main__":
    list_users()
