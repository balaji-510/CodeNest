import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

users_data = [
    {"email": "23g5a0508@srit.ac.in", "first_name": "Naresh", "last_name": "KP"},
    {"email": "23g5a0512@srit.ac.in", "first_name": "Ranjith", "last_name": "kumar M"},
    {"email": "23g5a0502@srit.ac.in", "first_name": "Eswar", "last_name": "c"},
    {"email": "23g5a0516@srit.ac.in", "first_name": "Yaswanth", "last_name": "kumar D"},
    {"email": "23g5a0515@srit.ac.in", "first_name": "Tharun", "last_name": "KM"},
]

default_password = "CodeNest@123"

print("Starting user population...")

for data in users_data:
    username = data["email"].split('@')[0]
    email = data["email"]
    first_name = data["first_name"]
    last_name = data["last_name"]

    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists. Skipping.")
        continue

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=default_password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create UserProfile if not automatically created (signals might not be set up)
        UserProfile.objects.get_or_create(user=user, role='student')
        
        print(f"Successfully created user: {username} ({first_name} {last_name})")
        
    except Exception as e:
        print(f"Error creating user {username}: {e}")

print("User population completed.")
