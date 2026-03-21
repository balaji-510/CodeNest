import React, { useState, useEffect } from 'react';
import { getMentorStats } from '../services/api';

const TestMentorAPI = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getMentorStats();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>;
    if (error) return <div style={{ color: 'red', padding: '50px' }}>Error: {error}</div>;

    return (
        <div style={{ color: 'white', padding: '50px', fontFamily: 'monospace' }}>
            <h1>Mentor API Test Page</h1>
            <h2>Raw API Response:</h2>
            <pre style={{ 
                background: '#1a1a1a', 
                padding: '20px', 
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '80vh'
            }}>
                {JSON.stringify(data, null, 2)}
            </pre>
            
            <h2>Quick Stats:</h2>
            <ul>
                <li>Total Students: {data?.studentStats?.length || 0}</li>
                <li>Branch Data Items: {data?.branchData?.length || 0}</li>
                <li>Topic Mastery Items: {data?.topicMastery?.length || 0}</li>
                <li>Submission History Items: {data?.submissionHistory?.length || 0}</li>
            </ul>

            <h2>Student Details:</h2>
            {data?.studentStats?.map((student, idx) => (
                <div key={idx} style={{ 
                    background: '#2a2a2a', 
                    padding: '15px', 
                    margin: '10px 0',
                    borderRadius: '8px'
                }}>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Username:</strong> {student.username}</p>
                    <p><strong>Branch:</strong> {student.branch}</p>
                    <p><strong>Solved:</strong> {student.solved}</p>
                    <p><strong>Points:</strong> {student.points}</p>
                    <p><strong>Status:</strong> {student.status}</p>
                    <p><strong>Last Active:</strong> {student.lastActive}</p>
                </div>
            ))}
        </div>
    );
};

export default TestMentorAPI;
