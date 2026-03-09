"""
Script to add problems to CodeNest platform
Usage: python add_problems.py
"""

import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem, TestCase

def add_problem(
    title,
    difficulty,
    topic,
    platform="CodeNest",
    url="",
    leetcode_url="",
    description="",
    examples=None,
    constraints=None,
    starter_code=None,
    test_cases=None
):
    """Add a single problem to the database"""
    
    # Create problem
    problem = Problem.objects.create(
        title=title,
        difficulty=difficulty,
        topic=topic,
        platform=platform,
        url=url,
        leetcode_url=leetcode_url,
        description=description,
        examples=json.dumps(examples or []),
        constraints=json.dumps(constraints or []),
        starter_code=json.dumps(starter_code or {})
    )
    
    # Add test cases if provided
    if test_cases:
        for tc in test_cases:
            TestCase.objects.create(
                problem=problem,
                input_data=tc['input'],
                expected_output=tc['output'],
                is_hidden=tc.get('is_hidden', True)
            )
    
    print(f"✅ Added: {title} ({difficulty})")
    return problem


def add_sample_problems():
    """Add sample problems to get started"""
    
    print("🚀 Adding sample problems...\n")
    
    # Problem 1: Two Sum
    add_problem(
        title="Two Sum",
        difficulty="Easy",
        topic="Arrays",
        platform="LeetCode",
        url="https://leetcode.com/problems/two-sum/",
        leetcode_url="https://leetcode.com/problems/two-sum/",
        description="""Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.""",
        examples=[
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1,2]"
            }
        ],
        constraints=[
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        starter_code={
            "python": "def two_sum(nums, target):\n    # Write your code here\n    pass",
            "javascript": "function twoSum(nums, target) {\n    // Write your code here\n}",
            "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
        },
        test_cases=[
            {"input": "[2,7,11,15]\n9", "output": "[0,1]", "is_hidden": False},
            {"input": "[3,2,4]\n6", "output": "[1,2]", "is_hidden": False},
            {"input": "[3,3]\n6", "output": "[0,1]", "is_hidden": True}
        ]
    )
    
    # Problem 2: Valid Palindrome
    add_problem(
        title="Valid Palindrome",
        difficulty="Easy",
        topic="Strings",
        platform="LeetCode",
        url="https://leetcode.com/problems/valid-palindrome/",
        description="""A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.""",
        examples=[
            {
                "input": 's = "A man, a plan, a canal: Panama"',
                "output": "true",
                "explanation": '"amanaplanacanalpanama" is a palindrome.'
            },
            {
                "input": 's = "race a car"',
                "output": "false",
                "explanation": '"raceacar" is not a palindrome.'
            }
        ],
        constraints=[
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters."
        ],
        starter_code={
            "python": "def is_palindrome(s):\n    # Write your code here\n    pass",
            "javascript": "function isPalindrome(s) {\n    // Write your code here\n}",
            "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n    }\n};"
        },
        test_cases=[
            {"input": "A man, a plan, a canal: Panama", "output": "true", "is_hidden": False},
            {"input": "race a car", "output": "false", "is_hidden": False},
            {"input": " ", "output": "true", "is_hidden": True}
        ]
    )
    
    # Problem 3: Reverse Linked List
    add_problem(
        title="Reverse Linked List",
        difficulty="Easy",
        topic="Linked Lists",
        platform="LeetCode",
        url="https://leetcode.com/problems/reverse-linked-list/",
        description="""Given the head of a singly linked list, reverse the list, and return the reversed list.""",
        examples=[
            {
                "input": "head = [1,2,3,4,5]",
                "output": "[5,4,3,2,1]"
            },
            {
                "input": "head = [1,2]",
                "output": "[2,1]"
            }
        ],
        constraints=[
            "The number of nodes in the list is the range [0, 5000].",
            "-5000 <= Node.val <= 5000"
        ],
        starter_code={
            "python": "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\ndef reverse_list(head):\n    # Write your code here\n    pass",
            "javascript": "function reverseList(head) {\n    // Write your code here\n}",
            "java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n    }\n};"
        }
    )
    
    # Problem 4: Maximum Subarray
    add_problem(
        title="Maximum Subarray",
        difficulty="Medium",
        topic="Dynamic Programming",
        platform="LeetCode",
        url="https://leetcode.com/problems/maximum-subarray/",
        description="""Given an integer array `nums`, find the subarray with the largest sum, and return its sum.""",
        examples=[
            {
                "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                "output": "6",
                "explanation": "The subarray [4,-1,2,1] has the largest sum 6."
            },
            {
                "input": "nums = [1]",
                "output": "1"
            }
        ],
        constraints=[
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        starter_code={
            "python": "def max_subarray(nums):\n    # Write your code here\n    pass",
            "javascript": "function maxSubArray(nums) {\n    // Write your code here\n}",
            "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your code here\n    }\n};"
        },
        test_cases=[
            {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "is_hidden": False},
            {"input": "[1]", "output": "1", "is_hidden": False},
            {"input": "[5,4,-1,7,8]", "output": "23", "is_hidden": True}
        ]
    )
    
    # Problem 5: Binary Search
    add_problem(
        title="Binary Search",
        difficulty="Easy",
        topic="Binary Search",
        platform="LeetCode",
        url="https://leetcode.com/problems/binary-search/",
        description="""Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.

You must write an algorithm with `O(log n)` runtime complexity.""",
        examples=[
            {
                "input": "nums = [-1,0,3,5,9,12], target = 9",
                "output": "4",
                "explanation": "9 exists in nums and its index is 4"
            },
            {
                "input": "nums = [-1,0,3,5,9,12], target = 2",
                "output": "-1",
                "explanation": "2 does not exist in nums so return -1"
            }
        ],
        constraints=[
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All the integers in nums are unique.",
            "nums is sorted in ascending order."
        ],
        starter_code={
            "python": "def binary_search(nums, target):\n    # Write your code here\n    pass",
            "javascript": "function search(nums, target) {\n    // Write your code here\n}",
            "java": "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
        }
    )
    
    print(f"\n✅ Successfully added 5 sample problems!")
    print("\nYou can now:")
    print("1. View them at: http://localhost:8000/admin/api/problem/")
    print("2. Access via API: http://localhost:8000/api/problems/")
    print("3. See them in the frontend Problems page")


def add_custom_problem():
    """Interactive mode to add a custom problem"""
    print("\n📝 Add Custom Problem\n")
    
    title = input("Title: ")
    difficulty = input("Difficulty (Easy/Medium/Hard): ")
    topic = input("Topic (e.g., Arrays, Strings, DP): ")
    platform = input("Platform (default: CodeNest): ") or "CodeNest"
    url = input("Problem URL (optional): ")
    description = input("Description: ")
    
    print("\nProblem added! You can add more details via Django admin.")
    
    add_problem(
        title=title,
        difficulty=difficulty,
        topic=topic,
        platform=platform,
        url=url,
        description=description
    )


if __name__ == "__main__":
    print("=" * 60)
    print("CodeNest - Problem Management")
    print("=" * 60)
    print("\nOptions:")
    print("1. Add sample problems (5 problems)")
    print("2. Add custom problem (interactive)")
    print("3. Exit")
    
    choice = input("\nEnter choice (1-3): ")
    
    if choice == "1":
        add_sample_problems()
    elif choice == "2":
        add_custom_problem()
    else:
        print("Exiting...")
