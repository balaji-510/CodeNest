import FeatureCard from "../Components/FeatureCard";
import ai from "../images/ai.jpg";
import idle from "../images/idle.jpg";
import performance from "../images/performance.jpg";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../styles1/Hero.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPlatformStats } from "../services/api";

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_problems_solved: 0,
    active_users: 0,
    platform_accuracy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load platform stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k+';
    }
    return num + '+';
  };

  return (
    <div className="page animate-fade-in">
      <div className="home">
        <Navbar />
        <section className="hero">
          <h1 className="hero-title">Where Coding Meets Intelligence</h1>
          <p className="hero-subtitle">
            Write Code, Analyze Performance, and learn from your Mistakes - All
            in One Place
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate("/login")} className="get-started magnetic-hover">
              Get Started — It's Free
            </button>
            <button onClick={() => navigate("/problems")} className="get-started magnetic-hover" style={{ background: 'transparent', border: '2px solid var(--primary-color)', color: 'var(--primary-color)', boxShadow: 'none' }}>
              Browse Problems
            </button>
          </div>
        </section>
        <section className="features">
          <FeatureCard
            img={idle}
            title="Built-in Coding Editor"
            description="Write, run, and test code directly on the platform."
          />
          <FeatureCard
            img={performance}
            title="Performance Analytics"
            description="Track your progress with topic-wise insights."
          />
          <FeatureCard
            img={ai}
            title="AI Error Assistant"
            description="Get instant explanations for coding errors."
          />
        </section>

        <section className="how-it-works scroll-reveal">
          <h2 className="section-title">How it Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Choose a Challenge</h3>
              <p>Select from hundreds of problems across different topics and difficulty levels.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Write & Test Code</h3>
              <p>Use our professional-grade editor with multi-language support to craft your solution.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get AI Feedback</h3>
              <p>Receive instant, intelligent explanations for any errors and optimize your logic.</p>
            </div>
          </div>
        </section>

        <section className="stats-section scroll-reveal">
          <div className="stat-item">
            <h2>{loading ? '...' : formatNumber(stats.total_problems_solved)}</h2>
            <p>Problems Solved</p>
          </div>
          <div className="stat-item">
            <h2>{loading ? '...' : formatNumber(stats.active_users)}</h2>
            <p>Active Coders</p>
          </div>
          <div className="stat-item">
            <h2>{loading ? '...' : stats.platform_accuracy.toFixed(0) + '%'}</h2>
            <p>Success Rate</p>
          </div>
        </section>

        <section className="final-cta scroll-reveal">
          <h2>Ready to Level Up Your Skills?</h2>
          <p>Join thousands of developers who are mastering code with intelligence.</p>
          <button onClick={() => navigate("/login")} className="cta-button magnetic-hover">
            Join the Community
          </button>
        </section>

        <Footer />
      </div>
    </div>
  );
}
export default Home;
