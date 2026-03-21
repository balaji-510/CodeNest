import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { ToastContainer } from '../Components/Toast';
import { useToast } from '../hooks/useToast';
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import '../styles1/DiscussionDetail.css';

const DiscussionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toasts, removeToast, showToast } = useToast();
    const [discussion, setDiscussion] = useState(null);
    const [replies, setReplies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newReply, setNewReply] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [votingDiscussion, setVotingDiscussion] = useState(false);
    const [votingReplies, setVotingReplies] = useState(new Set());

    useEffect(() => {
        loadDiscussion();
        loadReplies();
    }, [id]);

    const loadDiscussion = async () => {
        try {
            const response = await api.get(`/discussions/${id}/`);
            setDiscussion(response.data);
        } catch (error) {
            console.error('Failed to load discussion:', error);
            showToast('Failed to load discussion', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadReplies = async () => {
        try {
            const response = await api.get(`/discussions/${id}/replies/`);
            setReplies(response.data);
        } catch (error) {
            console.error('Failed to load replies:', error);
        }
    };

    const handleVote = async (voteType) => {
        if (votingDiscussion) return; // Prevent multiple clicks
        
        setVotingDiscussion(true);
        try {
            const response = await api.post(`/discussions/${id}/vote/`, { vote_type: voteType });
            setDiscussion(prev => ({
                ...prev,
                votes: response.data.votes
            }));
            showToast('Vote recorded', 'success');
        } catch (error) {
            console.error('Vote error:', error);
            showToast('Failed to vote', 'error');
        } finally {
            setVotingDiscussion(false);
        }
    };

    const handleReplyVote = async (replyId, voteType) => {
        if (votingReplies.has(replyId)) return; // Prevent multiple clicks
        
        setVotingReplies(prev => new Set([...prev, replyId]));
        try {
            const response = await api.post(`/discussion-replies/${replyId}/vote/`, { vote_type: voteType });
            setReplies(prev => prev.map(r => {
                if (r.id === replyId) {
                    return { ...r, votes: response.data.votes };
                }
                return r;
            }));
            showToast('Vote recorded', 'success');
        } catch (error) {
            console.error('Vote error:', error);
            showToast('Failed to vote', 'error');
        } finally {
            setVotingReplies(prev => {
                const newSet = new Set(prev);
                newSet.delete(replyId);
                return newSet;
            });
        }
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        
        if (!newReply.trim()) {
            showToast('Please enter a reply', 'error');
            return;
        }

        if (isSubmitting) return; // Prevent multiple submissions

        setIsSubmitting(true);
        try {
            const response = await api.post(`/discussions/${id}/reply/`, {
                content: newReply,
                parent_reply_id: replyingTo
            });
            
            setReplies([...replies, response.data]);
            setNewReply('');
            setReplyingTo(null);
            showToast('Reply posted successfully', 'success');
            
            // Reload replies to get updated list
            loadReplies();
        } catch (error) {
            console.error('Failed to post reply:', error);
            if (error.response?.data?.error) {
                showToast(error.response.data.error, 'error');
            } else {
                showToast('Failed to post reply. Please try again.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="discussion-detail-page">
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading discussion...</p>
                </div>
                <Footer />
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        );
    }

    if (!discussion) {
        return (
            <div className="discussion-detail-page">
                <Navbar />
                <div className="error-container">
                    <h2>Discussion not found</h2>
                    <button onClick={() => navigate('/discuss')} className="btn-back">
                        <ArrowLeft size={20} />
                        Back to Discussions
                    </button>
                </div>
                <Footer />
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        );
    }

    return (
        <div className="discussion-detail-page animate-fade-in">
            <Navbar />
            
            <main className="discussion-detail-container">
                <button onClick={() => navigate('/discuss')} className="btn-back">
                    <ArrowLeft size={20} />
                    Back to Discussions
                </button>

                {/* Discussion Post */}
                <div className="discussion-post glass-effect">
                    <div className="post-header">
                        <span className="post-category">{discussion.category}</span>
                        <h1>{discussion.title}</h1>
                        <div className="post-meta">
                            <img 
                                src={discussion.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.author_username}`}
                                alt={discussion.author_username}
                                className="author-avatar"
                            />
                            <div className="author-info">
                                <span className="author-name">{discussion.author_username}</span>
                                <span className="post-time">{formatTimeAgo(discussion.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="post-content">
                        <p>{discussion.content}</p>
                    </div>

                    {discussion.tags && discussion.tags.length > 0 && (
                        <div className="post-tags">
                            {discussion.tags.map((tag, idx) => (
                                <span key={idx} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="post-actions">
                        <div className="vote-buttons">
                            <button 
                                className="vote-btn up"
                                onClick={() => handleVote('up')}
                                disabled={votingDiscussion}
                            >
                                <ThumbsUp size={18} />
                                <span>{discussion.votes || 0}</span>
                            </button>
                            <button 
                                className="vote-btn down"
                                onClick={() => handleVote('down')}
                                disabled={votingDiscussion}
                            >
                                <ThumbsDown size={18} />
                            </button>
                        </div>
                        <div className="reply-count">
                            <MessageSquare size={18} />
                            <span>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</span>
                        </div>
                    </div>
                </div>

                {/* Reply Form */}
                <div className="reply-form glass-effect">
                    <h3>
                        {replyingTo ? 'Reply to comment' : 'Add your reply'}
                    </h3>
                    {replyingTo && (
                        <div className="replying-to">
                            <span>Replying to a comment</span>
                            <button onClick={() => setReplyingTo(null)}>Cancel</button>
                        </div>
                    )}
                    <form onSubmit={handleSubmitReply}>
                        <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows="4"
                            required
                        />
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            <Send size={18} />
                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                        </button>
                    </form>
                </div>

                {/* Replies */}
                <div className="replies-section">
                    <h3>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>
                    
                    {replies.length === 0 ? (
                        <div className="no-replies glass-effect">
                            <MessageSquare size={48} />
                            <p>No replies yet. Be the first to reply!</p>
                        </div>
                    ) : (
                        <div className="replies-list">
                            {replies.map(reply => (
                                <div key={reply.id} className="reply-card glass-effect">
                                    <div className="reply-header">
                                        <img 
                                            src={reply.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author_username}`}
                                            alt={reply.author_username}
                                            className="author-avatar"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">{reply.author_username}</span>
                                            <span className="reply-time">{formatTimeAgo(reply.created_at)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="reply-content">
                                        <p>{reply.content}</p>
                                    </div>

                                    <div className="reply-actions">
                                        <div className="vote-buttons">
                                            <button 
                                                className="vote-btn up"
                                                onClick={() => handleReplyVote(reply.id, 'up')}
                                                disabled={votingReplies.has(reply.id)}
                                            >
                                                <ThumbsUp size={16} />
                                                <span>{reply.votes || 0}</span>
                                            </button>
                                            <button 
                                                className="vote-btn down"
                                                onClick={() => handleReplyVote(reply.id, 'down')}
                                                disabled={votingReplies.has(reply.id)}
                                            >
                                                <ThumbsDown size={16} />
                                            </button>
                                        </div>
                                        <button 
                                            className="btn-reply"
                                            onClick={() => setReplyingTo(reply.id)}
                                        >
                                            Reply
                                        </button>
                                    </div>

                                    {/* Nested replies */}
                                    {reply.child_replies && reply.child_replies.length > 0 && (
                                        <div className="nested-replies">
                                            {reply.child_replies.map(childReply => (
                                                <div key={childReply.id} className="reply-card nested">
                                                    <div className="reply-header">
                                                        <img 
                                                            src={childReply.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${childReply.author_username}`}
                                                            alt={childReply.author_username}
                                                            className="author-avatar"
                                                        />
                                                        <div className="author-info">
                                                            <span className="author-name">{childReply.author_username}</span>
                                                            <span className="reply-time">{formatTimeAgo(childReply.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="reply-content">
                                                        <p>{childReply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default DiscussionDetail;
