import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Navbar from "../Components/Navbar";
import AIAssistant from "../Components/AIAssistant";
import AchievementToast from "../Components/AchievementToast";
import { getProblemById, executeCode, submitCode } from "../services/api";
import API_BASE from "../config";
import "../styles1/Editor.css";

function ProblemSubmissionRow({ sub, onLoadCode }) {
    const [expanded, setExpanded] = useState(false);
    const statusColor = sub.status === 'ACCEPTED' ? '#22c55e' : '#ef4444';
    const date = new Date(sub.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
                <div>
                    <span style={{ color: statusColor, fontWeight: 600, fontSize: '0.9rem' }}>{sub.status}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '10px' }}>{sub.language}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '10px' }}>{sub.passed_testcases}/{sub.total_testcases} tests</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{date}</span>
            </div>
            {expanded && (
                <div style={{ marginTop: '10px' }}>
                    <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', overflowX: 'auto', maxHeight: '200px', color: '#e2e8f0' }}>
                        {sub.code || 'No code stored'}
                    </pre>
                    {sub.code && (
                        <button
                            style={{ marginTop: '6px', padding: '4px 12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            onClick={() => onLoadCode(sub.code, sub.language)}
                        >
                            Load this code
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function EditorPage() {
    const { id } = useParams();
    // const navigate = useNavigate(); // Unused
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState(null);
    const [customInput, setCustomInput] = useState("");
    const [testCases, setTestCases] = useState([]);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [inputMode, setInputMode] = useState("testcases"); // "testcases" or "custom"
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [editorHeight, setEditorHeight] = useState(50); // Percentage
    const [isResizing, setIsResizing] = useState(false);
    const [newAchievements, setNewAchievements] = useState([]);
    const [leftTab, setLeftTab] = useState('description'); // 'description' | 'submissions'
    const [problemSubmissions, setProblemSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await getProblemById(id);
                // Parse JSON strings if they are strings (from backend default serialization of TextField)
                // In a real DRF setup, we might want to use JSONField but for MySQL compatibility on some versions TextField + JSON string is safer or easier.
                // Or if serializer handled it, it's already an object. Let's handle both.

                const safeParseJSON = (data, fallback) => {
                    if (!data) return fallback;
                    if (typeof data !== 'string') return data;
                    try {
                        let parsed = JSON.parse(data);
                        // Sometimes data is double-stringified
                        if (typeof parsed === 'string') {
                            parsed = JSON.parse(parsed);
                        }
                        return parsed;
                    } catch (e) {
                        console.error("Failed to parse JSON:", data, e);
                        return fallback;
                    }
                };

                let parsedExamples = safeParseJSON(data.examples, []);
                let parsedStarterCode = safeParseJSON(data.starter_code, {});
                let parsedConstraints = safeParseJSON(data.constraints, []);

                setProblem({
                    ...data,
                    examples: parsedExamples,
                    constraints: parsedConstraints,
                    starterCode: parsedStarterCode
                });

                if (parsedStarterCode?.[language]) {
                    setCode(parsedStarterCode[language]);
                }
                
                // Fetch test cases (visible ones for testing)
                const testCasesResponse = await fetch(`${API_BASE}/api/problems/${id}/testcases/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                
                if (testCasesResponse.ok) {
                    const testCasesData = await testCasesResponse.json();
                    // Filter only visible test cases for Run button
                    const visibleTestCases = testCasesData.filter(tc => !tc.is_hidden);
                    setTestCases(visibleTestCases);
                    if (visibleTestCases.length > 0) {
                        setSelectedTestCase(0); // Select first test case by default
                    }
                }
            } catch (error) {
                console.error("Failed to load problem", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Re-fetch only if ID changes

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Enter or Cmd+Enter to run code
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!isRunning && !isSubmitting) {
                    handleRunCode();
                }
            }
            // Ctrl+Shift+Enter or Cmd+Shift+Enter to submit code
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                if (!isRunning && !isSubmitting) {
                    handleSubmitCode();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRunning, isSubmitting]);

    // Separate effect to update code when language changes, avoiding full re-fetch
    useEffect(() => {
        if (problem?.starterCode?.[language]) {
            setCode(problem.starterCode[language]);
        }
    }, [language, problem]);

    const handleRunCode = async () => {
        // Check if user is logged in
        const token = localStorage.getItem('access_token');
        if (!token) {
            setOutput({ 
                error: "Please login to run code. Redirecting to login page...",
            });
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        setIsRunning(true);
        setOutput(null);
        
        try {
            let inputToUse = "";
            let expectedOutput = null;
            
            if (inputMode === "testcases" && selectedTestCase !== null && testCases[selectedTestCase]) {
                // Use selected test case
                inputToUse = testCases[selectedTestCase].input_data;
                expectedOutput = testCases[selectedTestCase].expected_output;
            } else {
                // Use custom input
                inputToUse = customInput;
            }
            
            console.log('Executing code:', { language, inputMode, stdin: inputToUse });
            const result = await executeCode(language, code, inputToUse);
            console.log('Execution result:', result);
            
            // Add expected output if running test case
            if (expectedOutput) {
                result.expected_output = expectedOutput;
                result.test_case_mode = true;
            }
            
            setOutput(result);
        } catch (error) {
            console.error('Execution error:', error);
            
            // Check if it's an authentication error
            if (error.response?.status === 401 || error.response?.status === 403) {
                setOutput({ 
                    error: "Session expired. Please login again.",
                });
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/login';
                }, 2000);
                return;
            }
            
            const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Execution failed. Please try again.";
            setOutput({ 
                error: errorMessage,
                details: error.response?.data 
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        try {
            // Submit code with test case validation
            const result = await submitCode(id, language, code);
            console.log('Submission result:', result);

            // Store the full result for display
            setSubmissionResult({
                type: result.status === 'ACCEPTED' ? 'success' : 'error',
                status: result.status,
                passed: result.passed,
                total: result.total,
                all_passed: result.all_passed,
                execution_time_ms: result.execution_time_ms,
                memory_used_kb: result.memory_used_kb,
                test_results: result.test_results || []
            });
            
            // Refresh submissions list after submit
            fetchProblemSubmissions();
            
            // Check for newly earned achievements
            if (result.newly_earned_achievements && result.newly_earned_achievements.length > 0) {
                setNewAchievements(result.newly_earned_achievements);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            const errorMessage = error.response?.data?.error || error.message || "Submission failed. Please try again.";
            setSubmissionResult({ 
                type: 'error', 
                message: errorMessage,
                test_results: []
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchProblemSubmissions = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;
        setSubmissionsLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/submissions/?user=${userId}&problem=${id}`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setProblemSubmissions(data);
            }
        } catch (e) {
            console.error('Failed to fetch problem submissions', e);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    // Resize handler
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const codeSectionElement = document.querySelector('.code-section');
            if (!codeSectionElement) return;
            
            const rect = codeSectionElement.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const newHeight = (offsetY / rect.height) * 100;
            
            // Limit between 20% and 80%
            if (newHeight >= 20 && newHeight <= 80) {
                setEditorHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    if (loading) {
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Editor...</div>;
    }

    if (!problem) {
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Problem not found.</div>;
    }

    return (
        <div className={`editor-page ${isResizing ? 'resizing' : ''}`}>
            <Navbar />
            <div className="editor-container">
                <div className="problem-description">
                    <div className="left-panel-tabs">
                        <button
                            className={`left-tab-btn ${leftTab === 'description' ? 'active' : ''}`}
                            onClick={() => setLeftTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`left-tab-btn ${leftTab === 'submissions' ? 'active' : ''}`}
                            onClick={() => {
                                setLeftTab('submissions');
                                fetchProblemSubmissions();
                            }}
                        >
                            Submissions
                        </button>
                    </div>

                    {leftTab === 'description' && (
                        <>
                            <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                                {problem.difficulty}
                            </span>
                            <h2>{problem.title}</h2>
                            {problem.url && (
                                <a href={problem.url} target="_blank" rel="noopener noreferrer" className="external-link">
                                    View on LeetCode ↗
                                </a>
                            )}
                            <div className="description-content">
                                <p>{problem.description}</p>

                                {testCases && testCases.length > 0 && (
                                    <>
                                        <h3>Examples:</h3>
                                        {testCases.map((tc, i) => (
                                            <div key={i} className="example-box">
                                                <p><strong>Example {i + 1}:</strong></p>
                                                <p><strong>Input:</strong></p>
                                                <pre>{tc.input_data}</pre>
                                                <p><strong>Output:</strong></p>
                                                <pre>{tc.expected_output}</pre>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {problem.constraints && problem.constraints.length > 0 && (
                                    <>
                                        <h3>Constraints:</h3>
                                        <ul className="constraints-list">
                                            {problem.constraints.map((constraint, i) => (
                                                <li key={i}>{constraint}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {leftTab === 'submissions' && (
                        <div className="problem-submissions-tab">
                            {submissionsLoading ? (
                                <p style={{ color: 'var(--text-secondary)', padding: '20px' }}>Loading...</p>
                            ) : problemSubmissions.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', padding: '20px' }}>No submissions yet for this problem.</p>
                            ) : (
                                <div className="problem-submissions-list">
                                    {problemSubmissions.map((sub) => (
                                        <ProblemSubmissionRow key={sub.id} sub={sub} onLoadCode={(c, l) => { setCode(c); setLanguage(l); setLeftTab('description'); }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                    <div className="code-section">
                    <div className="editor-controls">
                        <div className="control-group">
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                            {/* Show Manage Test Cases button for teachers */}
                            {localStorage.getItem('userRole') === 'teacher' && (
                                <button
                                    className="manage-testcases-btn"
                                    onClick={() => window.location.href = `/manage-testcases/${id}`}
                                    title="Manage Test Cases"
                                >
                                    ⚙️ Test Cases
                                </button>
                            )}
                        </div>
                        <div className="control-group">
                            <button
                                className="run-btn"
                                onClick={handleRunCode}
                                disabled={isRunning}
                                title="Run Code (Ctrl+Enter)"
                            >
                                {isRunning ? "Running..." : "Run"}
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmitCode}
                                disabled={isSubmitting || isRunning}
                                title="Submit Code (Ctrl+Shift+Enter)"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                            <div className="keyboard-shortcuts-hint">
                                <span>⌨️ Ctrl+Enter: Run | Ctrl+Shift+Enter: Submit</span>
                            </div>
                        </div>
                    </div>
                    <div className="monaco-editor-wrapper" style={{ flex: `0 0 ${editorHeight}%` }}>
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                fontSize: 16,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                glyphMargin: false,
                                folding: true,
                                lineDecorationsWidth: 10,
                                lineNumbersMinChars: 3,
                                // DISABLE AUTOCOMPLETE
                                quickSuggestions: false,
                                suggestOnTriggerCharacters: false,
                                acceptSuggestionOnCommitCharacter: false,
                                acceptSuggestionOnEnter: "off",
                                wordBasedSuggestions: false,
                            }}
                            loading={<div style={{ color: 'white', padding: '20px' }}>Loading editor...</div>}
                        />
                    </div>

                    {/* Resize Handle */}
                    <div 
                        className="resize-handle"
                        onMouseDown={handleMouseDown}
                        title="Drag to resize"
                    >
                        <div className="resize-handle-line"></div>
                    </div>

                    {/* Bottom Panel: Test Cases + Output */}
                    <div className="bottom-panel" style={{ flex: `1 1 ${100 - editorHeight}%` }}>
                        {/* Test Cases / Custom Input Section */}
                        <div className="input-section">
                            <div className="input-tabs">
                                <button 
                                    className={`tab-btn ${inputMode === 'testcases' ? 'active' : ''}`}
                                    onClick={() => setInputMode('testcases')}
                                >
                                    Test Cases
                                </button>
                                <button 
                                    className={`tab-btn ${inputMode === 'custom' ? 'active' : ''}`}
                                    onClick={() => setInputMode('custom')}
                                >
                                    Custom Input
                                </button>
                            </div>
                            
                            {inputMode === 'testcases' ? (
                                <div className="testcases-tab">
                                    {testCases.length > 0 ? (
                                        <>
                                            <div className="testcase-selector">
                                                {testCases.map((tc, index) => (
                                                    <button
                                                        key={index}
                                                        className={`testcase-btn ${selectedTestCase === index ? 'active' : ''}`}
                                                        onClick={() => setSelectedTestCase(index)}
                                                    >
                                                        Case {index + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            {selectedTestCase !== null && testCases[selectedTestCase] && (
                                                <div className="testcase-display">
                                                    <div className="testcase-detail">
                                                        <strong>Input:</strong>
                                                        <pre>{testCases[selectedTestCase].input_data}</pre>
                                                    </div>
                                                    <div className="testcase-detail">
                                                        <strong>Expected Output:</strong>
                                                        <pre>{testCases[selectedTestCase].expected_output}</pre>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-testcases">
                                            <p>No test cases available. Use Custom Input to test your code.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="custom-input-tab">
                                    <textarea
                                        className="custom-input-textarea"
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Enter test input here (e.g., for Two Sum:&#10;4&#10;2 7 11 15&#10;9)"
                                        rows="6"
                                    />
                                    <small className="input-hint">
                                        💡 Tip: Enter your own test input to debug your solution
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Output Terminal */}
                        <div className="output-terminal">
                            <div className="terminal-header">Output</div>
                            <div className="terminal-content">
                                {isRunning && <span className="loading-text">Running code...</span>}
                                {!isRunning && output && (
                                <>
                                    {output.test_case_mode && output.expected_output && (
                                        <div className="test-comparison">
                                            <div className="comparison-section">
                                                <strong>Your Output:</strong>
                                                <pre className={output.stdout?.trim() === output.expected_output?.trim() ? 'match' : 'no-match'}>
                                                    {output.stdout || output.output || '(no output)'}
                                                </pre>
                                            </div>
                                            <div className="comparison-section">
                                                <strong>Expected:</strong>
                                                <pre className="expected">{output.expected_output}</pre>
                                            </div>
                                            {output.stdout?.trim() === output.expected_output?.trim() ? (
                                                <div className="result-badge success">✓ Test Passed</div>
                                            ) : (
                                                <div className="result-badge error">✗ Test Failed</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {!output.test_case_mode && (
                                        <>
                                            {output.stdout && <pre className="stdout">{output.stdout}</pre>}
                                            {output.output && !output.stdout && <pre className="stdout">{output.output}</pre>}
                                        </>
                                    )}
                                    
                                    {output.stderr && <pre className="stderr">{output.stderr}</pre>}
                                    {output.error && (
                                        <div className="error">
                                            <strong>Error:</strong>
                                            <pre>{output.error}</pre>
                                            {output.details && (
                                                <details style={{ marginTop: '10px' }}>
                                                    <summary style={{ cursor: 'pointer', color: '#fbbf24' }}>Show details</summary>
                                                    <pre style={{ marginTop: '5px', fontSize: '0.85em' }}>
                                                        {JSON.stringify(output.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    )}
                                    {output.execution_time && (
                                        <div style={{ marginTop: '10px', color: '#60a5fa', fontSize: '0.85em' }}>
                                            ⏱️ Execution time: {output.execution_time}s
                                        </div>
                                    )}
                                    {output.memory_used && output.memory_used > 0 && (
                                        <div style={{ color: '#60a5fa', fontSize: '0.85em' }}>
                                            💾 Memory used: {(output.memory_used / 1024).toFixed(2)} KB
                                        </div>
                                    )}
                                    {!output.stdout && !output.stderr && !output.error && !output.output && !output.test_case_mode && <span className="no-output">No output</span>}
                                </>
                            )}
                            {!isRunning && !output && <span className="placeholder-text">Run code to see output...</span>}
                        </div>
                    </div>
                    </div> {/* End bottom-panel */}
                </div> {/* End code-section */}

                {submissionResult && (
                    <div className="submission-modal-overlay" onClick={() => setSubmissionResult(null)}>
                        <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    {submissionResult.status === 'ACCEPTED' ? '✅ Accepted!' : '❌ Wrong Answer'}
                                </h2>
                                <button className="close-btn" onClick={() => setSubmissionResult(null)}>×</button>
                            </div>
                            
                            <div className="modal-content">
                                {submissionResult.message && (
                                    <p className="submission-message">{submissionResult.message}</p>
                                )}
                                
                                {submissionResult.test_results && submissionResult.test_results.length > 0 && (
                                    <>
                                        <div className="test-summary">
                                            <span className={submissionResult.all_passed ? 'success' : 'error'}>
                                                {submissionResult.passed}/{submissionResult.total} test cases passed
                                            </span>
                                            {submissionResult.execution_time_ms && (
                                                <span className="metric">⏱️ {submissionResult.execution_time_ms}ms</span>
                                            )}
                                            {submissionResult.memory_used_kb && (
                                                <span className="metric">💾 {submissionResult.memory_used_kb}KB</span>
                                            )}
                                        </div>
                                        
                                        <div className="test-cases-results">
                                            <h3>Test Cases</h3>
                                            {submissionResult.test_results.map((testResult, index) => (
                                                <div key={index} className={`test-case-result ${testResult.passed ? 'passed' : 'failed'}`}>
                                                    <div className="test-case-header">
                                                        <span className="test-number">Test Case {testResult.testcase}</span>
                                                        <span className={`test-status ${testResult.passed ? 'pass' : 'fail'}`}>
                                                            {testResult.passed ? '✓ Passed' : '✗ Failed'}
                                                        </span>
                                                    </div>
                                                    
                                                    {testResult.input !== undefined && (
                                                        <div className="test-detail">
                                                            <strong>Input:</strong>
                                                            <pre>{testResult.input}</pre>
                                                        </div>
                                                    )}
                                                    
                                                    {testResult.expected !== undefined && (
                                                        <div className="test-detail">
                                                            <strong>Expected:</strong>
                                                            <pre>{testResult.expected}</pre>
                                                        </div>
                                                    )}
                                                    
                                                    {testResult.actual !== undefined && (
                                                        <div className="test-detail">
                                                            <strong>Your Output:</strong>
                                                            <pre>{testResult.actual}</pre>
                                                        </div>
                                                    )}
                                                    
                                                    {testResult.error && (
                                                        <div className="test-detail error">
                                                            <strong>Error:</strong>
                                                            <pre>{testResult.error}</pre>
                                                        </div>
                                                    )}
                                                    
                                                    {!testResult.input && !testResult.expected && !testResult.actual && (
                                                        <div className="test-detail hidden-info">
                                                            <em>Hidden test case - Details not shown</em>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="modal-footer">
                                <button className="btn-primary" onClick={() => setSubmissionResult(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <AIAssistant 
                code={code} 
                language={language}
                problemTitle={problem?.title}
                problemDescription={problem?.description}
            />
            
            {/* Achievement Toasts */}
            {newAchievements.map((achievement, index) => (
                <AchievementToast
                    key={achievement.id}
                    achievement={achievement}
                    onClose={() => {
                        setNewAchievements(prev => prev.filter(a => a.id !== achievement.id));
                    }}
                    delay={index * 500}
                />
            ))}
        </div >
    );
}

export default EditorPage;
