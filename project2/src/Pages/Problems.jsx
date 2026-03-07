import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getProblems } from "../services/api";
import "../styles1/Problems.css";

function Problems() {
    const navigate = useNavigate();
    const [selectDifficulty, setSelectedDifficulty] = useState("All");
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [searchTerm, setSearchterm] = useState("");
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            setLoading(true);
            try {
                const params = {};
                if (selectDifficulty !== "All") params.difficulty = selectDifficulty;
                if (selectedTopic !== "All") params.topic = selectedTopic;
                if (searchTerm) params.search = searchTerm;

                const data = await getProblems(params);
                setProblems(data);
            } catch (error) {
                console.error("Failed to fetch problems", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProblems();
        }, 300); // 300ms debounce for search

        return () => clearTimeout(timeoutId);
    }, [selectDifficulty, selectedTopic, searchTerm]);

    const topics = ["All", "Arrays", "Strings", "Stack", "Queue", "LinkedList", "Tree", "Graph", "DP"];

    return (
        <>
            <div className="page animate-fade-in">
                <Navbar />
                <div className="problem-header">
                    <p>Problems</p>
                    <input
                        type="text"
                        placeholder="Search Problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchterm(e.target.value)}
                    />
                </div>
                <div className="problem-buttons">
                    <button
                        className={selectDifficulty === "All" ? "active" : ""}
                        onClick={() => setSelectedDifficulty("All")}
                    >
                        All
                    </button>
                    <button
                        className={selectDifficulty === "Easy" ? "active" : ""}
                        onClick={() => setSelectedDifficulty("Easy")}
                    >
                        Easy
                    </button>
                    <button
                        className={selectDifficulty === "Medium" ? "active" : ""}
                        onClick={() => setSelectedDifficulty("Medium")}
                    >
                        Medium
                    </button>
                    <button
                        className={selectDifficulty === "Hard" ? "active" : ""}
                        onClick={() => setSelectedDifficulty("Hard")}
                    >
                        Hard
                    </button>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                        {topics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading problems...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th className="problem-title">Title</th>
                                <th className="problem-topic">Topic</th>
                                <th className="problem-Difficulty">Difficulty</th>
                                <th className="problem-status">Platform</th>
                                <th className="problem-link">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.length > 0 ? (
                                problems.map((problem) => (
                                    <tr
                                        key={problem.id}
                                        className="scroll-reveal"
                                    >
                                        <td
                                            className="problem-title"
                                            onClick={() => navigate(`/solve/${problem.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {problem.title}
                                        </td>
                                        <td className="problem-topic">{problem.topic}</td>
                                        <td>
                                            <span
                                                className={`difficulty ${problem.difficulty.toLowerCase()}`}
                                            >
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="problem-status">
                                            <span style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                                                {problem.platform}
                                            </span>
                                        </td>
                                        <td className="problem-link">
                                            {problem.url && (
                                                <a
                                                    href={problem.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="external-link-icon"
                                                    title="View on Platform"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    ↗
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No problems found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                <Footer />
            </div>
        </>
    );
}
export default Problems;
