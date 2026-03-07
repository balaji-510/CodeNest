import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem, Submission
from django.contrib.auth.models import User

def check_connection():
    print("--- Database Connection Check ---")
    try:
        user_count = User.objects.count()
        problem_count = Problem.objects.count()
        submission_count = Submission.objects.count()
        
        print(f"✅ Successfully connected to MySQL database 'codenest_db'")
        print(f"Stats found in database:")
        print(f" - Users: {user_count}")
        print(f" - Problems: {problem_count}")
        print(f" - Submissions: {submission_count}")
        
        if user_count > 0:
            print(f"\nExample User: {User.objects.first().username}")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    check_connection()
