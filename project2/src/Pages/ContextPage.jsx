import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import '../styles1/Contests.css'; // Reuse contest styles

const ContextPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [context, setContext] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        fetchContextDetails();
    }, [id]);

    useEffect(() => {
        if (!context) return;

        const timer = setInterval(() => {
            const now = new Date();
            const end = new Date(context.end_time);
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(timer);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [context]);

    const fetchContextDetails = async () => {
        try {
            const response = await api.get(`/contexts/${id}/`);
            setContext(response.data);
        } catch (error) {
            console.error("Failed to fetch context", error);
            // alert("Failed to load context");
        } finally {
            setLoading(false);
        }
    };

    const handleSolveProblem = (problemId) => {
        navigate(`/solve/${problemId}?context=${id}`);
    };

    if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading Context...</div>;
    if (!context) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Context Not Found</div>;

    return (
        <div className="page animate-fade-in">
            <Navbar />
            <main className="contests-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '8rem' }}>
                <header className="context-header" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{context.title}</h1>
                            <p style={{ color: '#94a3b8' }}>By {context.mentor_name} • {context.difficulty}</p>
                        </div>
                        <div className="glass-effect" style={{ padding: '1rem 2rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <Clock size={16} /> Time Remaining
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft === 'Expired' ? '#f43f5e' : '#38bdf8' }}>
                                {timeLeft}
                            </div>
                            {/* Edit Button for Mentor */}
                            {localStorage.getItem('userRole') === 'teacher' && (
                                <button
                                    className="button secondary"
                                    style={{ marginTop: '10px', fontSize: '0.8rem', padding: '5px 10px' }}
                                    onClick={() => navigate(`/edit-context/${id}`)}
                                >
                                    Edit Context
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="glass-effect" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px' }}>
                        <h3>Instructions</h3>
                        <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>{context.description || "No specific instructions."}</p>
                    </div>
                </header>

                <section className="problem-list">
                    <h3 style={{ marginBottom: '1rem' }}>Problems ({context.problems.length})</h3>
                    <div className="problems-grid" style={{ display: 'grid', gap: '1rem' }}>
                        {context.problems.map((cp, index) => (
                            <div key={cp.id} className="glass-effect problem-card" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.1)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{cp.problem.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: cp.problem.difficulty === 'Easy' ? '#4ade80' : cp.problem.difficulty === 'Medium' ? '#facc15' : '#f43f5e' }}>
                                            {cp.problem.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="button primary"
                                    onClick={() => handleSolveProblem(cp.problem.id)}
                                    disabled={timeLeft === 'Expired'}
                                    style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                                >
                                    Solve <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ContextPage;
