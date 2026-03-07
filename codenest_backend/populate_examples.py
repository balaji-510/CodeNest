
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem

def populate_examples():
    problems = Problem.objects.all()
    for problem in problems:
        print(f"Checking {problem.title}...")
        
        updated = False
        
        # Reverse String
        if "Reverse String" in problem.title:
            if not problem.examples or problem.examples == '[]':
                problem.examples = json.dumps([
                    { "input": 's = ["h","e","l","l","o"]', "output": '["o","l","l","e","h"]' },
                    { "input": 's = ["H","a","n","n","a","h"]', "output": '["h","a","n","n","a","H"]' }
                ])
                if not problem.constraints or problem.constraints == '[]':
                     problem.constraints = json.dumps([
                        "1 <= s.length <= 10^5",
                        "s[i] is a printable ascii character."
                    ])
                updated = True

        # Longest Substring Without Repeating Characters
        elif "Longest Substring" in problem.title:
             if not problem.examples or problem.examples == '[]':
                problem.examples = json.dumps([
                    { "input": 's = "abcabcbb"', "output": "3", "explanation": "The answer is \"abc\", with the length of 3." },
                    { "input": 's = "bbbbb"', "output": "1", "explanation": "The answer is \"b\", with the length of 1." },
                    { "input": 's = "pwwkew"', "output": "3", "explanation": "The answer is \"wke\", with the length of 3." }
                ])
                if not problem.constraints or problem.constraints == '[]':
                    problem.constraints = json.dumps([
                        "0 <= s.length <= 5 * 10^4",
                        "s consists of English letters, digits, symbols and spaces."
                    ])
                updated = True
        
        if updated:
            problem.save()
            print(f"Updated examples/constraints for {problem.title}")
        else:
            print(f"No updates needed for {problem.title}")

if __name__ == "__main__":
    populate_examples()
