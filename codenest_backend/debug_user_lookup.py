
import os
import django
from django.db.models import Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
UserModel = get_user_model()

def check_user(username):
    print(f"Checking for '{username}'...")
    user = UserModel.objects.filter(
        Q(username__iexact=username) | Q(email__iexact=username)
    ).order_by('id').first()
    
    if user:
        print(f"FOUND: ID={user.id}, Username={user.username}, Email={user.email}")
        print(f"Check Password 'CodeNest@123': {user.check_password('CodeNest@123')}")
    else:
        print("NOT FOUND")

if __name__ == "__main__":
    check_user('23g5a0516')
    check_user('23g5a0516@srit.ac.in')
    check_user('234g5a0516@srit.ac.in')
