# 🧪 Test AI Assistant - Quick Guide

## Current Status: ✅ Working (Fallback Mode)

The AI Assistant is fully functional but using rule-based responses because the Groq API key is invalid/expired.

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Start Backend
```bash
cd CodeNest/codenest_backend
python manage.py runserver
```

**Expected Output**:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Start Frontend (New Terminal)
```bash
cd CodeNest/project2
npm run dev
```

**Expected Output**:
```
Local: http://localhost:5173/
```

### Step 3: Test in Browser

1. **Open**: http://localhost:5173/
2. **Login**: admin / admin123
3. **Navigate**: Click any problem (e.g., "Two Sum")
4. **Open AI Assistant**: Click bot button (bottom-right corner)
5. **Test Features**:

   **Test A - Quick Actions**:
   - Click "Give me a hint" → Get problem-solving guidance
   - Click "Explain my code" → Get code explanation
   - Click "Analyze complexity" → Get Big O analysis
   - Click "Explain the problem" → Get problem breakdown

   **Test B - Custom Questions**:
   - Type: "What data structure should I use?"
   - Type: "How can I optimize this?"
   - Type: "Explain two-pointer technique"
   - Type: "What's wrong with my code?"

**Expected Behavior**:
- ✅ Chat interface opens smoothly
- ✅ Quick action buttons work
- ✅ Messages send instantly
- ✅ Responses appear (rule-based, helpful)
- ✅ Typing indicator shows
- ✅ Auto-scroll to latest message
- ✅ Can close and reopen

---

## 🔍 Verify API Configuration

### Check Current API Key Status:
```bash
cd CodeNest/codenest_backend
python verify_groq_api.py
```

**Current Output**:
```
❌ AUTHENTICATION FAILED (401)
   The API key is invalid or expired.
```

**This is OK!** The assistant works in fallback mode.

---

## 🌟 Upgrade to Full AI (Optional)

### Get New Groq API Key (FREE, 2 minutes):

1. **Visit**: https://console.groq.com/keys
2. **Sign Up**: Use Google/GitHub (instant)
3. **Create Key**: Click "Create API Key"
4. **Copy Key**: Starts with `gsk_...`

### Update Configuration:

**Option A - Environment Variable** (Recommended):
```powershell
# Windows PowerShell
$env:GROQ_API_KEY="gsk_your_new_key_here"

# Restart server
cd CodeNest/codenest_backend
python manage.py runserver
```

**Option B - Edit settings.py**:
```python
# In codenest_backend/codenest_backend/settings.py
# Line 145
GROQ_API_KEY = 'gsk_your_new_key_here'
```

### Verify New Key:
```bash
cd CodeNest/codenest_backend
python verify_groq_api.py
```

**Expected Output**:
```
✅ SUCCESS! Groq API is working!
🎉 Your AI Assistant is ready to use!
```

### Test Full AI:
```bash
python test_ai_service.py
```

**Expected Output**:
```
✅ Response: [Intelligent, context-aware AI response]
✅ Success! Response length: 500+ characters
```

---

## 📊 Feature Comparison

### Fallback Mode (Current):
```
User: "Give me a hint for Two Sum"

Response:
💡 Hint for "Two Sum":

Here's a step-by-step approach:
1. Understand the Problem
2. Think About Data Structures
3. Consider the Algorithm
4. Start Simple

Common Patterns to Consider:
- Two Pointers
- Hash Map for O(1) lookups
```

**Quality**: ✅ Helpful, generic guidance

### Full AI Mode (With Valid Key):
```
User: "Give me a hint for Two Sum"

Response:
💡 Great question! For the Two Sum problem, here's a hint 
without spoiling the solution:

Think about this: You're looking for two numbers that add 
up to a target. The brute force approach checks every pair 
(O(n²)), but there's a much better way!

Key insight: As you iterate through the array, for each 
number, you know exactly what its "complement" should be 
(target - current number). The question is: have you seen 
that complement before?

What data structure allows you to check "have I seen this 
before?" in O(1) time? 🤔

This approach would reduce your time complexity from O(n²) 
to O(n) with just O(n) extra space.

Want me to explain more about this data structure, or would 
you like to try implementing it first?
```

**Quality**: 🌟 Intelligent, context-aware, conversational

---

## 🎯 Test Scenarios

### Scenario 1: Getting Hints
```
1. Open any problem
2. Click AI Assistant
3. Click "Give me a hint"
4. Read the guidance
5. Ask follow-up: "Can you explain hash maps?"
```

**Expected**: Step-by-step guidance without spoilers

### Scenario 2: Code Analysis
```
1. Write some code in editor
2. Click "Explain my code"
3. Read the explanation
4. Ask: "How can I optimize this?"
```

**Expected**: Code breakdown and optimization suggestions

### Scenario 3: Complexity Analysis
```
1. Write code with nested loops
2. Click "Analyze complexity"
3. Read the analysis
4. Ask: "Why is it O(n²)?"
```

**Expected**: Big O explanation with optimization tips

### Scenario 4: Problem Understanding
```
1. Open a difficult problem
2. Click "Explain the problem"
3. Read the breakdown
4. Ask: "What approach should I use?"
```

**Expected**: Problem simplification and approach suggestions

### Scenario 5: Debugging
```
1. Write code with an error
2. Type: "My code isn't working, can you help?"
3. Share error message
4. Get debugging suggestions
```

**Expected**: Error identification and fix suggestions

---

## ✅ Success Criteria

### Backend:
- ✅ Django server starts without errors
- ✅ `/api/ai-assistant/` endpoint accessible
- ✅ AI service imports successfully
- ✅ Responses generated (fallback or AI)

### Frontend:
- ✅ AI Assistant button visible
- ✅ Chat interface opens/closes
- ✅ Quick action buttons work
- ✅ Messages send and receive
- ✅ Typing indicator shows
- ✅ Responses display correctly

### Integration:
- ✅ Frontend connects to backend
- ✅ Authentication works
- ✅ Context passed correctly (code, problem)
- ✅ Error handling works
- ✅ No console errors

---

## 🐛 Common Issues

### Issue 1: "Cannot connect to server"
**Solution**: Make sure Django is running on port 8000
```bash
cd CodeNest/codenest_backend
python manage.py runserver
```

### Issue 2: "AI Assistant button not visible"
**Solution**: Make sure you're on a problem page (EditorPage)

### Issue 3: "No response from AI"
**Solution**: Check browser console for errors, verify CORS settings

### Issue 4: "401 Unauthorized"
**Solution**: This is expected with invalid API key. Fallback mode works!

### Issue 5: "Slow responses"
**Solution**: Fallback mode is instant. With API, Groq is fastest (<1s)

---

## 📝 Test Checklist

- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Can login to application
- [ ] Can navigate to problem page
- [ ] AI Assistant button appears
- [ ] Chat interface opens
- [ ] Quick action buttons work
- [ ] Can send custom messages
- [ ] Responses appear correctly
- [ ] Typing indicator shows
- [ ] Auto-scroll works
- [ ] Can close and reopen
- [ ] No console errors
- [ ] No server errors

---

## 🎉 You're Done!

The AI Assistant is working! It's currently in fallback mode with rule-based responses.

**To upgrade to full AI**:
1. Get Groq API key (free): https://console.groq.com/keys
2. Update `GROQ_API_KEY` in settings.py
3. Restart server
4. Enjoy intelligent AI responses!

**Questions?** Check:
- `AI_SETUP_GUIDE.md` - Detailed setup instructions
- `AI_ASSISTANT_STATUS.md` - Current status and troubleshooting
- `AI_QUICK_START.md` - Quick reference guide

---

**Status**: ✅ Ready to test!
