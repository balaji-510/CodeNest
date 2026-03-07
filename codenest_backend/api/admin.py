from django.contrib import admin
from .models import UserProfile, Problem, Submission, TopicProgress, Analytics

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'rank', 'accuracy', 'active_days')

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'topic', 'platform')
    list_filter = ('difficulty', 'topic', 'platform')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'problem', 'status', 'created_at')
    list_filter = ('status', 'created_at')

admin.site.register(TopicProgress)
admin.site.register(Analytics)
