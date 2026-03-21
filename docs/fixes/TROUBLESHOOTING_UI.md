# 🔧 Troubleshooting: Test Cases Section Not Visible

**Issue**: Test Cases and Custom Input tabs are not showing up  
**Status**: Code is present, likely a cache/rendering issue

---

## ✅ Verification Steps

### 1. Check if Code is Present

The code IS present in `EditorPage.jsx` at lines 308-373:
```jsx
{/* Test Cases / Custom Input Section */}
<div className="input-section">
    <div className="input-tabs">
        <button className={`tab-btn ${inputMode === 'testcases' ? 'active' : ''}`}>
            Test Cases
        </button>
        <button className={`tab-btn ${inputMode === 'custom' ? 'active' : ''}`}>
            Custom Input
        </button>
    </div>
    ...
</div>
```

### 2. Check if CSS is Present

The CSS IS present in `Editor.css` at line 609:
```css
.input-section {
    flex: 0 0 200px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--glass-border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
```

---

## 🔧 Solutions

### Solution 1: Hard Refresh Browser (Most Likely Fix)

**Windows/Linux**:
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac**:
- Press `Cmd + Shift + R`

This clears the browser cache and reloads all CSS/JS files.

---

### Solution 2: Clear Browser Cache

1. Open DevTools (`F12`)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

### Solution 3: Restart Development Server

```bash
# Stop the frontend server (Ctrl+C)
cd CodeNest/project2
npm run dev
```

---

### Solution 4: Check Browser Console

1. Open DevTools (`F12`)
2. Go to Console tab
3. Look for any errors (red text)
4. Check if there are any CSS loading errors

---

### Solution 5: Verify File Saved

Make sure `EditorPage.jsx` was saved properly:
1. Open the file
2. Check lines 308-373 for the input-section code
3. Save again if needed (`Ctrl + S`)

---

### Solution 6: Check React DevTools

1. Install React DevTools extension
2. Open DevTools
3. Go to Components tab
4. Find EditorPage component
5. Check if `testCases`, `inputMode`, `selectedTestCase` states exist

---

## 🧪 Quick Test

### Open Browser Console and Run:

```javascript
// Check if element exists
document.querySelector('.input-section')

// Should return: <div class="input-section">...</div>
// If null: Element not rendered
```

```javascript
// Check CSS
getComputedStyle(document.querySelector('.input-section')).display

// Should return: "flex"
// If "none": CSS is hiding it
```

---

## 📊 Expected Behavior

After refresh, you should see:

```
┌─────────────────────────────────────────────┐
│  Monaco Editor                              │
│  (Your code here)                           │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  [Test Cases] [Custom Input]                │  ← This should be visible
├─────────────────────────────────────────────┤
│  [Case 1] [Case 2] [Case 3]                 │
│                                             │
│  Input:                                     │
│  4                                          │
│  2 7 11 15                                  │
│  9                                          │
│                                             │
│  Expected Output:                           │
│  0 1                                        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Output                                     │
│  (Terminal output here)                     │
└─────────────────────────────────────────────┘
```

---

## 🔍 Debug Checklist

- [ ] Hard refresh browser (`Ctrl + Shift + R`)
- [ ] Check browser console for errors
- [ ] Verify EditorPage.jsx has input-section code
- [ ] Verify Editor.css has .input-section styles
- [ ] Restart development server
- [ ] Clear browser cache completely
- [ ] Try different browser
- [ ] Check React DevTools for component state

---

## 💡 Most Common Causes

1. **Browser Cache** (90% of cases)
   - Solution: Hard refresh

2. **CSS Not Loaded** (5% of cases)
   - Solution: Check Network tab in DevTools

3. **React State Issue** (3% of cases)
   - Solution: Check React DevTools

4. **File Not Saved** (2% of cases)
   - Solution: Save and refresh

---

## 🚀 If Still Not Working

### Check Network Tab:

1. Open DevTools (`F12`)
2. Go to Network tab
3. Refresh page
4. Look for `Editor.css`
5. Click on it
6. Check if `.input-section` styles are present

### Check Elements Tab:

1. Open DevTools (`F12`)
2. Go to Elements tab
3. Press `Ctrl + F`
4. Search for "input-section"
5. If found: Check computed styles
6. If not found: React rendering issue

---

## 📝 Manual Verification

### Step 1: Check File Content

Open `CodeNest/project2/src/Pages/EditorPage.jsx` and search for:
```
{/* Test Cases / Custom Input Section */}
```

Should be around line 308.

### Step 2: Check CSS File

Open `CodeNest/project2/src/styles1/Editor.css` and search for:
```
.input-section {
```

Should be around line 609.

### Step 3: Verify Import

In `EditorPage.jsx`, check line 7:
```javascript
import "../styles1/Editor.css";
```

---

## ✅ Success Indicators

After fixing, you should see:
- ✅ Two tabs: "Test Cases" and "Custom Input"
- ✅ Test case buttons: "Case 1", "Case 2", etc.
- ✅ Input and expected output displayed
- ✅ Can switch between tabs
- ✅ Can select different test cases

---

## 🆘 Still Having Issues?

If none of the above works:

1. **Check if backend is running**:
   ```bash
   # Should be running on port 8000
   curl http://localhost:8000/api/problems/1/testcases/
   ```

2. **Check if test cases exist**:
   - Login as admin
   - Go to http://localhost:5173/manage-testcases/1
   - Verify test cases are there

3. **Check browser compatibility**:
   - Try Chrome/Edge (recommended)
   - Update browser to latest version

4. **Nuclear option** (last resort):
   ```bash
   # Stop all servers
   # Delete node_modules
   cd CodeNest/project2
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

**Most Likely Solution**: Hard refresh browser with `Ctrl + Shift + R`

Try that first! 🎯
