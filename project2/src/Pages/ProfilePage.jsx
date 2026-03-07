import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useParams, useNavigate
import { ExternalLink, Edit2, Check, X, Shield, Code2, Terminal, Cpu, Camera } from 'lucide-react';
import '../styles1/Profile.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { getUserStats, getUserStatsByUsername, updateProfile } from '../services/api'; // Added updateProfile



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
    const [linkedAccounts, setLinkedAccounts] = useState(() => {
        const saved = localStorage.getItem('linkedAccounts');
        return saved ? JSON.parse(saved) : {
            leetcode: 'arivera_lc',
            codechef: 'arivera_cc',
            hackerrank: 'arivera_hr',
            codeforces: 'arivera_cf'
        };
    });
    const [tempAccounts, setTempAccounts] = useState({ ...linkedAccounts });

    // User Profile State
    const [user, setUser] = useState({
        name: "Alex Rivera",
        username: "@arivera_dev",
        bio: "Full-stack developer | Open source enthusiast | Problem solver at heart. Always learning and building something new.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        skills: ["React", "Node.js", "Python", "TypeScript", "GraphQL", "PostgreSQL"],
        stats: {
            solved: 452,
            rank: 1240,
            points: 15420,
            streak: 15
        },
        recentActivity: [],
        badges: [
            { id: 1, name: "Fast Learner", icon: "⚡", color: "#fbbf24", description: "Completed 10 problems in a day" },
            { id: 2, name: "Night Owl", icon: "🦉", color: "#818cf8", description: "Solved problems after midnight" },
            { id: 3, name: "Gold Solver", icon: "🥇", color: "#f59e0b", description: "Top 1% in Weekly Contest" },
            { id: 4, name: "Bug Hunter", icon: "🛡️", color: "#ec4899", description: "Identified and fixed 5 edge cases" }
        ]
    });

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

                setUser(prev => ({
                    ...prev,
                    name: currentStats.full_name || prev.name,
                    username: `@${currentStats.username}` || prev.username,
                    // bio: currentStats.bio || prev.bio,
                    stats: {
                        solved: currentStats.problemsSolved,
                        rank: currentStats.rank,
                        points: currentStats.problemsSolved * 10 + currentStats.activeDays * 5,
                        streak: currentStats.activeDays
                    },
                    recentActivity: currentStats.recentSubmissions.map(sub => ({
                        id: sub.id,
                        type: sub.status === 'Solved' ? 'Solved' : 'Submission',
                        problem: sub.title,
                        difficulty: sub.difficulty || 'Medium',
                        status: sub.status,
                        time: sub.date // simple date for now
                    }))
                }));

                const accounts = {
                    leetcode: currentStats.leetcode_handle || '',
                    codechef: currentStats.codechef_handle || '',
                    codeforces: currentStats.codeforces_handle || ''
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
                                {!isEditingAccounts ? (
                                    <button
                                        className="icon-btn-small magnetic-hover"
                                        onClick={() => setIsEditingAccounts(true)}
                                        title="Edit Accounts"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                ) : (
                                    <div className="edit-actions-small">
                                        <button className="icon-btn-small success magnetic-hover" onClick={handleSaveAccounts}><Check size={16} /></button>
                                        <button className="icon-btn-small danger magnetic-hover" onClick={handleCancelAccounts}><X size={16} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="accounts-list">
                                {Object.entries(tempAccounts).map(([platform, username]) => (
                                    <div key={platform} className="account-item">
                                        <div className="account-platform-info">
                                            {platform === 'leetcode' && <Code2 size={18} className="platform-icon leetcode" />}
                                            {platform === 'codechef' && <Cpu size={18} className="platform-icon codechef" />}
                                            {platform === 'hackerrank' && <Terminal size={18} className="platform-icon hackerrank" />}
                                            {platform === 'codeforces' && <Shield size={18} className="platform-icon codeforces" />}
                                            <span className="platform-name">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                                        </div>

                                        {isEditingAccounts ? (
                                            <input
                                                type="text"
                                                className="account-input"
                                                value={username}
                                                readOnly
                                                disabled
                                                title="Linked accounts cannot be changed manually."
                                            />
                                        ) : (
                                            <a
                                                href={getPlatformUrl(platform, username)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="account-link"
                                            >
                                                {username || 'Link Account'} <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                ))}
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
                            <h3 className="card-title">Achievements</h3>
                            <div className="badges-grid">
                                {user.badges.map(badge => (
                                    <div key={badge.id} className="badge-item magnetic-hover" title={badge.description}>
                                        <div className="badge-icon" style={{ backgroundColor: `${badge.color}20`, borderColor: badge.color }}>
                                            {badge.icon}
                                        </div>
                                        <div className="badge-info">
                                            <h4>{badge.name}</h4>
                                            <p>{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
