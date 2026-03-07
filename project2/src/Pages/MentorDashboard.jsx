import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, AreaChart, Area,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { exportToCSV } from '../services/mentorReports';
import { getMentorStats } from '../services/api';
import '../styles1/MentorDashboard.css';

const MentorDashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    // const [newContest, setNewContest] = useState({...}); // Removed for new page flow

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: [],
        branchData: [],
        submissionHistory: [],
        studentStats: [],
        topicMastery: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMentorStats();
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch mentor stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6'];

    const handleExport = () => {
        exportToCSV(dashboardData.studentStats, `Student_Report_${new Date().toLocaleDateString()}.csv`);
    };

    const handleCreateContest = (e) => {
        e.preventDefault();
        console.log('Creating contest:', newContest);
        alert(`Contest "${newContest.title}" created successfully!`);
        setIsContestModalOpen(false);
    };

    const handleViewProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    const filteredStudents = dashboardData.studentStats.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBranch = branchFilter === 'all' || student.branch.toLowerCase() === branchFilter.toLowerCase();
        return matchesSearch && matchesBranch;
    });

    const atRiskStudents = dashboardData.studentStats.filter(s => s.status === 'Inactive' || s.solved < 5); // Adjusted threshold for demo

    if (loading) {
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Dashboard...</div>;
    }

    return (
        <div className="mentor-dashboard-container page animate-fade-in">
            <Navbar />
            <main className="mentor-content">
                <header className="mentor-header">
                    <div className="header-info">
                        <h1>Mentor <span>Dashboard</span></h1>
                        <p>Monitor class performance and track individual student growth across branches.</p>
                    </div>
                    <div className="header-actions">
                        <button className="button secondary magnetic-hover" onClick={handleExport}>Export Report</button>
                        <button className="button primary magnetic-hover" onClick={() => navigate('/create-context')}>Create Context</button>
                    </div>
                </header>

                {/* Aggregate Stats */}
                <section className="stats-grid">
                    {dashboardData.stats.map((stat, i) => (
                        <div key={i} className="glass-effect stat-card magnetic-hover">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-details">
                                <span className="label">{stat.label}</span>
                                <span className="value">{stat.value}</span>
                                <span className={`trend ${stat.trend.includes('↑') || stat.trend.includes('+') ? 'positive' : ''}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="mentor-grid">
                    {/* Branch-wise Performance */}
                    <section className="chart-section glass-effect">
                        <h3>Branch Comparison (Avg. Problems Solved)</h3>
                        <div className="chart-container" style={{ height: '300px', marginTop: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData.branchData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="avgSolved" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={40}>
                                        {dashboardData.branchData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Aggregate Activity */}
                    <section className="chart-section glass-effect">
                        <h3>Collective Submission Activity</h3>
                        <div className="chart-container" style={{ height: '300px', marginTop: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData.submissionHistory}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Student List Table */}
                <section className="student-table-section glass-effect">
                    <div className="table-header">
                        <div className="table-title">
                            <h3>Recent Student Activity</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Showing {filteredStudents.length} students</p>
                        </div>
                        <div className="table-actions">
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="table-search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="branch-filter"
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                            >
                                <option value="all">All Branches</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="MECH">MECH</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Branch</th>
                                    <th>Solved</th>
                                    <th>Points</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div className="student-info">
                                                <div className="student-avatar">{student.name.charAt(0)}</div>
                                                <div className="name-box">
                                                    <span>{student.name}</span>
                                                    <small style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Active {student.lastActive}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{student.branch}</td>
                                        <td>{student.solved}</td>
                                        <td>{student.points}</td>
                                        <td>
                                            <span className={`status-badge ${student.status.toLowerCase()}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="text-button"
                                                onClick={() => handleViewProfile(student.username)}
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            {loading ? 'Loading...' : 'No students found matching your criteria.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="mentor-grid">
                    {/* Topic Mastery Radar */}
                    <section className="chart-section glass-effect">
                        <h3>Topic-wise Class Mastery</h3>
                        <div className="chart-container" style={{ height: '350px', marginTop: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardData.topicMastery}>
                                    <PolarGrid stroke="var(--glass-border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Class Avg"
                                        dataKey="A"
                                        stroke="var(--primary-color)"
                                        fill="var(--primary-color)"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* At-Risk Students Card */}
                    <section className="at-risk-section glass-effect">
                        <div className="section-header">
                            <h3>At-Risk Students</h3>
                            <span className="risk-count">{atRiskStudents.length} Needs Attention</span>
                        </div>
                        <div className="risk-list">
                            {atRiskStudents.map(student => (
                                <div key={student.id} className="risk-item">
                                    <div className="risk-info">
                                        <div className="student-avatar" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }}>{student.name.charAt(0)}</div>
                                        <div>
                                            <p>{student.name}</p>
                                            <small>{student.branch} • Active {student.lastActive}</small>
                                        </div>
                                    </div>
                                    <div className="risk-reason">
                                        <span className="risk-badge">{student.solved < 5 ? 'Low Activity' : 'Inactive'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Create Contest Modal Removed - Redirects to /create-context now */}

            <Footer />
        </div>
    );
};

export default MentorDashboard;
