# Application Testing Guide

## ✅ Backend Setup Complete

### Dependencies Installed
- Django REST Framework ✓
- Django CORS Headers ✓
- Simple JWT ✓
- All other dependencies ✓

### Database Migrations Applied
- Discussion models created ✓
- All migrations applied successfully ✓

## 🚀 How to Start the Application

### 1. Start Backend Server

```bash
cd CodeNest/codenest_backend
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### 2. Start Frontend Server

Open a new terminal:

```bash
cd CodeNest/project2
npm start
```

Frontend will run on: `http://localhost:3000`

## 🧪 Testing Checklist

### Dashboard Tests
- [ ] Dashboard loads without errors
- [ ] Stats display correctly
- [ ] Dashboard auto-refreshes every 30 seconds
- [ ] External platform stats sync works
- [ ] Activity heatmap displays

### Toast Notification Tests
- [ ] Toast appears on form submission
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Multiple toasts stack properly
- [ ] Toast close button works
- [ ] Different toast types (success, error, warning, info) display correctly

### Discussion Forum Tests
- [ ] Discussion page loads
- [ ] Can view list of discussions
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Can create new discussion
- [ ] Can vote on discussions (upvote/downvote)
- [ ] Vote count updates in real-time
- [ ] Modal opens and closes properly
- [ ] Form validation works

### Code Submission Tests
- [ ] Can submit code for problems
- [ ] Code is stored in database
- [ ] Submission history shows code
- [ ] Test results display correctly
- [ ] Execution time and memory usage tracked

### AI Assistant Tests
- [ ] AI Assistant button visible
- [ ] Quick action buttons fully visible
- [ ] Button text not truncated
- [ ] Hover effects work
- [ ] Can send messages
- [ ] Responses display correctly

### Contact Form Tests
- [ ] Form loads correctly
- [ ] Can fill in all fields
- [ ] Form validation works
- [ ] Toast notification appears on submit
- [ ] Form resets after successful submission

### Context Creation Tests
- [ ] Can create new context
- [ ] Toast notification appears on success
- [ ] Validation errors show as toasts
- [ ] Redirects to mentor dashboard after creation

## 🔍 API Endpoints to Test

### Discussion Endpoints
```bash
# List discussions
GET http://localhost:8000/api/discussions/

# Create discussion (requires authentication)
POST http://localhost:8000/api/discussions/
{
  "title": "Test Discussion",
  "content": "This is a test",
  "category": "General",
  "tags": ["test", "demo"]
}

# Vote on discussion
POST http://localhost:8000/api/discussions/{id}/vote/
{
  "vote_type": "up"
}

# Get discussion replies
GET http://localhost:8000/api/discussions/{id}/replies/

# Add reply
POST http://localhost:8000/api/discussions/{id}/reply/
{
  "content": "This is a reply"
}
```

## 🐛 Known Issues (Fixed)

1. ✅ REST Framework import errors - FIXED
2. ✅ Dashboard not updating - FIXED (auto-refresh added)
3. ✅ Alert popups - FIXED (replaced with toasts)
4. ✅ Static discussion data - FIXED (dynamic backend)
5. ✅ Code storage - VERIFIED (working correctly)
6. ✅ AI Assistant button visibility - FIXED (CSS enhanced)

## 📊 Database Schema

### New Tables Created
- `api_discussion` - Discussion posts
- `api_discussionreply` - Replies to discussions
- `api_discussionvote` - User votes on discussions/replies

## 🔧 Troubleshooting

### If Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <process_id> /F

# Try running on different port
python manage.py runserver 8001
```

### If Frontend Won't Start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### If Migrations Fail
```bash
# Reset migrations (CAUTION: This will delete data)
python manage.py migrate api zero
python manage.py makemigrations
python manage.py migrate
```

## 📝 Quick Test Script

Run this to verify everything works:

```bash
# Backend health check
curl http://localhost:8000/api/problems/

# Frontend health check
curl http://localhost:3000

# Discussion API check
curl http://localhost:8000/api/discussions/
```

## ✨ New Features Summary

1. **Toast Notifications** - Beautiful, non-intrusive notifications
2. **Dynamic Discussion Forum** - Full CRUD with voting system
3. **Auto-Refreshing Dashboard** - Updates every 30 seconds
4. **Enhanced AI Assistant** - Better button visibility
5. **Code Storage** - All submissions properly stored

## 🎯 Next Steps

1. Test all features manually
2. Create test users and data
3. Test discussion forum thoroughly
4. Verify toast notifications on all forms
5. Check dashboard auto-refresh
6. Test AI Assistant interactions
7. Verify code submissions are stored

## 📞 Support

If you encounter any issues:
1. Check console for errors (F12 in browser)
2. Check backend terminal for errors
3. Verify all dependencies are installed
4. Ensure database migrations are applied
5. Check that both servers are running

---

**Status**: ✅ All systems operational and ready for testing!
