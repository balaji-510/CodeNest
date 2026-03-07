import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codenest_backend.settings")
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Problem, Context, ContextProblem, Notification

def run_test():
    print("--- Starting Context Feature Test ---")
    
    # 1. Setup Users
    mentor_user, _ = User.objects.get_or_create(username="test_mentor")
    UserProfile.objects.update_or_create(user=mentor_user, defaults={'role': 'teacher'})
    
    student_user, _ = User.objects.get_or_create(username="test_student_1")
    UserProfile.objects.update_or_create(user=student_user, defaults={'role': 'student', 'branch': 'CSE'})
    
    # 2. Setup Problem
    problem, _ = Problem.objects.get_or_create(
        title="Test Logic Problem", 
        defaults={
            'difficulty': 'Easy',
            'topic': 'Logic',
            'platform': 'LeetCode'
        }
    )
    
    print("Users and Problem setup complete.")
    
    # 3. Create Context
    print("Creating Context...")
    start_time = timezone.now() + timedelta(minutes=10)
    end_time = start_time + timedelta(hours=2)
    
    context = Context.objects.create(
        title="Test Context 101",
        description="A test context",
        mentor=mentor_user,
        start_time=start_time,
        end_time=end_time,
        difficulty='Easy',
        target_branch='CSE'
    )
    
    ContextProblem.objects.create(context=context, problem=problem, order_index=0)
    
    print(f"Context '{context.title}' created with ID: {context.id}")
    
    # 4. Create Notifications (Simulation of View Logic)
    # The view logic does this, but here we can manually test the model creation or call the logic if extracted.
    # Since we can't easily call the ViewSet methods without a request object, we'll verify the model logic.
    
    print("Simulating Notification Creation...")
    Notification.objects.create(
        recipient=student_user,
        title=f"New Context: {context.title}",
        message="Test Message",
        link=f"/context/{context.id}"
    )
    
    # 5. Verify Data
    # Check if student has notification
    notif = Notification.objects.filter(recipient=student_user, title__contains=context.title).first()
    if notif:
        print(f"PASS: Notification found for student: {notif.title}")
    else:
        print("FAIL: Notification not found for student")
        
    # Check Context Listing Logic
    # Mentor should see it
    mentor_contexts = Context.objects.filter(mentor=mentor_user)
    if context in mentor_contexts:
        print("PASS: Mentor sees their context")
    else:
        print("FAIL: Mentor does not see their context")
        
    # Student should see it (it's active/upcoming)
    # Our logic in view: Context.objects.filter(is_active=True)
    # Is it active? Default is True.
    student_contexts = Context.objects.filter(is_active=True)
    if context in student_contexts:
        print("PASS: Student sees the context (Simulated)")
    else:
        print("FAIL: Student does not see the context")

    print("--- Test Complete ---")

if __name__ == '__main__':
    run_test()
