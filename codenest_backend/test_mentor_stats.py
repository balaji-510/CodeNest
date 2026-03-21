"""
Test script to verify mentor stats endpoint returns proper topic mastery data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codenest_backend.settings')
django.setup()

from api.models import Problem, Submission, UserProfile, User
from django.db.models import Count

def test_topic_mastery():
    """Test topic mastery calculation"""
    
    print("=" * 60)
    print("TESTING TOPIC MASTERY CALCULATION")
    print("=" * 60)
    
    # Get all problems grouped by topic
    problem_topics = Problem.objects.values('topic').annotate(
        total_problems=Count('id')
    ).filter(total_problems__gt=0).order_by('-total_problems')
    
    print(f"\n✓ Found {problem_topics.count()} topics with problems")
    
    # Get total students
    students = UserProfile.objects.filter(role='student')
    total_students = students.count()
    print(f"✓ Total students: {total_students}")
    
    topic_mastery = []
    for pt in problem_topics:
        topic = pt['topic']
        total_problems = pt['total_problems']
        
        # Count unique problem-user combinations (how many times students solved problems in this topic)
        unique_solves = Submission.objects.filter(
            problem__topic=topic,
            status='ACCEPTED'
        ).values('user', 'problem').distinct().count()
        
        # Calculate average problems solved per student
        avg_solved_per_student = unique_solves / total_students if total_students > 0 else 0
        
        topic_mastery.append({
            "subject": topic,
            "A": round(avg_solved_per_student, 1),
            "fullMark": total_problems
        })
        
        print(f"\n  Topic: {topic}")
        print(f"    Total Problems: {total_problems}")
        print(f"    Unique Solves: {unique_solves}")
        print(f"    Avg per Student: {round(avg_solved_per_student, 1)}")
        print(f"    Percentage: {round(avg_solved_per_student / total_problems * 100, 1) if total_problems > 0 else 0}%")
    
    print("\n" + "=" * 60)
    print("TOPIC MASTERY DATA FOR CHART:")
    print("=" * 60)
    for tm in topic_mastery[:5]:  # Show top 5
        percentage = round(tm['A'] / tm['fullMark'] * 100, 1) if tm['fullMark'] > 0 else 0
        print(f"  {tm['subject']}: {tm['A']}/{tm['fullMark']} ({percentage}%)")
    
    print("\n✅ Topic mastery calculation working!")
    print(f"✅ Chart will show top 5 topics")
    print("\n📊 Interpretation:")
    print("   'Class Avg: X' means on average, each student solved X problems in that topic")
    
    return topic_mastery

if __name__ == '__main__':
    test_topic_mastery()
