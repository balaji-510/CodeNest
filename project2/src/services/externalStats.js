export const fetchLeetCodeStats = async (username) => {
    try {
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
        const data = await response.json();
        if (data.status === "success") {
            return {
                platform: "LeetCode",
                totalSolved: data.totalSolved,
                easySolved: data.easySolved,
                mediumSolved: data.mediumSolved,
                hardSolved: data.hardSolved,
                acceptanceRate: data.acceptanceRate,
                ranking: data.ranking,
                contributionPoints: data.contributionPoints,
            };
        }
        return null;
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
            return {
                platform: "Codeforces",
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || "unrated",
                maxRank: user.maxRank || "unrated",
                contribution: user.contribution || 0,
                organization: user.organization || "",
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
        // Fetch HTML via local proxy to bypass CORS
        const response = await fetch(`/api/codechef/users/${username}`);
        const html = await response.text();

        // Simple parser using regex (robustness depends on CodeChef UI stability)
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const ratingElement = doc.querySelector('.rating-number');
        const starsElement = doc.querySelector('.rating-star'); // varies often, checking .rating-star or simple regex
        const globalRankElement = doc.querySelector('.rating-ranks ul li:first-child a strong');
        // const countryRankElement = doc.querySelector('.rating-ranks ul li:last-child a strong'); // Unused

        // Extracting Solved Count (e.g. "Fully Solved (123)")
        const solvedElement = doc.querySelector('.rating-data-section:nth-child(1) h3');
        let totalSolved = 0;
        if (solvedElement && solvedElement.innerText.includes('Fully Solved')) {
            const match = solvedElement.innerText.match(/\((\d+)\)/);
            if (match) totalSolved = parseInt(match[1]);
        }

        // Fallback or Regex if DOM query fails
        const rating = ratingElement ? parseInt(ratingElement.innerText) : 0;
        const stars = starsElement ? starsElement.innerText : "1★";
        const globalRank = globalRankElement ? globalRankElement.innerText : "N/A";
        // const countryRank = countryRankElement ? countryRankElement.innerText : "N/A";

        if (response.ok) {
            return {
                platform: "CodeChef",
                rating: rating,
                stars: stars,
                globalRank: globalRank,
                countryRank: "N/A", // keeping simple
                highestRating: 0, // Simplified
                totalSolved: totalSolved
            };
        }
        return null;
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
