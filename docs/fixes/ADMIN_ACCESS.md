# 🔐 Admin Dashboard Access

## ✅ Admin Account Created!

Your admin account is ready to use.

---

## 🌐 Access Information

### Admin Panel
- **URL**: http://localhost:8000/admin/
- **Username**: `admin`
- **Password**: `admin123`

### Frontend Login
- **URL**: http://localhost:5173/login
- **Username**: `admin`
- **Password**: `admin123`

---

## 📊 What You Can Do in Admin Panel

### User Management
- View all registered users
- Edit user profiles
- Change user roles (student/teacher)
- View user statistics
- Manage user permissions

### Problem Management
- Add new problems
- Edit existing problems
- Delete problems
- Manage test cases
- Set difficulty levels
- Add tags and topics

### Submission Tracking
- View all submissions
- Filter by user, problem, status
- Check execution times
- Review code submissions

### Contest Management
- Create contexts (problem sets)
- Assign problems to contexts
- Set start/end times
- Target specific batches/branches

### Notifications
- Send notifications to users
- Broadcast announcements
- Target specific groups

### Analytics
- View platform statistics
- Monitor user activity
- Track problem solve rates
- Generate reports

---

## 🎓 Creating Additional Accounts

### Create Another Admin
```bash
cd codenest_backend
venv\Scripts\activate
python manage.py createsuperuser
```

### Create Teacher Account
1. Register at http://localhost:5173
2. Use registration code: `TEACHER2024`
3. Account will have teacher privileges

### Create Student Account
1. Register at http://localhost:5173
2. No special code needed
3. Account will have student privileges

---

## 🔧 Quick Admin Tasks

### Add Sample Problems
1. Go to http://localhost:8000/admin/
2. Click "Problems"
3. Click "Add Problem"
4. Fill in details:
   - Title
   - Difficulty (Easy/Medium/Hard)
   - Topic (Arrays, DP, Graphs, etc.)
   - Platform (LeetCode, CodeChef, etc.)
   - Description
   - Examples
   - Test cases

### Create a Context (Assignment)
1. Go to "Contexts"
2. Click "Add Context"
3. Set:
   - Title
   - Description
   - Start/End time
   - Target batch/branch
4. Add problems to context

### View Student Progress
1. Go to "User profiles"
2. Click on any student
3. View their:
   - Problems solved
   - Accuracy
   - Active days
   - Linked accounts

---

## 🚀 API Access

### Get Auth Token
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codenest.com","password":"admin123"}'
```

### Use Token in Requests
```bash
curl -X GET http://localhost:8000/api/problems/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 Security Notes

### For Development
- Current credentials are fine
- Easy to remember
- Quick access for testing

### For Production
**IMPORTANT**: Change these credentials!

```bash
# Create new admin with strong password
python manage.py createsuperuser

# Then delete the default admin
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.get(username='admin').delete()
```

---

## 📱 Mobile/Remote Access

If you want to access from another device on your network:

1. Find your IP address:
```bash
ipconfig  # Windows
ifconfig  # Linux/Mac
```

2. Update settings.py:
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'YOUR_IP_ADDRESS']
```

3. Start server:
```bash
python manage.py runserver 0.0.0.0:8000
```

4. Access from other device:
```
http://YOUR_IP_ADDRESS:8000/admin/
```

---

## 🆘 Troubleshooting

### Can't Login?
- Check username is `admin` (lowercase)
- Check password is `admin123`
- Clear browser cache
- Try incognito/private mode

### Forgot Password?
```bash
cd codenest_backend
venv\Scripts\activate
python manage.py changepassword admin
```

### Need to Reset Everything?
```bash
# Delete database
del db.sqlite3

# Recreate
python manage.py migrate
python create_admin_quick.py
```

---

## 📊 Admin Dashboard Features

### Current Features
✅ User management
✅ Problem management
✅ Submission tracking
✅ Context creation
✅ Notification system
✅ Basic analytics

### Coming Soon (See ENHANCEMENT_ROADMAP.md)
- Real-time monitoring
- Advanced analytics
- Export reports
- Bulk operations
- Custom dashboards
- Performance metrics

---

## 🎯 Quick Actions

### Most Common Tasks
1. **Add a problem**: Admin → Problems → Add
2. **View submissions**: Admin → Submissions
3. **Create assignment**: Admin → Contexts → Add
4. **Send notification**: Admin → Notifications → Add
5. **View users**: Admin → Users

---

## 📚 Related Documentation

- **ENHANCEMENT_ROADMAP.md** - Future features
- **QUICK_WINS.md** - Easy improvements
- **README.md** - Full documentation
- **QUICK_REFERENCE.md** - Command reference

---

**You're all set!** Login and start managing your platform! 🚀
