# 🤖 AI Assistant Setup Guide

**Get Real-Time AI Responses with API Keys!**

---

## 🎯 Overview

The AI Assistant now supports **real AI integration** with multiple providers:

1. **Groq** (Recommended) - Fast, Free, High Quality
2. **OpenAI GPT** - Industry Standard
3. **Google Gemini** - Google's AI

The system automatically tries providers in order and falls back to rule-based responses if no API key is configured.

---

## 🚀 Quick Setup (Recommended: Groq)

### Option 1: Groq (FREE & FAST) ⭐

**Why Groq?**
- ✅ Completely FREE
- ✅ Very fast responses (< 1 second)
- ✅ High quality (Llama 3.1 70B model)
- ✅ No credit card required
- ✅ Generous rate limits

**Steps:**

1. **Get API Key**:
   - Visit: https://console.groq.com/
   - Sign up with Google/GitHub
   - Go to "API Keys" section
   - Click "Create API Key"
   - Copy the key (starts with `gsk_...`)

2. **Configure in CodeNest**:

   **Method A: Environment Variable (Recommended)**
   ```bash
   # Windows (PowerShell)
   $env:GROQ_API_KEY="gsk_your_actual_key_here"
   
   # Windows (CMD)
   set GROQ_API_KEY=gsk_your_actual_key_here
   
   # Linux/Mac
   export GROQ_API_KEY="gsk_your_actual_key_here"
   ```

   **Method B: Direct in settings.py**
   ```python
   # In codenest_backend/codenest_backend/settings.py
   GROQ_API_KEY = 'gsk_your_actual_key_here'
   ```

3. **Restart Server**:
   ```bash
   cd CodeNest/codenest_backend
   python manage.py runserver
   ```

4. **Test**:
   - Open any problem
   - Click AI Assistant
   - Ask a question
   - Get intelligent AI response! 🎉

---

## 🔧 Alternative Options

### Option 2: OpenAI GPT

**Pros:**
- Industry standard
- Very high quality
- GPT-3.5 or GPT-4

**Cons:**
- Requires payment
- Slower than Groq
- Need credit card

**Steps:**

1. **Get API Key**:
   - Visit: https://platform.openai.com/
   - Sign up and add payment method
   - Go to API Keys
   - Create new key

2. **Configure**:
   ```bash
   # Environment variable
   export OPENAI_API_KEY="sk-your_key_here"
   
   # Or in settings.py
   OPENAI_API_KEY = 'sk-your_key_here'
   ```

3. **Cost**: ~$0.002 per request (very cheap)

---

### Option 3: Google Gemini

**Pros:**
- Free tier available
- Good quality
- Google's latest AI

**Cons:**
- Slower than Groq
- More complex setup

**Steps:**

1. **Get API Key**:
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Create API key

2. **Configure**:
   ```bash
   # Environment variable
   export GEMINI_API_KEY="your_key_here"
   
   # Or in settings.py
   GEMINI_API_KEY = 'your_key_here'
   ```

---

## 📝 Complete Setup Example

### Using Groq (Recommended):

1. **Get Groq API Key**:
   ```
   Visit: https://console.groq.com/
   Sign up → API Keys → Create → Copy key
   ```

2. **Set Environment Variable**:
   ```powershell
   # Windows PowerShell
   $env:GROQ_API_KEY="gsk_abc123xyz..."
   ```

3. **Start Backend**:
   ```bash
   cd CodeNest/codenest_backend
   python manage.py runserver
   ```

4. **Start Frontend**:
   ```bash
   cd CodeNest/project2
   npm run dev
   ```

5. **Test AI Assistant**:
   - Navigate to any problem
   - Click bot button (bottom-right)
   - Ask: "Give me a hint"
   - Get intelligent AI response!

---

## 🧪 Testing AI Integration

### Test 1: Check if API Key is Working

```python
# In Django shell
python manage.py shell

from api.ai_service import AIService

context = {
    'code': 'def twoSum(nums, target): pass',
    'language': 'python',
    'problemTitle': 'Two Sum'
}

response = AIService.get_ai_response("Give me a hint", context)
print(response)
```

### Test 2: Frontend Testing

1. Open problem page
2. Click AI Assistant
3. Try these questions:
   - "Give me a hint for this problem"
   - "Explain my code"
   - "What's the time complexity?"
   - "How do I solve this?"

### Expected Behavior:

**With API Key:**
- Intelligent, context-aware responses
- Detailed explanations
- Code-specific analysis
- Natural language

**Without API Key:**
- Rule-based responses
- General guidance
- Still helpful but less detailed
- Note about configuring API key

---

## 🔒 Security Best Practices

### 1. Use Environment Variables

**DON'T** commit API keys to Git:
```python
# ❌ BAD
GROQ_API_KEY = 'gsk_abc123...'  # Don't do this!
```

**DO** use environment variables:
```python
# ✅ GOOD
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', 'your-api-key-here')
```

### 2. Add to .gitignore

```gitignore
# .env file
.env
.env.local

# Settings with keys
*_local.py
```

### 3. Use .env File

Create `.env` file in backend directory:
```env
GROQ_API_KEY=gsk_your_key_here
OPENAI_API_KEY=sk_your_key_here
GEMINI_API_KEY=your_key_here
```

Install python-dotenv:
```bash
pip install python-dotenv
```

Load in settings.py:
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## 📊 API Provider Comparison

| Provider | Cost | Speed | Quality | Setup | Recommended |
|----------|------|-------|---------|-------|-------------|
| **Groq** | FREE | ⚡⚡⚡ | ⭐⭐⭐⭐ | Easy | ✅ YES |
| OpenAI | $0.002/req | ⚡⚡ | ⭐⭐⭐⭐⭐ | Easy | For production |
| Gemini | FREE tier | ⚡ | ⭐⭐⭐⭐ | Medium | Alternative |

---

## 🎯 Features with AI Integration

### What AI Can Do:

1. **Intelligent Hints**:
   - Analyzes the specific problem
   - Provides step-by-step guidance
   - Suggests optimal approaches
   - Doesn't spoil the solution

2. **Code Analysis**:
   - Understands your actual code
   - Explains line by line
   - Identifies issues
   - Suggests improvements

3. **Complexity Analysis**:
   - Calculates exact Big O
   - Explains why
   - Suggests optimizations
   - Compares approaches

4. **Debugging**:
   - Identifies errors
   - Suggests fixes
   - Explains root cause
   - Prevents future issues

5. **Concept Explanation**:
   - Explains any concept
   - Provides examples
   - Relates to problem
   - Interactive learning

---

## 🐛 Troubleshooting

### Issue 1: "No AI response"

**Solution:**
- Check API key is set correctly
- Verify internet connection
- Check Django logs for errors
- Try fallback responses

### Issue 2: "API key invalid"

**Solution:**
- Regenerate API key
- Check for typos
- Ensure no extra spaces
- Verify key format (gsk_ for Groq, sk- for OpenAI)

### Issue 3: "Rate limit exceeded"

**Solution:**
- Wait a few minutes
- Use different provider
- Upgrade API plan
- Implement caching

### Issue 4: "Slow responses"

**Solution:**
- Use Groq (fastest)
- Check internet speed
- Reduce max_tokens
- Implement timeout

---

## 💡 Tips for Best Results

### 1. Be Specific

**Good:**
```
"Can you explain the two-pointer approach for this problem?"
```

**Better:**
```
"I'm trying to solve Two Sum. Can you explain how to use a hash map 
to achieve O(n) time complexity?"
```

### 2. Provide Context

- Share your code
- Mention what you've tried
- Explain where you're stuck
- Ask specific questions

### 3. Follow Up

- Ask clarifying questions
- Request examples
- Dig deeper into concepts
- Build on previous answers

---

## 📈 Usage Limits

### Groq (Free):
- 30 requests per minute
- 14,400 requests per day
- More than enough for learning!

### OpenAI (Paid):
- Depends on your plan
- ~$0.002 per request
- Very affordable

### Gemini (Free):
- 60 requests per minute
- Good for moderate use

---

## 🎉 Success!

Once configured, your AI Assistant will:

✅ Provide intelligent, context-aware responses  
✅ Understand your specific code and problem  
✅ Give detailed explanations and hints  
✅ Help debug and optimize  
✅ Teach concepts interactively  
✅ Respond in < 1 second (with Groq)  

---

## 📞 Need Help?

If you encounter issues:

1. Check Django logs: `python manage.py runserver`
2. Test API key in Django shell
3. Verify environment variables
4. Check internet connection
5. Try different provider

---

## 🚀 Ready to Go!

**Recommended Setup:**

1. Get Groq API key (FREE): https://console.groq.com/
2. Set environment variable: `$env:GROQ_API_KEY="gsk_..."`
3. Restart server
4. Test AI Assistant
5. Enjoy intelligent responses! 🎉

---

**Status**: AI Assistant ready for real-time intelligent responses! 🤖✨
