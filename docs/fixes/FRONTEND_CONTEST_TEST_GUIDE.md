# Frontend Contest Testing Guide

## 🎯 Quick Test - Contest Created Successfully!

A test contest has been created in the database and is ready to test in the frontend application.

---

## 📋 Contest Information

**Contest Name**: Weekly Programming Contest #1  
**Contest ID**: 2  
**Creator**: Teacher_Balaji  
**Status**: Upcoming (starts tomorrow)  
**Duration**: 2 hours (120 minutes)  
**Problems**: 3 (Two Sum, Best Time to Buy and Sell Stock, Contains Duplicate)  
**Public**: Yes (all students can join)

---

## 🚀 Step-by-Step Testing

### Step 1: Start Servers (if not running)
```bash
cd CodeNest
./START_SERVERS.bat
```

Wait for both servers to start:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

### Step 2: Login as Teacher

1. Open browser: http://localhost:5173
2. Click "Login"
3. Enter credentials:
   - Username: `Teacher_Balaji`
   - Password: (your password)
4. Click "Login"

---

### Step 3: Navigate to Manage Contests

1. After login, you'll see the Dashboard
2. Look for "Manage Contests" button (should be visible on Mentor Dashboard)
3. Click "Manage Contests"

**Expected**: You should be redirected to `/contests-management`

---

### Step 4: Verify Contest Appears

On the Contests Management page, you should see:

#### Contest Card
```
┌─────────────────────────────────────────┐
│ Weekly Programming Contest #1           │
│ [Upcoming Badge]                        │
│                                         │
│ 📅 Start: Mar 11, 2026 21:54           │
│ ⏱️  Duration: 120 minutes              │
│ 📝 Problems: 3                          │
│ 👥 Participants: 0                      │
│                                         │
│ [View] [Edit] [Delete]                  │
└─────────────────────────────────────────┘
```

#### Check These Details:
- ✅ Contest title: "Weekly Programming Contest #1"
- ✅ Status badge: "Upcoming" (blue/cyan color)
- ✅ Start time: Tomorrow's date
- ✅ Duration: 120 minutes
- ✅ Problems count: 3
- ✅ Participants: 0

---

### Step 5: Test Filters

Try clicking these filter buttons:

1. **All** - Should show the contest
2. **Upcoming** - Should show the contest (it's upcoming)
3. **Live** - Should show nothing (contest hasn't started)
4. **Completed** - Should show nothing (contest hasn't ended)

**Expected**: Filters work correctly and contest appears/disappears based on status

---

### Step 6: View Contest Details

1. Click "View" button on the contest card
2. Should navigate to contest detail page

**Expected**: See full contest details including:
- Title and description
- Start/end times
- Rules
- List of 3 problems
- Join button (if viewing as student)

---

### Step 7: Test Text Visibility

While on any contest page, check:

#### Dropdowns/Selects
- ✅ Filter dropdown text is WHITE and visible
- ✅ All options in dropdowns are visible
- ✅ No transparent or invisible text

#### DateTime Inputs (if editing)
- ✅ Date/time values are WHITE and visible
- ✅ Calendar icon is visible

#### All Form Inputs
- ✅ Text is white on dark background
- ✅ Placeholders are visible (gray)
- ✅ No color gradient hiding text

---

### Step 8: Test as Student (Optional)

1. Logout from teacher account
2. Login as a student (e.g., Balaji_Student)
3. Navigate to Contests page
4. Should see "Weekly Programming Contest #1"
5. Click "Join Contest"
6. Should see success toast: "Successfully joined contest"

**Expected**: Student can join the contest and see it in their contests list

---

## ✅ Success Checklist

### Backend ✅
- [x] Contest created in database
- [x] Contest has 3 problems
- [x] Contest serialization working
- [x] API endpoints functional

### Frontend (Test These)
- [ ] Contest appears in Manage Contests page
- [ ] Contest details are correct
- [ ] Status badge shows "Upcoming"
- [ ] All text is visible (no transparency issues)
- [ ] Filters work correctly
- [ ] View button works
- [ ] Edit button works (if implemented)
- [ ] Delete button works (shows toast, not alert)
- [ ] Students can see contest
- [ ] Students can join contest

---

## 🎨 Visual Checks

### Text Visibility
All text should be **WHITE** on **DARK BACKGROUND**:
- ✅ Contest titles
- ✅ Dropdown options
- ✅ Filter buttons
- ✅ Form inputs
- ✅ DateTime inputs
- ✅ Descriptions

### Toast Notifications
Should see **TOAST** (not alert) for:
- ✅ Contest created successfully (green)
- ✅ Contest deleted successfully (green)
- ✅ Errors (red)
- ✅ Student joined contest (green)

### Status Badges
- 🔵 **Upcoming**: Blue/Cyan badge
- 🔴 **Live**: Red/Orange badge
- ✅ **Completed**: Green badge

---

## 🐛 Troubleshooting

### Contest doesn't appear
1. Check backend is running: http://localhost:8000/api/contests/
2. Check you're logged in as teacher
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console for errors

### Text is not visible
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check GlobalFormFixes.css is loaded
4. Check browser console for CSS errors

### Toast doesn't appear
1. Check browser console for errors
2. Verify Toast component is imported
3. Check useToast hook is working

### Can't join as student
1. Verify contest is public
2. Check student is authenticated
3. Check backend API: POST /api/contests/2/join/

---

## 📸 Screenshots to Take (Optional)

1. Contests Management page with contest visible
2. Contest card showing all details
3. Filter buttons working
4. Contest detail page
5. Toast notification appearing
6. Student view of contest
7. Join contest success message

---

## 🎯 Expected Results Summary

### What Should Work ✅
1. Contest appears in Manage Contests
2. All contest details are correct
3. All text is visible (white on dark)
4. Filters work correctly
5. Toast notifications appear (not alerts)
6. Students can join contest
7. No console errors

### What Might Not Work Yet ⏳
1. Contest editing (if not implemented)
2. Contest deletion (works but needs confirmation)
3. Live contest features (contest hasn't started)
4. Leaderboard (no participants yet)
5. Submissions (contest not started)

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

CONTEST VISIBILITY:
[ ] Contest appears in Manage Contests: ___
[ ] Contest details correct: ___
[ ] Status badge correct: ___

TEXT VISIBILITY:
[ ] All dropdowns visible: ___
[ ] All form inputs visible: ___
[ ] DateTime inputs visible: ___

FUNCTIONALITY:
[ ] Filters work: ___
[ ] View button works: ___
[ ] Toast notifications work: ___
[ ] Student can join: ___

ISSUES FOUND:
_________________________________
_________________________________
_________________________________

OVERALL: [ ] Pass [ ] Fail
```

---

## 🎉 Success!

If all checks pass:
- ✅ Contest creation system is working
- ✅ Text visibility is fixed
- ✅ Toast notifications are working
- ✅ Ready for production use

The contest "Weekly Programming Contest #1" is now ready for students to join and participate when it starts tomorrow!
