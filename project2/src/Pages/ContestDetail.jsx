import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Trophy, Calendar, Clock, Users, Play, CheckCircle, Code } from 'lucide-react';
import API_BASE from '../config';
import '../styles1/ContestDetail.css';

function ContestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasJoined, setHasJoined] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        fetchContestDetails();
        const interval = setInterval(fetchContestDetails, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (contest && contest.status === 'ongoing') {
            const timer = setInterval(() => {
                setTimeRemaining(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [contest]);

    const fetchContestDetails = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            // Fetch contest details
            const contestResponse = await fetch(`${API_BASE}/api/contests/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (contestResponse.ok) {
                const contestData = await contestResponse.json();
                setContest(contestData);
                setTimeRemaining(contestData.time_remaining || 0);
                
                // Check if user has joined
                const participantsResponse = await fetch(`${API_BASE}/api/contests/${id}/leaderboard/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (participantsResponse.ok) {
                    const leaderboardData = await participantsResponse.json();
                    setLeaderboard(leaderboardData);
                    setHasJoined(leaderboardData.some(p => p.user_id === parseInt(userId)));
                }
            }
        } catch (error) {
            console.error('Failed to fetch contest details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinContest = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/api/contests/${id}/join/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setHasJoined(true);
                fetchContestDetails();
            }
        } catch (error) {
            console.error('Failed to join contest:', error);
        }
    };

    const handleStartContest = () => {
        navigate(`/contest/${id}/arena`);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'upcoming': { class: 'upcoming', icon: '📅', label: 'Upcoming' },
            'ongoing': { class: 'ongoing', icon: '🔴', label: 'Live' },
            'completed': { class: 'completed', icon: '✅', label: 'Completed' }
        };
        return badges[status] || badges.upcoming;
    };

    if (loading) {
        return (
            <div className="contest-detail-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading contest...</p>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="contest-detail-page">
                <Navbar />
                <div className="error-container">
                    <h2>Contest not found</h2>
                    <button className="btn-primary" onClick={() => navigate('/contests')}>
                        Back to Contests
                    </button>
                </div>
            </div>
        );
    }

    const statusBadge = getStatusBadge(contest.status);

    return (
        <div className="contest-detail-page">
            <Navbar />
            
            <main className="page-section">
                {/* Contest Header */}
                <div className="contest-header glass-effect">
                    <div className="header-content">
                        <div className="header-left">
                            <h1>{contest.title}</h1>
                            <span className={`status-badge ${statusBadge.class}`}>
                                {statusBadge.icon} {statusBadge.label}
                            </span>
                        </div>
                        <div className="header-right">
                            {contest.status === 'ongoing' && (
                                <div className="timer-display">
                                    <Clock size={24} />
                                    <span className="timer-text">{formatTime(timeRemaining)}</span>
                                </div>
                            )}
                            {!hasJoined && contest.status !== 'completed' && (
                                <button className="btn-primary" onClick={handleJoinContest}>
                                    <Users size={20} />
                                    Join Contest
                                </button>
                            )}
                            {hasJoined && contest.status === 'ongoing' && (
                                <button className="btn-success" onClick={handleStartContest}>
                                    <Play size={20} />
                                    Enter Arena
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="contest-content">
                    {/* Contest Info */}
                    <div className="contest-info-section">
                        <div className="info-card glass-effect">
                            <h2>About</h2>
                            <p className="description">{contest.description}</p>
                            
                            <div className="info-grid">
                                <div className="info-item">
                                    <Calendar size={20} />
                                    <div>
                                        <span className="info-label">Start Time</span>
                                        <span className="info-value">{formatDate(contest.start_time)}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Calendar size={20} />
                                    <div>
                                        <span className="info-label">End Time</span>
                                        <span className="info-value">{formatDate(contest.end_time)}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Clock size={20} />
                                    <div>
                                        <span className="info-label">Duration</span>
                                        <span className="info-value">{Math.floor(contest.duration_minutes / 60)}h {contest.duration_minutes % 60}m</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Users size={20} />
                                    <div>
                                        <span className="info-label">Participants</span>
                                        <span className="info-value">{contest.participant_count}</span>
                                    </div>
                                </div>
                            </div>

                            {contest.rules && (
                                <div className="rules-section">
                                    <h3>Rules</h3>
                                    <p>{contest.rules}</p>
                                </div>
                            )}
                        </div>

                        {/* Problems List */}
                        <div className="problems-card glass-effect">
                            <h2>
                                <Code size={24} />
                                Problems ({contest.problems?.length || 0})
                            </h2>
                            {contest.problems && contest.problems.length > 0 ? (
                                <div className="problems-list">
                                    {contest.problems.map((problem, index) => (
                                        <div 
                                            key={problem.id} 
                                            className="problem-item"
                                            onClick={() => {
                                                if (contest.status === 'ongoing' && hasJoined) {
                                                    // Navigate to contest arena with this problem
                                                    navigate(`/contest/${id}/arena?problem=${problem.id}`);
                                                } else if (contest.status === 'ongoing' && !hasJoined) {
                                                    alert('Please join the contest first');
                                                } else if (contest.status === 'upcoming') {
                                                    alert('Contest has not started yet');
                                                } else {
                                                    // For completed contests or practice, allow solving
                                                    navigate(`/solve/${problem.id}`);
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="problem-info">
                                                <span className="problem-number">{String.fromCharCode(65 + index)}</span>
                                                <div>
                                                    <h4>{problem.title}</h4>
                                                    <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="problem-actions">
                                                <span className="problem-points">100 pts</span>
                                                {contest.status === 'ongoing' && hasJoined && (
                                                    <span className="solve-badge">Solve →</span>
                                                )}
                                                {contest.status === 'completed' && (
                                                    <span className="practice-badge">Practice →</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-problems">No problems added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="leaderboard-section">
                        <div className="leaderboard-card glass-effect">
                            <h2>
                                <Trophy size={24} />
                                Leaderboard
                            </h2>
                            {leaderboard.length > 0 ? (
                                <div className="leaderboard-table">
                                    <div className="table-header">
                                        <span>Rank</span>
                                        <span>User</span>
                                        <span>Score</span>
                                        <span>Solved</span>
                                        <span>Penalty</span>
                                    </div>
                                    {leaderboard.map((participant) => (
                                        <div 
                                            key={participant.user_id} 
                                            className={`table-row ${participant.user_id === parseInt(userId) ? 'current-user' : ''}`}
                                        >
                                            <span className="rank">
                                                {participant.rank <= 3 ? (
                                                    <span className={`medal rank-${participant.rank}`}>
                                                        {participant.rank === 1 ? '🥇' : participant.rank === 2 ? '🥈' : '🥉'}
                                                    </span>
                                                ) : (
                                                    `#${participant.rank}`
                                                )}
                                            </span>
                                            <span className="username">{participant.username}</span>
                                            <span className="score">{participant.score}</span>
                                            <span className="solved">{participant.problems_solved}</span>
                                            <span className="penalty">{participant.penalty}m</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-participants">No participants yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ContestDetail;
