# Testing Analytics - Quick Guide

## Prerequisites
- Backend server running on http://localhost:8000
- Frontend server running on http://localhost:5173
- User account with some submissions

## Test the Analytics Endpoint

### 1. Test Backend API Directly

Open a new terminal and run:

```bash
# Get your access token first (login)
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# Copy the access token from response, then:
curl http://localhost:8000/api/analytics/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected response:
```json
{
  "totalSolved": 5,
  "acceptanceRate": "80.0%",
  "globalRank": 1,
  "points": 500,
  "submissionData": [...],
  "topicData": [...],
  "topicBreakdown": [...],
  "submissionStats": [...]
}
```

### 2. Test Frontend Analytics Page

1. Open browser: http://localhost:5173
2. Login with your credentials
3. Navigate to Analytics page (usually in the menu)
4. You should see:
   - Loading skeletons initially
   - Real stats after loading
   - Charts with your actual data
   - Topic breakdown
   - Submission activity

### 3. Test Different Scenarios

#### Scenario A: New User (No Submissions)
- Login with a new account
- Visit Analytics page
- Should see: "No data available yet. Start solving problems!"

#### Scenario B: User with Submissions
- Login with account that has solved problems
- Visit Analytics page
- Should see:
  - Total solved count
  - Acceptance rate percentage
  - Global rank number
  - Points/score
  - Charts with data

#### Scenario C: Error Handling
- Stop the backend server
- Try to visit Analytics page
- Should see: "Unable to Load Analytics" with retry button
- Start backend server
- Click retry button
- Data should load successfully

## Verify Data Accuracy

### Check Total Solved
1. Go to Problems page
2. Count how many problems you've solved (green checkmark)
3. Go to Analytics page
4. "Total Solved" should match

### Check Acceptance Rate
1. Count total submissions in your history
2. Count accepted submissions
3. Calculate: (accepted / total) * 100
4. Should match "Acceptance Rate" on Analytics page

### Check Global Rank
1. Go to Leaderboard page
2. Find your position
3. Go to Analytics page
4. "Global Rank" should match your leaderboard position

## Common Issues

### Issue: "Failed to load analytics"
**Solution**: 
- Check backend server is running
- Check you're logged in
- Check browser console for errors

### Issue: Charts not rendering
**Solution**:
- Check browser console for errors
- Verify data structure in Network tab
- Clear browser cache and reload

### Issue: Data seems incorrect
**Solution**:
- Check database has submissions
- Verify submission status is 'ACCEPTED' not 'Solved'
- Run: `python manage.py shell`
  ```python
  from api.models import Submission
  from django.contrib.auth.models import User
  user = User.objects.get(username='your_username')
  print(Submission.objects.filter(user=user, status='ACCEPTED').count())
  ```

## Browser Console Testing

Open browser console (F12) and run:

```javascript
// Test API call
fetch('http://localhost:8000/api/analytics/', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  }
})
.then(r => r.json())
.then(data => console.log('Analytics Data:', data))
.catch(err => console.error('Error:', err));
```

## Database Verification

Check data in Django shell:

```bash
cd codenest_backend
python manage.py shell
```

```python
from api.models import Submission, UserStats, TopicProgress
from django.contrib.auth.models import User

# Get user
user = User.objects.get(username='your_username')

# Check submissions
print("Total submissions:", Submission.objects.filter(user=user).count())
print("Accepted:", Submission.objects.filter(user=user, status='ACCEPTED').count())

# Check stats
stats = UserStats.objects.get(user=user)
print("Score:", stats.score)
print("Problems solved:", stats.problems_solved)

# Check topics
topics = TopicProgress.objects.filter(user=user)
for t in topics:
    print(f"{t.topic}: {t.solved_count}/{t.total_problems}")
```

## Success Criteria

✅ Analytics page loads without errors
✅ Loading states display properly
✅ Real data appears after loading
✅ Charts render correctly
✅ Stats match database values
✅ Empty states work for new users
✅ Error handling works when backend is down
✅ No console errors or warnings

## Next Steps After Testing

If everything works:
1. Test with multiple users
2. Test with different data volumes
3. Test on mobile devices
4. Consider adding more analytics features

If issues found:
1. Check browser console for errors
2. Check backend logs for errors
3. Verify database has correct data
4. Review API response in Network tab
5. Check authentication token is valid

---
**Last Updated**: March 8, 2026
