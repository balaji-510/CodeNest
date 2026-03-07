import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api"

def make_request(url, method='GET', data=None):
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            jsonData = json.dumps(data).encode('utf-8')
            req.add_header('Content-Type', 'application/json; charset=utf-8')
            req.add_header('Content-Length', len(jsonData))
            response = urllib.request.urlopen(req, jsonData)
        else:
            response = urllib.request.urlopen(req)
            
        return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Request failed for {url}: {e}")
        return None

def test_api():
    print("Initializing Mock Data...")
    res = make_request(f"{BASE_URL}/init-mock-data/", method='POST', data={})
    if res:
        print(f"Response: {res}")
    else:
        sys.exit(1)
        
    print("\nFetching Dashboard Stats for User 1...")
    # Assuming user 1 was created by init-mock-data if not exists
    res = make_request(f"{BASE_URL}/dashboard-stats/1/")
    if res:
        print(f"Response: {res}")
        print("\nBackend API Verification Successful!")
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_api()
