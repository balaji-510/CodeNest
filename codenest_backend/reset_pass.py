
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()
from django.contrib.auth.models import User

try:
    u = User.objects.get(username='23g5a0516')
    u.set_password('CodeNest@123')
    u.save()
    print(f"SUCCESS: Password reset for {u.username}")
except User.DoesNotExist:
    print("ERROR: User 23g5a0516 not found")
