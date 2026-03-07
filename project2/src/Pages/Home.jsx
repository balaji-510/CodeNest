import FeatureCard from "../Components/FeatureCard";
import ai from "../images/ai.jpg";
import idle from "../images/idle.jpg";
import performance from "../images/performance.jpg";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../styles1/Hero.css";
import { useNavigate } from "react-router-dom";
function Home() {
  const navigate = useNavigate();
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
          <button onClick={() => navigate("/login")} className="get-started magnetic-hover">
            Get Started
          </button>
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
            <h2>10k+</h2>
            <p>Problems Solved</p>
          </div>
          <div className="stat-item">
            <h2>500+</h2>
            <p>Active Coders</p>
          </div>
          <div className="stat-item">
            <h2>98%</h2>
            <p>AI Accuracy</p>
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
