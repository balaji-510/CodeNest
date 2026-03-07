import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';
import '../styles1/Roadmap.css';

import { getRoadmap } from '../services/api';

const RoadmapPage = () => {
    const [roadmaps, setRoadmaps] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedIn) {
                    // Optional: Redirect to login or show message
                    // setError("Please login to view your roadmap");
                    // setLoading(false);
                    // return;
                }

                const data = await getRoadmap();
                setRoadmaps(data);
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    setError("Please login to view your roadmap");
                } else {
                    setError("Failed to load roadmap");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, []);

    if (loading) {
        return (
            <div className="roadmap-page">
                <Navbar />
                <main className="roadmap-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="loading-spinner"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="roadmap-page">
                <Navbar />
                <main className="roadmap-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <h2 style={{ color: '#ff4444' }}>{error}</h2>
                    <br />
                    <button className="continue-btn" onClick={() => window.location.href = '/login'}>Go to Login</button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="roadmap-page">
            <Navbar />
            <main className="roadmap-container">
                <header className="roadmap-header scroll-reveal">
                    <h1>Learning <span>Roadmaps</span></h1>
                    <p>Follow expert-curated paths to master Data Structures and Algorithms.</p>
                </header>

                <div className="roadmap-grid">
                    {roadmaps.map(roadmap => (
                        <section key={roadmap.id} className="roadmap-track glass-effect scroll-reveal">
                            <div className="track-header">
                                <h2>{roadmap.title}</h2>
                                <span className="level-badge">{roadmap.level}</span>
                            </div>

                            <div className="progress-bar-container">
                                <div className="progress-info">
                                    <span>Overall Progress</span>
                                    <span>{roadmap.progress}%</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: `${roadmap.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="nodes-container">
                                {roadmap.nodes.map((node, index) => (
                                    <div key={node.id} className={`node-item ${node.status}`}>
                                        <div className="node-icon">
                                            {node.status === 'completed' ? <CheckCircle2 size={24} /> :
                                                node.status === 'current' ? <Circle size={24} className="animate-pulse" /> :
                                                    <Lock size={20} />}
                                        </div>
                                        <div className="node-content">
                                            <h4>{node.label}</h4>
                                            <p>{node.status === 'completed' ? 'Mastered' :
                                                node.status === 'current' ? 'In Progress' : 'Locked'}</p>
                                        </div>
                                        {index < roadmap.nodes.length - 1 && <div className="connector"></div>}
                                    </div>
                                ))}
                            </div>

                            <button className="continue-btn magnetic-hover" onClick={() => window.location.href = '/problems'}>
                                {roadmap.progress > 0 ? "Continue Journey" : "Start Track"} <ArrowRight size={18} />
                            </button>
                        </section>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RoadmapPage;
