# Visual Guide: Create Contest Step-by-Step

## ✅ Backend Status: READY
- Teacher account: Teacher_Balaji ✅
- Problems available: 31 ✅
- API working: ✅
- Test creation: ✅

---

## 📸 Step-by-Step with Visual Description

### STEP 1: Login
```
┌─────────────────────────────────────┐
│         CodeNest Login              │
├─────────────────────────────────────┤
│                                     │
│  Username: [Teacher_Balaji____]    │
│  Password: [**************]        │
│                                     │
│         [  Login  ]                 │
│                                     │
└─────────────────────────────────────┘
```
**Action**: Enter credentials and click Login

---

### STEP 2: Go to Create Contest
```
URL: http://localhost:5173/create-contest

OR

Dashboard → [Manage Contests] → [Create New Contest]
```

---

### STEP 3: Fill Form - Basic Information

```
┌─────────────────────────────────────────────────┐
│  📝 Basic Information                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Contest Title *                                │
│  ┌───────────────────────────────────────────┐ │
│  │ Weekly Contest #2                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Description *                                  │
│  ┌───────────────────────────────────────────┐ │
│  │ This is a programming contest for         │ │
│  │ students. Solve problems and compete!     │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Fill**:
- Title: `Weekly Contest #2`
- Description: `This is a programming contest for students`

---

### STEP 4: Fill Form - Schedule

```
┌─────────────────────────────────────────────────┐
│  📅 Schedule                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Start Time *                                   │
│  ┌───────────────────────────────────────────┐ │
│  │ 2026-03-12T10:00          📅             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  End Time *                                     │
│  ┌───────────────────────────────────────────┐ │
│  │ 2026-03-12T12:00          📅             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ⏱️ Duration (minutes) *                        │
│  ┌───────────────────────────────────────────┐ │
│  │ 120                                       │ │
│  └───────────────────────────────────────────┘ │
│  Recommended: 120 minutes (2 hours)             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Fill**:
- Start Time: Click input → Select tomorrow → Select 10:00 AM
- End Time: Click input → Select tomorrow → Select 12:00 PM
- Duration: `120`

**⚠️ IMPORTANT**: End time MUST be AFTER start time!

---

### STEP 5: Add Problems

```
┌─────────────────────────────────────────────────┐
│  📝 Problems (0)                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  [+ Add Problems]                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Click**: `Add Problems` button

---

### STEP 6: Select Problems

```
┌─────────────────────────────────────────────────┐
│  🔍 [Search problems...____________]            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Two Sum                      [Easy]     │   │
│  │ Arrays                                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Contains Duplicate           [Easy]     │   │
│  │ Arrays                                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Valid Anagram                [Easy]     │   │
│  │ Strings                                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Action**: Click on 2-3 problems to select them

---

### STEP 7: Selected Problems

```
┌─────────────────────────────────────────────────┐
│  Selected Problems:                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [A] Two Sum              [Easy]    [X]  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [B] Contains Duplicate   [Easy]    [X]  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [C] Valid Anagram        [Easy]    [X]  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Result**: 3 problems selected (A, B, C)

---

### STEP 8: Settings

```
┌─────────────────────────────────────────────────┐
│  👥 Settings                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ☑️ Public Contest (visible to all students)    │
│                                                 │
│  Contest Rules                                  │
│  ┌───────────────────────────────────────────┐ │
│  │ Standard contest rules apply:             │ │
│  │ 1. No plagiarism                          │ │
│  │ 2. No collaboration                       │ │
│  │ 3. Fair play expected                     │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Action**: Check "Public Contest" if you want all students to see it

---

### STEP 9: Submit

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         [Cancel]    [Create Contest]            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Action**: Click `Create Contest` button

---

### STEP 10: Success!

```
┌─────────────────────────────────────┐
│  ✅ Contest created successfully!   │
└─────────────────────────────────────┘
     ↑ Green toast notification
```

**Result**: 
- Green toast appears (top-right)
- Automatically redirects to Contests Management page
- Your contest appears in the list

---

## 🎯 Quick Checklist

Before clicking "Create Contest":

```
✅ Checklist:
├─ [✓] Logged in as Teacher_Balaji
├─ [✓] Title filled: "Weekly Contest #2"
├─ [✓] Description filled
├─ [✓] Start time: Tomorrow 10:00 AM
├─ [✓] End time: Tomorrow 12:00 PM (AFTER start)
├─ [✓] Duration: 120 minutes
├─ [✓] Problems: 2-3 selected
├─ [✓] Public: Checked
└─ [✓] Backend running on port 8000
```

If all checked → Click "Create Contest" → Success! ✅

---

## ❌ Common Errors & Fixes

### Error 1: "End time must be after start time"
```
Start: 2026-03-12T10:00
End:   2026-03-12T09:00  ❌ WRONG (before start)

Fix:
End:   2026-03-12T12:00  ✅ CORRECT (after start)
```

### Error 2: "Please select at least one problem"
```
Problems: (0)  ❌ WRONG

Fix:
Problems: (3)  ✅ CORRECT
- Two Sum
- Contains Duplicate
- Valid Anagram
```

### Error 3: "Only teachers can create contests"
```
Logged in as: Balaji_Student  ❌ WRONG

Fix:
Logged in as: Teacher_Balaji  ✅ CORRECT
```

---

## 🔍 Debugging

If it still doesn't work:

### 1. Open Browser Console (F12)
```
Console Tab:
├─ Look for red errors
├─ Check for "Failed to fetch"
├─ Check for "403 Forbidden"
└─ Check for "500 Server Error"
```

### 2. Check Network Tab (F12)
```
Network Tab:
├─ Filter: XHR
├─ Look for: POST /api/contests/
├─ Status: 
│   ├─ 201 Created  ✅ Success
│   ├─ 400 Bad Request  ❌ Validation error
│   ├─ 403 Forbidden  ❌ Not teacher
│   └─ 500 Server Error  ❌ Backend error
└─ Response: Check error message
```

### 3. Check Backend
```bash
# Test backend is running
curl http://localhost:8000/api/contests/

# Should return JSON with contests list
```

---

## 📞 Still Not Working?

Run diagnostic:
```bash
cd CodeNest/codenest_backend
python diagnose_contest_issue.py
```

This will check:
- ✅ Teacher account exists
- ✅ Problems exist
- ✅ API is configured
- ✅ Test creation works

---

## 🎉 Success Example

```
Input:
├─ Title: "Weekly Contest #2"
├─ Description: "Programming contest for students"
├─ Start: 2026-03-12T10:00
├─ End: 2026-03-12T12:00
├─ Duration: 120
├─ Problems: 3 selected
└─ Public: Yes

Output:
├─ ✅ Green toast: "Contest created successfully!"
├─ ✅ Redirect to: /contests-management
└─ ✅ Contest appears in list:
    ├─ Title: "Weekly Contest #2"
    ├─ Status: Upcoming
    ├─ Problems: 3
    └─ Participants: 0
```

Done! 🎊
