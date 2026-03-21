# 🤖 AI Assistant - Quick Reference Card

## ⚡ Quick Start (30 Seconds)

```bash
# Terminal 1 - Backend
cd CodeNest/codenest_backend
python manage.py runserver

# Terminal 2 - Frontend
cd CodeNest/project2
npm run dev

# Browser
http://localhost:5173/ → Login → Open Problem → Click Bot Icon
```

---

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Working | Endpoint: `/api/ai-assistant/` |
| Frontend UI | ✅ Working | Beautiful chat interface |
| Integration | ✅ Working | Full communication |
| Groq API | ⚠️ Invalid Key | Falls back to rule-based |
| Fallback Mode | ✅ Working | Helpful responses |

**Bottom Line**: Everything works! Get new API key for full AI.

---

## 🔑 Fix API Key (2 Minutes)

```bash
# 1. Get Key (FREE)
Visit: https://console.groq.com/keys

# 2. Set Key
$env:GROQ_API_KEY="gsk_your_new_key_here"

# 3. Restart
cd CodeNest/codenest_backend
python manage.py runserver

# 4. Verify
python verify_groq_api.py
```

---

## 🧪 Quick Tests

### Test 1: Verify API Key
```bash
cd CodeNest/codenest_backend
python verify_groq_api.py
```
**Expected**: ✅ SUCCESS! or ❌ 401 (need new key)

### Test 2: Test AI Service
```bash
python test_ai_service.py
```
**Expected**: ✅ Responses generated

### Test 3: Frontend
```
1. Open http://localhost:5173/
2. Login: admin / admin123
3. Click any problem
4. Click bot button (bottom-right)
5. Try "Give me a hint"
```
**Expected**: Chat opens, response appears

---

## 💡 Quick Actions

| Button | What It Does |
|--------|--------------|
| 💡 Give me a hint | Problem-solving guidance |
| 📝 Explain my code | Code breakdown |
| ⚡ Analyze complexity | Big O analysis |
| 📚 Explain the problem | Problem simplification |

---

## 📁 Key Files

### Backend:
- `api/ai_service.py` - AI logic
- `api/views.py` - API endpoint (line 1816)
- `api/urls.py` - Route config
- `settings.py` - API keys (line 145)

### Frontend:
- `Components/AIAssistant.jsx` - Chat UI
- `styles1/AIAssistant.css` - Styling
- `Pages/EditorPage.jsx` - Integration

### Testing:
- `verify_groq_api.py` - Check API key
- `test_ai_service.py` - Test service

### Docs:
- `AI_SETUP_GUIDE.md` - Full setup
- `AI_ASSISTANT_STATUS.md` - Status
- `TEST_AI_ASSISTANT.md` - Testing
- `AI_CHATBOT_IMPLEMENTATION_COMPLETE.md` - Complete docs

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Server error | Check Django running on :8000 |
| No response | Check browser console |
| 401 Error | Get new Groq API key |
| Slow | Use Groq (fastest) |
| CORS | Check CORS_ALLOWED_ORIGINS |

---

## 📊 Response Modes

### Fallback (Current):
- ⚡ Instant (< 100ms)
- 💰 Free
- ✅ Helpful
- ⚠️ Generic

### Full AI (With Key):
- ⚡ Fast (< 1s)
- 💰 Free (Groq)
- ✅ Intelligent
- 🌟 Context-aware

---

## 🎯 Usage Examples

### Get Hint:
```
Click "Give me a hint"
→ Step-by-step guidance
```

### Analyze Code:
```
Write code → Click "Explain my code"
→ Code breakdown
```

### Check Complexity:
```
Click "Analyze complexity"
→ Big O analysis
```

### Ask Question:
```
Type: "What's a hash map?"
→ Concept explanation
```

---

## ✅ Success Checklist

- [ ] Backend running (port 8000)
- [ ] Frontend running (port 5173)
- [ ] Can login
- [ ] Bot button visible
- [ ] Chat opens
- [ ] Quick actions work
- [ ] Messages send/receive
- [ ] No errors

---

## 🚀 Next Steps

1. **Test Now**: Follow Quick Start above
2. **Get API Key**: Visit console.groq.com (optional)
3. **Enjoy**: Use AI Assistant while coding!

---

## 📞 Need Help?

- Check `AI_SETUP_GUIDE.md` for detailed setup
- Check `AI_ASSISTANT_STATUS.md` for troubleshooting
- Run `python verify_groq_api.py` to check API
- Check Django logs for errors

---

**Status**: ✅ Ready to use!  
**Mode**: Fallback (Upgradeable)  
**Action**: Test it now! 🚀
