import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import '../styles1/Analytics.css';

const AnalyticsPage = () => {
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const submissionData = [
        { day: 'Mon', count: 12 },
        { day: 'Tue', count: 18 },
        { day: 'Wed', count: 15 },
        { day: 'Thu', count: 25 },
        { day: 'Fri', count: 22 },
        { day: 'Sat', count: 30 },
        { day: 'Sun', count: 28 },
    ];

    const topicData = [
        { name: 'Arrays', solved: 45, total: 50 },
        { name: 'Strings', solved: 38, total: 45 },
        { name: 'DP', solved: 15, total: 30 },
        { name: 'Graphs', solved: 12, total: 25 },
        { name: 'Trees', solved: 28, total: 40 },
    ];

    const stats = {
        totalSolved: 452,
        acceptanceRate: "72%",
        globalRank: 1240,
        points: 15420,
        topicBreakdown: [
            { topic: "Arrays", solved: 120, total: 150, color: "#38bdf8" },
            { topic: "Strings", solved: 85, total: 120, color: "#818cf8" },
            { topic: "Dynamic Programming", solved: 45, total: 100, color: "#c084fc" },
            { topic: "Trees", solved: 60, total: 80, color: "#f472b6" },
            { topic: "Graphs", solved: 30, total: 70, color: "#fb7185" },
        ],
        submissionStats: [
            { month: "Jan", count: 45 },
            { month: "Feb", count: 52 },
            { month: "Mar", count: 38 },
            { month: "Apr", count: 65 },
            { month: "May", count: 48 },
            { month: "Jun", count: 70 },
        ]
    };

    return (
        <div className="analytics-container page animate-fade-in">
            <Navbar />
            <main className="analytics-content">
                <header className="analytics-header">
                    <h1>Performance <span>Analytics</span></h1>
                    <p>Detailed insights into your coding journey and skill progression.</p>
                </header>

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
                                            {i === 1 ? "Total Solved" : i === 2 ? "Acceptance Rate" : i === 3 ? "Global Rank" : "Points"}
                                        </span>
                                        <span className="value">
                                            {i === 1 ? stats.totalSolved : i === 2 ? stats.acceptanceRate : i === 3 ? `#${stats.globalRank}` : stats.points.toLocaleString()}
                                        </span>
                                        {i === 1 && <span className="trend positive">+12 this week</span>}
                                        {i === 3 && <span className="trend">Top 5%</span>}
                                        {i === 4 && <span className="trend positive">Level 24</span>}
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
                            <h3>Topic Breakdown</h3>
                            <div className="chart-container" style={{ height: '300px', marginTop: '1.5rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topicData} layout="vertical">
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
                        </section>

                        <section className="submission-activity glass-effect scroll-reveal">
                            <h3>Submission Activity</h3>
                            <div className="chart-container" style={{ height: '300px', marginTop: '1.5rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={submissionData}>
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
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AnalyticsPage;
