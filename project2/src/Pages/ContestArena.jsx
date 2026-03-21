import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { Clock, CheckCircle, XCircle, Code, Play, Send, List, Trophy } from 'lucide-react';
import '../styles1/ContestArena.css';

function ContestArena() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [problemStatus, setProblemStatus] = useState({});
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        fetchContestData();
        const interval = setInterval(fetchContestData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        // Check if a specific problem is requested via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const problemId = urlParams.get('problem');
        
        if (problemId && problems.length > 0) {
            const problem = problems.find(p => p.id === parseInt(problemId));
            if (problem) {
                setSelectedProblem(problem);
            }
        }
    }, [problems]);

    useEffect(() => {
        if (contest && contest.status === 'ongoing') {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 0) {
                        navigate(`/contest/${id}`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [contest, id, navigate]);

    useEffect(() => {
        if (selectedProblem && selectedProblem.starter_code) {
            let starterCode;
            try {
                starterCode = typeof selectedProblem.starter_code === 'string' 
                    ? JSON.parse(selectedProblem.starter_code) 
                    : selectedProblem.starter_code;
            } catch (e) {
                starterCode = {};
            }
            setCode(starterCode[language] || '');
        }
    }, [selectedProblem, language]);

    const fetchContestData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            // Fetch contest details
            const contestResponse = await fetch(`http://localhost:8000/api/contests/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (contestResponse.ok) {
                const contestData = await contestResponse.json();
                setContest(contestData);
                setProblems(contestData.problems || []);
                setTimeRemaining(contestData.time_remaining || 0);
                
                if (!selectedProblem && contestData.problems?.length > 0) {
                    setSelectedProblem(contestData.problems[0]);
                }
            }

            // Fetch leaderboard
            const leaderboardResponse = await fetch(`http://localhost:8000/api/contests/${id}/leaderboard/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (leaderboardResponse.ok) {
                const leaderboardData = await leaderboardResponse.json();
                setLeaderboard(leaderboardData);
            }
        } catch (error) {
            console.error('Failed to fetch contest data:', error);
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(null);
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/execute-code/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    language,
                    code,
                    stdin: ''
                })
            });

            if (response.ok) {
                const result = await response.json();
                setOutput(result);
            }
        } catch (error) {
            console.error('Execution error:', error);
            setOutput({ error: 'Execution failed' });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedProblem) return;
        
        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/contests/${id}/submit/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    problem_id: selectedProblem.id,
                    language,
                    code
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Update problem status
                setProblemStatus(prev => ({
                    ...prev,
                    [selectedProblem.id]: result.status === 'ACCEPTED' ? 'accepted' : 'failed'
                }));
                
                // Show result
                setOutput({
                    ...result,
                    isSubmission: true
                });
                
                // Refresh leaderboard
                fetchContestData();
            }
        } catch (error) {
            console.error('Submission error:', error);
            setOutput({ error: 'Submission failed', isSubmission: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProblemStatusIcon = (problemId) => {
        const status = problemStatus[problemId];
        if (status === 'accepted') return <CheckCircle size={16} className="status-accepted" />;
        if (status === 'failed') return <XCircle size={16} className="status-failed" />;
        return null;
    };

    if (!contest) {
        return (
            <div className="contest-arena">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading contest...</p>
                </div>
            </div>
        );
    }

    if (contest.status !== 'ongoing') {
        return (
            <div className="contest-arena">
                <div className="error-container">
                    <h2>Contest is not ongoing</h2>
                    <button className="btn-primary" onClick={() => navigate(`/contest/${id}`)}>
                        Back to Contest
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-arena">
            {/* Top Bar */}
            <div className="arena-header">
                <div className="header-left">
                    <h2>{contest.title}</h2>
                    <div className="timer-display">
                        <Clock size={20} />
                        <span className="timer-text">{formatTime(timeRemaining)}</span>
                    </div>
                </div>
                <div className="header-right">
                    <button 
                        className="btn-secondary"
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                    >
                        <Trophy size={18} />
                        Leaderboard
                    </button>
                    <button 
                        className="btn-secondary"
                        onClick={() => navigate(`/contest/${id}`)}
                    >
                        Exit Arena
                    </button>
                </div>
            </div>

            <div className="arena-content">
                {/* Problems Sidebar */}
                <div className="problems-sidebar">
                    <div className="sidebar-header">
                        <List size={20} />
                        <span>Problems</span>
                    </div>
                    <div className="problems-list">
                        {problems.map((problem, index) => (
                            <div
                                key={problem.id}
                                className={`problem-item ${selectedProblem?.id === problem.id ? 'active' : ''}`}
                                onClick={() => setSelectedProblem(problem)}
                            >
                                <div className="problem-label">
                                    <span className="problem-letter">{String.fromCharCode(65 + index)}</span>
                                    {getProblemStatusIcon(problem.id)}
                                </div>
                                <div className="problem-info">
                                    <span className="problem-title">{problem.title}</span>
                                    <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="arena-main">
                    {selectedProblem ? (
                        <>
                            {/* Problem Description */}
                            <div className="problem-section">
                                <div className="problem-header">
                                    <h3>{selectedProblem.title}</h3>
                                    <span className={`difficulty ${selectedProblem.difficulty.toLowerCase()}`}>
                                        {selectedProblem.difficulty}
                                    </span>
                                </div>
                                <div className="problem-description">
                                    <p>{selectedProblem.description}</p>
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className="editor-section">
                                <div className="editor-controls">
                                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                        <option value="python">Python</option>
                                        <option value="javascript">JavaScript</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                    </select>
                                    <div className="control-buttons">
                                        <button
                                            className="btn-run"
                                            onClick={handleRunCode}
                                            disabled={isRunning || isSubmitting}
                                        >
                                            <Play size={16} />
                                            {isRunning ? 'Running...' : 'Run'}
                                        </button>
                                        <button
                                            className="btn-submit"
                                            onClick={handleSubmit}
                                            disabled={isRunning || isSubmitting}
                                        >
                                            <Send size={16} />
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                                <div className="monaco-wrapper">
                                    <Editor
                                        height="400px"
                                        language={language}
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        options={{
                                            fontSize: 14,
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            // DISABLE AUTOCOMPLETE
                                            quickSuggestions: false,
                                            suggestOnTriggerCharacters: false,
                                            acceptSuggestionOnCommitCharacter: false,
                                            acceptSuggestionOnEnter: "off",
                                            wordBasedSuggestions: false,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Output */}
                            {output && (
                                <div className="output-section">
                                    <div className="output-header">
                                        {output.isSubmission ? 'Submission Result' : 'Output'}
                                    </div>
                                    <div className="output-content">
                                        {output.isSubmission ? (
                                            <div className={`submission-result ${output.status === 'ACCEPTED' ? 'accepted' : 'failed'}`}>
                                                <div className="result-header">
                                                    {output.status === 'ACCEPTED' ? (
                                                        <>
                                                            <CheckCircle size={24} />
                                                            <span>Accepted!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={24} />
                                                            <span>Wrong Answer</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="result-stats">
                                                    <span>Test Cases: {output.passed}/{output.total}</span>
                                                    <span>Points: {output.points}</span>
                                                    <span>Time: {output.time_taken}m</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {output.stdout && <pre>{output.stdout}</pre>}
                                                {output.stderr && <pre className="error">{output.stderr}</pre>}
                                                {output.error && <pre className="error">{output.error}</pre>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-problem">
                            <Code size={64} />
                            <p>Select a problem to start</p>
                        </div>
                    )}
                </div>

                {/* Leaderboard Sidebar */}
                {showLeaderboard && (
                    <div className="leaderboard-sidebar">
                        <div className="sidebar-header">
                            <Trophy size={20} />
                            <span>Leaderboard</span>
                            <button 
                                className="close-btn"
                                onClick={() => setShowLeaderboard(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="leaderboard-list">
                            {leaderboard.map((participant) => (
                                <div 
                                    key={participant.user_id}
                                    className={`leaderboard-item ${participant.user_id === parseInt(userId) ? 'current-user' : ''}`}
                                >
                                    <span className="rank">#{participant.rank}</span>
                                    <span className="username">{participant.username}</span>
                                    <span className="score">{participant.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ContestArena;
