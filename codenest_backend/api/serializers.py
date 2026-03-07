from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Problem, Submission, Analytics, TopicProgress, Context, ContextProblem, Notification
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
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'teacher_code', 'branch']
    
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
        validated_data.pop('teacher_code', None) # Remove teacher_code before creating user
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create UserProfile with the role and branch
        UserProfile.objects.create(user=user, role=role, branch=branch, batch=batch)
        
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'rank', 'accuracy', 'active_days', 'role', 'branch', 'bio', 'avatar', 'skills', 'github_link', 'linkedin_link', 'twitter_link', 'leetcode_handle', 'is_leetcode_verified', 'verification_token', 'codechef_handle', 'is_codechef_verified', 'codeforces_handle', 'is_codeforces_verified']

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ['id', 'title', 'difficulty', 'topic', 'platform', 'url', 'leetcode_url', 'description', 'examples', 'constraints', 'starter_code', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.ReadOnlyField(source='problem.title')
    
    class Meta:
        model = Submission
        fields = ['id', 'user', 'problem', 'problem_title', 'status', 'created_at']
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
