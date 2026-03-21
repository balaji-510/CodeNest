# 📝 How to Add Problems to CodeNest

There are now **3 easy ways** to add problems to your platform!

---

## Method 1: UI Form (NEW!) ⭐ EASIEST

### For Teachers/Admins:
1. Login to your account (must be a teacher/admin)
2. Go to the **Problems** page
3. Click the **"+ Add Problem"** button (top right)
4. Fill in the form:
   - **Basic Info**: Title, Difficulty, Topic, Platform, URLs
   - **Description**: Full problem statement
   - **Examples**: Add input/output examples with explanations
   - **Constraints**: Add problem constraints
   - **Starter Code**: Provide templates for Python, JavaScript, Java, C++
5. Click **"Add Problem"**
6. Done! The problem is now live

### Features:
- ✅ Beautiful, user-friendly interface
- ✅ Add multiple examples
- ✅ Add multiple constraints
- ✅ Starter code for 4 languages
- ✅ Real-time validation
- ✅ Success/error messages

### Access:
- **URL**: http://localhost:5173/add-problem
- **Who can access**: Teachers and Admins only
- **Button location**: Problems page (top right)

---

## Method 2: Django Admin Panel ⭐ QUICK

### Steps:
1. Go to: http://localhost:8000/admin/
2. Login with: `admin` / `admin123`
3. Click **"Problems"** under API section
4. Click **"Add Problem"** button
5. Fill in the form
6. Click **"Save"**

### Pros:
- Quick and simple
- Good for single problems
- Can also add test cases

### Cons:
- Less user-friendly than UI form
- Need to format JSON manually for examples/constraints

---

## Method 3: Python Script ⭐⭐ BULK IMPORT

### For adding multiple problems at once:

```bash
cd codenest_backend
venv\Scripts\activate  # Windows
python add_problems.py
```

### Options:
1. **Add sample problems** - Adds 5 pre-configured problems
2. **Add custom problem** - Interactive mode to add one problem
3. **Exit**

### Sample Problems Included:
1. Two Sum (Easy - Arrays)
2. Valid Palindrome (Easy - Strings)
3. Reverse Linked List (Easy - Linked Lists)
4. Maximum Subarray (Medium - DP)
5. Binary Search (Easy - Binary Search)

### Pros:
- Fast bulk import
- Pre-configured with test cases
- Good for initial setup

### Cons:
- Requires command line
- Need to edit script for custom problems

---

## Problem Data Structure

When adding problems, here's what you need:

### Required Fields:
- **title**: Problem name (e.g., "Two Sum")
- **difficulty**: Easy, Medium, or Hard
- **topic**: Category (e.g., Arrays, Strings, DP)
- **description**: Full problem statement

### Optional Fields:
- **platform**: Source platform (default: CodeNest)
- **url**: Link to original problem
- **leetcode_url**: Specific LeetCode link
- **examples**: Array of {input, output, explanation}
- **constraints**: Array of constraint strings
- **starter_code**: Object with code templates per language

### Example JSON Format:

```json
{
  "title": "Two Sum",
  "difficulty": "Easy",
  "topic": "Arrays",
  "platform": "LeetCode",
  "description": "Given an array...",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9"
    }
  ],
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9"
  ],
  "starter_code": {
    "python": "def two_sum(nums, target):\n    pass",
    "javascript": "function twoSum(nums, target) {\n}",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n    }\n};"
  }
}
```

---

## Adding Test Cases

Test cases can be added through:

### 1. Django Admin:
- Go to **Test Cases** section
- Click **Add Test Case**
- Select the problem
- Add input and expected output
- Mark as hidden or sample

### 2. Python Script:
```python
from api.models import Problem, TestCase

problem = Problem.objects.get(title="Two Sum")

TestCase.objects.create(
    problem=problem,
    input_data="[2,7,11,15]\n9",
    expected_output="[0,1]",
    is_hidden=False  # Sample test case
)
```

---

## Tips for Adding Good Problems

### 1. Clear Description
- Explain the problem clearly
- Include what input/output format to expect
- Mention any special cases

### 2. Good Examples
- Provide 2-3 examples
- Include edge cases
- Add explanations for complex examples

### 3. Proper Constraints
- Specify input size limits
- Mention value ranges
- Note any special conditions

### 4. Starter Code
- Provide function signatures
- Use clear parameter names
- Add helpful comments

### 5. Test Cases
- Include sample test cases (visible)
- Add edge cases (hidden)
- Test boundary conditions

---

## Importing from LeetCode/Other Platforms

### Manual Import:
1. Copy problem from LeetCode
2. Use the UI form to add it
3. Paste description, examples, constraints
4. Add the LeetCode URL

### Future Enhancement:
We can add automatic scraping/import from:
- LeetCode API
- Codeforces API
- CodeChef API

---

## Troubleshooting

### "Add Problem" button not showing?
- Make sure you're logged in as a teacher/admin
- Check: `localStorage.getItem('userRole')` should be 'teacher'

### Form submission fails?
- Check all required fields are filled
- Ensure backend server is running
- Check browser console for errors

### Can't access Django admin?
- URL: http://localhost:8000/admin/
- Default credentials: admin / admin123
- Create new admin: `python manage.py createsuperuser`

### Script not working?
```bash
cd codenest_backend
venv\Scripts\activate
python add_problems.py
```

---

## Quick Start: Add Your First Problem

### Using UI (Recommended):
1. Login as teacher
2. Go to Problems page
3. Click "+ Add Problem"
4. Fill in:
   - Title: "Hello World"
   - Difficulty: Easy
   - Topic: Basics
   - Description: "Print 'Hello World'"
5. Click "Add Problem"

### Using Script:
```bash
cd codenest_backend
venv\Scripts\activate
python add_problems.py
# Choose option 1 to add sample problems
```

---

## Next Steps

After adding problems:
1. ✅ View them on the Problems page
2. ✅ Students can solve them
3. ✅ Add test cases for auto-grading
4. ✅ Track submissions and analytics

---

## Need Help?

- Check the Django admin for existing problems
- Look at sample problems for reference
- Review the Problem model in `api/models.py`
- Test the API: http://localhost:8000/api/problems/

---

**Happy Problem Adding! 🚀**
