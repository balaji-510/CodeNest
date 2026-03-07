import React from 'react';
import '../styles1/Heatmap.css';

const ContributionHeatmap = ({ data }) => {
    // data is expected to be an array of objects: { date: "YYYY-MM-DD", count: number }
    // We need to map this to the last 365 days.

    const generateCalendarData = () => {
        const calendar = [];
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setDate(today.getDate() - 364);

        // Create a map for O(1) lookup
        const dataMap = {};
        if (data && Array.isArray(data)) {
            data.forEach(item => {
                dataMap[item.date] = item.count;
            });
        }

        for (let i = 0; i < 365; i++) {
            const current = new Date(oneYearAgo);
            current.setDate(oneYearAgo.getDate() + i);
            const dateStr = current.toISOString().split('T')[0];

            const count = dataMap[dateStr] || 0;

            // Determine level based on count
            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 5) level = 3;
            if (count > 10) level = 4;

            calendar.push({ date: current, count, level });
        }
        return calendar;
    };

    const activityData = generateCalendarData();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="heatmap-wrapper glass-effect scroll-reveal">
            <div className="heatmap-header">
                <h3>Activity Heatmap</h3>
                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="square level-0"></div>
                    <div className="square level-1"></div>
                    <div className="square level-2"></div>
                    <div className="square level-3"></div>
                    <div className="square level-4"></div>
                    <span>More</span>
                </div>
            </div>

            <div className="heatmap-container">
                <div className="days-labels">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                </div>
                <div className="heatmap-grid">
                    {activityData.map((day, index) => (
                        <div
                            key={index}
                            className={`square level-${day.level}`}
                            title={`${day.date.toDateString()}: ${day.count} submissions`}
                        ></div>
                    ))}
                </div>
            </div>

            <div className="months-labels">
                {months.map(m => <span key={m}>{m}</span>)}
            </div>
        </div>
    );
};

export default ContributionHeatmap;
