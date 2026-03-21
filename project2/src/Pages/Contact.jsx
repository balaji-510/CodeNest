import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { ToastContainer } from '../Components/Toast';
import { useToast } from '../hooks/useToast';
import '../styles1/Hero.css';

const Contact = () => {
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showSuccess('Message sent successfully! We\'ll get back to you soon.');
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: 'general',
                message: ''
            });
        } catch (error) {
            showError('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page animate-fade-in">
            <Navbar />
            <main className="page-section">
                <header className="section-title">
                    <h1>Get in <span>Touch</span></h1>
                    <p>Have questions or feedback? We'd love to hear from you.</p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '4rem',
                    alignItems: 'start'
                }}>
                    <section className="glass-effect" style={{ padding: '3rem', borderRadius: '24px' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Send us a Message</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subject</label>
                                <select 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        outline: 'none'
                                    }}>
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="business">Business Partnership</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Tell us what's on your mind..."
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        outline: 'none',
                                        resize: 'none'
                                    }}
                                    required
                                ></textarea>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="magnetic-hover" 
                                style={{
                                    padding: '1rem 2rem',
                                    background: isSubmitting ? 'var(--text-secondary)' : 'var(--primary-color)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}>
                                <Send size={18} /> {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </section>

                    <section style={{ display: 'grid', gap: '2rem' }}>
                        <div className="glass-effect" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Contact Information</h3>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</p>
                                        <p>support@codenest.io</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px', color: 'var(--secondary-color)' }}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone</p>
                                        <p>+1 (555) 000-0000</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(192, 132, 252, 0.1)', borderRadius: '12px', color: 'var(--accent-color)' }}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location</p>
                                        <p>San Francisco, CA</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-effect" style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(192, 132, 252, 0.1))',
                            border: '1px solid var(--primary-color)'
                        }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageCircle size={20} /> Live Support
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Need immediate help? Our support team is available 24/7 for premium members.
                            </p>
                            <button className="magnetic-hover" style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'white',
                                color: 'black',
                                borderRadius: '12px',
                                fontWeight: '600'
                            }}>
                                Start Chat
                            </button>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default Contact;
