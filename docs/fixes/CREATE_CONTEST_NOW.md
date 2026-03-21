# Create Contest NOW - Ultra Simple Guide

## ✅ Backend is Ready!
Your backend is working perfectly. Follow these exact steps:

---

## 🚀 5-Minute Guide

### 1. Open Browser
```
http://localhost:5173/create-contest
```

### 2. Login (if not logged in)
```
Username: Teacher_Balaji
Password: (your password)
```

### 3. Fill This Exact Form

**Title**:
```
Weekly Contest #2
```

**Description**:
```
Programming contest for students
```

**Start Time**:
```
Click the input → Select tomorrow → Select 10:00 AM
Result: 2026-03-12T10:00
```

**End Time**:
```
Click the input → Select tomorrow → Select 12:00 PM
Result: 2026-03-12T12:00
```

**Duration**:
```
120
```

**Problems**:
```
1. Click "Add Problems" button
2. Click on "Two Sum"
3. Click on "Contains Duplicate"
4. Click on "Valid Anagram"
Result: 3 problems selected
```

**Public Contest**:
```
✓ Check the box
```

### 4. Click Button
```
[Create Contest]
```

### 5. Expected Result
```
✅ Green toast: "Contest created successfully!"
✅ Redirects to contests page
✅ See "Weekly Contest #2" in list
```

---

## ❌ If It Fails

### Check Browser Console (F12)
1. Press F12
2. Go to Console tab
3. Look for red errors
4. Share the error message

### Check Network Tab (F12)
1. Press F12
2. Go to Network tab
3. Click "Create Contest" again
4. Look for POST request to `/api/contests/`
5. Check the response

### Common Issues

**"End time must be after start time"**
- Make sure end time (12:00 PM) is AFTER start time (10:00 AM)

**"Please select at least one problem"**
- Click "Add Problems" and select at least 1 problem

**"Only teachers can create contests"**
- Make sure you're logged in as Teacher_Balaji

**"Failed to fetch" or "Network error"**
- Make sure backend is running on port 8000
- Check: http://localhost:8000/api/contests/

---

## 🔧 Quick Fixes

### Backend Not Running?
```bash
cd CodeNest/codenest_backend
python manage.py runserver
```

### Frontend Not Running?
```bash
cd CodeNest/project2
npm run dev
```

### Clear Cache
```
Press: Ctrl + Shift + R (Windows)
Press: Cmd + Shift + R (Mac)
```

---

## 📋 Copy-Paste Values

Use these exact values:

```
Title: Weekly Contest #2
Description: Programming contest for students
Start: Tomorrow 10:00 AM
End: Tomorrow 12:00 PM
Duration: 120
Problems: Two Sum, Contains Duplicate, Valid Anagram
Public: Yes
```

---

## ✅ Success Looks Like This

After clicking "Create Contest":

1. **Toast Notification** (top-right corner):
   ```
   ┌─────────────────────────────────┐
   │ ✅ Contest created successfully!│
   └─────────────────────────────────┘
   ```

2. **Automatic Redirect**:
   ```
   URL changes to: /contests-management
   ```

3. **Contest Appears**:
   ```
   ┌─────────────────────────────────────┐
   │ Weekly Contest #2                   │
   │ [Upcoming]                          │
   │ Start: Mar 12, 2026 10:00          │
   │ Duration: 120 minutes               │
   │ Problems: 3                         │
   │ Participants: 0                     │
   └─────────────────────────────────────┘
   ```

---

## 🎯 That's It!

If you follow these exact steps, it will work. The backend is confirmed working.

If it still doesn't work, share:
1. Screenshot of the form
2. Error message from browser console
3. Network response from F12 → Network tab

Good luck! 🚀
