import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { getAnalytics } from '../services/api';
import '../styles1/Analytics.css';

const AnalyticsPage = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [analytics, setAnalytics] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [isTeacher, setIsTeacher] = React.useState(false);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getAnalytics();
                console.log("📊 Analytics data received:", data);
                setAnalytics(data);
                setIsTeacher(data.isTeacher || false);
            } catch (err) {
                console.error("Failed to load analytics:", err);
                setError(err.message || "Failed to load analytics data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="analytics-container page animate-fade-in">
            <Navbar />
            <main className="analytics-content">
                <header className="analytics-header">
                    <h1>Performance <span>Analytics</span></h1>
                    <p>{isTeacher ? "Class-wide performance insights and student progress tracking." : "Detailed insights into your coding journey and skill progression."}</p>
                </header>

                {error ? (
                    <div className="analytics-error" style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
                        <h2>Unable to Load Analytics</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="solve-btn-primary" style={{ marginTop: '20px' }}>
                            Try Again
                        </button>
                    </div>
                ) : !isLoading && !analytics ? (
                    <div className="analytics-error" style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
                        <h2>Unable to Load Analytics</h2>
                        <p>No data received from the server.</p>
                        <button onClick={() => window.location.reload()} className="solve-btn-primary" style={{ marginTop: '20px' }}>
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="analytics-grid">
                        {/* Top Stats */}
                        <section className="summary-stats scroll-reveal">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`glass-effect stat-card ${isLoading ? '' : 'magnetic-hover'}`}>
                                    {isLoading ? (
                                        <>
                                            <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '10px' }}></div>
                                            <div className="skeleton" style={{ height: '40px', width: '40%' }}></div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="label">
                                                {i === 1 ? (isTeacher ? "Total Problems Solved" : "Total Solved") : 
                                                 i === 2 ? (isTeacher ? "Class Acceptance Rate" : "Acceptance Rate") : 
                                                 i === 3 ? (isTeacher ? "Total Students" : "Global Rank") : 
                                                 (isTeacher ? "Total Points" : "Points")}
                                            </span>
                                            <span className="value">
                                                {i === 1 ? analytics.totalSolved : 
                                                 i === 2 ? analytics.acceptanceRate : 
                                                 i === 3 ? (isTeacher ? analytics.totalStudents : `#${analytics.globalRank}`) : 
                                                 (analytics.points || 0).toLocaleString()}
                                            </span>
                                            {i === 1 && <span className="trend positive">{isTeacher ? "Across all students" : "Keep going!"}</span>}
                                            {i === 3 && !isTeacher && <span className="trend">Top performer</span>}
                                            {i === 3 && isTeacher && <span className="trend">Active learners</span>}
                                            {i === 4 && !isTeacher && <span className="trend positive">Level {Math.floor((analytics.points || 0) / 1000)}</span>}
                                            {i === 4 && isTeacher && <span className="trend positive">Combined score</span>}
                                            {i === 2 && (
                                                <div className="mini-chart">
                                                    <div className="bar" style={{ height: '70%', transitionDelay: '0.1s' }}></div>
                                                    <div className="bar" style={{ height: '85%', transitionDelay: '0.2s' }}></div>
                                                    <div className="bar" style={{ height: '60%', transitionDelay: '0.3s' }}></div>
                                                    <div className="bar" style={{ height: '75%', transitionDelay: '0.4s' }}></div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </section>
                        {/* Topic Breakdown & Submission Activity */}
                        <div className="analytics-row">
                            <section className="topic-breakdown glass-effect scroll-reveal">
                                <h3>{isTeacher ? "Class Topic Progress (Avg per Student)" : "Topic Breakdown"}</h3>
                                {isLoading ? (
                                    <div className="skeleton" style={{ height: '300px', marginTop: '1.5rem' }}></div>
                                ) : analytics && analytics.topicData && analytics.topicData.length > 0 ? (
                                    <div className="chart-container" style={{ height: '300px', marginTop: '1.5rem' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.topicData} layout="vertical">
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={12} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                                />
                                                <Bar dataKey="solved" fill="var(--primary-color)" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {isTeacher ? "No student activity yet." : "No topic data available yet. Start solving problems!"}
                                    </div>
                                )}
                            </section>

                            <section className="submission-activity glass-effect scroll-reveal">
                                <h3>{isTeacher ? "Class Submission Activity" : "Submission Activity"}</h3>
                                {isLoading ? (
                                    <div className="skeleton" style={{ height: '300px', marginTop: '1.5rem' }}></div>
                                ) : analytics && analytics.submissionData ? (
                                    <div className="chart-container" style={{ height: '300px', marginTop: '1.5rem' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analytics.submissionData}>
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
                                ) : (
                                    <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No submission data available
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Topic Mastery Radar Chart */}
                        {analytics && analytics.topicMastery && analytics.topicMastery.length > 0 && (
                            <section className="topic-mastery-radar glass-effect scroll-reveal" style={{ marginTop: '2rem' }}>
                                <h3>{isTeacher ? "Topic-wise Class Mastery" : "Your Topic Mastery"}</h3>
                                <div className="chart-container" style={{ height: '400px', marginTop: '1.5rem' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.topicMastery}>
                                            <PolarGrid stroke="var(--glass-border)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <PolarRadiusAxis 
                                                angle={30} 
                                                domain={[0, Math.max(...analytics.topicMastery.map(t => t.fullMark || 5), 5)]} 
                                                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                                                axisLine={false} 
                                            />
                                            <Radar
                                                name={isTeacher ? "Class Avg" : "Your Progress"}
                                                dataKey="A"
                                                stroke="var(--primary-color)"
                                                fill="var(--primary-color)"
                                                fillOpacity={0.6}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                                formatter={(value, name, props) => {
                                                    const fullMark = props.payload.fullMark;
                                                    if (isTeacher) {
                                                        return [`${value} problems (avg per student) out of ${fullMark}`, name];
                                                    } else {
                                                        return [`${value} / ${fullMark} problems solved`, name];
                                                    }
                                                }}
                                            />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AnalyticsPage;
