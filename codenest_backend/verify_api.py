
import requests
import json

def verify_api():
    # Login to get token (if needed, but problem view might be public or we can use existing user)
    # The ProblemViewSet allows Any, so we might not need auth for GET /problems/{id}/
    
    # First, list problems to get an ID
    try:
        response = requests.get('http://localhost:8000/api/problems/')
        if response.status_code != 200:
            print(f"Failed to list problems: {response.status_code} {response.text}")
            return

        problems = response.json()
        if not problems:
            print("No problems found to verify.")
            return

        problem_id = problems[0]['id']
        print(f"Verifying Problem ID: {problem_id}")

        # Get specific problem details
        response = requests.get(f'http://localhost:8000/api/problems/{problem_id}/')
        if response.status_code != 200:
            print(f"Failed to get problem details: {response.status_code} {response.text}")
            return

        problem_data = response.json()
        print("Problem Data Keys:", problem_data.keys())
        
        if 'constraints' in problem_data:
            print("\nConstraints found:")
            print(problem_data['constraints'])
            
            # Verify it's a valid JSON string or list (depending on how DRF serializes it)
            # In our model it's a TextField storing JSON string, but serializer might just check field.
            # Actually, in the frontend we parse it. The serializer just returns the string from the model unless we changed it to a JSONField or used a SerializerMethodField.
            # Let's see what we get.
            pass
        else:
            print("\nERROR: 'constraints' field missing in response.")

        if 'examples' in problem_data:
             print("\nExamples found:")
             print(problem_data['examples'])

    except Exception as e:
        print(f"Verification failed with error: {e}")

if __name__ == "__main__":
    verify_api()
