"""
Quick test script to verify AI integration
Run this to test if Groq API is working
"""

import os
import sys

# Add the backend to path
sys.path.insert(0, 'codenest_backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
import django
django.setup()

from api.ai_service import AIService

def test_ai_service():
    """Test the AI service with a simple query"""
    
    print("🤖 Testing AI Service...")
    print("-" * 50)
    
    # Test context
    context = {
        'code': '''
def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
        ''',
        'language': 'python',
        'problemTitle': 'Two Sum',
        'problemDescription': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
    }
    
    # Test query
    query = "Can you analyze the time complexity of my code and suggest an optimization?"
    
    print(f"\n📝 Query: {query}\n")
    print("⏳ Getting AI response...\n")
    
    try:
        response = AIService.get_ai_response(query, context)
        print("✅ AI Response:")
        print("-" * 50)
        print(response)
        print("-" * 50)
        print("\n🎉 AI Service is working!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\n⚠️ Make sure:")
        print("1. Groq API key is configured in settings.py")
        print("2. Internet connection is available")
        print("3. requests library is installed")

if __name__ == "__main__":
    test_ai_service()
