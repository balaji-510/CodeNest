import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Trophy, Clock, Users, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles1/Contests.css';

const ContestsHub = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const response = await api.get('/contexts/');
            setContests(response.data);
        } catch (error) {
            console.error("Failed to fetch contests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnterContext = (id) => {
        navigate(`/context/${id}`);
    };

    const now = new Date();

    // Process contests
    const upcoming = contests.filter(c => new Date(c.start_time) > now);
    const active = contests.filter(c => new Date(c.start_time) <= now && new Date(c.end_time) > now);
    const past = contests.filter(c => new Date(c.end_time) <= now);

    // Featured: The nearest upcoming or active one
    const featured = active.length > 0 ? active[0] : (upcoming.length > 0 ? upcoming[0] : null);

    if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading Contests...</div>;

    return (
        <div className="contests-page">
            <Navbar />
            <main className="contests-container">
                <header className="contests-header scroll-reveal">
                    <h1>CodeNest <span>Contests</span></h1>
                    <p>Put your skills to the test with live global coding challenges.</p>
                </header>

                {featured && (
                    <section className="featured-contest glass-effect scroll-reveal">
                        <div className="contest-badge">{active.includes(featured) ? 'Live Now' : 'Up Next'}</div>
                        <div className="contest-main-info">
                            <h2>{featured.title}</h2>
                            <p className="start-at" style={{ color: '#94a3b8', margin: '0.5rem 0' }}>
                                {active.includes(featured) ? `Ends at: ${new Date(featured.end_time).toLocaleString()}` : `Starts at: ${new Date(featured.start_time).toLocaleString()}`}
                            </p>
                        </div>
                        <div className="contest-footer">
                            <div className="meta">
                                <span><Users size={18} /> {featured.difficulty}</span>
                                <span><Clock size={18} /> {featured.duration_minutes} mins</span>
                            </div>
                            <button className="register-btn magnetic-hover" onClick={() => handleEnterContext(featured.id)}>
                                {active.includes(featured) ? 'Enter Now' : 'View Details'}
                            </button>
                        </div>
                    </section>
                )}

                <div className="contests-grid">
                    <section className="upcoming-section">
                        <h3>Active & Upcoming</h3>
                        {active.length === 0 && upcoming.length === 0 && <p style={{ color: '#94a3b8' }}>No active or upcoming contests.</p>}
                        <div className="contests-list">
                            {[...active, ...upcoming].map(c => (
                                <div key={c.id} className="contest-card glass-effect scroll-reveal">
                                    <div className="card-header">
                                        <h4>{c.title}</h4>
                                        <span className={`status-badge ${active.includes(c) ? 'live' : 'upcoming'}`}>
                                            {active.includes(c) ? 'Live' : 'Upcoming'}
                                        </span>
                                    </div>
                                    <p className="start-at">
                                        <Clock size={14} style={{ marginRight: '5px' }} />
                                        {active.includes(c) ? `Ends: ${new Date(c.end_time).toLocaleString()}` : `Starts: ${new Date(c.start_time).toLocaleString()}`}
                                    </p>
                                    <button className="secondary-btn" onClick={() => handleEnterContext(c.id)}>
                                        {active.includes(c) ? 'Enter' : 'Details'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="past-section">
                        <h3>Past Contests</h3>
                        {past.length === 0 && <p style={{ color: '#94a3b8' }}>No past contests.</p>}
                        <div className="contests-list">
                            {past.map(c => (
                                <div key={c.id} className="contest-card glass-effect scroll-reveal">
                                    <div className="card-header">
                                        <h4>{c.title}</h4>
                                        <span className="status-badge ended">Ended</span>
                                    </div>
                                    <p className="start-at">Ended on: {new Date(c.end_time).toLocaleDateString()}</p>
                                    <button className="text-link" onClick={() => handleEnterContext(c.id)}>View Problems <ArrowRight size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContestsHub;
