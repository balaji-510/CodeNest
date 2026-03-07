import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const login = async (username, password) => {
    try {
        const response = await api.post('/token/', { username, password });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('isLoggedIn', 'true');
            // Store user details returned by CustomTokenObtainPairView
            if (response.data.user_id) {
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('username', response.data.username);
                if (response.data.email) {
                    localStorage.setItem('userEmail', response.data.email);
                }
                if (response.data.role) {
                    localStorage.setItem('userRole', response.data.role);
                }
            }
        }
        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/register/', userData);
        return response.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('linkedAccounts');
    localStorage.removeItem('externalStatsCache');
};

// User Stats API
export const getUserStats = async (userId = 1) => {
    try {
        // In a real app, we might get userId from the token or a /me endpoint
        // For now, if no userId is passed, we could try to fetch current user's profile
        const response = await api.get(`/dashboard-stats/${userId}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
};

// Submissions API (if needed directly)
export const getSubmissions = async (userId = 1) => {
    try {
        const response = await api.get(`/submissions/?user=${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching submissions:", error);
        throw error;
    }
};

// Placeholder for updates - in real app this would be a POST/PUT
export const updateUserStats = async (newStats) => {
    // For now, we might not have an endpoint to "update stats" directly 
    // as stats are derived from submissions and activity.
    // This is just to keep compatibility with existing code if possible, 
    // or we should remove usages of updateUserStats if it's no longer relevant.
    console.warn("updateUserStats is not fully implemented in backend yet.");
    return newStats;
};

export const getProblems = async (params = {}) => {
    try {
        const response = await api.get('/problems/', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching problems:", error);
        throw error;
    }
};

export const getProblemById = async (id) => {
    try {
        const response = await api.get(`/problems/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching problem ${id}:`, error);
        throw error;
    }
};

export const getLeaderboard = async () => {
    try {
        const response = await api.get('/leaderboard/');
        return response.data;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        throw error;
    }
};

export const getVerificationToken = async () => {
    try {
        const response = await api.get('/get-verification-token/');
        return response.data;
    } catch (error) {
        console.error("Error fetching verification token:", error);
        throw error;
    }
};

export const verifyLeetCode = async (handle) => {
    try {
        const response = await api.post('/verify-leetcode/', { handle });
        return response.data;
    } catch (error) {
        console.error("Error verifying LeetCode:", error);
        throw error;
    }
};

export const verifyCodeforces = async (handle) => {
    try {
        const response = await api.post('/verify-codeforces/', { handle });
        return response.data;
    } catch (error) {
        console.error("Error verifying Codeforces:", error);
        throw error;
    }
};

export const verifyCodeChef = async (handle) => {
    try {
        const response = await api.post('/verify-codechef/', { handle });
        return response.data;
    } catch (error) {
        console.error("Error verifying CodeChef:", error);
        throw error;
    }
};

export const executeCode = async (language, code, stdin = "") => {
    try {
        const response = await api.post('/execute-code/', { language, code, stdin });
        return response.data;
    } catch (error) {
        console.error("Error executing code:", error);
        throw error;
    }
};

export const getMentorStats = async () => {
    try {
        const response = await api.get('/mentor-stats/');
        return response.data;
    } catch (error) {
        console.error("Error fetching mentor stats:", error);
        throw error;
    }
};

export const getDailyChallenge = async () => {
    try {
        const response = await api.get('/daily-challenge/');
        return response.data;
    } catch (error) {
        console.error("Error fetching daily challenge:", error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/profile/update/', profileData);
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const getUserStatsByUsername = async (username) => {
    try {
        const response = await api.get(`/dashboard-stats/user/${username}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user stats by username:", error);
        throw error;
    }
};

export const getCurrentUserStats = async () => {
    try {
        const response = await api.get('/dashboard-stats/me/');
        return response.data;
    } catch (error) {
        console.error("Error fetching current user stats:", error);
        throw error;
    }
};

export const getRoadmap = async () => {
    try {
        const response = await api.get('/roadmap/');
        return response.data;
    } catch (error) {
        console.error("Error fetching roadmap:", error);
        throw error;
    }
};

export const submitCode = async (problemId, language, code) => {
    try {
        // Ideally we run against test cases here or on backend.
        // For this prototype, we will just mark as Solved if they submit.
        const response = await api.post('/submissions/', {
            problem: problemId,
            status: "Solved"
        });
        return response.data;
    } catch (error) {
        console.error("Error submitting code:", error);
        throw error;
    }
};

export default api;
