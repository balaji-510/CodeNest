from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Count, Q
from .models import Discussion, DiscussionReply, DiscussionVote
from .serializers import DiscussionSerializer, DiscussionReplySerializer
import logging

logger = logging.getLogger(__name__)


class DiscussionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing discussion forum posts
    """
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Discussion.objects.annotate(
            replies_count=Count('replies')
        ).select_related('author', 'author__profile')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category and category != 'All Topics':
            queryset = queryset.filter(category=category)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        instance.views += 1
        instance.save(update_fields=['views'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        """
        Vote on a discussion (upvote or downvote)
        """
        discussion = self.get_object()
        vote_type = request.data.get('vote_type')  # 'up' or 'down'
        
        if vote_type not in ['up', 'down']:
            return Response(
                {'error': 'Invalid vote type. Must be "up" or "down"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already voted
        existing_vote = DiscussionVote.objects.filter(
            user=request.user,
            discussion=discussion
        ).first()
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                # Remove vote if same type
                existing_vote.delete()
                discussion.votes += -1 if vote_type == 'up' else 1
            else:
                # Change vote
                existing_vote.vote_type = vote_type
                existing_vote.save()
                discussion.votes += 2 if vote_type == 'up' else -2
        else:
            # Create new vote
            DiscussionVote.objects.create(
                user=request.user,
                discussion=discussion,
                vote_type=vote_type
            )
            discussion.votes += 1 if vote_type == 'up' else -1
        
        discussion.save(update_fields=['votes'])
        
        return Response({
            'votes': discussion.votes,
            'message': 'Vote recorded successfully'
        })
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """
        Get all replies for a discussion
        """
        discussion = self.get_object()
        replies = discussion.replies.filter(parent_reply=None).select_related(
            'author', 'author__profile'
        ).prefetch_related('child_replies')
        
        serializer = DiscussionReplySerializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reply(self, request, pk=None):
        """
        Add a reply to a discussion
        """
        discussion = self.get_object()
        content = request.data.get('content')
        parent_reply_id = request.data.get('parent_reply_id', None)
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        parent_reply = None
        if parent_reply_id:
            try:
                parent_reply = DiscussionReply.objects.get(id=parent_reply_id)
            except DiscussionReply.DoesNotExist:
                return Response(
                    {'error': 'Parent reply not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        reply = DiscussionReply.objects.create(
            discussion=discussion,
            author=request.user,
            content=content,
            parent_reply=parent_reply
        )
        
        serializer = DiscussionReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DiscussionReplyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing discussion replies
    """
    queryset = DiscussionReply.objects.all()
    serializer_class = DiscussionReplySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        """
        Vote on a reply (upvote or downvote)
        """
        reply = self.get_object()
        vote_type = request.data.get('vote_type')  # 'up' or 'down'
        
        if vote_type not in ['up', 'down']:
            return Response(
                {'error': 'Invalid vote type. Must be "up" or "down"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already voted
        existing_vote = DiscussionVote.objects.filter(
            user=request.user,
            reply=reply
        ).first()
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                # Remove vote if same type
                existing_vote.delete()
                reply.votes += -1 if vote_type == 'up' else 1
            else:
                # Change vote
                existing_vote.vote_type = vote_type
                existing_vote.save()
                reply.votes += 2 if vote_type == 'up' else -2
        else:
            # Create new vote
            DiscussionVote.objects.create(
                user=request.user,
                reply=reply,
                vote_type=vote_type
            )
            reply.votes += 1 if vote_type == 'up' else -1
        
        reply.save(update_fields=['votes'])
        
        return Response({
            'votes': reply.votes,
            'message': 'Vote recorded successfully'
        })
