
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

users_data = [
    {"email": "234g5a0508@srit.ac.in", "first_name": "Naresh", "last_name": "KP"},
    {"email": "234g5a0512@srit.ac.in", "first_name": "Ranjith", "last_name": "kumar M"},
    {"email": "234g5a0502@srit.ac.in", "first_name": "Eswar", "last_name": "c"},
    # 234g5a0516 is handled separately below
    {"email": "234g5a0515@srit.ac.in", "first_name": "Tharun", "last_name": "KM"},
]

default_password = "CodeNest@123"

print("Starting CORRECTION of user population (adding '234' prefix)...")

# 1. Handle 234g5a0516 specifically (merge with yashraj if exists)
try:
    # Check if a user with this email already exists
    existing_user_email = User.objects.filter(email='234g5a0516@srit.ac.in').first()
    if existing_user_email:
        print(f"User with email 234g5a0516@srit.ac.in exists: {existing_user_email.username}")
        # Update username to match roll number
        if existing_user_email.username != '234g5a0516':
            print(f"Renaming {existing_user_email.username} to 234g5a0516")
            existing_user_email.username = '234g5a0516'
        
        # Reset password
        existing_user_email.set_password(default_password)
        existing_user_email.save()
        print("Updated 234g5a0516 successfully.")
    else:
        # Create fresh
        print("Creating 234g5a0516...")
        user = User.objects.create_user(
            username='234g5a0516',
            email='234g5a0516@srit.ac.in',
            password=default_password,
            first_name='Yaswanth',
            last_name='kumar D'
        )
        UserProfile.objects.get_or_create(user=user, role='student')
        print("Created 234g5a0516.")

except Exception as e:
    print(f"Error handling 234g5a0516: {e}")

# 2. Handle others
for data in users_data:
    username = data["email"].split('@')[0] # e.g. 234g5a0508
    email = data["email"]
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists. Updating password.")
        u = User.objects.get(username=username)
        u.set_password(default_password)
        u.save()
        continue
        
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=default_password,
            first_name=data["first_name"],
            last_name=data["last_name"]
        )
        UserProfile.objects.get_or_create(user=user, role='student')
        print(f"Successfully created user: {username}")
        
    except Exception as e:
        print(f"Error creating user {username}: {e}")

print("Correction completed.")
