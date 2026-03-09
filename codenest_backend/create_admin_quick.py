"""
Quick script to create a superuser for CodeNest
Run this from the codenest_backend directory
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User

# Create superuser
username = "admin"
email = "admin@codenest.com"
password = "admin123"

if User.objects.filter(username=username).exists():
    print(f"✅ User '{username}' already exists!")
    user = User.objects.get(username=username)
else:
    user = User.objects.create_superuser(username=username, email=email, password=password)
    print(f"✅ Superuser created successfully!")

print(f"\n📝 Login Credentials:")
print(f"   Username: {username}")
print(f"   Password: {password}")
print(f"\n🌐 Access admin at: http://localhost:8000/admin/")
print(f"🌐 Login at frontend: http://localhost:5173/login")
