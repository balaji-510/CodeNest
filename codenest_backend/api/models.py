from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    rank = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    active_days = models.IntegerField(default=0)
    role = models.CharField(max_length=20, default='student') # student or teacher
    branch = models.CharField(max_length=20, default='CSE', blank=True) # CSE, IT, ECE, MECH, etc.
    batch = models.CharField(max_length=10, default='2024', blank=True) # Graduation Year
    roll_number = models.CharField(max_length=20, blank=True, default='') # Student Roll Number
    bio = models.TextField(blank=True, default='')
    avatar = models.URLField(blank=True, default='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')
    skills = models.TextField(blank=True, default='') # Comma separated
    github_link = models.URLField(blank=True, default='')
    linkedin_link = models.URLField(blank=True, default='')
    twitter_link = models.URLField(blank=True, default='')
    
    # Gender
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, default='')

    # Verification Fields
    leetcode_handle = models.CharField(max_length=50, blank=True, null=True)
    is_leetcode_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=50, blank=True, null=True)
    
    codechef_handle = models.CharField(max_length=50, blank=True, null=True)
    is_codechef_verified = models.BooleanField(default=False)
    
    codeforces_handle = models.CharField(max_length=50, blank=True, null=True)
    is_codeforces_verified = models.BooleanField(default=False)

    hackerrank_handle = models.CharField(max_length=50, blank=True, null=True)
    is_hackerrank_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.verification_token:
            import uuid
            self.verification_token = f"CN-{str(uuid.uuid4())[:8]}"
        # Set gender-based default avatar if still using the generic default
        if self.avatar == 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' or not self.avatar:
            seed = self.user.username if self.user_id else 'user'
            if self.gender == 'female':
                self.avatar = f'https://api.dicebear.com/7.x/avataaars/svg?seed={seed}&hair=longHair&accessories=prescription02&clothesColor=pink'
            else:
                self.avatar = f'https://api.dicebear.com/7.x/avataaars/svg?seed={seed}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.username

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    DIFFICULTY_POINTS = {
        'Easy': 10,
        'Medium': 15,
        'Hard': 20,
    }
    
    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    points = models.IntegerField(default=10)  # Easy=10, Medium=15, Hard=20
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

    def save(self, *args, **kwargs):
        # Always derive points from difficulty
        self.points = self.DIFFICULTY_POINTS.get(self.difficulty, 10)
        super().save(*args, **kwargs)
    
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
        ('RUNTIME_ERROR', 'RUNTIME_ERROR'),
        ('TIME_LIMIT_EXCEEDED', 'TIME_LIMIT_EXCEEDED'),
        ('MEMORY_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED'),
        ('COMPILATION_ERROR', 'COMPILATION_ERROR'),
    ]

    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++'),
        ('javascript', 'JavaScript'),
        ('c', 'C'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING')

    # Code and Language
    code = models.TextField(default='')
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='python')

    # Execution Results
    passed_testcases = models.IntegerField(default=0)
    total_testcases = models.IntegerField(default=0)
    execution_time_ms = models.IntegerField(null=True, blank=True)
    memory_used_kb = models.IntegerField(null=True, blank=True)

    # Error Information
    error_message = models.TextField(blank=True, default='')
    test_results = models.JSONField(default=list)  # Store individual test case results

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['problem']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
        # Removed unique constraint to allow multiple submissions

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


class AchievementDefinition(models.Model):
    """Achievement definitions - what achievements exist"""
    CATEGORY_CHOICES = [
        ('problems', 'Problem Solving'),
        ('difficulty', 'Difficulty Mastery'),
        ('topic', 'Topic Mastery'),
        ('streak', 'Streaks'),
        ('speed', 'Speed'),
        ('time', 'Time-based'),
        ('special', 'Special'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50)  # Emoji
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    requirement = models.JSONField()  # e.g., {"type": "problems_solved", "count": 10}
    points = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'points']
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class Achievement(models.Model):
    """User achievements and badges"""
    ACHIEVEMENT_TYPES = [
        ('streak', 'Streak'),
        ('problems', 'Problems Solved'),
        ('contest', 'Contest'),
        ('topic', 'Topic Master'),
        ('speed', 'Speed'),
        ('special', 'Special'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_def = models.ForeignKey(AchievementDefinition, on_delete=models.CASCADE, null=True, blank=True, related_name='user_achievements')
    type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)  # Emoji or icon name
    progress = models.IntegerField(default=0)  # Current progress towards achievement
    target = models.IntegerField(default=100)  # Target value for completion
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-earned_at']
        indexes = [
            models.Index(fields=['user', 'type']),
        ]
        unique_together = ['user', 'achievement_def']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class PlatformAccount(models.Model):
    """Linked coding platform accounts"""
    PLATFORM_CHOICES = [
        ('leetcode', 'LeetCode'),
        ('codechef', 'CodeChef'),
        ('codeforces', 'Codeforces'),
        ('hackerrank', 'HackerRank'),
        ('hackerearth', 'HackerEarth'),
        ('atcoder', 'AtCoder'),
        ('geeksforgeeks', 'GeeksforGeeks'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='platform_accounts')
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    handle = models.CharField(max_length=100)
    is_verified = models.BooleanField(default=False)
    
    # Platform Stats
    rating = models.IntegerField(null=True, blank=True)
    problems_solved = models.IntegerField(default=0)
    rank = models.IntegerField(null=True, blank=True)
    
    # Sync Info
    last_synced = models.DateTimeField(null=True, blank=True)
    api_data = models.JSONField(default=dict)  # Store raw API response
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'platform')
        indexes = [
            models.Index(fields=['user', 'platform']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.platform} ({self.handle})"


class Contest(models.Model):
    """Contest model for competitive programming contests"""
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_contests')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.IntegerField()  # Duration in minutes
    problems = models.ManyToManyField(Problem, related_name='contests')
    participants = models.ManyToManyField(User, through='ContestParticipant', related_name='participated_contests')
    is_public = models.BooleanField(default=True)
    rules = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['creator']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def status(self):
        from django.utils import timezone
        now = timezone.now()
        if now < self.start_time:
            return 'upcoming'
        elif now > self.end_time:
            return 'completed'
        else:
            return 'ongoing'
    
    @property
    def time_remaining(self):
        from django.utils import timezone
        if self.status == 'ongoing':
            remaining = self.end_time - timezone.now()
            return int(remaining.total_seconds())
        return 0


class ContestParticipant(models.Model):
    """Tracks contest participation and scores"""
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='contest_participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contest_participations')
    score = models.IntegerField(default=0)
    problems_solved = models.IntegerField(default=0)
    penalty = models.IntegerField(default=0)  # Time penalty in minutes
    rank = models.IntegerField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_submission_time = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['contest', 'user']
        ordering = ['-score', 'penalty']
        indexes = [
            models.Index(fields=['contest', 'score']),
        ]
    
    def __str__(self):
        return f"{self.user.username} in {self.contest.title}"


class ContestSubmission(models.Model):
    """Submissions made during a contest"""
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='contest_submissions')
    participant = models.ForeignKey(ContestParticipant, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    time_taken = models.IntegerField()  # Minutes from contest start
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['contest', 'participant']),
            models.Index(fields=['problem', 'is_accepted']),
        ]
    
    def __str__(self):
        return f"{self.participant.user.username} - {self.problem.title}"


class Discussion(models.Model):
    """Discussion forum posts"""
    CATEGORY_CHOICES = [
        ('General', 'General'),
        ('Algorithms', 'Algorithms'),
        ('Data Structures', 'Data Structures'),
        ('Interview Prep', 'Interview Prep'),
        ('Competitive Programming', 'Competitive Programming'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    tags = models.JSONField(default=list, blank=True)
    votes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['category']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title


class DiscussionReply(models.Model):
    """Replies to discussion posts"""
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussion_replies')
    content = models.TextField()
    parent_reply = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='child_replies')
    votes = models.IntegerField(default=0)
    is_solution = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['discussion']),
            models.Index(fields=['author']),
        ]
    
    def __str__(self):
        return f"Reply by {self.author.username} on {self.discussion.title}"


class DiscussionVote(models.Model):
    """Track user votes on discussions and replies"""
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussion_votes')
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, null=True, blank=True, related_name='user_votes')
    reply = models.ForeignKey(DiscussionReply, on_delete=models.CASCADE, null=True, blank=True, related_name='user_votes')
    vote_type = models.CharField(max_length=4, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [
            ('user', 'discussion'),
            ('user', 'reply'),
        ]
        indexes = [
            models.Index(fields=['user', 'discussion']),
            models.Index(fields=['user', 'reply']),
        ]
    
    def __str__(self):
        target = self.discussion or self.reply
        return f"{self.user.username} {self.vote_type}d {target}"


class Checkpoint(models.Model):
    """Teacher-defined targets for students (problems to solve, ratings to achieve)"""
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='checkpoints')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')

    # CoderNest targets
    cn_problems = models.IntegerField(default=0, help_text='Min problems solved on CoderNest')
    cn_score = models.IntegerField(default=0, help_text='Min score on CoderNest')

    # Platform targets
    lc_problems = models.IntegerField(default=0)
    lc_rating = models.IntegerField(default=0)
    cc_problems = models.IntegerField(default=0)
    cc_rating = models.IntegerField(default=0)
    cf_problems = models.IntegerField(default=0)
    cf_rating = models.IntegerField(default=0)

    # Targeting
    target_batch = models.CharField(max_length=50, blank=True, default='All')
    target_branch = models.CharField(max_length=50, blank=True, default='All')

    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
