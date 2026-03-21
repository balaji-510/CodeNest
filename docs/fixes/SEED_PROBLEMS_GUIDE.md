# 🌱 Seed Problems Guide

## Quick Start - Add 31 Popular Problems

We've created a comprehensive collection of **31 popular problems** from LeetCode covering all major topics!

### Run the Seeder:

```bash
cd codenest_backend
venv\Scripts\activate
python seed_problems.py
```

### What You'll Get:

**31 Problems across 10 topics:**

1. **Arrays** (5 problems)
   - Two Sum (Easy)
   - Best Time to Buy and Sell Stock (Easy)
   - Contains Duplicate (Easy)
   - Product of Array Except Self (Medium)
   - Maximum Subarray (Medium)

2. **Strings** (4 problems)
   - Valid Anagram (Easy)
   - Valid Palindrome (Easy)
   - Longest Substring Without Repeating Characters (Medium)
   - Group Anagrams (Medium)

3. **Linked Lists** (3 problems)
   - Reverse Linked List (Easy)
   - Merge Two Sorted Lists (Easy)
   - Linked List Cycle (Easy)

4. **Trees** (4 problems)
   - Maximum Depth of Binary Tree (Easy)
   - Invert Binary Tree (Easy)
   - Binary Tree Level Order Traversal (Medium)
   - Validate Binary Search Tree (Medium)

5. **Graphs** (3 problems)
   - Number of Islands (Medium)
   - Clone Graph (Medium)
   - Course Schedule (Medium)

6. **Dynamic Programming** (4 problems)
   - Climbing Stairs (Easy)
   - House Robber (Medium)
   - Coin Change (Medium)
   - Longest Increasing Subsequence (Medium)

7. **Binary Search** (2 problems)
   - Binary Search (Easy)
   - Search in Rotated Sorted Array (Medium)

8. **Stacks** (2 problems)
   - Valid Parentheses (Easy)
   - Min Stack (Medium)

9. **Hashing** (2 problems)
   - Two Sum (Easy)
   - Longest Consecutive Sequence (Medium)

10. **Recursion** (2 problems)
    - Fibonacci Number (Easy)
    - Power of Two (Easy)

---

## Usage Options

### Option 1: Add All Problems (Recommended)
```bash
python seed_problems.py
# Choose option 1
```
This adds all 31 problems to your database.

### Option 2: Clear and Re-seed
```bash
python seed_problems.py
# Choose option 2
# Type "yes" to confirm
```
This deletes all existing problems and adds the new ones.

### Option 3: Exit
Just exits without making changes.

---

## What Each Problem Includes:

✅ **Title** - Problem name
✅ **Difficulty** - Easy/Medium/Hard
✅ **Topic** - Category (Arrays, Strings, etc.)
✅ **Platform** - Source (LeetCode)
✅ **URL** - Link to original problem
✅ **Description** - Full problem statement
✅ **Examples** - Input/output examples with explanations
✅ **Constraints** - Problem constraints
✅ **Starter Code** - Templates for Python, JavaScript, Java, C++ (where applicable)

---

## After Seeding

### View Problems:

1. **Frontend**: http://localhost:5173/problems
2. **Django Admin**: http://localhost:8000/admin/api/problem/
3. **API**: http://localhost:8000/api/problems/

### Filter by Topic:
- Use the topic dropdown on the Problems page
- All problems are tagged with their respective topics

### Filter by Difficulty:
- Use the difficulty buttons (Easy/Medium/Hard)

---

## Difficulty Distribution:

- **Easy**: 14 problems (45%)
- **Medium**: 17 problems (55%)
- **Hard**: 0 problems (can add more later)

---

## Adding More Problems

### Method 1: Use the UI
1. Login as teacher
2. Go to Problems page
3. Click "+ Add Problem"
4. Fill the form

### Method 2: Edit seed_problems.py
Add more problems to the `PROBLEMS` dictionary:

```python
"YourTopic": [
    {
        "title": "Your Problem",
        "difficulty": "Easy",
        "topic": "YourTopic",
        "platform": "LeetCode",
        "url": "https://...",
        "description": "...",
        "examples": [...],
        "constraints": [...]
    }
]
```

Then run: `python seed_problems.py`

---

## Troubleshooting

### "Module not found" error:
```bash
cd codenest_backend
venv\Scripts\activate
python seed_problems.py
```

### Problems not showing in frontend:
- Check backend is running: http://localhost:8000
- Check API: http://localhost:8000/api/problems/
- Clear browser cache and reload

### Want to start fresh:
```bash
python seed_problems.py
# Choose option 2 (Clear and re-seed)
# Type "yes"
```

---

## Next Steps

After seeding:

1. ✅ **View Problems** - Go to Problems page
2. ✅ **Try Solving** - Click on any problem
3. ✅ **Add Test Cases** - Use Django admin to add test cases
4. ✅ **Add More Problems** - Use the UI form or edit the script
5. ✅ **Track Progress** - Students can start solving!

---

## Benefits of These Problems

- ✅ **Interview Prep** - All are popular interview questions
- ✅ **Topic Coverage** - Covers all major DSA topics
- ✅ **Difficulty Progression** - Mix of Easy and Medium
- ✅ **Real Platform Links** - Links to LeetCode for reference
- ✅ **Well Documented** - Clear descriptions and examples

---

## Platform Coverage

Currently includes problems from:
- **LeetCode** - 31 problems

Future additions can include:
- CodeChef
- Codeforces
- HackerRank
- GeeksforGeeks

---

**Happy Coding! 🚀**
