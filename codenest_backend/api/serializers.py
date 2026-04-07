from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Problem, Submission, Analytics, TopicProgress, 
    Context, ContextProblem, Notification, Achievement, AchievementDefinition, 
    PlatformAccount, TestCase, Contest, ContestParticipant, ContestSubmission,
    Discussion, DiscussionReply, DiscussionVote
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        
        # Get role from profile
        if hasattr(self.user, 'profile'):
            data['role'] = self.user.profile.role
        else:
            data['role'] = 'student'
            
        return data

from django.conf import settings

class CodeExecutionSerializer(serializers.Serializer):
    language = serializers.ChoiceField(choices=['python', 'py', 'javascript', 'js', 'cpp', 'c++', 'java'])
    code = serializers.CharField(max_length=65536) # 64KB limit
    stdin = serializers.CharField(max_length=65536, required=False, allow_blank=True, default='')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='student')
    teacher_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    branch = serializers.CharField(write_only=True, required=False, default='CSE')
    batch = serializers.CharField(write_only=True, required=False, default='2024')
    roll_number = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    gender = serializers.CharField(write_only=True, required=False, default='')
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'teacher_code', 'branch', 'batch', 'roll_number', 'gender']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        role = data.get('role', 'student')
        teacher_code = data.get('teacher_code', '')
        
        if role == 'teacher':
            if teacher_code != settings.TEACHER_REGISTRATION_CODE:
                raise serializers.ValidationError({"teacher_code": "Invalid teacher registration code."})
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        branch = validated_data.pop('branch', 'CSE')
        batch = validated_data.pop('batch', '2024')
        roll_number = validated_data.pop('roll_number', '')
        gender = validated_data.pop('gender', '')
        validated_data.pop('teacher_code', None)
        
        # For teachers, set default values for student-specific fields if empty
        if role == 'teacher':
            if not branch or branch == '':
                branch = 'CSE'
            if not batch or batch == '':
                batch = '2024'
            if not roll_number:
                roll_number = ''
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        UserProfile.objects.create(user=user, role=role, branch=branch, batch=batch, roll_number=roll_number, gender=gender)
        
        # Create UserStats for the new user
        from .models import UserStats
        UserStats.objects.create(user=user, score=0, problems_solved=0)
        
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'rank', 'accuracy', 'active_days', 'role', 'branch', 'bio', 'avatar', 'skills', 'github_link', 'linkedin_link', 'twitter_link', 'leetcode_handle', 'is_leetcode_verified', 'verification_token', 'codechef_handle', 'is_codechef_verified', 'codeforces_handle', 'is_codeforces_verified', 'hackerrank_handle', 'is_hackerrank_verified', 'gender']

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ['id', 'title', 'difficulty', 'points', 'topic', 'platform', 'url', 'leetcode_url', 'description', 'examples', 'constraints', 'starter_code', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.ReadOnlyField(source='problem.title')
    problem_difficulty = serializers.ReadOnlyField(source='problem.difficulty')
    language_display = serializers.CharField(source='get_language_display', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'user', 'problem', 'problem_title', 'problem_difficulty',
            'status', 'code', 'language', 'language_display',
            'passed_testcases', 'total_testcases',
            'execution_time_ms', 'memory_used_kb',
            'error_message', 'test_results', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class TopicProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicProgress
        fields = ['topic', 'solved_count', 'total_problems']

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = ['date', 'problems_solved']

class UserStatsSerializer(serializers.Serializer):
    # Custom serializer to aggregate data for the dashboard
    user_profile = UserProfileSerializer(source='profile')
    recent_submissions = SubmissionSerializer(many=True, source='submissions') # We might want to limit this in view
    topic_progress = TopicProgressSerializer(many=True)
    analytics = AnalyticsSerializer(many=True)

class ContextProblemSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer(read_only=True)
    problem_id = serializers.PrimaryKeyRelatedField(queryset=Problem.objects.all(), source='problem', write_only=True)
    
    class Meta:
        model = ContextProblem
        fields = ['id', 'problem', 'problem_id', 'order_index']

class ContextSerializer(serializers.ModelSerializer):
    mentor_name = serializers.ReadOnlyField(source='mentor.username')
    problems = ContextProblemSerializer(source='context_problems', many=True, read_only=True)
    
    class Meta:
        model = Context
        fields = ['id', 'title', 'description', 'mentor', 'mentor_name', 'start_time', 'end_time', 'duration_minutes', 'difficulty', 'target_batch', 'target_branch', 'is_active', 'created_at', 'problems']
        read_only_fields = ['mentor', 'created_at', 'problems']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'title', 'message', 'link', 'is_read', 'created_at']
        read_only_fields = ['created_at']


# New Serializers for Enhanced Features

class AchievementDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementDefinition
        fields = ['id', 'name', 'description', 'icon', 'category', 'requirement', 'points', 'is_active']
        read_only_fields = ['id']


class AchievementSerializer(serializers.ModelSerializer):
    achievement_def = AchievementDefinitionSerializer(read_only=True)
    
    class Meta:
        model = Achievement
        fields = ['id', 'achievement_def', 'type', 'title', 'description', 'icon', 'progress', 'target', 'earned_at']
        read_only_fields = ['earned_at']


class AchievementProgressSerializer(serializers.Serializer):
    """Serializer for achievement progress"""
    achievement = AchievementDefinitionSerializer()
    earned = serializers.BooleanField()
    earned_at = serializers.DateTimeField(allow_null=True)
    progress = serializers.IntegerField()
    target = serializers.IntegerField()
    percentage = serializers.SerializerMethodField()
    
    def get_percentage(self, obj):
        if obj['target'] == 0:
            return 0
        return min(100, int((obj['progress'] / obj['target']) * 100))


class PlatformAccountSerializer(serializers.ModelSerializer):
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    
    class Meta:
        model = PlatformAccount
        fields = ['id', 'platform', 'platform_display', 'handle', 'is_verified', 
                  'rating', 'problems_solved', 'rank', 'last_synced', 'created_at']
        read_only_fields = ['is_verified', 'rating', 'problems_solved', 'rank', 'last_synced', 'created_at']


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Detailed submission serializer with code"""
    problem_title = serializers.ReadOnlyField(source='problem.title')
    problem_difficulty = serializers.ReadOnlyField(source='problem.difficulty')
    username = serializers.ReadOnlyField(source='user.username')
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'user', 'username', 'problem', 'problem_title', 'problem_difficulty',
                  'status', 'code', 'language', 'language_display', 'passed_testcases', 
                  'total_testcases', 'execution_time_ms', 'memory_used_kb', 'error_message',
                  'test_results', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


# All models are now imported at the top of the file



class TestCaseSerializer(serializers.ModelSerializer):
    """Serializer for test cases"""
    class Meta:
        model = TestCase
        fields = ['id', 'problem', 'input_data', 'expected_output', 'is_hidden', 'created_at']
        read_only_fields = ['created_at']



class ContestSerializer(serializers.ModelSerializer):
    """Serializer for Contest model"""
    creator_name = serializers.ReadOnlyField(source='creator.username')
    status = serializers.ReadOnlyField()
    time_remaining = serializers.ReadOnlyField()
    participant_count = serializers.SerializerMethodField()
    problems_count = serializers.SerializerMethodField()
    problem_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'creator', 'creator_name',
            'start_time', 'end_time', 'duration_minutes', 'status',
            'time_remaining', 'is_public', 'rules', 'participant_count',
            'problems_count', 'problem_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_problems_count(self, obj):
        return obj.problems.count()

    def create(self, validated_data):
        problem_ids = validated_data.pop('problem_ids', [])
        contest = Contest.objects.create(**validated_data)

        if problem_ids:
            from .models import Problem
            problems = Problem.objects.filter(id__in=problem_ids)
            contest.problems.set(problems)

        return contest




class ContestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Contest with problems"""
    creator_name = serializers.ReadOnlyField(source='creator.username')
    status = serializers.ReadOnlyField()
    time_remaining = serializers.ReadOnlyField()
    problems = ProblemSerializer(many=True, read_only=True)
    participant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'creator', 'creator_name',
            'start_time', 'end_time', 'duration_minutes', 'status',
            'time_remaining', 'is_public', 'rules', 'problems',
            'participant_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']
    
    def get_participant_count(self, obj):
        return obj.participants.count()


class ContestParticipantSerializer(serializers.ModelSerializer):
    """Serializer for Contest Participant"""
    username = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    
    class Meta:
        model = ContestParticipant
        fields = [
            'id', 'user', 'user_id', 'username', 'score',
            'problems_solved', 'penalty', 'rank', 'joined_at',
            'last_submission_time'
        ]
        read_only_fields = ['score', 'problems_solved', 'penalty', 'rank', 'joined_at']


class ContestSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for Contest Submission"""
    username = serializers.ReadOnlyField(source='participant.user.username')
    problem_title = serializers.ReadOnlyField(source='problem.title')
    
    class Meta:
        model = ContestSubmission
        fields = [
            'id', 'contest', 'participant', 'username', 'problem',
            'problem_title', 'submission', 'points', 'time_taken',
            'is_accepted', 'created_at'
        ]
        read_only_fields = ['points', 'time_taken', 'is_accepted', 'created_at']


class ContestLeaderboardSerializer(serializers.Serializer):
    """Serializer for contest leaderboard"""
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    score = serializers.IntegerField()
    problems_solved = serializers.IntegerField()
    penalty = serializers.IntegerField()
    last_submission_time = serializers.DateTimeField()



class DiscussionReplySerializer(serializers.ModelSerializer):
    """Serializer for discussion replies"""
    author_username = serializers.ReadOnlyField(source='author.username')
    author_avatar = serializers.SerializerMethodField()
    child_replies = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionReply
        fields = ['id', 'discussion', 'author', 'author_username', 'author_avatar', 
                  'content', 'parent_reply', 'votes', 'is_solution', 'created_at', 
                  'updated_at', 'child_replies']
        read_only_fields = ['author', 'created_at', 'updated_at', 'votes']
    
    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            return obj.author.profile.avatar
        return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + obj.author.username
    
    def get_child_replies(self, obj):
        if obj.child_replies.exists():
            return DiscussionReplySerializer(obj.child_replies.all(), many=True).data
        return []


class DiscussionSerializer(serializers.ModelSerializer):
    """Serializer for discussion posts"""
    author_username = serializers.ReadOnlyField(source='author.username')
    author_avatar = serializers.SerializerMethodField()
    replies_count = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = Discussion
        fields = ['id', 'title', 'content', 'author', 'author_username', 'author_avatar',
                  'category', 'tags', 'votes', 'views', 'is_pinned', 'is_locked',
                  'created_at', 'updated_at', 'replies_count']
        read_only_fields = ['author', 'created_at', 'updated_at', 'votes', 'views']
    
    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            return obj.author.profile.avatar
        return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + obj.author.username
