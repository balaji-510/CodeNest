import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Code, Calendar, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import API_BASE from '../config';
import '../styles1/Submissions.css';

function Submissions() {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [languageFilter, setLanguageFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [submissions, statusFilter, languageFilter, searchQuery]);

    const fetchSubmissions = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            const response = await fetch(`${API_BASE}/api/submissions/?user=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...submissions];

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(sub => sub.status === statusFilter);
        }

        // Language filter
        if (languageFilter !== 'All') {
            filtered = filtered.filter(sub => sub.language === languageFilter);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(sub => 
                sub.problem_title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredSubmissions(filtered);
    };

    const getStatusIcon = (status) => {
        if (status === 'ACCEPTED') {
            return <CheckCircle className="status-icon success" size={20} />;
        }
        return <XCircle className="status-icon error" size={20} />;
    };

    const getStatusClass = (status) => {
        return status === 'ACCEPTED' ? 'success' : 'error';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
    };

    const handleGoToProblem = (problemId) => {
        navigate(`/solve/${problemId}`);
    };

    if (loading) {
        return (
            <div className="submissions-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="submissions-page">
            <Navbar />
            
            <main className="page-section">
                <header className="section-title">
                    <h1>My <span>Submissions</span></h1>
                    <p>View and track all your code submissions</p>
                </header>

                {/* Summary Stats */}
                {!loading && submissions.length > 0 && (
                    <div className="submissions-summary">
                        <div className="summary-stat">
                            <span className="s-label">Total</span>
                            <span className="s-value">{submissions.length}</span>
                        </div>
                        <div className="summary-stat accepted">
                            <span className="s-label">Accepted</span>
                            <span className="s-value">{submissions.filter(s => s.status === 'ACCEPTED').length}</span>
                        </div>
                        <div className="summary-stat failed">
                            <span className="s-label">Failed</span>
                            <span className="s-value">{submissions.filter(s => s.status !== 'ACCEPTED').length}</span>
                        </div>
                        <div className="summary-stat rate">
                            <span className="s-label">Accept Rate</span>
                            <span className="s-value">
                                {submissions.length > 0
                                    ? Math.round((submissions.filter(s => s.status === 'ACCEPTED').length / submissions.length) * 100)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="filters-container glass-effect">
                    <div className="filter-group">
                        <Filter size={18} />
                        <input
                            type="text"
                            placeholder="Search by problem name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="All">All Status</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="FAILED">Failed</option>
                            <option value="RUNTIME_ERROR">Runtime Error</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select 
                            value={languageFilter} 
                            onChange={(e) => setLanguageFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="All">All Languages</option>
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </select>
                    </div>

                    <div className="results-count">
                        {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Submissions List */}
                {filteredSubmissions.length === 0 ? (
                    <div className="empty-state glass-effect">
                        <Code size={64} />
                        <h2>No submissions found</h2>
                        <p>Start solving problems to see your submissions here!</p>
                        <button className="btn-primary" onClick={() => navigate('/problems')}>
                            Browse Problems
                        </button>
                    </div>
                ) : (
                    <div className="submissions-list">
                        {filteredSubmissions.map((submission) => (
                            <div key={submission.id} className={`submission-card glass-effect ${submission.status === 'ACCEPTED' ? 'accepted-card' : 'failed-card'}`}>
                                <div className="submission-info">
                                    <h3
                                        className="problem-title"
                                        onClick={() => handleGoToProblem(submission.problem)}
                                    >
                                        {submission.problem_title || `Problem #${submission.problem}`}
                                    </h3>
                                    <div className="submission-meta">
                                        <span className="language-badge">{submission.language}</span>
                                        <span className="meta-item">
                                            <Calendar size={13} />
                                            {formatDate(submission.created_at)}
                                        </span>
                                        {submission.execution_time_ms > 0 && (
                                            <span className="meta-item">
                                                <Clock size={13} />
                                                {submission.execution_time_ms}ms
                                            </span>
                                        )}
                                        {submission.memory_used_kb > 0 && (
                                            <span className="meta-item">
                                                {submission.memory_used_kb}KB
                                            </span>
                                        )}
                                        <span className="meta-item">
                                            {submission.passed_testcases}/{submission.total_testcases} tests
                                        </span>
                                    </div>
                                </div>

                                <div className={`status-badge ${getStatusClass(submission.status)}`}>
                                    {getStatusIcon(submission.status)}
                                    {submission.status === 'ACCEPTED' ? 'Accepted' : submission.status === 'FAILED' ? 'Failed' : submission.status}
                                </div>

                                <button
                                    className="btn-secondary"
                                    onClick={() => handleViewDetails(submission)}
                                >
                                    View Code
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Details Modal */}
            {selectedSubmission && (
                <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
                    <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedSubmission.problem_title || `Problem #${selectedSubmission.problem}`}</h2>
                            <button className="close-btn" onClick={() => setSelectedSubmission(null)}>×</button>
                        </div>

                        <div className="modal-content">
                            <div className="submission-details">
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`status-badge ${getStatusClass(selectedSubmission.status)}`}>
                                        {selectedSubmission.status}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Language:</span>
                                    <span className="language-badge">{selectedSubmission.language}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Test Cases:</span>
                                    <span>{selectedSubmission.passed_testcases}/{selectedSubmission.total_testcases} passed</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Submitted:</span>
                                    <span>{formatDate(selectedSubmission.created_at)}</span>
                                </div>
                            </div>

                            <div className="code-section">
                                <h3>Code</h3>
                                <pre className="code-block">
                                    <code>{selectedSubmission.code || 'No code available'}</code>
                                </pre>
                            </div>

                            {selectedSubmission.test_results && selectedSubmission.test_results.length > 0 && (
                                <div className="test-results-section">
                                    <h3>Test Results</h3>
                                    {selectedSubmission.test_results.map((result, index) => (
                                        <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                                            <div className="test-result-header">
                                                <span>Test Case {result.testcase}</span>
                                                <span className={result.passed ? 'pass' : 'fail'}>
                                                    {result.passed ? '✓ Passed' : '✗ Failed'}
                                                </span>
                                            </div>
                                            {result.input && (
                                                <div className="test-detail">
                                                    <strong>Input:</strong>
                                                    <pre>{result.input}</pre>
                                                </div>
                                            )}
                                            {result.expected && (
                                                <div className="test-detail">
                                                    <strong>Expected:</strong>
                                                    <pre>{result.expected}</pre>
                                                </div>
                                            )}
                                            {result.actual && (
                                                <div className="test-detail">
                                                    <strong>Your Output:</strong>
                                                    <pre>{result.actual}</pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-primary"
                                onClick={() => handleGoToProblem(selectedSubmission.problem)}
                            >
                                Go to Problem
                            </button>
                            <button 
                                className="btn-secondary"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Submissions;
