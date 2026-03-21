// Central API base URL — set VITE_API_URL in your .env or Vercel env vars
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_BASE;
