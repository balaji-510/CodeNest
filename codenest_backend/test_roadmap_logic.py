import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Problem, Submission, TopicProgress
from api.views import get_roadmap
from rest_framework.test import APIRequestFactory, force_authenticate

def test_roadmap_logic():
    print("Setting up test data...")
    # 1. Create User
    user, created = User.objects.get_or_create(username='roadmap_test_user')
    if created:
        user.set_password('password')
        user.save()
    
    # 2. Clear existing data for this user
    Submission.objects.filter(user=user).delete()
    TopicProgress.objects.filter(user=user).delete()
    
    # Clean up existing problems to ensure consistent totals
    Problem.objects.filter(topic="Arrays").delete()
    
    # 3. Create Problems for "Arrays & Strings" (Topic: "Arrays")
    # We need enough to reach 80%
    # Let's say we have 2 problems total for "Arrays"
    p1, _ = Problem.objects.get_or_create(title="Test Array 1", difficulty="Easy", topic="Arrays", platform="LeetCode")
    p2, _ = Problem.objects.get_or_create(title="Test Array 2", difficulty="Easy", topic="Arrays", platform="LeetCode")
    
    print(f"Created {Problem.objects.filter(topic='Arrays').count()} problems for topic 'Arrays'.")

    # 4. Check Roadmap (Should be Current for Arrays, Locked for others)
    factory = APIRequestFactory()
    request = factory.get('/api/roadmap/')
    force_authenticate(request, user=user)
    response = get_roadmap(request)
    
    print("\n--- Initial Roadmap State ---")
    arrays_node = response.data[0]['nodes'][0]
    print(f"Node: {arrays_node['label']}, Status: {arrays_node['status']}, Solved: {arrays_node['solved']}/{arrays_node['total']}")
    print(f"Full Node Data: {arrays_node}")
    
    # assert arrays_node['status'] == 'current'
    # assert arrays_node['solved'] == 0
    
    # 5. Solve 1 Problem (50%)
    print("\n--- Solving 1 Problem ---")
    Submission.objects.create(user=user, problem=p1, status="Solved")
    
    # Check TopicProgress
    tp = TopicProgress.objects.get(user=user, topic="Arrays")
    print(f"TopicProgress: {tp.topic} - {tp.solved_count}/{tp.total_problems}")
    
    response = get_roadmap(request)
    arrays_node = response.data[0]['nodes'][0]
    print(f"Node: {arrays_node['label']}, Status: {arrays_node['status']}, Solved: {arrays_node['solved']}/{arrays_node['total']}")
    
    assert arrays_node['solved'] == 1
    assert arrays_node['status'] == 'current' # 50% < 80%

    # 6. Solve 2nd Problem (100%)
    print("\n--- Solving 2nd Problem ---")
    Submission.objects.create(user=user, problem=p2, status="Solved")
    
    response = get_roadmap(request)
    arrays_node = response.data[0]['nodes'][0]
    next_node = response.data[0]['nodes'][1] # Linked Lists
    
    print(f"Node: {arrays_node['label']}, Status: {arrays_node['status']}, Solved: {arrays_node['solved']}/{arrays_node['total']}")
    print(f"Next Node: {next_node['label']}, Status: {next_node['status']}")
    
    assert arrays_node['status'] == 'completed'
    assert next_node['status'] == 'current' # Should be unlocked now
    
    print("\nSUCCESS: Roadmap logic verified!")

if __name__ == "__main__":
    test_roadmap_logic()
