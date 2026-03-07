
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem

def populate_constraints():
    problems = Problem.objects.all()
    for problem in problems:
        print(f"Updating {problem.title}...")
        if not problem.constraints or problem.constraints == '[]':
            if "Two Sum" in problem.title:
                problem.constraints = json.dumps([
                    "2 <= nums.length <= 10^4",
                    "-10^9 <= nums[i] <= 10^9",
                    "-10^9 <= target <= 10^9",
                    "Only one valid answer exists."
                ])
            elif "Palindrome" in problem.title:
                problem.constraints = json.dumps([
                    "1 <= s.length <= 2 * 10^5",
                    "s consists only of printable ASCII characters."
                ])
            elif "3Sum" in problem.title:
                problem.constraints = json.dumps([
                    "0 <= nums.length <= 3000",
                    "-10^5 <= nums[i] <= 10^5"
                ])
            else:
                problem.constraints = json.dumps([
                    "No constraints available for this problem."
                ])
            problem.save()
            print(f"Updated constraints for {problem.title}")
        else:
            print(f"Constraints already exist for {problem.title}")

if __name__ == "__main__":
    populate_constraints()
