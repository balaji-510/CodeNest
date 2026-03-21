import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Scoreboard from './Scoreboard';

const ScoreboardPage = () => (
  <div className="page animate-fade-in" style={{ minHeight: '100vh' }}>
    <Navbar />
    <main style={{ width: '100%', padding: '1.5rem 2rem', paddingTop: '5.5rem', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          🏆 <span style={{ color: 'var(--primary-color)' }}>Scoreboard</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Cross-platform student rankings — CoderNest · LeetCode · CodeChef · Codeforces
        </p>
      </div>
      <Scoreboard fullPage />
    </main>
    <Footer />
  </div>
);

export default ScoreboardPage;
