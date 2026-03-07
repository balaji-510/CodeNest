import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Navbar from "../Components/Navbar";
import AIAssistant from "../Components/AIAssistant";
import { getProblemById, executeCode, submitCode } from "../services/api";
import "../styles1/Editor.css";

function EditorPage() {
    const { id } = useParams();
    // const navigate = useNavigate(); // Unused
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

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
            } catch (error) {
                console.error("Failed to load problem", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Re-fetch only if ID changes

    // Separate effect to update code when language changes, avoiding full re-fetch
    useEffect(() => {
        if (problem?.starterCode?.[language]) {
            setCode(problem.starterCode[language]);
        }
    }, [language, problem]);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            const result = await executeCode(language, code);
            setOutput(result);
        } catch (error) {
            setOutput({ error: "Execution failed. Please try again." });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        try {
            // We need to pass the problem ID and code
            const result = await submitCode(id, language, code);

            if (result.status === 'Solved') {
                setSubmissionResult({ type: 'success', message: 'Accepted! Great work.' });
            } else {
                setSubmissionResult({ type: 'error', message: `Wrong Answer. Try again.` });
            }
        } catch (error) {
            console.error("Submission failed:", error);
            setSubmissionResult({ type: 'error', message: "Submission failed. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Editor...</div>;
    }

    if (!problem) {
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Problem not found.</div>;
    }

    return (
        <div className="editor-page">
            <Navbar />
            <div className="editor-container">
                <div className="problem-description">
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

                        {problem.examples && problem.examples.length > 0 && (
                            <>
                                <h3>Examples:</h3>
                                {problem.examples.map((ex, i) => (
                                    <div key={i} className="example-box">
                                        <p><strong>Input:</strong> {ex.input}</p>
                                        <p><strong>Output:</strong> {ex.output}</p>
                                        {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
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
                        </div>
                        <div className="control-group">
                            <button
                                className="run-btn"
                                onClick={handleRunCode}
                                disabled={isRunning}
                            >
                                {isRunning ? "Running..." : "Run"}
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmitCode}
                                disabled={isSubmitting || isRunning}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                    <div className="monaco-editor-wrapper">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                fontSize: 16,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Output Terminal */}
                    <div className="output-terminal">
                        <div className="terminal-header">Output</div>
                        <div className="terminal-content">
                            {isRunning && <span className="loading-text">Running code...</span>}
                            {!isRunning && output && (
                                <>
                                    {output.stdout && <pre className="stdout">{output.stdout}</pre>}
                                    {output.stderr && <pre className="stderr">{output.stderr}</pre>}
                                    {output.error && <pre className="error">{output.error}</pre>}
                                    {!output.stdout && !output.stderr && !output.error && <span className="no-output">No output</span>}
                                </>
                            )}
                            {!isRunning && !output && <span className="placeholder-text">Run execution to see output...</span>}
                        </div>
                    </div>
                </div>

                {submissionResult && (
                    <div className={`submission-result-modal ${submissionResult.type}`}>
                        {submissionResult.message}
                        <button onClick={() => setSubmissionResult(null)}>X</button>
                    </div>
                )}
            </div>
            <AIAssistant code={code} language={language} />
        </div >
    );
}

export default EditorPage;
