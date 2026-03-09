"""
Test AI Assistant Endpoint with Real HTTP Request
"""
import requests
import json

print("🧪 Testing AI Assistant Endpoint (Live)")
print("=" * 60)

# First, login to get token
print("\n1️⃣ Logging in...")
login_url = "http://localhost:8000/api/token/"
login_data = {
    "username": "admin",
    "password": "admin123"
}

try:
    login_response = requests.post(login_url, json=login_data, timeout=5)
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        access_token = token_data['access']
        print(f"✅ Login successful!")
        print(f"   Token: {access_token[:20]}...")
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        print(f"\n⚠️ Make sure Django server is running:")
        print(f"   cd CodeNest/codenest_backend")
        print(f"   python manage.py runserver")
        exit(1)
        
except requests.exceptions.ConnectionError:
    print(f"❌ Cannot connect to server!")
    print(f"\n⚠️ Please start Django server first:")
    print(f"   cd CodeNest/codenest_backend")
    print(f"   python manage.py runserver")
    exit(1)

# Now test AI assistant endpoint
print("\n2️⃣ Testing AI Assistant endpoint...")
ai_url = "http://localhost:8000/api/ai-assistant/"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

test_data = {
    "query": "Give me a hint for solving Two Sum problem",
    "context": {
        "code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]",
        "language": "python",
        "problemTitle": "Two Sum",
        "problemDescription": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    }
}

print(f"   Query: {test_data['query']}")
print(f"   Context: {test_data['context']['problemTitle']}")

try:
    ai_response = requests.post(ai_url, json=test_data, headers=headers, timeout=30)
    
    print(f"\n✅ Response Status: {ai_response.status_code}")
    
    if ai_response.status_code == 200:
        response_data = ai_response.json()
        ai_text = response_data.get('response', '')
        
        print(f"✅ AI Response received!")
        print(f"   Length: {len(ai_text)} characters")
        print(f"\n📝 Response Preview:")
        print("-" * 60)
        print(ai_text[:500] + "..." if len(ai_text) > 500 else ai_text)
        print("-" * 60)
        print(f"\n🎉 AI Assistant endpoint is working perfectly!")
        
    else:
        print(f"❌ Error: {ai_response.status_code}")
        print(f"   Response: {ai_response.text}")
        
except Exception as e:
    print(f"\n❌ Exception occurred:")
    print(f"   Type: {type(e).__name__}")
    print(f"   Message: {str(e)}")

print("\n" + "=" * 60)
print("\n💡 If you see errors:")
print("   1. Make sure Django server is running")
print("   2. Check that admin/admin123 credentials are correct")
print("   3. Verify Groq API key is configured")
print("   4. Check Django logs for detailed errors")
