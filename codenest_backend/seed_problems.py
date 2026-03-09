"""
Seed database with popular problems from various platforms
Covers all major topics: Arrays, Strings, DP, Trees, Graphs, etc.
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem, TestCase

def clear_existing_problems():
    """Clear all existing problems"""
    Problem.objects.all().delete()
    print("✅ Cleared existing problems")

def add_problem(data):
    """Helper to add a problem"""
    problem = Problem.objects.create(
        title=data['title'],
        difficulty=data['difficulty'],
        topic=data['topic'],
        platform=data['platform'],
        url=data.get('url', ''),
        leetcode_url=data.get('leetcode_url', ''),
        description=data['description'],
        examples=json.dumps(data.get('examples', [])),
        constraints=json.dumps(data.get('constraints', [])),
        starter_code=json.dumps(data.get('starter_code', {}))
    )
    
    # Add test cases if provided
    for tc in data.get('test_cases', []):
        TestCase.objects.create(
            problem=problem,
            input_data=tc['input'],
            expected_output=tc['output'],
            is_hidden=tc.get('is_hidden', True)
        )
    
    print(f"✅ Added: {data['title']} ({data['difficulty']} - {data['topic']})")
    return problem


# Problem definitions organized by topic
PROBLEMS = {
    "Arrays": [
        {
            "title": "Two Sum",
            "difficulty": "Easy",
            "topic": "Arrays",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/two-sum/",
            "leetcode_url": "https://leetcode.com/problems/two-sum/",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "examples": [
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] == 9"},
                {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
            ],
            "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
            "starter_code": {
                "python": "def two_sum(nums, target):\n    pass",
                "javascript": "function twoSum(nums, target) {\n}",
                "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n    }\n}",
                "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n}"
            }
        },
        {
            "title": "Best Time to Buy and Sell Stock",
            "difficulty": "Easy",
            "topic": "Arrays",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
            "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.",
            "examples": [
                {"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."}
            ],
            "constraints": ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"]
        },
        {
            "title": "Contains Duplicate",
            "difficulty": "Easy",
            "topic": "Arrays",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/contains-duplicate/",
            "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
            "examples": [
                {"input": "nums = [1,2,3,1]", "output": "true"},
                {"input": "nums = [1,2,3,4]", "output": "false"}
            ],
            "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"]
        },
        {
            "title": "Product of Array Except Self",
            "difficulty": "Medium",
            "topic": "Arrays",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/product-of-array-except-self/",
            "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
            "examples": [
                {"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]"}
            ],
            "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"]
        },
        {
            "title": "Maximum Subarray",
            "difficulty": "Medium",
            "topic": "Arrays",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/maximum-subarray/",
            "description": "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
            "examples": [
                {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6."}
            ],
            "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"]
        }
    ],
    
    "Strings": [
        {
            "title": "Valid Anagram",
            "difficulty": "Easy",
            "topic": "Strings",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/valid-anagram/",
            "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
            "examples": [
                {"input": 's = "anagram", t = "nagaram"', "output": "true"},
                {"input": 's = "rat", t = "car"', "output": "false"}
            ],
            "constraints": ["1 <= s.length, t.length <= 5 * 10^4"]
        },
        {
            "title": "Valid Palindrome",
            "difficulty": "Easy",
            "topic": "Strings",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/valid-palindrome/",
            "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
            "examples": [
                {"input": 's = "A man, a plan, a canal: Panama"', "output": "true"}
            ],
            "constraints": ["1 <= s.length <= 2 * 10^5"]
        },
        {
            "title": "Longest Substring Without Repeating Characters",
            "difficulty": "Medium",
            "topic": "Strings",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            "description": "Given a string s, find the length of the longest substring without repeating characters.",
            "examples": [
                {"input": 's = "abcabcbb"', "output": "3", "explanation": 'The answer is "abc", with the length of 3.'}
            ],
            "constraints": ["0 <= s.length <= 5 * 10^4"]
        },
        {
            "title": "Group Anagrams",
            "difficulty": "Medium",
            "topic": "Strings",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/group-anagrams/",
            "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
            "examples": [
                {"input": 'strs = ["eat","tea","tan","ate","nat","bat"]', "output": '[["bat"],["nat","tan"],["ate","eat","tea"]]'}
            ],
            "constraints": ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"]
        }
    ],

    
    "Linked Lists": [
        {
            "title": "Reverse Linked List",
            "difficulty": "Easy",
            "topic": "Linked Lists",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/reverse-linked-list/",
            "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            "examples": [
                {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}
            ],
            "constraints": ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"]
        },
        {
            "title": "Merge Two Sorted Lists",
            "difficulty": "Easy",
            "topic": "Linked Lists",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/merge-two-sorted-lists/",
            "description": "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.",
            "examples": [
                {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"}
            ],
            "constraints": ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100"]
        },
        {
            "title": "Linked List Cycle",
            "difficulty": "Easy",
            "topic": "Linked Lists",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/linked-list-cycle/",
            "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
            "examples": [
                {"input": "head = [3,2,0,-4], pos = 1", "output": "true", "explanation": "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed)."}
            ],
            "constraints": ["The number of the nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5"]
        }
    ],
    
    "Trees": [
        {
            "title": "Maximum Depth of Binary Tree",
            "difficulty": "Easy",
            "topic": "Trees",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            "description": "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
            "examples": [
                {"input": "root = [3,9,20,null,null,15,7]", "output": "3"}
            ],
            "constraints": ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"]
        },
        {
            "title": "Invert Binary Tree",
            "difficulty": "Easy",
            "topic": "Trees",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/invert-binary-tree/",
            "description": "Given the root of a binary tree, invert the tree, and return its root.",
            "examples": [
                {"input": "root = [4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"}
            ],
            "constraints": ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"]
        },
        {
            "title": "Binary Tree Level Order Traversal",
            "difficulty": "Medium",
            "topic": "Trees",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
            "description": "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
            "examples": [
                {"input": "root = [3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]"}
            ],
            "constraints": ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"]
        },
        {
            "title": "Validate Binary Search Tree",
            "difficulty": "Medium",
            "topic": "Trees",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/validate-binary-search-tree/",
            "description": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
            "examples": [
                {"input": "root = [2,1,3]", "output": "true"}
            ],
            "constraints": ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"]
        }
    ],
    
    "Graphs": [
        {
            "title": "Number of Islands",
            "difficulty": "Medium",
            "topic": "Graphs",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/number-of-islands/",
            "description": "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
            "examples": [
                {"input": 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', "output": "1"}
            ],
            "constraints": ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"]
        },
        {
            "title": "Clone Graph",
            "difficulty": "Medium",
            "topic": "Graphs",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/clone-graph/",
            "description": "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
            "examples": [
                {"input": "adjList = [[2,4],[1,3],[2,4],[1,3]]", "output": "[[2,4],[1,3],[2,4],[1,3]]"}
            ],
            "constraints": ["The number of nodes in the graph is in the range [0, 100].", "1 <= Node.val <= 100"]
        },
        {
            "title": "Course Schedule",
            "difficulty": "Medium",
            "topic": "Graphs",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/course-schedule/",
            "description": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses.",
            "examples": [
                {"input": "numCourses = 2, prerequisites = [[1,0]]", "output": "true"}
            ],
            "constraints": ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"]
        }
    ],

    
    "Dynamic Programming": [
        {
            "title": "Climbing Stairs",
            "difficulty": "Easy",
            "topic": "Dynamic Programming",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/climbing-stairs/",
            "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            "examples": [
                {"input": "n = 2", "output": "2", "explanation": "1. 1 step + 1 step\n2. 2 steps"},
                {"input": "n = 3", "output": "3", "explanation": "1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"}
            ],
            "constraints": ["1 <= n <= 45"]
        },
        {
            "title": "House Robber",
            "difficulty": "Medium",
            "topic": "Dynamic Programming",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/house-robber/",
            "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
            "examples": [
                {"input": "nums = [1,2,3,1]", "output": "4", "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4."}
            ],
            "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"]
        },
        {
            "title": "Coin Change",
            "difficulty": "Medium",
            "topic": "Dynamic Programming",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/coin-change/",
            "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
            "examples": [
                {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"}
            ],
            "constraints": ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"]
        },
        {
            "title": "Longest Increasing Subsequence",
            "difficulty": "Medium",
            "topic": "Dynamic Programming",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/longest-increasing-subsequence/",
            "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
            "examples": [
                {"input": "nums = [10,9,2,5,3,7,101,18]", "output": "4", "explanation": "The longest increasing subsequence is [2,3,7,101], therefore the length is 4."}
            ],
            "constraints": ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"]
        }
    ],
    
    "Binary Search": [
        {
            "title": "Binary Search",
            "difficulty": "Easy",
            "topic": "Binary Search",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/binary-search/",
            "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
            "examples": [
                {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"},
                {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"}
            ],
            "constraints": ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4"]
        },
        {
            "title": "Search in Rotated Sorted Array",
            "difficulty": "Medium",
            "topic": "Binary Search",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
            "description": "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
            "examples": [
                {"input": "nums = [4,5,6,7,0,1,2], target = 0", "output": "4"}
            ],
            "constraints": ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4"]
        }
    ],
    
    "Stacks": [
        {
            "title": "Valid Parentheses",
            "difficulty": "Easy",
            "topic": "Stacks",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/valid-parentheses/",
            "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
            "examples": [
                {"input": 's = "()"', "output": "true"},
                {"input": 's = "()[]{}"', "output": "true"},
                {"input": 's = "(]"', "output": "false"}
            ],
            "constraints": ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."]
        },
        {
            "title": "Min Stack",
            "difficulty": "Medium",
            "topic": "Stacks",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/min-stack/",
            "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
            "examples": [
                {"input": '["MinStack","push","push","push","getMin","pop","top","getMin"]', "output": "[null,null,null,null,-3,null,0,-2]"}
            ],
            "constraints": ["-2^31 <= val <= 2^31 - 1", "Methods pop, top and getMin operations will always be called on non-empty stacks."]
        }
    ],
    
    "Hashing": [
        {
            "title": "Two Sum",
            "difficulty": "Easy",
            "topic": "Hashing",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/two-sum/",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target using hash map.",
            "examples": [
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}
            ],
            "constraints": ["2 <= nums.length <= 10^4"]
        },
        {
            "title": "Longest Consecutive Sequence",
            "difficulty": "Medium",
            "topic": "Hashing",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/longest-consecutive-sequence/",
            "description": "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.",
            "examples": [
                {"input": "nums = [100,4,200,1,3,2]", "output": "4", "explanation": "The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4."}
            ],
            "constraints": ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"]
        }
    ],
    
    "Recursion": [
        {
            "title": "Fibonacci Number",
            "difficulty": "Easy",
            "topic": "Recursion",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/fibonacci-number/",
            "description": "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.",
            "examples": [
                {"input": "n = 2", "output": "1", "explanation": "F(2) = F(1) + F(0) = 1 + 0 = 1."},
                {"input": "n = 3", "output": "2", "explanation": "F(3) = F(2) + F(1) = 1 + 1 = 2."}
            ],
            "constraints": ["0 <= n <= 30"]
        },
        {
            "title": "Power of Two",
            "difficulty": "Easy",
            "topic": "Recursion",
            "platform": "LeetCode",
            "url": "https://leetcode.com/problems/power-of-two/",
            "description": "Given an integer n, return true if it is a power of two. Otherwise, return false.",
            "examples": [
                {"input": "n = 1", "output": "true", "explanation": "2^0 = 1"},
                {"input": "n = 16", "output": "true", "explanation": "2^4 = 16"}
            ],
            "constraints": ["-2^31 <= n <= 2^31 - 1"]
        }
    ]
}


def seed_all_problems():
    """Seed all problems from all topics"""
    print("\n" + "="*60)
    print("🚀 Seeding CodeNest with Popular Problems")
    print("="*60 + "\n")
    
    total_added = 0
    
    for topic, problems in PROBLEMS.items():
        print(f"\n📚 Adding {topic} problems...")
        for problem_data in problems:
            add_problem(problem_data)
            total_added += 1
    
    print("\n" + "="*60)
    print(f"✅ Successfully added {total_added} problems!")
    print("="*60)
    print("\nProblems by topic:")
    for topic, problems in PROBLEMS.items():
        print(f"  • {topic}: {len(problems)} problems")
    
    print("\nYou can now:")
    print("  1. View them at: http://localhost:8000/admin/api/problem/")
    print("  2. Access via API: http://localhost:8000/api/problems/")
    print("  3. See them in the frontend: http://localhost:5173/problems")
    print("\n")

if __name__ == "__main__":
    import sys
    
    print("\n" + "="*60)
    print("CodeNest Problem Seeder")
    print("="*60)
    print("\nThis will add popular problems from LeetCode covering:")
    print("  • Arrays (5 problems)")
    print("  • Strings (4 problems)")
    print("  • Linked Lists (3 problems)")
    print("  • Trees (4 problems)")
    print("  • Graphs (3 problems)")
    print("  • Dynamic Programming (4 problems)")
    print("  • Binary Search (2 problems)")
    print("  • Stacks (2 problems)")
    print("  • Hashing (2 problems)")
    print("  • Recursion (2 problems)")
    print(f"\nTotal: {sum(len(p) for p in PROBLEMS.values())} problems")
    
    print("\nOptions:")
    print("  1. Add all problems (recommended)")
    print("  2. Clear existing and add all")
    print("  3. Exit")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        seed_all_problems()
    elif choice == "2":
        confirm = input("⚠️  This will delete ALL existing problems. Continue? (yes/no): ").strip().lower()
        if confirm == "yes":
            clear_existing_problems()
            seed_all_problems()
        else:
            print("Cancelled.")
    else:
        print("Exiting...")
