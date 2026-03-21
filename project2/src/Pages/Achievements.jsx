import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Trophy, Lock, Star, Filter, Search } from 'lucide-react';
import API_BASE from '../config';
import '../styles1/Achievements.css';

function Achievements() {
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    const categories = [
        'All',
        'problems',
        'difficulty',
        'topic',
        'streak',
        'speed',
        'time',
        'special'
    ];

    const categoryLabels = {
        'problems': 'Problem Solving',
        'difficulty': 'Difficulty Mastery',
        'topic': 'Topic Mastery',
        'streak': 'Streaks',
        'speed': 'Speed',
        'time': 'Time-based',
        'special': 'Special'
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            // Fetch user's progress towards all achievements
            const progressResponse = await fetch(`${API_BASE}/api/achievements/progress/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                setProgress(progressData);
            }
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAchievements = progress.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.achievement.category === selectedCategory;
        const matchesSearch = !searchQuery || 
            item.achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const earnedCount = progress.filter(item => item.earned).length;
    const totalPoints = progress
        .filter(item => item.earned)
        .reduce((sum, item) => sum + item.achievement.points, 0);

    if (loading) {
        return (
            <div className="achievements-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading achievements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="achievements-page">
            <Navbar />
            
            <main className="page-section">
                <header className="section-title">
                    <h1><Trophy size={40} /> <span>Achievements</span></h1>
                    <p>Unlock badges and earn points by completing challenges</p>
                </header>

                {/* Stats Summary */}
                <div className="achievements-stats glass-effect">
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-info">
                            <span className="stat-value">{earnedCount}/{progress.length}</span>
                            <span className="stat-label">Achievements</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-info">
                            <span className="stat-value">{totalPoints}</span>
                            <span className="stat-label">Total Points</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <span className="stat-value">{progress.length > 0 ? Math.round((earnedCount / progress.length) * 100) : 0}%</span>
                            <span className="stat-label">Completion</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-container glass-effect">
                    <div className="filter-group">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search achievements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category === 'All' ? 'All' : categoryLabels[category] || category}
                            </button>
                        ))}
                    </div>

                    <div className="results-count">
                        {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="achievements-grid">
                    {filteredAchievements.map((item, index) => (
                        <div
                            key={index}
                            className={`achievement-card glass-effect ${item.earned ? 'earned' : 'locked'}`}
                            onClick={() => setSelectedAchievement(item)}
                        >
                            <div className="achievement-icon">
                                {item.earned ? (
                                    <span className="icon-emoji">{item.achievement.icon}</span>
                                ) : (
                                    <Lock size={40} className="lock-icon" />
                                )}
                            </div>
                            
                            <div className="achievement-info">
                                <h3>{item.achievement.name}</h3>
                                <p>{item.achievement.description}</p>
                                
                                {!item.earned && (
                                    <div className="progress-bar-container">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">
                                            {item.progress}/{item.target} ({item.percentage}%)
                                        </span>
                                    </div>
                                )}
                                
                                <div className="achievement-footer">
                                    <span className="points-badge">
                                        <Star size={14} /> {item.achievement.points} pts
                                    </span>
                                    {item.earned && item.earned_at && (
                                        <span className="earned-date">
                                            Earned {new Date(item.earned_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAchievements.length === 0 && (
                    <div className="empty-state glass-effect">
                        <Trophy size={64} />
                        <h2>No achievements found</h2>
                        <p>Try adjusting your filters or search query</p>
                    </div>
                )}
            </main>

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <div className="modal-overlay" onClick={() => setSelectedAchievement(null)}>
                    <div className="achievement-modal glass-effect" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedAchievement(null)}>×</button>
                        
                        <div className="modal-icon">
                            {selectedAchievement.earned ? (
                                <span className="icon-emoji-large">{selectedAchievement.achievement.icon}</span>
                            ) : (
                                <Lock size={80} className="lock-icon-large" />
                            )}
                        </div>
                        
                        <h2>{selectedAchievement.achievement.name}</h2>
                        <p className="modal-description">{selectedAchievement.achievement.description}</p>
                        
                        <div className="modal-stats">
                            <div className="modal-stat">
                                <span className="modal-stat-label">Category</span>
                                <span className="modal-stat-value">
                                    {categoryLabels[selectedAchievement.achievement.category] || selectedAchievement.achievement.category}
                                </span>
                            </div>
                            <div className="modal-stat">
                                <span className="modal-stat-label">Points</span>
                                <span className="modal-stat-value">
                                    <Star size={16} /> {selectedAchievement.achievement.points}
                                </span>
                            </div>
                            {selectedAchievement.earned && selectedAchievement.earned_at && (
                                <div className="modal-stat">
                                    <span className="modal-stat-label">Earned</span>
                                    <span className="modal-stat-value">
                                        {new Date(selectedAchievement.earned_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {!selectedAchievement.earned && (
                            <div className="modal-progress">
                                <h3>Progress</h3>
                                <div className="progress-bar-container">
                                    <div className="progress-bar large">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${selectedAchievement.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">
                                        {selectedAchievement.progress}/{selectedAchievement.target} ({selectedAchievement.percentage}%)
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {selectedAchievement.earned && (
                            <div className="earned-badge">
                                <Trophy size={24} />
                                <span>Achievement Unlocked!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Achievements;
