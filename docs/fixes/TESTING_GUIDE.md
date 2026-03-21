# 🧪 Complete Testing Guide - CodeNest

**Date**: March 9, 2026  
**Purpose**: Step-by-step testing for all new features

---

## 🚀 Quick Start

### Prerequisites:
1. Backend running on http://localhost:8000
2. Frontend running on http://localhost:5173
3. Admin account: admin/admin
4. Student account: Create or use existing

---

## 1️⃣ Test Keyboard Shortcuts

**Time**: 2 minutes  
**User**: Any

### Steps:
1. Login to CodeNest
2. Navigate to any problem
3. Click "Solve Problem"
4. Write some code in editor
5. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
   - ✅ Code should run
6. Press `Ctrl+Shift+Enter` (or `Cmd+Shift+Enter`)
   - ✅ Code should submit
7. Check bottom of editor for keyboard hints
   - ✅ Should see hint bar

**Expected Results**:
- Shortcuts work without clicking buttons
- Hint bar is visible
- Tooltips show on button hover

---

## 2️⃣ Test Achievements System

**Time**: 5 minutes  
**User**: Any

### Steps:

#### View Achievements:
1. Login to CodeNest
2. Click "Achievements" in navbar
3. ✅ Should see achievements page with 23 achievements
4. Try category filters (All, Problems, Difficulty, etc.)
   - ✅ Filtering should work
5. Try search box (search "master")
   - ✅ Should filter achievements
6. Click on an achievement card
   - ✅ Modal should open with details

#### Earn Achievements:
1. Navigate to Problems
2. Solve an easy problem
   - ✅ Should earn "First Blood" (if first submission)
   - ✅ Should earn "Easy Peasy" (if first easy problem)
3. Check achievements page
   - ✅ Progress bars should update
   - ✅ Unlocked achievements should show

**Expected Results**:
- All 23 achievements visible
- Filters work correctly
- Search works
- Modal opens
- Progress bars show correctly
- Achievements unlock on solving problems

---

## 3️⃣ Test Activity Heatmap

**Time**: 3 minutes  
**User**: Any

### Steps:
1. Login to CodeNest
2. Navigate to Dashboard
3. Scroll to Activity Heatmap section
4. ✅ Should see 365-day calendar
5. Hover over cells
   - ✅ Tooltip should show date and submission count
6. Check stats cards:
   - ✅ Current Streak
   - ✅ Longest Streak
   - ✅ Active Days
   - ✅ Most Active Hour
7. Solve a problem
8. Return to dashboard
9. ✅ Today's cell should be colored
10. ✅ Stats should update

**Expected Results**:
- Heatmap displays 365 days
- Tooltips work on hover
- Stats are accurate
- Colors indicate intensity (0-4 levels)
- Updates after solving problems

---

## 4️⃣ Test Contest System - Full Flow

**Time**: 15 minutes  
**Users**: 1 teacher, 2 students

### Part A: Contest Creation (Teacher)

1. Login as teacher (admin/admin123)
2. Navigate to `/contests`
3. Click "Create Contest" button
4. ✅ Should see creation form

#### Fill Form:
5. Title: "Test Contest 2026"
6. Description: "A test contest for validation"
7. Start Time: Set to 5 minutes from now
8. End Time: Set to 35 minutes from now (30 min duration)
9. Duration: 30 minutes
10. Click "Add Problems"
11. ✅ Problem selector should open
12. Search for "array"
13. Select 3 problems by clicking
14. ✅ Selected problems should appear below
15. Keep "Public" checked
16. Click "Create Contest"
17. ✅ Should redirect to contest detail page
18. ✅ Contest should show "Upcoming" status

**Expected Results**:
- Form validates required fields
- Problem selector works
- Search filters problems
- Selected problems show with A, B, C labels
- Contest created successfully
- Redirects to detail page

---

### Part B: Contest Browsing (Student 1)

1. Login as student
2. Navigate to `/contests`
3. ✅ Should see "Test Contest 2026"
4. Try status filters:
   - Click "Upcoming"
   - ✅ Should see the test contest
   - Click "Ongoing"
   - ✅ Should be empty (contest hasn't started)
5. Click on "Test Contest 2026" card
6. ✅ Should navigate to contest detail

**Expected Results**:
- Contest appears in list
- Filters work correctly
- Card shows correct information
- Navigation works

---

### Part C: Join Contest (Student 1 & 2)

1. On contest detail page
2. ✅ Should see:
   - Contest title and description
   - Start/end times
   - Duration
   - Problems list (A, B, C)
   - Empty leaderboard
   - "Join Contest" button
3. Click "Join Contest"
4. ✅ Button should change to "Joined"
5. ✅ Participant count should increase to 1
6. ✅ Your name should appear on leaderboard with 0 score

**Repeat for Student 2**:
7. Login as second student
8. Navigate to contest detail
9. Join contest
10. ✅ Participant count should be 2
11. ✅ Both students on leaderboard

**Expected Results**:
- Join button works
- Participant count updates
- Leaderboard shows participants
- Can't join twice

---

### Part D: Wait for Contest Start

1. Stay on contest detail page
2. ✅ Timer should count down
3. Wait for contest to start (5 minutes)
4. ✅ Status should change to "Ongoing"
5. ✅ "Enter Arena" button should appear
6. ✅ Timer should show remaining time

**Expected Results**:
- Timer counts down correctly
- Status updates automatically
- Enter Arena button appears
- Join button disappears

---

### Part E: Contest Arena (Student 1)

1. Click "Enter Arena"
2. ✅ Should navigate to arena page
3. ✅ Should see:
   - Problems sidebar (A, B, C)
   - Timer in header
   - Code editor
   - Run and Submit buttons

#### Solve Problem A:
4. Click on Problem A in sidebar
5. ✅ Problem description should load
6. ✅ Starter code should load in editor
7. Write solution code
8. Click "Run"
9. ✅ Output should display
10. Click "Submit"
11. ✅ Should see submission result
12. ✅ If accepted:
    - Green success message
    - Points: 100
    - Problem A should show green checkmark
13. Click "Leaderboard" button
14. ✅ Leaderboard sidebar should open
15. ✅ Your score should be 100
16. ✅ Your rank should be 1

#### Solve Problem B:
17. Click on Problem B
18. Write and submit solution
19. ✅ If accepted, score should be 200
20. ✅ Problem B should show checkmark

**Expected Results**:
- Arena loads correctly
- Problems switch properly
- Code editor works
- Run executes code
- Submit evaluates solution
- Results display correctly
- Leaderboard updates
- Problem status indicators work

---

### Part F: Concurrent Participation (Student 2)

1. Login as Student 2
2. Enter arena
3. Solve Problem A
4. ✅ Score: 100
5. Check leaderboard
6. ✅ Should see both students
7. ✅ Student 1 should be rank 1 (200 pts)
8. ✅ Student 2 should be rank 2 (100 pts)

**Expected Results**:
- Multiple students can participate
- Leaderboard updates for all
- Rankings are correct
- Scores are accurate

---

### Part G: Contest Completion

1. Wait for contest to end (30 minutes)
2. ✅ Timer should reach 00:00:00
3. ✅ Should auto-exit to contest detail
4. ✅ Status should be "Completed"
5. ✅ Final leaderboard should display
6. ✅ Top 3 should have medals (🥇🥈🥉)

**Expected Results**:
- Timer expires correctly
- Auto-exit works
- Status updates to completed
- Final rankings are correct
- Medals display for top 3

---

## 5️⃣ Test Submission History

**Time**: 2 minutes  
**User**: Any (after solving problems)

### Steps:
1. Login to CodeNest
2. Click "Submissions" in navbar
3. ✅ Should see all your submissions
4. Try filters:
   - Status: Accepted
   - ✅ Should show only accepted
   - Language: Python
   - ✅ Should show only Python
5. Try search (search problem name)
   - ✅ Should filter by problem
6. Click on a submission
   - ✅ Modal should open
   - ✅ Should show code and results

**Expected Results**:
- All submissions visible
- Filters work correctly
- Search works
- Modal displays details
- Test results visible

---

## 🎯 Quick Validation Checklist

### Keyboard Shortcuts:
- [ ] Ctrl+Enter runs code
- [ ] Ctrl+Shift+Enter submits code
- [ ] Hint bar visible
- [ ] Tooltips work

### Achievements:
- [ ] 23 achievements visible
- [ ] Filters work
- [ ] Search works
- [ ] Modal opens
- [ ] Progress bars update
- [ ] Achievements unlock

### Activity Heatmap:
- [ ] 365-day calendar displays
- [ ] Tooltips work
- [ ] Stats are accurate
- [ ] Colors show intensity
- [ ] Updates after activity

### Contest System:
- [ ] Contest creation works (teachers)
- [ ] Problem selection works
- [ ] Contest browsing works
- [ ] Status filtering works
- [ ] Join contest works
- [ ] Timer counts down
- [ ] Status updates automatically
- [ ] Arena loads correctly
- [ ] Code editor works
- [ ] Run code works
- [ ] Submit works
- [ ] Leaderboard updates
- [ ] Rankings are correct
- [ ] Contest completes properly

### Submission History:
- [ ] All submissions visible
- [ ] Filters work
- [ ] Search works
- [ ] Modal displays details

---

## 🐛 Common Issues & Solutions

### Issue: Achievements not unlocking
**Solution**: 
- Check backend is running
- Verify achievement service is integrated
- Check console for errors
- Manually trigger by solving a problem

### Issue: Heatmap not showing data
**Solution**:
- Solve at least one problem
- Refresh dashboard
- Check API endpoint: `/api/activity-heatmap/`

### Issue: Contest timer not counting down
**Solution**:
- Check system time is correct
- Verify contest times in database
- Refresh page
- Check browser console for errors

### Issue: Arena not loading
**Solution**:
- Verify you joined the contest
- Check contest is ongoing
- Clear browser cache
- Check console for errors

### Issue: Submit not working in arena
**Solution**:
- Verify problem is in contest
- Check code is not empty
- Verify contest is still ongoing
- Check backend logs

---

## 📊 Performance Benchmarks

### Expected Load Times:
- Achievements page: < 1 second
- Activity heatmap: < 1 second
- Contest list: < 1 second
- Contest detail: < 1 second
- Contest arena: < 2 seconds
- Code execution: 2-5 seconds
- Submission evaluation: 3-10 seconds

### Auto-refresh Intervals:
- Contest detail leaderboard: 30 seconds
- Contest arena leaderboard: 30 seconds
- Activity heatmap: 30 seconds
- Dashboard stats: 30 seconds

---

## ✅ Final Validation

After completing all tests, verify:

1. **All Features Work**: ✅
2. **No Console Errors**: ✅
3. **Responsive Design**: ✅
4. **Data Persists**: ✅
5. **Real-time Updates**: ✅
6. **Error Handling**: ✅
7. **Loading States**: ✅
8. **Success Messages**: ✅

---

## 🎉 Testing Complete!

If all tests pass, your CodeNest platform is **production ready**!

**Status**: Ready for deployment 🚀

---

**Happy Testing!** 🧪
