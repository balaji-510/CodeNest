import React, { useState, useEffect } from 'react';
import { Flame, Calendar, TrendingUp, Clock } from 'lucide-react';
import '../styles1/ActivityHeatmap.css';

function ActivityHeatmap({ userId }) {
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        fetchHeatmapData();
    }, [userId]);

    const fetchHeatmapData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const url = userId 
                ? `http://localhost:8000/api/activity-heatmap/?user=${userId}`
                : 'http://localhost:8000/api/activity-heatmap/';
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHeatmapData(data);
            }
        } catch (error) {
            console.error('Failed to fetch heatmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorForLevel = (level) => {
        const colors = [
            '#0f172a', // 0 - no activity
            '#1e3a5f', // 1 - low
            '#2563eb', // 2 - medium
            '#3b82f6', // 3 - high
            '#60a5fa'  // 4 - very high
        ];
        return colors[Math.min(level, 4)];
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDayOfWeek = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Group activity data by weeks
    const groupByWeeks = () => {
        if (!heatmapData) return [];
        
        const weeks = [];
        let currentWeek = [];
        
        heatmapData.activity_data.forEach((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();
            
            // Start a new week on Sunday
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            
            currentWeek.push(day);
            
            // Push the last week
            if (index === heatmapData.activity_data.length - 1) {
                weeks.push(currentWeek);
            }
        });
        
        return weeks;
    };

    if (loading) {
        return (
            <div className="heatmap-loading">
                <div className="loading-spinner"></div>
                <p>Loading activity...</p>
            </div>
        );
    }

    if (!heatmapData) {
        return (
            <div className="heatmap-error">
                <p>Failed to load activity data</p>
            </div>
        );
    }

    const weeks = groupByWeeks();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="activity-heatmap-container">
            {/* Stats Cards */}
            <div className="heatmap-stats">
                <div className="stat-card glass-effect">
                    <div className="stat-icon">
                        <Flame size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{heatmapData.current_streak}</div>
                        <div className="stat-label">Current Streak</div>
                    </div>
                </div>
                
                <div className="stat-card glass-effect">
                    <div className="stat-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{heatmapData.longest_streak}</div>
                        <div className="stat-label">Longest Streak</div>
                    </div>
                </div>
                
                <div className="stat-card glass-effect">
                    <div className="stat-icon">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{heatmapData.active_days}</div>
                        <div className="stat-label">Active Days</div>
                    </div>
                </div>
                
                <div className="stat-card glass-effect">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{heatmapData.most_active_hour}</div>
                        <div className="stat-label">Most Active Hour</div>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="heatmap-section glass-effect">
                <div className="heatmap-header">
                    <h3>
                        <Calendar size={20} />
                        Activity in the last year
                    </h3>
                    <div className="heatmap-legend">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map(level => (
                            <div
                                key={level}
                                className="legend-box"
                                style={{ backgroundColor: getColorForLevel(level) }}
                            ></div>
                        ))}
                        <span>More</span>
                    </div>
                </div>

                <div className="heatmap-grid-container">
                    {/* Day labels */}
                    <div className="day-labels">
                        <div className="day-label">Mon</div>
                        <div className="day-label"></div>
                        <div className="day-label">Wed</div>
                        <div className="day-label"></div>
                        <div className="day-label">Fri</div>
                        <div className="day-label"></div>
                        <div className="day-label">Sun</div>
                    </div>

                    {/* Heatmap grid */}
                    <div className="heatmap-grid">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="heatmap-week">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className="heatmap-day"
                                        style={{ backgroundColor: getColorForLevel(day.level) }}
                                        onMouseEnter={() => setSelectedDay(day)}
                                        onMouseLeave={() => setSelectedDay(null)}
                                        title={`${formatDate(day.date)}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tooltip */}
                {selectedDay && (
                    <div className="heatmap-tooltip">
                        <div className="tooltip-date">{formatDate(selectedDay.date)}</div>
                        <div className="tooltip-stats">
                            <span>{selectedDay.count} submission{selectedDay.count !== 1 ? 's' : ''}</span>
                            <span className="tooltip-separator">•</span>
                            <span>{selectedDay.accepted} accepted</span>
                        </div>
                    </div>
                )}

                {/* Additional Stats */}
                <div className="heatmap-footer">
                    <div className="footer-stat">
                        <span className="footer-label">Total Submissions:</span>
                        <span className="footer-value">{heatmapData.total_submissions}</span>
                    </div>
                    <div className="footer-stat">
                        <span className="footer-label">Total Accepted:</span>
                        <span className="footer-value">{heatmapData.total_accepted}</span>
                    </div>
                    <div className="footer-stat">
                        <span className="footer-label">Most Active Day:</span>
                        <span className="footer-value">{heatmapData.most_active_day}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityHeatmap;
