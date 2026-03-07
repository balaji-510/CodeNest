import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";
import "../styles1/Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-symbol">C</div>
            <span className="logo-text">Code<span>Nest</span></span>
          </div>
          <p className="brand-description">
            The ultimate platform for mastering Data Structures and Algorithms with AI-driven insights.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon magnetic-hover"><Github size={20} /></a>
            <a href="#" className="social-icon magnetic-hover"><Twitter size={20} /></a>
            <a href="#" className="social-icon magnetic-hover"><Linkedin size={20} /></a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/problems">Problems</Link>
            <Link to="/contests">Contests</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/discuss">Discuss</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <a href="#">Career</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Get the latest problem sets and tips.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Email Address" />
            <button className="magnetic-hover"><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 CodeNest. All rights reserved.</p>
        <div className="footer-bottom-links">
          <span>English (US)</span>
          <div className="dot"></div>
          <span>Made with ❤️ for Coders</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
