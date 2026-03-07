import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../styles1/Leaderboard.css';
import { getLeaderboard } from '../services/api';

const LeaderboardPage = () => {
    const [leaderboardData, setLeaderboardData] = useState([
        { rank: 1, name: "CodeWizard", points: 15420, solved: 842, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeWizard" },
        { rank: 2, name: "DevMaster", points: 14200, solved: 798, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevMaster" },
        { rank: 3, name: "AlgorithmKing", points: 13850, solved: 756, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlgorithmKing" },
        { rank: 4, name: "BinaryNinja", points: 12100, solved: 645, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BinaryNinja" },
        { rank: 5, name: "PixelPerfect", points: 11500, solved: 612, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PixelPerfect" },
        { rank: 6, name: "StackOverlord", points: 10800, solved: 589, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StackOverlord" },
        { rank: 7, name: "CoffeeCoder", points: 9950, solved: 542, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CoffeeCoder" },
        { rank: 8, name: "BugHunter", points: 9200, solved: 512, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BugHunter" },
    ]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();

                // Add currentUser flag if needed/possible. 
                // The backend now handles calculations, so we just display what we get.
                // We might want to highlight the current user if we know their ID.
                // const currentUserId = parseInt(localStorage.getItem('user_id'));
                // const formattedData = data.map((user, index) => ({
                //     ...user,
                //     rank: index + 1,
                //     isCurrentUser: false // Backend doesn't return ID directly in this view yet, but name check works
                // }));

                // Check for current user based on name matches for now (backend handles isCurrentUser flag)
                setLeaderboardData(data);
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            }
        };

        fetchLeaderboard();

        // Refresh every minute
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="leaderboard-page">
            <Navbar />
            <main className="leaderboard-container">
                <header className="leaderboard-header scroll-reveal">
                    <h1>Global Leaderboard</h1>
                    <p>Compete with the best minds across the globe</p>
                </header>

                <section className="top-three">
                    {leaderboardData.slice(0, 3).map((user, index) => (
                        <div key={user.name} className={`top-card glass-effect rank-${user.rank} scroll-reveal ${user.isCurrentUser ? 'current-user-highlight' : ''}`} style={{ transitionDelay: `${index * 0.2}s` }}>
                            <div className="rank-badge">
                                {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                            </div>
                            <img src={user.avatar} alt={user.name} className="top-avatar" />
                            <h3 className="top-name">{user.name}</h3>
                            <div className="top-stats">
                                <span>{user.points.toLocaleString()} pts</span>
                                <span className="divider">|</span>
                                <span>{user.solved} solved</span>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="leaderboard-list glass-effect scroll-reveal">
                    <div className="list-header">
                        <span className="col-rank">Rank</span>
                        <span className="col-user">User</span>
                        <span className="col-solved">Solved</span>
                        <span className="col-points">Points</span>
                    </div>
                    <div className="list-body">
                        {leaderboardData.slice(3).map((user, index) => (
                            <div key={user.name} className={`list-item magnetic-hover ${user.isCurrentUser ? 'current-user-row' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                                <span className="col-rank">#{user.rank}</span>
                                <div className="col-user">
                                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                                    <span>{user.name}</span>
                                </div>
                                <span className="col-solved">{user.solved}</span>
                                <span className="col-points">{user.points.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LeaderboardPage;
