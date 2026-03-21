import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { ToastContainer } from '../Components/Toast';
import { Calendar, Clock, FileText, Users, Plus, X, Search } from 'lucide-react';
import '../styles1/CreateContest.css';
import { useToast } from '../hooks/useToast';

function CreateContest() {
    const navigate = useNavigate();
    const { toasts, removeToast, showToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        duration_minutes: 120,
        is_public: true,
        rules: 'Standard contest rules apply:\n1. No plagiarism\n2. No collaboration\n3. Fair play expected'
    });
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [availableProblems, setAvailableProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showProblemSelector, setShowProblemSelector] = useState(false);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/problems/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableProblems(data);
            }
        } catch (error) {
            console.error('Failed to fetch problems:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddProblem = (problem) => {
        if (!selectedProblems.find(p => p.id === problem.id)) {
            setSelectedProblems(prev => [...prev, problem]);
        }
    };

    const handleRemoveProblem = (problemId) => {
        setSelectedProblems(prev => prev.filter(p => p.id !== problemId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedProblems.length === 0) {
            showToast('Please select at least one problem', 'error');
            return;
        }

        // Validate dates
        if (new Date(formData.start_time) >= new Date(formData.end_time)) {
            showToast('End time must be after start time', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            
            // Create contest
            const contestResponse = await fetch('http://localhost:8000/api/contests/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    problem_ids: selectedProblems.map(p => p.id)
                })
            });

            if (contestResponse.ok) {
                const contest = await contestResponse.json();
                showToast('Contest created successfully!', 'success');
                setTimeout(() => {
                    navigate('/contests-management');
                }, 1500);
            } else {
                const error = await contestResponse.json();
                console.error('Contest creation error:', error);
                const errorMsg = error.detail || error.message || Object.values(error).flat().join(', ') || 'Failed to create contest';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error creating contest:', error);
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProblems = availableProblems.filter(problem =>
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="create-contest-page">
            <Navbar />
            <div className="create-contest-container">
                <div className="page-header">
                    <h1>Create Contest</h1>
                    <p>Set up a new programming contest for your students</p>
                </div>

                <form onSubmit={handleSubmit} className="contest-form">
                    {/* Basic Information */}
                    <div className="form-section">
                        <h2>
                            <FileText size={20} />
                            Basic Information
                        </h2>
                        
                        <div className="form-group">
                            <label htmlFor="title">Contest Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Weekly Contest #1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the contest objectives and what students will learn..."
                                rows="4"
                                required
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="form-section">
                        <h2>
                            <Calendar size={20} />
                            Schedule
                        </h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="start_time">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    id="start_time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="end_time">End Time *</label>
                                <input
                                    type="datetime-local"
                                    id="end_time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration_minutes">
                                <Clock size={16} />
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                id="duration_minutes"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleInputChange}
                                min="30"
                                max="480"
                                required
                            />
                            <small>Recommended: 120 minutes (2 hours)</small>
                        </div>
                    </div>

                    {/* Problems */}
                    <div className="form-section">
                        <h2>
                            <FileText size={20} />
                            Problems ({selectedProblems.length})
                        </h2>
                        
                        <button
                            type="button"
                            className="btn-add-problem"
                            onClick={() => setShowProblemSelector(!showProblemSelector)}
                        >
                            <Plus size={18} />
                            Add Problems
                        </button>

                        {showProblemSelector && (
                            <div className="problem-selector">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search problems..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="problems-grid">
                                    {filteredProblems.map(problem => (
                                        <div
                                            key={problem.id}
                                            className={`problem-card ${selectedProblems.find(p => p.id === problem.id) ? 'selected' : ''}`}
                                            onClick={() => handleAddProblem(problem)}
                                        >
                                            <div className="problem-header">
                                                <span className="problem-title">{problem.title}</span>
                                                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            <div className="problem-topics">
                                                {problem.topics?.slice(0, 2).map(topic => (
                                                    <span key={topic} className="topic-tag">{topic}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProblems.length > 0 && (
                            <div className="selected-problems">
                                <h3>Selected Problems:</h3>
                                <div className="selected-list">
                                    {selectedProblems.map((problem, index) => (
                                        <div key={problem.id} className="selected-problem-item">
                                            <span className="problem-number">{String.fromCharCode(65 + index)}</span>
                                            <div className="problem-info">
                                                <span className="problem-title">{problem.title}</span>
                                                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-remove"
                                                onClick={() => handleRemoveProblem(problem.id)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="form-section">
                        <h2>
                            <Users size={20} />
                            Settings
                        </h2>
                        
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleInputChange}
                                />
                                <span>Public Contest (visible to all students)</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label htmlFor="rules">Contest Rules</label>
                            <textarea
                                id="rules"
                                name="rules"
                                value={formData.rules}
                                onChange={handleInputChange}
                                rows="6"
                                placeholder="Enter contest rules..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/contests')}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-create"
                            disabled={isLoading || selectedProblems.length === 0}
                        >
                            {isLoading ? 'Creating...' : 'Create Contest'}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}

export default CreateContest;
