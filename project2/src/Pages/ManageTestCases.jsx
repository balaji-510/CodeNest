import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { getProblemById } from '../services/api';
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import '../styles1/ManageTestCases.css';

function ManageTestCases() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProblemAndTestCases();
    }, [id]);

    const fetchProblemAndTestCases = async () => {
        try {
            const problemData = await getProblemById(id);
            setProblem(problemData);
            
            // Fetch test cases
            const response = await fetch(`http://localhost:8000/api/problems/${id}/testcases/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setTestCases(data);
            } else {
                setTestCases([]);
            }
        } catch (error) {
            console.error('Failed to load test cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTestCase = () => {
        setTestCases([
            ...testCases,
            {
                id: null,
                input_data: '',
                expected_output: '',
                is_hidden: true,
                isNew: true
            }
        ]);
    };

    const updateTestCase = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    const deleteTestCase = async (index) => {
        const testCase = testCases[index];
        
        if (testCase.id && !testCase.isNew) {
            // Delete from backend
            try {
                await fetch(`http://localhost:8000/api/testcases/${testCase.id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
            } catch (error) {
                console.error('Failed to delete test case:', error);
                alert('Failed to delete test case');
                return;
            }
        }
        
        // Remove from state
        const updated = testCases.filter((_, i) => i !== index);
        setTestCases(updated);
    };

    const saveTestCases = async () => {
        setSaving(true);
        try {
            for (const testCase of testCases) {
                const payload = {
                    problem: parseInt(id),
                    input_data: testCase.input_data,
                    expected_output: testCase.expected_output,
                    is_hidden: testCase.is_hidden
                };

                if (testCase.id && !testCase.isNew) {
                    // Update existing
                    await fetch(`http://localhost:8000/api/testcases/${testCase.id}/`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Create new
                    await fetch('http://localhost:8000/api/testcases/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify(payload)
                    });
                }
            }
            
            alert('Test cases saved successfully!');
            fetchProblemAndTestCases(); // Refresh
        } catch (error) {
            console.error('Failed to save test cases:', error);
            alert('Failed to save test cases');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="manage-testcases-page">
                <Navbar />
                <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="manage-testcases-page">
            <Navbar />
            <main className="page-section">
                <header className="section-title">
                    <h1>Manage <span>Test Cases</span></h1>
                    <p>Problem: {problem?.title}</p>
                </header>

                <div className="testcases-container glass-effect">
                    <div className="testcases-header">
                        <h2>Test Cases ({testCases.length})</h2>
                        <div className="header-actions">
                            <button className="btn-secondary" onClick={() => navigate(`/solve/${id}`)}>
                                Back to Problem
                            </button>
                            <button className="btn-primary" onClick={addTestCase}>
                                <Plus size={18} /> Add Test Case
                            </button>
                            <button 
                                className="btn-success" 
                                onClick={saveTestCases}
                                disabled={saving}
                            >
                                <Save size={18} /> {saving ? 'Saving...' : 'Save All'}
                            </button>
                        </div>
                    </div>

                    {testCases.length === 0 ? (
                        <div className="empty-state">
                            <p>No test cases yet. Add your first test case!</p>
                            <button className="btn-primary" onClick={addTestCase}>
                                <Plus size={18} /> Add Test Case
                            </button>
                        </div>
                    ) : (
                        <div className="testcases-list">
                            {testCases.map((testCase, index) => (
                                <div key={index} className="testcase-card">
                                    <div className="testcase-header">
                                        <h3>Test Case #{index + 1}</h3>
                                        <div className="testcase-actions">
                                            <button
                                                className={`visibility-toggle ${testCase.is_hidden ? 'hidden' : 'visible'}`}
                                                onClick={() => updateTestCase(index, 'is_hidden', !testCase.is_hidden)}
                                                title={testCase.is_hidden ? 'Hidden from users' : 'Visible to users'}
                                            >
                                                {testCase.is_hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                                                {testCase.is_hidden ? 'Hidden' : 'Visible'}
                                            </button>
                                            <button
                                                className="btn-danger-small"
                                                onClick={() => deleteTestCase(index)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="testcase-content">
                                        <div className="form-group">
                                            <label>Input</label>
                                            <textarea
                                                value={testCase.input_data}
                                                onChange={(e) => updateTestCase(index, 'input_data', e.target.value)}
                                                placeholder="Enter input data (one value per line)"
                                                rows="4"
                                            />
                                            <small>Tip: For multiple inputs, put each on a new line</small>
                                        </div>

                                        <div className="form-group">
                                            <label>Expected Output</label>
                                            <textarea
                                                value={testCase.expected_output}
                                                onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                                                placeholder="Enter expected output"
                                                rows="4"
                                            />
                                            <small>Tip: Output should match exactly (including whitespace)</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ManageTestCases;
