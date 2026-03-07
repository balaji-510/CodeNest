import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hash, MessageSquare, Trophy, LayoutDashboard, User, Swords, Map } from 'lucide-react';
import '../styles1/CommandPalette.css';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const commands = [
        { id: 'dashboard', title: 'Go to Dashboard', icon: <LayoutDashboard size={18} />, action: () => navigate('/dashboard') },
        { id: 'problems', title: 'Browse Problems', icon: <Hash size={18} />, action: () => navigate('/problems') },
        { id: 'contests', title: 'Contests Hub', icon: <Swords size={18} />, action: () => navigate('/contests') },
        { id: 'roadmap', title: 'Learning Roadmap', icon: <Map size={18} />, action: () => navigate('/roadmap') },
        { id: 'leaderboard', title: 'Global Leaderboard', icon: <Trophy size={18} />, action: () => navigate('/leaderboard') },
        { id: 'discuss', title: 'Community Forum', icon: <MessageSquare size={18} />, action: () => navigate('/discuss') },
        { id: 'profile', title: 'My Profile', icon: <User size={18} />, action: () => navigate('/profile') },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-palette-content glass-effect" onClick={e => e.stopPropagation()}>
                <div className="search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        autoFocus
                        placeholder="Search commands (Dashboard, Leaderboard...)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <kbd className="esc-key">ESC</kbd>
                </div>

                <div className="commands-list">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map(cmd => (
                            <div
                                key={cmd.id}
                                className="command-item"
                                onClick={() => { cmd.action(); setIsOpen(false); }}
                            >
                                <span className="cmd-icon">{cmd.icon}</span>
                                <span className="cmd-title">{cmd.title}</span>
                                <span className="cmd-shortcut">⏎</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">No commands found for "{query}"</div>
                    )}
                </div>

                <div className="command-palette-footer">
                    <span>Tip: Use ↑↓ arrows to navigate and Enter to select</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
