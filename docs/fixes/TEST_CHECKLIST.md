# Test Checklist - Contest & Visibility Fixes

## 🚀 Quick Start
1. Make sure both servers are running
2. Login as a teacher account
3. Follow the tests below

---

## ✅ Test 1: Contest Creation

### Steps:
1. **Navigate**: Dashboard → "Manage Contests" button
2. **Click**: "Create New Contest" button
3. **Fill Form**:
   - Title: "Weekly Contest #1"
   - Description: "Test contest for students"
   - Start Time: (select tomorrow's date, 10:00 AM)
   - End Time: (select tomorrow's date, 12:00 PM)
   - Duration: 120 minutes
   - Check "Public Contest"
4. **Add Problems**:
   - Click "Add Problems"
   - Select 2-3 problems from the list
5. **Submit**: Click "Create Contest"

### Expected Results:
- ✅ Green toast notification appears (top-right): "Contest created successfully!"
- ✅ Automatically redirects to Contests Management page
- ✅ New contest appears in the list
- ❌ NO alert() popup should appear

### If It Fails:
- Check browser console for errors
- Verify you're logged in as teacher
- Ensure at least one problem exists in database

---

## ✅ Test 2: Date Validation

### Steps:
1. **Navigate**: Create New Contest page
2. **Fill Form**:
   - Start Time: Tomorrow 10:00 AM
   - End Time: Tomorrow 9:00 AM (BEFORE start time)
3. **Submit**: Click "Create Contest"

### Expected Results:
- ✅ Red toast notification: "End time must be after start time"
- ✅ Form does NOT submit
- ✅ User stays on create page

---

## ✅ Test 3: Text Visibility - CreateContest Page

### Steps:
1. **Navigate**: Create New Contest page
2. **Check These Elements**:

#### DateTime Inputs:
- [ ] Start Time input - text is WHITE and visible
- [ ] End Time input - text is WHITE and visible
- [ ] Calendar icon is visible (white)

#### All Text Inputs:
- [ ] Title input - text is WHITE
- [ ] Description textarea - text is WHITE
- [ ] Duration input - text is WHITE

#### Checkboxes:
- [ ] "Public Contest" checkbox label is visible

### Expected Results:
- ✅ ALL text is white and clearly visible
- ✅ NO transparent or invisible text
- ✅ Placeholders are visible (gray)

---

## ✅ Test 4: Text Visibility - Mentor Dashboard

### Steps:
1. **Navigate**: Mentor Dashboard
2. **Check Branch Filter**:
   - [ ] Click the branch dropdown
   - [ ] All options (CSE, ECE, etc.) are WHITE and visible
   - [ ] Selected option is visible

### Expected Results:
- ✅ Dropdown text is white
- ✅ Options are white on dark background
- ✅ Dropdown arrow is visible

---

## ✅ Test 5: Text Visibility - Problems Page

### Steps:
1. **Navigate**: Problems page
2. **Check Filters**:
   - [ ] Difficulty dropdown - text visible
   - [ ] Topic dropdown - text visible
   - [ ] All options in dropdowns are visible

### Expected Results:
- ✅ All dropdown text is white
- ✅ All options are visible
- ✅ Selected values are visible

---

## ✅ Test 6: Text Visibility - Editor Page

### Steps:
1. **Navigate**: Any problem → Solve
2. **Check Language Selector**:
   - [ ] Language dropdown text is visible
   - [ ] All language options (Python, JavaScript, C++, Java) are visible

### Expected Results:
- ✅ Language selector text is white
- ✅ All options are visible

---

## ✅ Test 7: Contest Management

### Steps:
1. **Navigate**: Contests Management page
2. **Check Filters**:
   - [ ] "All" filter button
   - [ ] "Upcoming" filter button
   - [ ] "Live" filter button
   - [ ] "Completed" filter button
3. **Check Contest Cards**:
   - [ ] Contest titles are visible
   - [ ] Status badges are visible
   - [ ] All text is readable

### Expected Results:
- ✅ All filters work
- ✅ All text is visible
- ✅ Contest cards display properly

---

## ✅ Test 8: Delete Contest (Toast)

### Steps:
1. **Navigate**: Contests Management page
2. **Find**: A test contest
3. **Click**: Delete button (trash icon)
4. **Confirm**: Click "OK" in confirmation dialog
5. **Observe**: Toast notification

### Expected Results:
- ✅ Confirmation dialog appears (this is OK)
- ✅ After confirming, green toast: "Contest deleted successfully"
- ✅ Contest removed from list
- ❌ NO alert() after deletion

---

## 🎯 Summary Checklist

### Contest Creation:
- [ ] Toast notifications work (no alerts)
- [ ] Date validation works
- [ ] Redirect after creation works
- [ ] Error messages are clear

### Text Visibility:
- [ ] CreateContest page - all text visible
- [ ] MentorDashboard - dropdowns visible
- [ ] Problems page - filters visible
- [ ] Editor page - language selector visible
- [ ] ContestsManagement - all text visible

### Overall:
- [ ] No console errors
- [ ] No alert() popups (except delete confirmation)
- [ ] All form elements have white text
- [ ] All dropdowns have visible options
- [ ] datetime inputs are visible

---

## 🐛 Common Issues & Solutions

### Issue: Text still not visible
**Solution**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Toast not appearing
**Solution**: Check browser console, verify useToast hook is imported

### Issue: Contest creation fails
**Solution**: 
- Verify logged in as teacher
- Check backend is running (port 8000)
- Check at least one problem exists

### Issue: Redirect not working
**Solution**: Check browser console for navigation errors

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 - Contest Creation: ☐ Pass ☐ Fail
Test 2 - Date Validation: ☐ Pass ☐ Fail
Test 3 - CreateContest Visibility: ☐ Pass ☐ Fail
Test 4 - MentorDashboard Visibility: ☐ Pass ☐ Fail
Test 5 - Problems Visibility: ☐ Pass ☐ Fail
Test 6 - Editor Visibility: ☐ Pass ☐ Fail
Test 7 - Contest Management: ☐ Pass ☐ Fail
Test 8 - Delete Toast: ☐ Pass ☐ Fail

Overall: ☐ All Pass ☐ Some Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## ✨ Success!

If all tests pass:
- ✅ Contest creation is working perfectly
- ✅ All text visibility issues are fixed
- ✅ Application is ready for use

You can now:
1. Create contests for students
2. Manage existing contests
3. All form elements are visible and usable
4. Consistent user experience across all pages
