import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Edit2, Check, X, Shield, Code2, Terminal, Cpu, Camera, Trophy } from 'lucide-react';
import '../styles1/Profile.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import ActivityHeatmap from '../Components/ActivityHeatmap';
import { getUserStats, getUserStatsByUsername, updateProfile, getVerificationToken } from '../services/api';
import API_BASE from '../config';



const ProfilePage = () => {
    const { username: paramUsername } = useParams(); // Get username from URL
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingAccounts, setIsEditingAccounts] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Check if the profile being viewed is the current logged-in user
    const loggedInUsername = localStorage.getItem('username');
    const isOwnProfile = !paramUsername || paramUsername === loggedInUsername;

    // Linked Accounts State
    const [linkedAccounts, setLinkedAccounts] = useState({
        leetcode: '',
        codechef: '',
        hackerrank: '',
        codeforces: ''
    });
    const [tempAccounts, setTempAccounts] = useState({ ...linkedAccounts });

    // User Profile State
    const [user, setUser] = useState({
        name: "Loading...",
        username: "@loading",
        bio: "Loading profile...",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
        skills: [],
        stats: {
            solved: 0,
            rank: 0,
            points: 0,
            streak: 0
        },
        recentActivity: [],
        badges: []
    });
    
    const [achievements, setAchievements] = useState([]);
    const [achievementsLoading, setAchievementsLoading] = useState(true);

    const [tempUser, setTempUser] = useState({ ...user });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                let currentStats;
                if (paramUsername) {
                    currentStats = await getUserStatsByUsername(paramUsername);
                } else {
                    const userId = localStorage.getItem('user_id');
                    currentStats = await getUserStats(userId);
                }

                // Get verification status
                let verificationData = { leetcode_verified: false, codechef_verified: false, codeforces_verified: false };
                try {
                    verificationData = await getVerificationToken();
                } catch (err) {
                    console.log("Could not fetch verification status", err);
                }

                setUser(prev => ({
                    ...prev,
                    name: currentStats.full_name || currentStats.username,
                    username: `@${currentStats.username}`,
                    bio: currentStats.bio || "No bio yet. Edit your profile to add one!",
                    avatar: currentStats.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStats.username}`,
                    skills: currentStats.skills || [],
                    stats: {
                        solved: currentStats.problemsSolved,
                        rank: currentStats.rank,
                        points: currentStats.problemsSolved * 10 + currentStats.activeDays * 5,
                        streak: currentStats.activeDays
                    },
                    recentActivity: (currentStats.recentSubmissions || []).map(sub => ({
                        id: sub.id,
                        type: sub.status === 'ACCEPTED' ? 'Solved' : 'Attempted',
                        problem: sub.title,
                        difficulty: sub.difficulty || 'Medium',
                        status: sub.status,
                        time: sub.date
                    })),
                    badges: [] // TODO: Fetch from achievements API when implemented
                }));

                const accounts = {
                    leetcode: currentStats.leetcode_handle || '',
                    codechef: currentStats.codechef_handle || '',
                    codeforces: currentStats.codeforces_handle || '',
                    hackerrank: currentStats.hackerrank_handle || ''
                };

                setLinkedAccounts(prev => ({ ...prev, ...accounts }));
                setTempAccounts(prev => ({ ...prev, ...accounts }));

            } catch (error) {
                console.error("Failed to fetch user stats for profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [paramUsername]);
    
    // Fetch user achievements
    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const token = localStorage.getItem('access_token');
                let userId;
                
                if (paramUsername) {
                    // Get user ID from username
                    const stats = await getUserStatsByUsername(paramUsername);
                    userId = stats.user_id;
                } else {
                    userId = localStorage.getItem('user_id');
                }
                
                const response = await fetch(`${API_BASE}/api/achievements/?user_id=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Filter to show only unlocked achievements (progress === 100)
                    const unlocked = data.filter(ach => ach.progress === 100);
                    setAchievements(unlocked);
                }
            } catch (error) {
                console.error('Failed to fetch achievements:', error);
            } finally {
                setAchievementsLoading(false);
            }
        };
        
        if (!isLoading) {
            fetchAchievements();
        }
    }, [paramUsername, isLoading]);

    const handleSaveAccounts = () => {
        setLinkedAccounts({ ...tempAccounts });
        localStorage.setItem('linkedAccounts', JSON.stringify(tempAccounts));
        // ideally we should also save to backend here
        setIsEditingAccounts(false);
    };

    const handleCancelAccounts = () => {
        setTempAccounts({ ...linkedAccounts });
        setIsEditingAccounts(false);
    };

    const handleSaveProfile = async () => {
        try {
            const formattedSkills = typeof tempUser.skills === 'string' ? tempUser.skills.split(',').map(s => s.trim()) : tempUser.skills;

            // Update backend
            await updateProfile({
                name: tempUser.name,
                bio: tempUser.bio,
                skills: formattedSkills,
                avatar: tempUser.avatar,
                github_link: '', // Add mapping if tempUser has these fields
                linkedin_link: '',
                twitter_link: ''
            });

            const updatedUser = {
                ...user,
                name: tempUser.name,
                bio: tempUser.bio,
                skills: formattedSkills,
                avatar: tempUser.avatar
            };
            setUser(updatedUser);

            // Save to LS as fallback/cache
            // eslint-disable-next-line no-unused-vars
            const { stats, ...userToSave } = updatedUser;
            localStorage.setItem('codenest_user_profile', JSON.stringify(userToSave));

            setIsEditingProfile(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const handleCancelProfile = () => {
        setTempUser({ ...user });
        setIsEditingProfile(false);
    };

    const getPlatformUrl = (platform, username) => {
        const urls = {
            leetcode: `https://leetcode.com/${username}`,
            codechef: `https://codechef.com/users/${username}`,
            hackerrank: `https://hackerrank.com/${username}`,
            codeforces: `https://codeforces.com/profile/${username}`
        };
        return urls[platform] || '#';
    };

    return (
        <div className="profile-container">
            <Navbar />

            <main className="profile-content animate-fade-in">
                <div className="profile-grid">
                    {/* Left Column: User Info */}
                    <section className="profile-sidebar">
                        <div className="glass-effect profile-card user-info-card scroll-reveal">
                            {isLoading ? (
                                <>
                                    <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: '50%', marginBottom: '2rem' }}></div>
                                    <div className="skeleton" style={{ height: '32px', width: '70%', marginBottom: '10px' }}></div>
                                    <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '20px' }}></div>
                                    <div className="skeleton" style={{ height: '60px', width: '90%', marginBottom: '20px' }}></div>
                                </>
                            ) : (
                                <>
                                    <div className="avatar-container">
                                        <img src={user.avatar} alt={user.name} className="profile-avatar" />
                                        <div className="status-indicator online"></div>
                                        {isEditingProfile && <div className="avatar-overlay"><Camera size={24} /></div>}
                                    </div>

                                    {isEditingProfile ? (
                                        <div className="edit-profile-form">
                                            <input
                                                type="text"
                                                className="edit-input name-input"
                                                value={tempUser.name}
                                                onChange={e => setTempUser({ ...tempUser, name: e.target.value })}
                                            />
                                            <p className="user-handle">{user.username}</p>
                                            <textarea
                                                className="edit-input bio-input"
                                                rows="3"
                                                value={tempUser.bio}
                                                onChange={e => setTempUser({ ...tempUser, bio: e.target.value })}
                                            />
                                            <div className="edit-actions">
                                                <button className="icon-btn-small success magnetic-hover" onClick={handleSaveProfile}><Check size={18} /></button>
                                                <button className="icon-btn-small danger magnetic-hover" onClick={handleCancelProfile}><X size={18} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="user-name">{user.name}</h1>
                                            <p className="user-handle">{user.username}</p>
                                            <p className="user-bio">{user.bio}</p>

                                            <div className="social-links">
                                                <button className="social-btn magnetic-hover">GitHub</button>
                                                <button className="social-btn magnetic-hover">LinkedIn</button>
                                                <button className="social-btn magnetic-hover">Twitter</button>
                                            </div>

                                            <button
                                                className="edit-profile-btn magnetic-hover"
                                                onClick={() => {
                                                    setTempUser({ ...user });
                                                    setIsEditingProfile(true);
                                                }}
                                            >
                                                Edit Profile
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="glass-effect profile-card accounts-card scroll-reveal">
                            <div className="card-header-flex">
                                <h3 className="card-title">Coding Profiles</h3>
                                {isOwnProfile && (
                                    <button
                                        className="icon-btn-small magnetic-hover"
                                        onClick={() => navigate('/settings')}
                                        title="Manage Accounts in Settings"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="accounts-list">
                                {Object.entries(linkedAccounts).filter(([_, username]) => username).map(([platform, username]) => (
                                    <div key={platform} className="account-item">
                                        <div className="account-platform-info">
                                            {platform === 'leetcode' && <Code2 size={18} className="platform-icon leetcode" />}
                                            {platform === 'codechef' && <Cpu size={18} className="platform-icon codechef" />}
                                            {platform === 'hackerrank' && <Terminal size={18} className="platform-icon hackerrank" />}
                                            {platform === 'codeforces' && <Shield size={18} className="platform-icon codeforces" />}
                                            <span className="platform-name">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                                        </div>

                                        <a
                                            href={getPlatformUrl(platform, username)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="account-link"
                                        >
                                            {username} <ExternalLink size={12} />
                                        </a>
                                    </div>
                                ))}
                                {Object.values(linkedAccounts).every(v => !v) && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                        <p>No accounts linked yet.</p>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => navigate('/settings')}
                                                style={{
                                                    marginTop: '1rem',
                                                    padding: '0.5rem 1rem',
                                                    background: 'var(--primary-color)',
                                                    borderRadius: '8px',
                                                    color: 'white'
                                                }}
                                            >
                                                Link Accounts
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-effect profile-card skills-card scroll-reveal">
                            <h3 className="card-title">Skills</h3>
                            {isEditingProfile ? (
                                <textarea
                                    className="edit-input skills-input"
                                    value={Array.isArray(tempUser.skills) ? tempUser.skills.join(', ') : tempUser.skills}
                                    onChange={e => setTempUser({ ...tempUser, skills: e.target.value })}
                                    placeholder="React, Node.js, Python..."
                                />
                            ) : (
                                <div className="skills-tags">
                                    {user.skills.map(skill => (
                                        <span key={skill} className="skill-tag magnetic-hover">{skill}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Stats & Activity */}
                    <section className="profile-main">
                        <div className="stats-grid">
                            <div className="glass-effect stat-card scroll-reveal magnetic-hover">
                                <span className="stat-label">Problems Solved</span>
                                <span className="stat-value">{user.stats.solved}</span>
                                <div className="stat-progress-bar">
                                    <div className="progress-fill" style={{ width: '75%', transitionDelay: '0.5s' }}></div>
                                </div>
                            </div>
                            <div className="glass-effect stat-card scroll-reveal magnetic-hover">
                                <span className="stat-label">Global Rank</span>
                                <span className="stat-value">#{user.stats.rank}</span>
                            </div>
                            <div className="glass-effect stat-card scroll-reveal magnetic-hover">
                                <span className="stat-label">Total Points</span>
                                <span className="stat-value">{user.stats.points.toLocaleString()}</span>
                            </div>
                            <div className="glass-effect stat-card scroll-reveal magnetic-hover">
                                <span className="stat-label">Current Streak</span>
                                <span className="stat-value">{user.stats.streak} Days</span>
                            </div>
                        </div>

                        <div className="glass-effect profile-card badges-card scroll-reveal">
                            <div className="card-header-with-action">
                                <h3 className="card-title">
                                    <Trophy size={24} />
                                    Achievements
                                </h3>
                                {achievements.length > 0 && (
                                    <button 
                                        className="view-all-btn"
                                        onClick={() => navigate('/achievements')}
                                    >
                                        View All
                                    </button>
                                )}
                            </div>
                            {achievementsLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="loading-spinner"></div>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading achievements...</p>
                                </div>
                            ) : achievements.length > 0 ? (
                                <div className="achievements-showcase">
                                    {achievements.slice(0, 6).map(achievement => (
                                        <div key={achievement.id} className="achievement-showcase-item magnetic-hover">
                                            <div className="achievement-icon-large">
                                                {achievement.icon}
                                            </div>
                                            <div className="achievement-details">
                                                <h4>{achievement.title}</h4>
                                                <p>{achievement.description}</p>
                                                <span className="achievement-points">+{achievement.points} pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</p>
                                    <p>No achievements yet!</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Start solving problems to earn badges.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Activity Heatmap */}
                        <div className="glass-effect profile-card heatmap-card scroll-reveal">
                            <h3 className="card-title">Activity Overview</h3>
                            <ActivityHeatmap />
                        </div>

                        <div className="glass-effect profile-card activity-card scroll-reveal">
                            <h3 className="card-title">Recent Activity</h3>
                            <div className="activity-list">
                                {user.recentActivity.map(activity => (
                                    <div key={activity.id} className="activity-item magnetic-hover">
                                        <div className={`activity-icon ${activity.type.toLowerCase()}`}></div>
                                        <div className="activity-details">
                                            <p className="activity-text">
                                                <span className="activity-type">{activity.type}</span>
                                                <span className="problem-name">{activity.problem}</span>
                                            </p>
                                            <span className="activity-time">{activity.time}</span>
                                        </div>
                                        {activity.difficulty && (
                                            <span className={`difficulty-badge ${activity.difficulty.toLowerCase()}`}>
                                                {activity.difficulty}
                                            </span>
                                        )}
                                        {activity.status && (
                                            <span className="status-badge error">{activity.status}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
