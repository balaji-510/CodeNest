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
                console.log("🔄 Fetching mentor stats...");
                const data = await getMentorStats();
                console.log("✅ Mentor stats received:", data);
                console.log("📊 Student count:", data.studentStats?.length || 0);
                console.log("📈 Stats:", data.stats);
                setDashboardData(data);
            } catch (error) {
                console.error("❌ Failed to fetch mentor stats:", error);
                console.error("Error details:", error.response?.data || error.message);
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

    const handleViewProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    const filteredStudents = dashboardData.studentStats.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBranch = branchFilter === 'all' || student.branch.toLowerCase() === branchFilter.toLowerCase();
        return matchesSearch && matchesBranch;
    });

    const atRiskStudents = []; // moved to Student Activity page

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
                        <button className="button secondary magnetic-hover" onClick={() => navigate('/contests-management')}>Manage Contests</button>
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

                {/* Student List Table - moved to Activity page */}

                <div className="mentor-grid">
                    {/* Topic Mastery Radar */}
                    <section className="chart-section glass-effect" style={{ gridColumn: '1 / -1' }}>
                        <h3>Topic-wise Class Mastery</h3>
                        <div className="chart-container" style={{ height: '350px', marginTop: '1.5rem' }}>
                            {dashboardData.topicMastery && dashboardData.topicMastery.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardData.topicMastery}>
                                        <PolarGrid stroke="var(--glass-border)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <PolarRadiusAxis 
                                            angle={30} 
                                            domain={[0, Math.max(...dashboardData.topicMastery.map(t => t.fullMark || 5))]} 
                                            tick={{ fill: '#94a3b8', fontSize: 10 }} 
                                            axisLine={false} 
                                        />
                                        <Radar
                                            name="Class Avg"
                                            dataKey="A"
                                            stroke="var(--primary-color)"
                                            fill="var(--primary-color)"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                            formatter={(value, name) => {
                                                if (name === "Class Avg") {
                                                    return [`${value} problems (avg per student)`, name];
                                                }
                                                return [value, name];
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No topic data available yet. Students need to start solving problems!
                                </div>
                            )}
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
