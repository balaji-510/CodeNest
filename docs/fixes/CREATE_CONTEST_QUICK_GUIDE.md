# Quick Guide: Create Contest Using Frontend

## 🚀 Step-by-Step Instructions

### Step 1: Login as Teacher
1. Open browser: `http://localhost:5173`
2. Click **"Login"** button
3. Enter credentials:
   - Username: `Teacher_Balaji`
   - Password: (your password)
4. Click **"Login"**

---

### Step 2: Navigate to Create Contest Page

**Option A: From Mentor Dashboard**
1. After login, go to Mentor Dashboard
2. Look for **"Manage Contests"** button
3. Click **"Manage Contests"**
4. Click **"Create New Contest"** button

**Option B: Direct URL**
1. Go to: `http://localhost:5173/create-contest`

---

### Step 3: Fill Contest Form

#### Basic Information
1. **Contest Title** (Required)
   ```
   Example: "Weekly Contest #2"
   ```

2. **Description** (Required)
   ```
   Example: "This is a programming contest for all students. 
   Solve problems and compete with your peers!"
   ```

#### Schedule
3. **Start Time** (Required)
   - Click the datetime input
   - Select: **Tomorrow's date**
   - Select time: **10:00 AM**
   - Format: `2026-03-12T10:00`

4. **End Time** (Required)
   - Click the datetime input
   - Select: **Tomorrow's date**
   - Select time: **12:00 PM** (2 hours after start)
   - Format: `2026-03-12T12:00`
   - ⚠️ **IMPORTANT**: End time MUST be AFTER start time

5. **Duration (minutes)** (Required)
   ```
   Example: 120 (for 2 hours)
   ```

#### Problems
6. **Add Problems** (Required - at least 1)
   - Click **"Add Problems"** button
   - Search box will appear
   - Click on problems to select them
   - Selected problems will show below
   - You need **at least 1 problem**

   **Example**: Select these problems:
   - Two Sum
   - Contains Duplicate
   - Valid Anagram

7. **Remove Problems** (Optional)
   - Click the **X** button next to any selected problem to remove it

#### Settings
8. **Public Contest** (Optional)
   - Check the box if you want all students to see it
   - Uncheck if you want it private

9. **Contest Rules** (Optional)
   ```
   Default rules are already filled in.
   You can edit them if needed.
   ```

---

### Step 4: Submit Form

1. Review all fields
2. Make sure:
   - ✅ Title is filled
   - ✅ Description is filled
   - ✅ Start time is set
   - ✅ End time is AFTER start time
   - ✅ At least 1 problem is selected
3. Click **"Create Contest"** button
4. Wait for response...

---

### Step 5: Expected Results

#### Success ✅
- Green toast notification appears (top-right corner)
- Message: "Contest created successfully!"
- Automatically redirects to Contests Management page
- Your new contest appears in the list

#### Error ❌
- Red toast notification appears
- Shows error message
- Form stays on page
- Fix the error and try again

---

## 🐛 Common Issues & Solutions

### Issue 1: "End time must be after start time"
**Problem**: End time is before or equal to start time  
**Solution**: 
- Make sure end time is AFTER start time
- Example: Start 10:00 AM, End 12:00 PM ✅
- Example: Start 10:00 AM, End 09:00 AM ❌

### Issue 2: "Please select at least one problem"
**Problem**: No problems selected  
**Solution**: 
- Click "Add Problems" button
- Click on at least 1 problem to select it
- Selected problems will show below with A, B, C labels

### Issue 3: "Only teachers can create contests"
**Problem**: Not logged in as teacher  
**Solution**: 
- Logout
- Login with teacher account (Teacher_Balaji)
- Try again

### Issue 4: "Failed to create contest"
**Problem**: Backend error or validation issue  
**Solution**: 
- Check browser console (F12) for errors
- Make sure backend server is running (port 8000)
- Check all required fields are filled
- Try refreshing the page

### Issue 5: Text in datetime inputs not visible
**Problem**: CSS not loaded  
**Solution**: 
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Restart frontend server

### Issue 6: Problems list is empty
**Problem**: No problems in database  
**Solution**: 
- Make sure problems exist in database
- Check: `http://localhost:8000/api/problems/`
- Add problems first if needed

---

## 📋 Example: Complete Form

```
Title: Weekly Programming Contest #2

Description: 
This is a weekly programming contest for all students.
Solve as many problems as you can within the time limit.
Good luck!

Start Time: 2026-03-12T10:00
End Time: 2026-03-12T12:00
Duration: 120 minutes

Problems Selected:
A. Two Sum (Easy)
B. Contains Duplicate (Easy)
C. Valid Anagram (Easy)

Public Contest: ✓ Checked

Rules: (default rules are fine)
```

Click **"Create Contest"** → Success! ✅

---

## 🔍 Debugging Steps

If contest creation fails, check these:

### 1. Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Look for red error messages
4. Share the error message if you need help

### 2. Check Network Tab
1. Press `F12` to open Developer Tools
2. Go to **Network** tab
3. Click "Create Contest" button
4. Look for request to `/api/contests/`
5. Check the response:
   - **200 OK**: Success ✅
   - **400 Bad Request**: Validation error ❌
   - **403 Forbidden**: Permission denied ❌
   - **500 Server Error**: Backend error ❌

### 3. Check Backend Server
1. Open: `http://localhost:8000/api/contests/`
2. Should see JSON response with contests list
3. If error, backend is not running

### 4. Check Authentication
1. Open: `http://localhost:8000/api/auth/user/`
2. Should see your user info
3. Check `role: "teacher"`
4. If not authenticated, login again

---

## 🎯 Quick Test

Try creating this simple contest:

```
Title: Test Contest
Description: Testing contest creation
Start Time: Tomorrow 10:00 AM
End Time: Tomorrow 12:00 PM
Duration: 120
Problems: Select any 1 problem
Public: Yes
```

Click **"Create Contest"**

**Expected**: Green toast + redirect to contests page

---

## 📞 Need Help?

If you're still having issues:

1. **Check these files**:
   - Browser console (F12)
   - Network tab (F12)
   - Backend logs

2. **Share this info**:
   - Error message from toast
   - Error from browser console
   - Network response (if any)
   - Which step failed

3. **Common fixes**:
   - Restart both servers
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear browser cache
   - Check you're logged in as teacher
   - Check backend is running on port 8000

---

## ✅ Success Checklist

Before clicking "Create Contest":
- [ ] Logged in as teacher
- [ ] Title filled
- [ ] Description filled
- [ ] Start time set (future date/time)
- [ ] End time set (AFTER start time)
- [ ] Duration set (e.g., 120)
- [ ] At least 1 problem selected
- [ ] Backend server running
- [ ] Frontend server running

If all checked, click **"Create Contest"** and it should work! 🎉

---

## 🎬 Video Tutorial Steps

1. Login as teacher
2. Click "Manage Contests"
3. Click "Create New Contest"
4. Fill title: "Test Contest"
5. Fill description: "Testing"
6. Set start time: Tomorrow 10:00 AM
7. Set end time: Tomorrow 12:00 PM
8. Set duration: 120
9. Click "Add Problems"
10. Click on 1-3 problems
11. Click "Create Contest"
12. See green toast
13. Redirected to contests page
14. See new contest in list

Done! ✅
