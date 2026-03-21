import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Trophy, Calendar, Clock, Users, Plus, Filter } from 'lucide-react';
import '../styles1/Contests.css';

function Contests() {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const userRole = localStorage.getItem('userRole');
    const isTeacher = userRole === 'teacher';

    useEffect(() => {
        fetchContests();
    }, [statusFilter]);

    const fetchContests = async () => {
        try {
            const token = localStorage.getItem('access_token');
            let url = 'http://localhost:8000/api/contests/';
            
            if (statusFilter !== 'All') {
                url += `?status=${statusFilter.toLowerCase()}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setContests(data);
            }
        } catch (error) {
            console.error('Failed to fetch contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'upcoming': { class: 'upcoming', icon: '📅', label: 'Upcoming' },
            'ongoing': { class: 'ongoing', icon: '🔴', label: 'Live' },
            'completed': { class: 'completed', icon: '✅', label: 'Completed' }
        };
        return badges[status] || badges.upcoming;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const handleContestClick = (contestId) => {
        navigate(`/contest/${contestId}`);
    };

    const handleCreateContest = () => {
        navigate('/create-contest');
    };

    if (loading) {
        return (
            <div className="contests-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading contests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contests-page">
            <Navbar />
            
            <main className="page-section">
                <header className="section-title">
                    <div>
                        <h1><Trophy size={40} /> <span>Contests</span></h1>
                        <p>Compete with others and test your skills</p>
                    </div>
                    {userRole === 'teacher' && (
                        <button className="btn-primary" onClick={handleCreateContest}>
                            <Plus size={20} />
                            Create Contest
                        </button>
                    )}
                </header>

                {/* Filters */}
                <div className="filters-container glass-effect">
                    <div className="filter-group">
                        <Filter size={18} />
                        <span>Filter by status:</span>
                    </div>
                    <div className="status-filters">
                        {['All', 'Upcoming', 'Ongoing', 'Completed'].map(status => (
                            <button
                                key={status}
                                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="results-count">
                        {contests.length} contest{contests.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Contests List */}
                {contests.length === 0 ? (
                    <div className="empty-state glass-effect">
                        <Trophy size={64} />
                        <h2>No contests found</h2>
                        <p>Check back later for upcoming contests!</p>
                        {userRole === 'teacher' && (
                            <button className="btn-primary" onClick={handleCreateContest}>
                                Create First Contest
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="contests-grid">
                        {contests.map((contest) => {
                            const statusBadge = getStatusBadge(contest.status);
                            return (
                                <div
                                    key={contest.id}
                                    className={`contest-card glass-effect ${contest.status}`}
                                    onClick={() => handleContestClick(contest.id)}
                                >
                                    <div className="contest-header">
                                        <h3>{contest.title}</h3>
                                        <span className={`status-badge ${statusBadge.class}`}>
                                            {statusBadge.icon} {statusBadge.label}
                                        </span>
                                    </div>

                                    <p className="contest-description">{contest.description}</p>

                                    <div className="contest-meta">
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>{formatDate(contest.start_time)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Clock size={16} />
                                            <span>{formatDuration(contest.duration_minutes)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Users size={16} />
                                            <span>{contest.participant_count} participants</span>
                                        </div>
                                        <div className="meta-item">
                                            <Trophy size={16} />
                                            <span>{contest.problems_count} problems</span>
                                        </div>
                                    </div>

                                    <div className="contest-footer">
                                        <span className="creator">By {contest.creator_name}</span>
                                        {contest.status === 'ongoing' && contest.time_remaining && (
                                            <span className="time-remaining">
                                                ⏱️ {Math.floor(contest.time_remaining / 3600)}h {Math.floor((contest.time_remaining % 3600) / 60)}m left
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Contests;
