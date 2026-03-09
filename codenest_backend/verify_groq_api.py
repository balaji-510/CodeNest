"""
Verify Groq API Key
"""
import os
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.conf import settings

print("🔍 Verifying Groq API Configuration\n")
print("=" * 60)

# Check if API key is set
api_key = settings.GROQ_API_KEY
print(f"✅ API Key found: {api_key[:20]}...{api_key[-10:]}")
print(f"   Length: {len(api_key)} characters")
print(f"   Starts with 'gsk_': {api_key.startswith('gsk_')}")

# Test API key with a simple request
print("\n🧪 Testing API key with Groq...")
print("-" * 60)

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "user", "content": "Say 'Hello, CodeNest!' if you can read this."}
    ],
    "max_tokens": 50
}

try:
    response = requests.post(url, headers=headers, json=data, timeout=10)
    
    if response.status_code == 200:
        result = response.json()
        message = result['choices'][0]['message']['content']
        print(f"✅ SUCCESS! Groq API is working!")
        print(f"   Response: {message}")
        print(f"\n🎉 Your AI Assistant is ready to use!")
    elif response.status_code == 401:
        print(f"❌ AUTHENTICATION FAILED (401)")
        print(f"   The API key is invalid or expired.")
        print(f"\n📝 To fix this:")
        print(f"   1. Visit: https://console.groq.com/keys")
        print(f"   2. Create a new API key")
        print(f"   3. Update settings.py with the new key:")
        print(f"      GROQ_API_KEY = 'gsk_your_new_key_here'")
        print(f"\n   OR set environment variable:")
        print(f"      $env:GROQ_API_KEY='gsk_your_new_key_here'")
    elif response.status_code == 429:
        print(f"❌ RATE LIMIT EXCEEDED (429)")
        print(f"   Too many requests. Wait a moment and try again.")
    else:
        print(f"❌ ERROR: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
except requests.exceptions.Timeout:
    print(f"❌ TIMEOUT: Request took too long")
    print(f"   Check your internet connection")
except requests.exceptions.ConnectionError:
    print(f"❌ CONNECTION ERROR")
    print(f"   Cannot reach Groq API. Check internet connection.")
except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {str(e)}")

print("\n" + "=" * 60)
print("\n💡 Note: Even without a valid API key, the AI Assistant")
print("   will work using rule-based responses (fallback mode).")
print("\n   For intelligent AI responses, configure a valid API key.")
