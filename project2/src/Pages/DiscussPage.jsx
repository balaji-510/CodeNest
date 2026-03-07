import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../styles1/Discuss.css';

const DiscussPage = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [discussions, setDiscussions] = React.useState([
        {
            id: 1,
            title: "How to handle overlapping subproblems in Dynamic Programming?",
            author: "AlgoWizard",
            category: "Algorithms",
            votes: 156,
            replies: 24,
            time: "2h ago",
            tags: ["DP", "Optimization"]
        },
        {
            id: 2,
            title: "BFS vs DFS: Which one is better for finding shortest path in unweighted graph?",
            author: "GraphMaster",
            category: "Data Structures",
            votes: 89,
            replies: 12,
            time: "5h ago",
            tags: ["Graphs", "Traversal"]
        },
        {
            id: 3,
            title: "Interview Experience: SDE-1 role at Google (L3)",
            author: "CareerPath",
            category: "Interview Prep",
            votes: 245,
            replies: 56,
            time: "8h ago",
            tags: ["Google", "Interview"]
        },
        {
            id: 4,
            title: "Solutions to Weekly Contest 412 - Discussion",
            author: "CP_Enthusiast",
            category: "Competitive Programming",
            votes: 67,
            replies: 156,
            time: "1d ago",
            tags: ["Contest", "CP"]
        }
    ]);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleVote = (id, delta) => {
        setDiscussions(prev => prev.map(post =>
            post.id === id ? { ...post, votes: post.votes + delta } : post
        ));
    };

    const handleNewPost = () => {
        const title = prompt("Enter post title:");
        if (title) {
            const newPost = {
                id: Date.now(),
                title,
                author: "You",
                category: "General",
                votes: 0,
                replies: 0,
                time: "Just now",
                tags: ["General"]
            };
            setDiscussions([newPost, ...discussions]);
        }
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
                    <button className="new-post-btn magnetic-hover" onClick={handleNewPost}>
                        Start Discussion
                    </button>
                </header>

                <div className="discuss-layout">
                    {/* Sidebar */}
                    <aside className="discuss-sidebar">
                        <div className="glass-effect sidebar-card scroll-reveal">
                            <h3>Categories</h3>
                            <div className="category-list">
                                <button className="cat-btn active">All Topics</button>
                                <button className="cat-btn">Algorithms</button>
                                <button className="cat-btn">Data Structures</button>
                                <button className="cat-btn">Interview Prep</button>
                                <button className="cat-btn">Competitive Programming</button>
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
                        <div className="feed-filters glass-effect scroll-reveal">
                            <span className="active">Latest</span>
                            <span>Trending</span>
                            <span>Top</span>
                        </div>

                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="glass-effect discussion-card scroll-reveal">
                                    <div className="vote-section">
                                        <div className="skeleton" style={{ height: '20px', width: '20px', marginBottom: '10px' }}></div>
                                        <div className="skeleton" style={{ height: '24px', width: '24px', marginBottom: '10px' }}></div>
                                        <div className="skeleton" style={{ height: '20px', width: '20px' }}></div>
                                    </div>
                                    <div className="post-info" style={{ width: '100%' }}>
                                        <div className="skeleton" style={{ height: '14px', width: '80px', marginBottom: '10px' }}></div>
                                        <div className="skeleton" style={{ height: '24px', width: '90%', marginBottom: '15px' }}></div>
                                        <div className="skeleton" style={{ height: '14px', width: '200px' }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            discussions.map(post => (
                                <div key={post.id} className="glass-effect discussion-card scroll-reveal">
                                    <div className="vote-section">
                                        <button className="vote-btn up magnetic-hover" onClick={() => handleVote(post.id, 1)}>▲</button>
                                        <span className="votes">{post.votes}</span>
                                        <button className="vote-btn down magnetic-hover" onClick={() => handleVote(post.id, -1)}>▼</button>
                                    </div>
                                    <div className="post-info">
                                        <span className="post-category">{post.category}</span>
                                        <h3 className="post-title">{post.title}</h3>
                                        <div className="post-meta">
                                            <span className="author">by {post.author}</span>
                                            <span className="divider">•</span>
                                            <span className="time">{post.time}</span>
                                            <span className="divider">•</span>
                                            <span className="replies">{post.replies} replies</span>
                                        </div>
                                        <div className="post-tags">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="post-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DiscussPage;
