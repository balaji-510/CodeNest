import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User

def delete_users():
    count = User.objects.all().count()
    if count == 0:
        print("No users to delete.")
        return

    print(f"Deleting {count} users...")
    User.objects.all().delete()
    print("All users deleted successfully.")

if __name__ == "__main__":
    delete_users()
