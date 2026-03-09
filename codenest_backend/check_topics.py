"""
Check what topics are in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem

topics = Problem.objects.values_list('topic', flat=True).distinct()
print("Topics in database:")
for topic in sorted(set(topics)):
    count = Problem.objects.filter(topic=topic).count()
    print(f"  - {topic}: {count} problems")
