const defaultStats = {
    problemsSolved: 142,
    accuracy: 89,
    activeDays: 45,
    rank: 482,
    recentSubmissions: [
        { id: 1, title: "Two Sum", status: "Solved", date: "2026-01-19" },
        { id: 2, title: "Reverse String", status: "Solved", date: "2026-01-18" },
        { id: 3, title: "Valid Palindrome", status: "Attempted", date: "2026-01-17" },
    ],
    topicProgress: [
        { topic: "Arrays", solved: 45, total: 100 },
        { topic: "Strings", solved: 32, total: 80 },
        { topic: "Linked List", solved: 12, total: 50 },
        { topic: "Trees", solved: 8, total: 60 },
    ]
};

export const getUserStats = () => {
    const saved = localStorage.getItem('codenest_user_stats');
    if (saved) {
        return JSON.parse(saved);
    }
    localStorage.setItem('codenest_user_stats', JSON.stringify(defaultStats));
    return defaultStats;
};

export const updateUserStats = (newStats) => {
    localStorage.setItem('codenest_user_stats', JSON.stringify(newStats));
    window.dispatchEvent(new Event('statsUpdated')); // Custom event for reactivity
    return newStats;
};
