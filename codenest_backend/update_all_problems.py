
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem

def populate_all_problems():
    problems_data = {
        "Two Sum": {
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "examples": [
                { "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]." },
                { "input": "nums = [3,2,4], target = 6", "output": "[1,2]" },
                { "input": "nums = [3,3], target = 6", "output": "[0,1]" }
            ],
            "constraints": [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9",
                "Only one valid answer exists."
            ]
        },
        "Valid Palindrome": {
            "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.",
            "examples": [
                { "input": 's = "A man, a plan, a canal: Panama"', "output": "true", "explanation": "\"amanaplanacanalpanama\" is a palindrome." },
                { "input": 's = "race a car"', "output": "false", "explanation": "\"raceacar\" is not a palindrome." },
                { "input": 's = " "', "output": "true", "explanation": "s is an empty string \"\" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome." }
            ],
            "constraints": [
                "1 <= s.length <= 2 * 10^5", 
                "s consists only of printable ASCII characters."
            ]
        },
        "3Sum": {
            "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
            "examples": [
                { "input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]", "explanation": "The distinct triplets are [-1,0,1] and [-1,-1,2]. Notice that the order of the output and the order of the triplets does not matter." },
                { "input": "nums = [0,1,1]", "output": "[]", "explanation": "The only possible triplet does not sum up to 0." },
                { "input": "nums = [0,0,0]", "output": "[[0,0,0]]", "explanation": "The only possible triplet sums up to 0." }
            ],
            "constraints": [
                "3 <= nums.length <= 3000",
                "-10^5 <= nums[i] <= 10^5"
            ]
        },
        "Reverse String": {
            "description": "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
            "examples": [
                { "input": 's = ["h","e","l","l","o"]', "output": '["o","l","l","e","h"]' },
                { "input": 's = ["H","a","n","n","a","h"]', "output": '["h","a","n","n","a","H"]' }
            ],
            "constraints": [
                "1 <= s.length <= 10^5",
                "s[i] is a printable ascii character."
            ]
        },
        "Climbing Stairs": {
            "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            "examples": [
                { "input": "n = 2", "output": "2", "explanation": "There are two ways to climb to the top. 1. 1 step + 1 step 2. 2 steps" },
                { "input": "n = 3", "output": "3", "explanation": "There are three ways to climb to the top. 1. 1 step + 1 step + 1 step 2. 1 step + 2 steps 3. 2 steps + 1 step" }
            ],
            "constraints": [
                "1 <= n <= 45"
            ]
        },
        "Merge k Sorted Lists": {
            "description": "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            "examples": [
                { "input": 'lists = [[1,4,5],[1,3,4],[2,6]]', "output": '[1,1,2,3,4,4,5,6]', "explanation": "The linked-lists are: [1->4->5, 1->3->4, 2->6]. We merge them into one sorted list: 1->1->2->3->4->4->5->6." },
                { "input": 'lists = []', "output": '[]' },
                { "input": 'lists = [[]]', "output": '[]' }
            ],
            "constraints": [
                "k == lists.length",
                "0 <= k <= 10^4",
                "0 <= lists[i].length <= 500",
                "-10^4 <= lists[i][j] <= 10^4",
                "lists[i] is sorted in ascending order.",
                "The sum of lists[i].length will not exceed 10^4."
            ]
        },
        "Longest Substring Without Repeating Characters": {
            "description": "Given a string s, find the length of the longest substring without repeating characters.",
            "examples": [
                { "input": 's = "abcabcbb"', "output": "3", "explanation": "The answer is \"abc\", with the length of 3." },
                { "input": 's = "bbbbb"', "output": "1", "explanation": "The answer is \"b\", with the length of 1." },
                { "input": 's = "pwwkew"', "output": "3", "explanation": "The answer is \"wke\", with the length of 3. Notice that the answer must be a substring, \"pwke\" is a subsequence and not a substring." }
            ],
            "constraints": [
                "0 <= s.length <= 5 * 10^4",
                "s consists of English letters, digits, symbols and spaces."
            ]
        },
        "Maximum Subarray": {
            "description": "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
            "examples": [
                { "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "The subarray [4,-1,2,1] has the largest sum 6." },
                { "input": "nums = [1]", "output": "1", "explanation": "The subarray [1] has the largest sum 1." },
                { "input": "nums = [5,4,-1,7,8]", "output": "23", "explanation": "The subarray [5,4,-1,7,8] has the largest sum 23." }
            ],
            "constraints": [
                "1 <= nums.length <= 10^5",
                "-10^4 <= nums[i] <= 10^4"
            ]
        },
        "Valid Parentheses": {
            "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            "examples": [
                { "input": 's = "()"', "output": "true" },
                { "input": 's = "()[]{}"', "output": "true" },
                { "input": 's = "(]"', "output": "false" }
            ],
            "constraints": [
                "1 <= s.length <= 10^4",
                "s consists of parentheses only '()[]{}'."
            ]
        },
        "Container With Most Water": {
            "description": "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
            "examples": [
                { "input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49", "explanation": "The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49." },
                { "input": "height = [1,1]", "output": "1" }
            ],
            "constraints": [
                 "n == height.length",
                 "2 <= n <= 10^5",
                 "0 <= height[i] <= 10^4"
            ]
        }
    }

    remaining_problems = Problem.objects.all()
    
    for problem in remaining_problems:
        if problem.title in problems_data:
            print(f"Updating {problem.title}...")
            data = problems_data[problem.title]
            
            # Update fields
            problem.description = data["description"]
            problem.examples = json.dumps(data["examples"])
            problem.constraints = json.dumps(data["constraints"])
            
            # Also ensure a URL is set if missing (mock URL for platform)
            if not problem.url:
                 slug = problem.title.lower().replace(" ", "-")
                 problem.url = f"https://leetcode.com/problems/{slug}"
                 
            if not problem.platform:
                problem.platform = "LeetCode"

            problem.save()
            print(f"Successfully updated {problem.title}")
        else:
            print(f"Skipping {problem.title} (Reason: No data in script or it's a test/custom problem)")
            # Optional: Add generic data for unknown/test problems so user sees something
            if "Test" in problem.title:
                 problem.description = "This is a test problem generated by the system."
                 problem.examples = json.dumps([{"input": "Test Input", "output": "Test Output", "explanation": "This is a test example."}])
                 problem.constraints = json.dumps(["Constraint 1", "Constraint 2"])
                 problem.save()
                 print(f"Added generic data to {problem.title}")

if __name__ == "__main__":
    populate_all_problems()
