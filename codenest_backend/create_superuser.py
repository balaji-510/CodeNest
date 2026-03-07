import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

username = '234g5a0516'
email = 'admin@example.com'
password = '1234'

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser {username}...")
    user = User.objects.create_superuser(username, email, password)
    print("User created.")
    
    # Create profile
    # Profile might be auto-created by signals, but lets be sure
    if not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user, role='teacher') 
        print("Profile created.")
    else:
        user.profile.role = 'teacher'
        user.profile.save()
        print("Profile role set to teacher.")
else:
    print(f"User {username} already exists. Resetting password.")
    u = User.objects.get(username=username)
    u.set_password(password)
    u.save()
    
    if not hasattr(u, 'profile'):
         UserProfile.objects.create(user=u, role='teacher')
    else:
         u.profile.role = 'teacher'
         u.profile.save()
    print("Password reset and role checked.")
