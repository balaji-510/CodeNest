import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles1/MentorDashboard.css';

const EditContext = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        difficulty: 'Medium',
        target_branch: 'All',
        target_batch: 'All'
    });

    const [availableProblems, setAvailableProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [loading, setLoading] = useState(true); // Loading context data

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Context
                const contextRes = await api.get(`/contexts/${id}/`);
                const c = contextRes.data;

                // Format dates for input type="datetime-local" (YYYY-MM-DDTHH:mm)
                const formatDateTime = (dateStr) => {
                    const date = new Date(dateStr);
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                    return date.toISOString().slice(0, 16);
                };

                setFormData({
                    title: c.title,
                    description: c.description,
                    start_time: formatDateTime(c.start_time),
                    end_time: formatDateTime(c.end_time),
                    difficulty: c.difficulty,
                    target_branch: c.target_branch || 'All',
                    target_batch: c.target_batch || 'All'
                });

                // Pre-select problems
                if (c.problems) {
                    setSelectedProblems(c.problems.map(cp => cp.problem.id));
                }

                // Fetch Available Problems
                setLoadingProblems(true);
                const probRes = await api.get('/problems/');
                let probs = probRes.data;
                if (probRes.data && probRes.data.results) probs = probRes.data.results;
                setAvailableProblems(probs);
                setLoadingProblems(false);

            } catch (error) {
                console.error("Failed to load data", error);
                alert("Failed to load context data.");
                navigate('/mentor-dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProblemSelect = (problemId) => {
        if (selectedProblems.includes(problemId)) {
            setSelectedProblems(selectedProblems.filter(id => id !== problemId));
        } else {
            setSelectedProblems([...selectedProblems, problemId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (new Date(formData.start_time) >= new Date(formData.end_time)) {
            alert("End time must be after start time.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                problems: selectedProblems
            };
            await api.put(`/contexts/${id}/`, payload);
            alert("Context Updated Successfully!");
            navigate('/mentor-dashboard');
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update context.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProblems = availableProblems.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading Context Data...</div>;

    return (
        <div className="mentor-dashboard-container page animate-fade-in">
            <Navbar />
            <main className="mentor-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '8rem' }}>
                <header className="mentor-header">
                    <h1>Edit <span>Context</span></h1>
                </header>

                <form onSubmit={handleSubmit} className="glass-effect" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Context Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                        />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Start Time</label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>End Time</label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Difficulty</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Target Branch</label>
                            <select
                                name="target_branch"
                                value={formData.target_branch}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            >
                                <option value="All">All Branches</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="MECH">MECH</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Target Batch</label>
                            <select
                                name="target_batch"
                                value={formData.target_batch}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            >
                                <option value="All">All Batches</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Select Problems ({selectedProblems.length} selected)</label>
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                        />
                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' }}>
                            {loadingProblems ? (
                                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '10px' }}>Loading problems...</div>
                            ) : filteredProblems.length > 0 ? (
                                filteredProblems.map(problem => (
                                    <div
                                        key={problem.id}
                                        onClick={() => handleProblemSelect(problem.id)}
                                        style={{
                                            padding: '10px',
                                            margin: '5px 0',
                                            background: selectedProblems.includes(problem.id) ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>{problem.title} <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '10px' }}>{problem.difficulty}</span></span>
                                        {selectedProblems.includes(problem.id) && <span style={{ color: '#38bdf8' }}>✓</span>}
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No problems found</div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            className="button secondary"
                            onClick={() => navigate('/mentor-dashboard')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button primary"
                            disabled={loading}
                        >
                            Update Context
                        </button>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export default EditContext;
