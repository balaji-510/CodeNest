"""
Script to add test cases for all problems in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem, TestCase

# Test cases for each problem
test_cases_data = {
    "Two Sum": [
        {"input": "4\n2 7 11 15\n9", "expected": "0 1", "hidden": False},
        {"input": "3\n3 2 4\n6", "expected": "1 2", "hidden": False},
        {"input": "2\n3 3\n6", "expected": "0 1", "hidden": True},
    ],
    "Valid Palindrome": [
        {"input": "A man, a plan, a canal: Panama", "expected": "true", "hidden": False},
        {"input": "race a car", "expected": "false", "hidden": False},
        {"input": " ", "expected": "true", "hidden": True},
    ],
    "3Sum": [
        {"input": "6\n-1 0 1 2 -1 -4", "expected": "[[-1,-1,2],[-1,0,1]]", "hidden": False},
        {"input": "3\n0 1 1", "expected": "[]", "hidden": False},
        {"input": "3\n0 0 0", "expected": "[[0,0,0]]", "hidden": True},
    ],
    "Reverse Linked List": [
        {"input": "5\n1 2 3 4 5", "expected": "5 4 3 2 1", "hidden": False},
        {"input": "2\n1 2", "expected": "2 1", "hidden": False},
        {"input": "0", "expected": "", "hidden": True},
    ],
    "Merge Two Sorted Lists": [
        {"input": "3\n1 2 4\n3\n1 3 4", "expected": "1 1 2 3 4 4", "hidden": False},
        {"input": "0\n0", "expected": "", "hidden": False},
        {"input": "1\n5\n2\n1 2", "expected": "1 2 5", "hidden": True},
    ],
    "Binary Tree Inorder Traversal": [
        {"input": "3\n1 null 2 3", "expected": "1 3 2", "hidden": False},
        {"input": "0", "expected": "", "hidden": False},
        {"input": "1\n1", "expected": "1", "hidden": True},
    ],
    "Maximum Depth of Binary Tree": [
        {"input": "5\n3 9 20 null null 15 7", "expected": "3", "hidden": False},
        {"input": "2\n1 null 2", "expected": "2", "hidden": False},
        {"input": "0", "expected": "0", "hidden": True},
    ],
    "Climbing Stairs": [
        {"input": "2", "expected": "2", "hidden": False},
        {"input": "3", "expected": "3", "hidden": False},
        {"input": "5", "expected": "8", "hidden": True},
    ],
    "House Robber": [
        {"input": "4\n1 2 3 1", "expected": "4", "hidden": False},
        {"input": "4\n2 7 9 3", "expected": "12", "hidden": False},
        {"input": "5\n2 1 1 2 1", "expected": "4", "hidden": True},
    ],
    "Coin Change": [
        {"input": "3\n1 2 5\n11", "expected": "3", "hidden": False},
        {"input": "1\n2\n3", "expected": "-1", "hidden": False},
        {"input": "1\n1\n0", "expected": "0", "hidden": True},
    ],
    "Binary Search": [
        {"input": "4\n-1 0 3 5 9 12\n9", "expected": "4", "hidden": False},
        {"input": "4\n-1 0 3 5 9 12\n2", "expected": "-1", "hidden": False},
        {"input": "1\n5\n5", "expected": "0", "hidden": True},
    ],
    "Search in Rotated Sorted Array": [
        {"input": "7\n4 5 6 7 0 1 2\n0", "expected": "4", "hidden": False},
        {"input": "7\n4 5 6 7 0 1 2\n3", "expected": "-1", "hidden": False},
        {"input": "1\n1\n0", "expected": "-1", "hidden": True},
    ],
    "Valid Parentheses": [
        {"input": "()", "expected": "true", "hidden": False},
        {"input": "()[]{}", "expected": "true", "hidden": False},
        {"input": "(]", "expected": "false", "hidden": True},
    ],
    "Min Stack": [
        {"input": "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin", "expected": "-3\n0\n-2", "hidden": False},
        {"input": "push 1\npush 2\ntop\ngetMin", "expected": "2\n1", "hidden": False},
        {"input": "push 0\ngetMin", "expected": "0", "hidden": True},
    ],
    "Implement Queue using Stacks": [
        {"input": "push 1\npush 2\npeek\npop\nempty", "expected": "1\n1\nfalse", "hidden": False},
        {"input": "push 1\npop\nempty", "expected": "1\ntrue", "hidden": False},
        {"input": "push 5\npeek", "expected": "5", "hidden": True},
    ],
    "Contains Duplicate": [
        {"input": "4\n1 2 3 1", "expected": "true", "hidden": False},
        {"input": "4\n1 2 3 4", "expected": "false", "hidden": False},
        {"input": "10\n1 1 1 3 3 4 3 2 4 2", "expected": "true", "hidden": True},
    ],
    "Two Sum II": [
        {"input": "4\n2 7 11 15\n9", "expected": "1 2", "hidden": False},
        {"input": "3\n2 3 4\n6", "expected": "1 3", "hidden": False},
        {"input": "2\n-1 0\n-1", "expected": "1 2", "hidden": True},
    ],
    "Product of Array Except Self": [
        {"input": "4\n1 2 3 4", "expected": "24 12 8 6", "hidden": False},
        {"input": "5\n-1 1 0 -3 3", "expected": "0 0 9 0 0", "hidden": False},
        {"input": "2\n1 2", "expected": "2 1", "hidden": True},
    ],
    "Maximum Subarray": [
        {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expected": "6", "hidden": False},
        {"input": "1\n1", "expected": "1", "hidden": False},
        {"input": "8\n5 4 -1 7 8", "expected": "23", "hidden": True},
    ],
    "Longest Substring Without Repeating Characters": [
        {"input": "abcabcbb", "expected": "3", "hidden": False},
        {"input": "bbbbb", "expected": "1", "hidden": False},
        {"input": "pwwkew", "expected": "3", "hidden": True},
    ],
    "Longest Palindromic Substring": [
        {"input": "babad", "expected": "bab", "hidden": False},
        {"input": "cbbd", "expected": "bb", "hidden": False},
        {"input": "a", "expected": "a", "hidden": True},
    ],
    "Group Anagrams": [
        {"input": "6\neat tea tan ate nat bat", "expected": "[[bat],[nat,tan],[ate,eat,tea]]", "hidden": False},
        {"input": "1\na", "expected": "[[a]]", "hidden": False},
        {"input": "0", "expected": "[]", "hidden": True},
    ],
    "Number of Islands": [
        {"input": "4 5\n11110\n11010\n11000\n00000", "expected": "1", "hidden": False},
        {"input": "4 5\n11000\n11000\n00100\n00011", "expected": "3", "hidden": False},
        {"input": "1 1\n1", "expected": "1", "hidden": True},
    ],
    "Clone Graph": [
        {"input": "[[2,4],[1,3],[2,4],[1,3]]", "expected": "[[2,4],[1,3],[2,4],[1,3]]", "hidden": False},
        {"input": "[[]]", "expected": "[[]]", "hidden": False},
        {"input": "[]", "expected": "[]", "hidden": True},
    ],
    "Course Schedule": [
        {"input": "2\n1\n1 0", "expected": "true", "hidden": False},
        {"input": "2\n2\n1 0\n0 1", "expected": "false", "hidden": False},
        {"input": "1\n0", "expected": "true", "hidden": True},
    ],
    "Fibonacci Number": [
        {"input": "2", "expected": "1", "hidden": False},
        {"input": "3", "expected": "2", "hidden": False},
        {"input": "4", "expected": "3", "hidden": True},
    ],
    "Unique Paths": [
        {"input": "3 7", "expected": "28", "hidden": False},
        {"input": "3 2", "expected": "3", "hidden": False},
        {"input": "1 1", "expected": "1", "hidden": True},
    ],
    "Longest Increasing Subsequence": [
        {"input": "8\n10 9 2 5 3 7 101 18", "expected": "4", "hidden": False},
        {"input": "7\n0 1 0 3 2 3", "expected": "4", "hidden": False},
        {"input": "8\n7 7 7 7 7 7 7", "expected": "1", "hidden": True},
    ],
    "Word Break": [
        {"input": "leetcode\n2\nleet code", "expected": "true", "hidden": False},
        {"input": "applepenapple\n2\napple pen", "expected": "true", "hidden": False},
        {"input": "catsandog\n5\ncats dog sand and cat", "expected": "false", "hidden": True},
    ],
    "Combination Sum": [
        {"input": "4\n2 3 6 7\n7", "expected": "[[2,2,3],[7]]", "hidden": False},
        {"input": "3\n2 3 5\n8", "expected": "[[2,2,2,2],[2,3,3],[3,5]]", "hidden": False},
        {"input": "1\n2\n1", "expected": "[]", "hidden": True},
    ],
    "Generate Parentheses": [
        {"input": "3", "expected": "((())),(()()),(())(),()(()),()()()","hidden": False},
        {"input": "1", "expected": "()", "hidden": False},
        {"input": "2", "expected": "(()),()()", "hidden": True},
    ],
}

def add_test_cases():
    """Add test cases for all problems"""
    problems = Problem.objects.all()
    
    added_count = 0
    skipped_count = 0
    
    for problem in problems:
        # Check if test cases already exist
        existing_count = TestCase.objects.filter(problem=problem).count()
        
        if existing_count > 0:
            print(f"⏭️  Skipping '{problem.title}' - already has {existing_count} test cases")
            skipped_count += 1
            continue
        
        # Get test cases for this problem
        if problem.title in test_cases_data:
            test_cases = test_cases_data[problem.title]
            
            for tc in test_cases:
                TestCase.objects.create(
                    problem=problem,
                    input_data=tc['input'],
                    expected_output=tc['expected'],
                    is_hidden=tc['hidden']
                )
            
            print(f"✅ Added {len(test_cases)} test cases for '{problem.title}'")
            added_count += 1
        else:
            print(f"⚠️  No test cases defined for '{problem.title}'")
    
    print(f"\n{'='*50}")
    print(f"✅ Added test cases for {added_count} problems")
    print(f"⏭️  Skipped {skipped_count} problems (already have test cases)")
    print(f"{'='*50}")

if __name__ == '__main__':
    print("Adding test cases for all problems...\n")
    add_test_cases()
