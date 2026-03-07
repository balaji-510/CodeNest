from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    rank = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    active_days = models.IntegerField(default=0)
    role = models.CharField(max_length=20, default='student') # student or teacher
    branch = models.CharField(max_length=20, default='CSE') # CSE, IT, ECE, MECH, etc.
    batch = models.CharField(max_length=10, default='2024') # Graduation Year
    bio = models.TextField(blank=True, default='')
    avatar = models.URLField(blank=True, default='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')
    skills = models.TextField(blank=True, default='') # Comma separated
    github_link = models.URLField(blank=True, default='')
    linkedin_link = models.URLField(blank=True, default='')
    twitter_link = models.URLField(blank=True, default='')
    
    # Verification Fields
    leetcode_handle = models.CharField(max_length=50, blank=True, null=True)
    is_leetcode_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=50, blank=True, null=True)
    
    codechef_handle = models.CharField(max_length=50, blank=True, null=True)
    is_codechef_verified = models.BooleanField(default=False)
    
    codeforces_handle = models.CharField(max_length=50, blank=True, null=True)
    is_codeforces_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.verification_token:
            import uuid
            self.verification_token = f"CN-{str(uuid.uuid4())[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.username

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    topic = models.CharField(max_length=100)
    platform = models.CharField(max_length=50) # e.g. LeetCode, CodeChef
    url = models.URLField(blank=True, null=True) # Official problem URL
    leetcode_url = models.URLField(blank=True, null=True) # Specific LeetCode URL if available
    description = models.TextField(blank=True, default='')
    examples = models.TextField(blank=True, default='[]') # Storing as JSON string for simplicity
    constraints = models.TextField(blank=True, default='[]') # Storing as JSON string
    starter_code = models.TextField(blank=True, default='{}') # Storing as JSON string
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='testcases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Test Case for {self.problem.title}"

class Submission(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('ACCEPTED', 'ACCEPTED'),
        ('FAILED', 'FAILED'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    passed_testcases = models.IntegerField(default=0)
    total_testcases = models.IntegerField(default=0)
    execution_time_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['problem']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'problem'],
                condition=models.Q(status='ACCEPTED'),
                name='unique_accepted_submission'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.problem.title} ({self.status})"

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    score = models.IntegerField(default=0)
    problems_solved = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['score']),
        ]

    def __str__(self):
        return f"Stats for {self.user.username}"

class Analytics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField()
    problems_solved = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('user', 'date')

class TopicProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topic_progress')
    topic = models.CharField(max_length=100)
    solved_count = models.IntegerField(default=0)
    total_problems = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'topic')

class Context(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
        ('Mixed', 'Mixed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_contexts')
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60) # estimated duration in mins
    
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    
    # Target Audience Filters
    target_batch = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. 2024, 2025")
    target_branch = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. CSE, ECE")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class ContextProblem(models.Model):
    context = models.ForeignKey(Context, on_delete=models.CASCADE, related_name='context_problems')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order_index']
        
    def __str__(self):
        return f"{self.context.title} - {self.problem.title}"

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"To {self.recipient.username}: {self.title}"
