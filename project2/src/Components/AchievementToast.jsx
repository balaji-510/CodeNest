import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import '../styles1/AchievementToast.css';

function AchievementToast({ achievement, onClose, delay = 0 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation with delay
        const showTimer = setTimeout(() => setIsVisible(true), 100 + delay);

        // Auto-close after 5 seconds (plus delay)
        const closeTimer = setTimeout(() => {
            handleClose();
        }, 5000 + delay);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(closeTimer);
        };
    }, [delay]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`achievement-toast ${isVisible ? 'visible' : ''}`}>
            <div className="toast-content">
                <div className="toast-icon">
                    <Trophy size={32} />
                </div>
                <div className="toast-info">
                    <div className="toast-title">Achievement Unlocked!</div>
                    <div className="toast-achievement">
                        <span className="achievement-emoji">{achievement.icon}</span>
                        <span className="achievement-name">{achievement.title}</span>
                    </div>
                    <div className="toast-description">{achievement.description}</div>
                    <div className="toast-points">+{achievement.points || 0} points</div>
                </div>
                <button className="toast-close" onClick={handleClose}>
                    <X size={20} />
                </button>
            </div>
            <div className="confetti-container">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="confetti" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        backgroundColor: ['#38bdf8', '#818cf8', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)]
                    }}></div>
                ))}
            </div>
        </div>
    );
}

export default AchievementToast;
