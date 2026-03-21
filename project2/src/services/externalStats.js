export const fetchLeetCodeStats = async (username) => {
    try {
        // Call our backend proxy to avoid CORS issues with LeetCode's GraphQL API
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/leetcode-stats/?username=${encodeURIComponent(username)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error("LeetCode proxy error:", response.status);
            return null;
        }

        const data = await response.json();
        if (data.error) {
            console.error("LeetCode API Error:", data.error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error fetching LeetCode stats:", error);
        return null;
    }
};

export const fetchCodeforcesStats = async (username) => {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const data = await response.json();
        if (data.status === "OK") {
            const user = data.result[0];

            // Also fetch solved count from user.status (accepted submissions, distinct problems)
            let problemsSolved = 0;
            try {
                const statusResp = await fetch(
                    `https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`
                );
                const statusData = await statusResp.json();
                if (statusData.status === 'OK') {
                    const solvedSet = new Set(
                        statusData.result
                            .filter(s => s.verdict === 'OK')
                            .map(s => `${s.problem.contestId}-${s.problem.index}`)
                    );
                    problemsSolved = solvedSet.size;
                }
            } catch (_) { /* ignore */ }

            return {
                platform: "Codeforces",
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || "unrated",
                maxRank: user.maxRank || "unrated",
                contribution: user.contribution || 0,
                organization: user.organization || "",
                problemsSolved,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching Codeforces stats:", error);
        return null;
    }
};

export const fetchCodeChefStats = async (username) => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/codechef-stats/?username=${encodeURIComponent(username)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error("CodeChef proxy error:", response.status);
            return null;
        }

        const data = await response.json();
        if (data.error) {
            console.error("CodeChef API Error:", data.error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error fetching CodeChef stats:", error);
        return null;
    }
};

export const syncAllStats = async (handles) => {
    const results = {};

    if (handles.leetcode) {
        results.leetcode = await fetchLeetCodeStats(handles.leetcode);
    }
    if (handles.codeforces) {
        results.codeforces = await fetchCodeforcesStats(handles.codeforces);
    }
    if (handles.codechef) {
        results.codechef = await fetchCodeChefStats(handles.codechef);
    }

    return results;
};
