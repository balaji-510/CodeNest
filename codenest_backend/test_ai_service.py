"""
Test AI Service with Groq API
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.ai_service import AIService

# Test context
context = {
    'code': 'def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]',
    'language': 'python',
    'problemTitle': 'Two Sum',
    'problemDescription': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
}

# Test queries
queries = [
    "Give me a hint for solving this problem",
    "What is the time complexity of my code?",
    "Can you explain how this code works?"
]

print("🤖 Testing AI Service with Groq API\n")
print("=" * 60)

for i, query in enumerate(queries, 1):
    print(f"\n📝 Test {i}: {query}")
    print("-" * 60)
    
    try:
        response = AIService.get_ai_response(query, context)
        print(f"✅ Response:\n{response[:300]}...")
        print(f"\n✅ Success! Response length: {len(response)} characters")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("=" * 60)

print("\n✅ AI Service test complete!")
