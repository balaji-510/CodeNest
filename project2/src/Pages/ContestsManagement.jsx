import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { ToastContainer } from '../Components/Toast';
import { Plus, Edit, Trash2, Users, Clock, Calendar, Trophy, Eye } from 'lucide-react';
import '../styles1/ContestsManagement.css';
import { useToast } from '../hooks/useToast';

const ContestsManagement = () => {
    const navigate = useNavigate();
    const { toasts, removeToast, showToast } = useToast();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed
    const [userRole, setUserRole] = useState('student');

    useEffect(() => {
        // Check user role from localStorage
        const role = localStorage.getItem('userRole') || 'student';
        setUserRole(role);
        console.log('User role:', role); // Debug log
        
        fetchContests();
    }, [filter]);

    const fetchContests = async () => {
        try {
            const token = localStorage.getItem('access_token');
            let url = 'http://localhost:8000/api/contests/';
            
            if (filter !== 'all') {
                url += `?status=${filter}`;
            }
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
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

    const handleDelete = async (contestId) => {
        if (!window.confirm('Are you sure you want to delete this contest?')) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/contests/${contestId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setContests(contests.filter(c => c.id !== contestId));
                showToast('Contest deleted successfully', 'success');
            } else {
                showToast('Failed to delete contest', 'error');
            }
        } catch (error) {
            console.error('Error deleting contest:', error);
            showToast('Network error. Please try again.', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            upcoming: { class: 'status-upcoming', text: 'Upcoming' },
            ongoing: { class: 'status-ongoing', text: 'Live' },
            completed: { class: 'status-completed', text: 'Ended' }
        };
        const badge = badges[status] || badges.upcoming;
        return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
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
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="contests-management-page animate-fade-in">
            <Navbar />
            <main className="contests-management-container">
                <header className="page-header">
                    <div className="header-content">
                        <h1>
                            <Trophy size={32} />
                            Contest Management
                        </h1>
                        <p>{userRole === 'teacher' ? 'Create and manage programming contests for your students' : 'View and participate in programming contests'}</p>
                    </div>
                    {userRole === 'teacher' && (
                        <button 
                            className="btn-create-contest"
                            onClick={() => navigate('/create-contest')}
                        >
                            <Plus size={20} />
                            Create Contest
                        </button>
                    )}
                </header>

                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-tabs">
                        <button 
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Contests
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'ongoing' ? 'active' : ''}`}
                            onClick={() => setFilter('ongoing')}
                        >
                            Live
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {/* Contests List */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading contests...</p>
                    </div>
                ) : contests.length === 0 ? (
                    <div className="empty-state glass-effect">
                        <Trophy size={64} />
                        <h3>No contests found</h3>
                        <p>{userRole === 'teacher' ? 'Create your first contest to get started!' : 'No contests available at the moment.'}</p>
                        {userRole === 'teacher' && (
                            <button 
                                className="btn-create-contest"
                                onClick={() => navigate('/create-contest')}
                            >
                                <Plus size={20} />
                                Create Contest
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="contests-grid">
                        {contests.map(contest => (
                            <div key={contest.id} className="contest-card glass-effect">
                                <div className="contest-header">
                                    <div className="contest-title-section">
                                        <h3>{contest.title}</h3>
                                        {getStatusBadge(contest.status)}
                                    </div>
                                    {userRole === 'teacher' && (
                                        <div className="contest-actions">
                                            <button 
                                                className="btn-icon"
                                                onClick={() => navigate(`/contest/${contest.id}`)}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                className="btn-icon"
                                                onClick={() => navigate(`/edit-contest/${contest.id}`)}
                                                title="Edit Contest"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDelete(contest.id)}
                                                title="Delete Contest"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
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
                                    <span className="creator-info">
                                        Created by {contest.creator_name}
                                    </span>
                                    <button 
                                        className="btn-view-contest"
                                        onClick={() => navigate(`/contest/${contest.id}`)}
                                    >
                                        {contest.status === 'ongoing' ? 'Enter Contest' : 'View Details'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default ContestsManagement;
