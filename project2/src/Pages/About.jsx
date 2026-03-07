import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../styles1/Hero.css'; // Reusing hero styles for consistency

const About = () => {
    return (
        <div className="about-page animate-fade-in">
            <Navbar />
            <main className="page-section">
                <header className="section-title">
                    <h1>About <span>CodeNest</span></h1>
                    <p>Empowering developers to master coding with intelligence.</p>
                </header>

                <section className="glass-effect" style={{ padding: '3rem', borderRadius: '24px', marginBottom: '4rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Our Mission</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                                At CodeNest, we believe that education should be accessible, engaging, and personalized.
                                Our mission is to provide a platform that not only tests your coding skills but also
                                helps you understand your mistakes through intelligent, AI-driven feedback.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginTop: '1rem' }}>
                                Whether you're a student preparing for interviews or a mentor tracking student progress,
                                CodeNest provides the tools you need to succeed in the ever-evolving world of software development.
                            </p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div className="glass-effect" style={{
                                padding: '2rem',
                                borderLeft: '4px solid var(--primary-color)',
                                background: 'rgba(56, 189, 248, 0.05)'
                            }}>
                                <h3 style={{ marginBottom: '1rem' }}>Key Features</h3>
                                <ul style={{ display: 'grid', gap: '1rem' }}>
                                    <li>✨ AI-Powered Error Analysis</li>
                                    <li>📊 Real-time Performance Analytics</li>
                                    <li>👩‍🏫 Comprehensive Mentor Dashboards</li>
                                    <li>💬 Active Community Discussions</li>
                                    <li>🏆 Competitive Leaderboards</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-it-works">
                    <h2 className="section-title">Why Choose <span>CodeNest</span>?</h2>
                    <div className="steps-container">
                        <div className="glass-effect step-card" style={{ padding: '2rem' }}>
                            <div className="step-number" style={{ background: 'var(--primary-color)' }}>1</div>
                            <h3>Modern Design</h3>
                            <p>A sleek, dark-themed glassmorphism interface that's easy on the eyes during long coding sessions.</p>
                        </div>
                        <div className="glass-effect step-card" style={{ padding: '2rem' }}>
                            <div className="step-number" style={{ background: 'var(--secondary-color)' }}>2</div>
                            <h3>AI Assistance</h3>
                            <p>Don't just see a "Wrong Answer" message. Understand *why* your code failed and how to improve it.</p>
                        </div>
                        <div className="glass-effect step-card" style={{ padding: '2rem' }}>
                            <div className="step-number" style={{ background: 'var(--accent-color)' }}>3</div>
                            <h3>Data Driven</h3>
                            <p>Track every submission, identify your weak areas, and watch your skills grow with detailed charts.</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default About;
