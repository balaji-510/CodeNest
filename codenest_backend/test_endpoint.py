"""
Test AI Assistant Endpoint
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import User
from api.views import ai_assistant
import json

print("🧪 Testing AI Assistant Endpoint")
print("=" * 60)

# Create test user
try:
    user = User.objects.get(username='admin')
    print(f"✅ Using existing user: {user.username}")
except User.DoesNotExist:
    user = User.objects.create_user('testuser', 'test@test.com', 'password')
    print(f"✅ Created test user: {user.username}")

# Create request factory
factory = RequestFactory()

# Test data
test_data = {
    'query': 'Give me a hint for Two Sum',
    'context': {
        'code': 'def twoSum(nums, target): pass',
        'language': 'python',
        'problemTitle': 'Two Sum'
    }
}

print(f"\n📝 Test Request:")
print(f"   Query: {test_data['query']}")
print(f"   Context: {test_data['context']['problemTitle']}")

# Create POST request
request = factory.post(
    '/api/ai-assistant/',
    data=json.dumps(test_data),
    content_type='application/json'
)
request.user = user

print(f"\n🔄 Calling ai_assistant view...")

try:
    response = ai_assistant(request)
    
    print(f"\n✅ Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"✅ Response received!")
        print(f"   Length: {len(data.get('response', ''))} characters")
        print(f"   Preview: {data.get('response', '')[:200]}...")
        print(f"\n🎉 Endpoint is working correctly!")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Content: {response.content.decode()}")
        
except Exception as e:
    print(f"\n❌ Exception occurred:")
    print(f"   Type: {type(e).__name__}")
    print(f"   Message: {str(e)}")
    
    import traceback
    print(f"\n📋 Full Traceback:")
    traceback.print_exc()

print("\n" + "=" * 60)
