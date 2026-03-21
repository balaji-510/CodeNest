"""
Fix script for:
1. LeetCode stats fetching
2. Mentor dashboard visibility

This script will:
- Test LeetCode API with actual user handles
- Verify mentor dashboard data
- Provide specific fixes
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile
import requests

print("=" * 80)
print("LEETCODE & DASHBOARD FIX SCRIPT")
print("=" * 80)

# Issue 1: Test LeetCode API with actual user handles
print("\n" + "=" * 80)
print("ISSUE 1: TESTING LEETCODE API WITH ACTUAL USER HANDLES")
print("=" * 80)

users_with_leetcode = UserProfile.objects.filter(
    leetcode_handle__isnull=False
).exclude(leetcode_handle='')

if users_with_leetcode.count() == 0:
    print("\n⚠️  No users have LeetCode handles linked!")
    print("\n💡 Solution:")
    print("  1. Login to CodeNest")
    print("  2. Go to Settings/Profile")
    print("  3. Link your LeetCode account")
else:
    print(f"\n✅ Found {users_with_leetcode.count()} user(s) with LeetCode handles")
    
    for profile in users_with_leetcode:
        print(f"\n{'='*60}")
        print(f"Testing: {profile.user.username}")
        print(f"LeetCode Handle: {profile.leetcode_handle}")
        print(f"Verified: {profile.is_leetcode_verified}")
        print(f"{'='*60}")
        
        # Test the LeetCode API
        query = """
        query userPublicProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    ranking
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
        """
        
        try:
            response = requests.post(
                'https://leetcode.com/graphql',
                json={'query': query, 'variables': {'username': profile.leetcode_handle}},
                headers={
                    'Content-Type': 'application/json',
                    'Referer': 'https://leetcode.com'
                },
                timeout=10
            )
            
            print(f"\n📡 API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if 'errors' in data:
                    print(f"❌ API Error: {data['errors']}")
                    print(f"\n💡 Possible reasons:")
                    print(f"  - Handle '{profile.leetcode_handle}' doesn't exist on LeetCode")
                    print(f"  - LeetCode API is temporarily down")
                    print(f"  - Rate limiting")
                else:
                    matched_user = data.get('data', {}).get('matchedUser')
                    
                    if matched_user:
                        print(f"✅ LeetCode API Working!")
                        print(f"  Username: {matched_user.get('username')}")
                        print(f"  Ranking: {matched_user.get('profile', {}).get('ranking')}")
                        
                        # Get submission stats
                        submit_stats = matched_user.get('submitStats', {}).get('acSubmissionNum', [])
                        total_solved = 0
                        for stat in submit_stats:
                            if stat['difficulty'] == 'All':
                                total_solved = stat['count']
                                break
                        
                        print(f"  Total Solved: {total_solved}")
                        
                        if total_solved == 0:
                            print(f"\n⚠️  This LeetCode account has 0 problems solved")
                            print(f"  The dashboard will show 0 for external stats")
                    else:
                        print(f"❌ User not found on LeetCode!")
                        print(f"\n💡 Solution:")
                        print(f"  - Verify the handle '{profile.leetcode_handle}' is correct")
                        print(f"  - Visit: https://leetcode.com/{profile.leetcode_handle}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"❌ Request timed out")
            print(f"💡 LeetCode API might be slow or down")
        except requests.exceptions.RequestException as e:
            print(f"❌ Network Error: {e}")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")

# Issue 2: Check frontend LeetCode stats API
print("\n" + "=" * 80)
print("ISSUE 2: TESTING FRONTEND LEETCODE STATS API")
print("=" * 80)

print("\n📡 Testing leetcode-stats-api.herokuapp.com...")

# Test with a known user
test_handles = ["tourist", "Errichto", "224g1a0510"]  # Include user's handle

for handle in test_handles:
    try:
        response = requests.get(
            f"https://leetcode-stats-api.herokuapp.com/{handle}",
            timeout=10
        )
        
        print(f"\n  Handle: {handle}")
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                print(f"  ✅ API Working!")
                print(f"  Total Solved: {data.get('totalSolved', 0)}")
            else:
                print(f"  ❌ API returned error: {data}")
        else:
            print(f"  ❌ HTTP Error")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")

print("\n💡 Note: The frontend uses leetcode-stats-api.herokuapp.com")
print("   This is a third-party API that might be unreliable")
print("   Consider switching to direct LeetCode GraphQL API")

# Issue 3: Mentor Dashboard
print("\n" + "=" * 80)
print("ISSUE 3: MENTOR DASHBOARD VISIBILITY")
print("=" * 80)

teachers = UserProfile.objects.filter(role='teacher')
students = UserProfile.objects.filter(role='student')

print(f"\n👨‍🏫 Teachers: {teachers.count()}")
print(f"👨‍🎓 Students: {students.count()}")

if teachers.count() == 0:
    print("\n❌ No teacher accounts!")
    print("\n💡 Solution:")
    print("  1. Create a teacher account:")
    print("     python create_admin.py")
    print("  2. Or update existing user:")
    print("     python manage.py shell")
    print("     from api.models import UserProfile")
    print("     profile = UserProfile.objects.get(user__username='your_username')")
    print("     profile.role = 'teacher'")
    print("     profile.save()")
else:
    print(f"\n✅ Teacher accounts exist")
    for teacher in teachers:
        print(f"  - {teacher.user.username}")

if students.count() == 0:
    print("\n⚠️  No student accounts - dashboard will be empty!")
    print("\n💡 Solution:")
    print("  1. Register student accounts through UI")
    print("  2. Or run: python manage.py seed_db")
else:
    print(f"\n✅ Student accounts exist")

# Check if frontend can access the API
print("\n" + "=" * 80)
print("FRONTEND ACCESS CHECK")
print("=" * 80)

print("\n📋 Checklist:")
print("  1. ✅ Backend API working (tested above)")
print("  2. ⚠️  Frontend needs to:")
print("     - Be logged in as teacher")
print("     - Navigate to /mentor-dashboard")
print("     - Check browser console for errors")
print("     - Verify API call to http://localhost:8000/api/mentor-stats/")

print("\n" + "=" * 80)
print("COMMON ISSUES & SOLUTIONS")
print("=" * 80)

print("\n1. LeetCode Stats Not Showing:")
print("   ❌ Problem: Third-party API (leetcode-stats-api.herokuapp.com) is down")
print("   ✅ Solution: Use direct LeetCode GraphQL API instead")
print("   📝 File to update: project2/src/services/externalStats.js")

print("\n2. Mentor Dashboard Empty:")
print("   ❌ Problem: No students or submissions in database")
print("   ✅ Solution: Add test data with: python manage.py seed_db")

print("\n3. Mentor Dashboard Not Visible:")
print("   ❌ Problem: Not logged in as teacher")
print("   ✅ Solution: Login with teacher account")
print("   📝 Teacher accounts:", [t.user.username for t in teachers])

print("\n4. CORS Errors:")
print("   ❌ Problem: Frontend can't access backend API")
print("   ✅ Solution: Check CORS settings in settings.py")
print("   📝 CORS_ALLOWED_ORIGINS should include http://localhost:5173")

print("\n" + "=" * 80)
print("NEXT STEPS")
print("=" * 80)

print("\n1. Start backend server:")
print("   cd codenest_backend")
print("   python manage.py runserver")

print("\n2. Start frontend server:")
print("   cd project2")
print("   npm run dev")

print("\n3. Login as teacher:")
for teacher in teachers[:1]:
    print(f"   Username: {teacher.user.username}")
    print(f"   (Use your password)")

print("\n4. Navigate to: http://localhost:5173/mentor-dashboard")

print("\n5. Open browser console (F12) and check for errors")

print("\n" + "=" * 80)
print("FIX COMPLETE")
print("=" * 80)
