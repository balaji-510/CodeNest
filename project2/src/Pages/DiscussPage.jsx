import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { ToastContainer } from '../Components/Toast';
import { useToast } from '../hooks/useToast';
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Search, Filter } from 'lucide-react';
import api from '../services/api';
import '../styles1/Discuss.css';

const DiscussPage = () => {
    const navigate = useNavigate();
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [discussions, setDiscussions] = useState([]);
    const [filteredDiscussions, setFilteredDiscussions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Topics');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: 'General',
        tags: ''
    });

    const categories = [
        'All Topics',
        'Algorithms',
        'Data Structures',
        'Interview Prep',
        'Competitive Programming',
        'General'
    ];

    // Load discussions from backend
    useEffect(() => {
        loadDiscussions();
    }, []);

    const loadDiscussions = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/discussions/');
            setDiscussions(response.data);
            setFilteredDiscussions(response.data);
        } catch (error) {
            console.error('Failed to load discussions:', error);
            showError('Failed to load discussions');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter discussions
    useEffect(() => {
        let filtered = discussions;

        // Filter by category
        if (selectedCategory !== 'All Topics') {
            filtered = filtered.filter(d => d.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(d =>
                d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredDiscussions(filtered);
    }, [selectedCategory, searchQuery, discussions]);

    const handleVote = async (discussionId, voteType) => {
        try {
            await api.post(`/discussions/${discussionId}/vote/`, { vote_type: voteType });
            
            // Update local state
            setDiscussions(prev => prev.map(d => {
                if (d.id === discussionId) {
                    return {
                        ...d,
                        votes: voteType === 'up' ? d.votes + 1 : d.votes - 1
                    };
                }
                return d;
            }));
        } catch (error) {
            showError('Failed to vote. Please try again.');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!newPost.title.trim() || !newPost.content.trim()) {
            showError('Please fill in all required fields');
            return;
        }

        try {
            const tagsArray = newPost.tags.split(',').map(t => t.trim()).filter(t => t);
            
            const response = await api.post('/discussions/', {
                title: newPost.title,
                content: newPost.content,
                category: newPost.category,
                tags: tagsArray
            });

            setDiscussions([response.data, ...discussions]);
            setShowNewPostModal(false);
            setNewPost({ title: '', content: '', category: 'General', tags: '' });
            showSuccess('Discussion created successfully!');
        } catch (error) {
            console.error('Failed to create discussion:', error);
            showError('Failed to create discussion. Please try again.');
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

    return (
        <div className="discuss-container page animate-fade-in">
            <Navbar />
            <main className="discuss-content">
                <header className="discuss-header scroll-reveal">
                    <div className="header-info">
                        <h1>Community <span>Discussions</span></h1>
                        <p>Share knowledge, ask questions, and grow together.</p>
                    </div>
                    <button 
                        className="new-post-btn magnetic-hover" 
                        onClick={() => setShowNewPostModal(true)}
                    >
                        <Plus size={20} /> Start Discussion
                    </button>
                </header>

                {/* Search Bar */}
                <div className="search-bar glass-effect">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="discuss-layout">
                    {/* Sidebar */}
                    <aside className="discuss-sidebar">
                        <div className="glass-effect sidebar-card scroll-reveal">
                            <h3>Categories</h3>
                            <div className="category-list">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass-effect sidebar-card scroll-reveal" style={{ transitionDelay: '0.1s' }}>
                            <h3>Hot Tags</h3>
                            <div className="tag-cloud">
                                <span className="tag">#BinarySearch</span>
                                <span className="tag">#DynamicProg</span>
                                <span className="tag">#Trees</span>
                                <span className="tag">#BigTech</span>
                                <span className="tag">#LeetCode75</span>
                            </div>
                        </div>
                    </aside>

                    {/* Feed */}
                    <section className="discuss-feed">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="glass-effect discussion-card scroll-reveal">
                                    <div className="skeleton-loader">
                                        <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '10px' }}></div>
                                        <div className="skeleton" style={{ height: '16px', width: '60%' }}></div>
                                    </div>
                                </div>
                            ))
                        ) : filteredDiscussions.length === 0 ? (
                            <div className="glass-effect empty-state">
                                <MessageSquare size={48} />
                                <h3>No discussions found</h3>
                                <p>Be the first to start a discussion!</p>
                            </div>
                        ) : (
                            filteredDiscussions.map(post => (
                                <div 
                                    key={post.id} 
                                    className="glass-effect discussion-card scroll-reveal"
                                    onClick={() => navigate(`/discuss/${post.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="vote-section">
                                        <button 
                                            className="vote-btn up magnetic-hover" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(post.id, 'up');
                                            }}
                                        >
                                            <ThumbsUp size={16} />
                                        </button>
                                        <span className="votes">{post.votes || 0}</span>
                                        <button 
                                            className="vote-btn down magnetic-hover" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(post.id, 'down');
                                            }}
                                        >
                                            <ThumbsDown size={16} />
                                        </button>
                                    </div>
                                    <div className="post-info">
                                        <span className="post-category">{post.category}</span>
                                        <h3 className="post-title">{post.title}</h3>
                                        <p className="post-excerpt">{post.content?.substring(0, 150)}...</p>
                                        <div className="post-meta">
                                            <span className="author">by {post.author_username || post.author}</span>
                                            <span className="divider">•</span>
                                            <span className="time">{formatTimeAgo(post.created_at)}</span>
                                            <span className="divider">•</span>
                                            <span className="replies">{post.replies_count || 0} replies</span>
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="post-tags">
                                                {post.tags.map((tag, idx) => (
                                                    <span key={idx} className="post-tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </main>

            {/* New Post Modal */}
            {showNewPostModal && (
                <div className="modal-overlay" onClick={() => setShowNewPostModal(false)}>
                    <div className="modal-content glass-effect" onClick={(e) => e.stopPropagation()}>
                        <h2>Start a New Discussion</h2>
                        <form onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    placeholder="What's your question or topic?"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== 'All Topics').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Content *</label>
                                <textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    placeholder="Describe your question or share your thoughts..."
                                    rows="6"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={newPost.tags}
                                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                    placeholder="e.g., arrays, sorting, interview"
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => setShowNewPostModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Discussion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default DiscussPage;