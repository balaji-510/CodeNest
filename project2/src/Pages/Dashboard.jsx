import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getUserStats, updateUserStats, getDailyChallenge, getCurrentUserStats, getUserStatsByUsername } from "../services/api";
import { Trophy, Calendar, Zap, Star, ArrowRight, RefreshCw, BarChart3, Globe, Code2, Cpu, Shield, Loader, ExternalLink } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ActivityHeatmap from "../Components/ActivityHeatmap";
import { syncAllStats } from "../services/externalStats";
import "../styles1/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { username } = useParams(); // Get username from URL
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [externalStats, setExternalStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [contests, setContests] = useState([]);
  const [loadingContests, setLoadingContests] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  // Load initial data and listen for updates
  useEffect(() => {
    const loadStats = async () => {
      try {
        let data;
        if (username) {
          data = await getUserStatsByUsername(username);
        } else {
          // Use authenticated user's stats
          data = await getCurrentUserStats();
        }
        setStats(data);

        // Load Daily Challenge
        const challenge = await getDailyChallenge();
        setDailyChallenge(challenge);
      } catch (error) {
        console.error("Failed to load user stats", error);
        setError(error.message || "Failed to load data");
        if (error.response) {
          if (error.response.status === 401) {
            navigate('/login');
          } else if (error.response.data && error.response.data.error) {
            setError(error.response.data.error);
          }
        }
      }
    };

    loadStats(); // Initial load

    // Listen for custom event to update UI when stats change (e.g. from other tabs or components)
    window.addEventListener('statsUpdated', loadStats);
    
    // Auto-refresh dashboard every 30 seconds
    const refreshInterval = setInterval(loadStats, 30000);

    const savedStats = localStorage.getItem('externalStatsCache');
    if (savedStats) setExternalStats(JSON.parse(savedStats));

    return () => {
      window.removeEventListener('statsUpdated', loadStats);
      clearInterval(refreshInterval);
    };
  }, [username]);

  // Fetch Real Contests
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch('https://kontests.net/api/v1/all');
        const data = await response.json();
        const relevantSites = ['LeetCode', 'CodeForces', 'CodeChef'];
        const upcoming = data
          .filter(c => relevantSites.includes(c.site) && c.status === "BEFORE")
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 3);
        setContests(upcoming);
      } catch (error) {
        console.error("Failed to fetch contests", error);
      } finally {
        setLoadingContests(false);
      }
    };
    fetchContests();
  }, []);

  const handleSync = async () => {
    if (!stats) return;

    // Strict Verification Check
    const unverified = [];
    if (stats.leetcode_handle && !stats.is_leetcode_verified) unverified.push("LeetCode");
    if (stats.codechef_handle && !stats.is_codechef_verified) unverified.push("CodeChef");
    if (stats.codeforces_handle && !stats.is_codeforces_verified) unverified.push("CodeForces");
    if (stats.hackerrank_handle && !stats.is_hackerrank_verified) unverified.push("HackerRank");

    if (unverified.length > 0) {
      alert(`Please verify your account(s) for ${unverified.join(", ")} in Profile Settings before syncing.`);
      return;
    }

    setIsSyncing(true);
    // Use handles from stats (which come from DB/Profile)
    const handles = {
      leetcode: stats.leetcode_handle,
      codechef: stats.codechef_handle,
      codeforces: stats.codeforces_handle,
      hackerrank: stats.hackerrank_handle,
    };

    const newStats = await syncAllStats(handles);
    setExternalStats(newStats);
    localStorage.setItem('externalStatsCache', JSON.stringify(newStats));
    setIsSyncing(false);
  };


  const handleSimulateSolve = async () => {
    if (!stats) return;
    const newStats = {
      ...stats,
      problemsSolved: stats.problemsSolved + 1,
      recentSubmissions: [
        { id: Date.now(), title: "Random Problem #" + Math.floor(Math.random() * 1000), status: "Solved", date: new Date().toISOString().split('T')[0] },
        ...stats.recentSubmissions.slice(0, 2)
      ]
    };
    const updated = await updateUserStats(newStats);
    setStats(updated);
    alert("Problem Solved! Stats updated dynamically.");
  };

  // Map backend skill stats to Recharts format
  // Data format from backend: { topic: "Name", solved: N, total: M }
  // Recharts needs: { subject: "Name", A: solved, fullMark: total }
  const radarData = stats?.skillStats?.map(item => ({
    subject: item.topic,
    A: item.solved,
    B: Math.floor(item.solved * 0.7), // Global average (70% of user's performance as comparison)
    fullMark: item.total
  })) || [];

  // Logic to calculate unified stats
  const getUnifiedStats = () => {
    if (!stats) return null;

    const codenestSolved = stats.problemsSolved || 0;
    const leetcodeSolved = externalStats?.leetcode?.totalSolved || 0;
    const codechefSolved = externalStats?.codechef?.totalSolved || 0;

    return {
      totalSolved: codenestSolved + leetcodeSolved + codechefSolved,
      overallAccuracy: stats.accuracy,
      combinedStreak: stats.activeDays,
      bestRank: Math.min(stats.rank, externalStats?.leetcode?.ranking || 9999999, externalStats?.codechef?.globalRank || 9999999)
    };
  };

  const unified = getUnifiedStats();

  return (
    <div className="animate-fade-in">
      <Navbar />
      <div className="dashboard">
        {error ? (
          <div className="dashboard-error-container" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-primary)' }}>
            <h2 style={{ color: '#ef4444' }}>Unable to Load Dashboard</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="solve-btn-primary" style={{ marginTop: '20px' }}>
              Try Again
            </button>
          </div>
        ) : !stats ? (
          <div className="dashboard-skeleton">
            <div className="skeleton" style={{ height: '48px', width: '300px', marginBottom: '20px' }}></div>
            <div className="skeleton" style={{ height: '24px', width: '500px', marginBottom: '40px' }}></div>
            <div className="stats-cards">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-effect stat-card" style={{ height: '150px' }}>
                  <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '20px' }}></div>
                  <div className="skeleton" style={{ height: '40px', width: '40%' }}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="dashboard-header-container">
              <div className="dashboard-title">
                <h1>Unified Dashboard: {username || localStorage.getItem('username') || 'User'}👋</h1>
                <p>Analyzing performance across <strong>CodeNest, LeetCode, & more</strong></p>
              </div>
              <div className="dashboard-actions">
                <button
                  onClick={handleSync}
                  className={`sync-button magnetic-hover ${isSyncing ? 'syncing' : ''}`}
                  disabled={isSyncing}
                >
                  <RefreshCw size={18} /> {isSyncing ? 'Syncing...' : 'Sync Global Stats'}
                </button>
                <button onClick={() => navigate("/profile")} className="profile-button">View Profile</button>
              </div>
            </div>

            <div className="stats-cards">
              <div className="card scroll-reveal">
                <div className="card-icon solved"><Zap size={20} /></div>
                <h2>Total Aggregate Solved</h2>
                <p>{unified?.totalSolved || stats.problemsSolved}</p>
                <span className="card-trend">Aggregated from all linked platforms</span>
              </div>
              <div className="card accuracy scroll-reveal">
                <div className="card-icon accuracy"><Star size={20} /></div>
                <h2>Global Reliability</h2>
                <p>{externalStats?.leetcode?.acceptanceRate || stats.accuracy}%</p>
                <span className="card-trend text-blue">Across Platforms</span>
              </div>
              <div className="card streak scroll-reveal">
                <div className="card-icon streak"><Calendar size={20} /></div>
                <h2>Active Discipline</h2>
                <p>{stats.activeDays}</p>
                <span className="card-trend">Consistency Level</span>
              </div>
              <div className="card rank scroll-reveal">
                <div className="card-icon rank"><Trophy size={20} /></div>
                <h2>Peak Global Rank</h2>
                <p>#{unified?.bestRank?.toLocaleString()}</p>
                <span className="card-trend">Top Performance</span>
              </div>
            </div>

            <section className="external-stats-section scroll-reveal">
              <div className="section-header">
                <Globe size={20} className="section-icon" />
                <h3>Global Platform Performance</h3>
              </div>
              {!externalStats && !isSyncing ? (
                <div className="empty-stats-placeholder glass-effect">
                  <p>Sync your accounts to see real-time performance from LeetCode, CodeChef, and Codeforces.</p>
                  <button onClick={handleSync} className="refresh-btn">Fetch Real Stats</button>
                </div>
              ) : (
                <div className="external-stats-grid">
                  {/* LeetCode Card */}
                  <div className="glass-effect external-card leetcode">
                    <div className="platform-header">
                      <div className="platform-logo-wrap leetcode-logo">
                        <img src="https://cdn.simpleicons.org/leetcode/FFA116" alt="LeetCode" width="32" height="32" />
                      </div>
                      <span>LeetCode</span>
                    </div>
                    <div className="platform-body">
                      <div className="p-stat">
                        <span className="p-label">Total Solved</span>
                        <span className="p-value">{externalStats?.leetcode?.totalSolved ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Easy</span>
                        <span className="p-value" style={{ color: '#22c55e' }}>{externalStats?.leetcode?.easySolved ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Medium</span>
                        <span className="p-value" style={{ color: '#f59e0b' }}>{externalStats?.leetcode?.mediumSolved ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Hard</span>
                        <span className="p-value" style={{ color: '#ef4444' }}>{externalStats?.leetcode?.hardSolved ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Contest Rating</span>
                        <span className="p-value">{externalStats?.leetcode?.contestRating || '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Contest Rank</span>
                        <span className="p-value">#{externalStats?.leetcode?.contestGlobalRanking?.toLocaleString() || '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Contests</span>
                        <span className="p-value">{externalStats?.leetcode?.contestsAttended || '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Top %</span>
                        <span className="p-value">{externalStats?.leetcode?.topPercentage ? `${externalStats.leetcode.topPercentage}%` : '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Global Rank</span>
                        <span className="p-value">#{externalStats?.leetcode?.ranking?.toLocaleString() ?? '--'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CodeChef Card */}
                  <div className="glass-effect external-card codechef">
                    <div className="platform-header">
                      <div className="platform-logo-wrap codechef-logo">
                        <img src="https://cdn.simpleicons.org/codechef/5B4638" alt="CodeChef" width="32" height="32" />
                      </div>
                      <span>CodeChef</span>
                    </div>
                    <div className="platform-body">
                      <div className="p-stat">
                        <span className="p-label">Rating</span>
                        <span className="p-value">{externalStats?.codechef?.currentRating ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Highest</span>
                        <span className="p-value">{externalStats?.codechef?.highestRating ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Stars</span>
                        <span className="p-value">{externalStats?.codechef?.stars ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Solved</span>
                        <span className="p-value">{externalStats?.codechef?.totalSolved ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Contests</span>
                        <span className="p-value">{externalStats?.codechef?.contestsParticipated ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Global Rank</span>
                        <span className="p-value">#{externalStats?.codechef?.globalRank ?? '--'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Codeforces Card */}
                  <div className="glass-effect external-card codeforces">
                    <div className="platform-header">
                      <div className="platform-logo-wrap codeforces-logo">
                        <img src="https://cdn.simpleicons.org/codeforces/1F8ACB" alt="Codeforces" width="32" height="32" />
                      </div>
                      <span>Codeforces</span>
                    </div>
                    <div className="platform-body">
                      <div className="p-stat">
                        <span className="p-label">Rank</span>
                        <span className="p-value" style={{ textTransform: 'capitalize' }}>{externalStats?.codeforces?.rank ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Rating</span>
                        <span className="p-value">{externalStats?.codeforces?.rating ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Max Rating</span>
                        <span className="p-value">{externalStats?.codeforces?.maxRating ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Max Rank</span>
                        <span className="p-value" style={{ textTransform: 'capitalize' }}>{externalStats?.codeforces?.maxRank ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Contribution</span>
                        <span className="p-value">{externalStats?.codeforces?.contribution ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Organization</span>
                        <span className="p-value" style={{ fontSize: '0.75rem' }}>{externalStats?.codeforces?.organization || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* HackerRank Card */}
                  <div className="glass-effect external-card hackerrank">
                    <div className="platform-header">
                      <div className="platform-logo-wrap hackerrank-logo">
                        <img src="https://cdn.simpleicons.org/hackerrank/2EC866" alt="HackerRank" width="32" height="32" />
                      </div>
                      <span>HackerRank</span>
                    </div>
                    <div className="platform-body">
                      <div className="p-stat">
                        <span className="p-label">Total Score</span>
                        <span className="p-value">{externalStats?.hackerrank?.totalScore ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Stars</span>
                        <span className="p-value">{externalStats?.hackerrank?.stars ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Badges</span>
                        <span className="p-value">{externalStats?.hackerrank?.badges ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Tracks</span>
                        <span className="p-value">{externalStats?.hackerrank?.tracks ?? '--'}</span>
                      </div>
                      <div className="p-stat">
                        <span className="p-label">Certificates</span>
                        <span className="p-value">{externalStats?.hackerrank?.certificates ?? '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="dashboard-main-grid">
              <section className="left-panel">
                <div className="daily-challenge-card glass-effect scroll-reveal">
                  {dailyChallenge ? (
                    <>
                      <div className="challenge-info">
                        <span className="badge">Daily Challenge</span>
                        <h3>{dailyChallenge.title}</h3>
                        <div className="challenge-meta">
                          <span className={`difficulty ${dailyChallenge.difficulty.toLowerCase()}`}>{dailyChallenge.difficulty}</span>
                          <span>•</span>
                          <span>{dailyChallenge.topic}</span>
                        </div>
                      </div>
                      <a href={dailyChallenge.url} target="_blank" rel="noopener noreferrer" className="solve-btn-primary magnetic-hover" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Solve Now <ArrowRight size={18} />
                      </a>
                    </>
                  ) : (
                    <div className="challenge-info">Loading Daily Challenge...</div>
                  )}
                </div>

                <ActivityHeatmap userId={stats?.user_profile?.user?.id} />

                <section className="recent-activity scroll-reveal">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {stats.recentSubmissions.map((sub) => (
                      <div key={sub.id} className="activity-item">
                        <div className="activity-main">
                          <span className="activity-title">{sub.title}</span>
                          <span className="date">{sub.date}</span>
                        </div>
                        <span className={`status ${sub.status.toLowerCase()}`}>{sub.status}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </section>

              <aside className="right-panel">
                <div className="skills-card glass-effect scroll-reveal">
                  <h3>Skill Analysis</h3>
                  <div className="radar-container" style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="var(--glass-border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <Radar
                          name="CodeNest"
                          dataKey="A"
                          stroke="var(--primary-color)"
                          fill="var(--primary-color)"
                          fillOpacity={0.4}
                        />
                        <Radar
                          name="Global Avg"
                          dataKey="B"
                          stroke="var(--secondary-color)"
                          fill="var(--secondary-color)"
                          fillOpacity={0.4}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="upcoming-contests-card glass-effect scroll-reveal">
                  <div className="card-header-flex">
                    <h3>Upcoming Contests</h3>
                    <button className="view-all-link" onClick={() => navigate('/contests')}>View all</button>
                  </div>

                  {loadingContests ? (
                    <div className="loading-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                      <Loader className="animate-spin" size={24} />
                    </div>
                  ) : contests.length > 0 ? (
                    contests.map((contest, index) => (
                      <div key={index} className="contest-item-mini">
                        <div className="contest-date-mini">
                          <span>{new Date(contest.start_time).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                          <strong>{new Date(contest.start_time).getDate()}</strong>
                        </div>
                        <div className="contest-info-mini">
                          <h4>{contest.name}</h4>
                          <p>
                            {new Date(contest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            • {Math.round(contest.duration / 60)} Min
                            <br />
                            <span style={{ fontSize: '0.8em', color: 'var(--primary-color)' }}>{contest.site}</span>
                          </p>
                        </div>
                        <a href={contest.url} target="_blank" rel="noopener noreferrer" className="contest-link-icon">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No upcoming contests found.
                    </div>
                  )}

                </div>

                <section className="topic-progress-card glass-effect scroll-reveal">
                  <h3>Curated Prep</h3>
                  <div className="topic-list">
                    {stats.topicProgress.slice(0, 3).map((tp) => (
                      <div key={tp.topic} className="topic-item">
                        <div className="topic-info">
                          <span>{tp.topic}</span>
                          <span>{tp.total > 0 ? Math.round((tp.solved / tp.total) * 100) : 0}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${tp.total > 0 ? (tp.solved / tp.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="roadmap-btn-link" onClick={() => navigate('/roadmap')}>Check Learning Roadmap →</button>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
export default Dashboard;
