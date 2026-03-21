import React, { useState, useEffect, useCallback } from 'react';
import { fetchLeetCodeStats, fetchCodeforcesStats, fetchCodeChefStats } from '../services/externalStats';
import { exportToCSV } from '../services/mentorReports';
import '../styles1/Scoreboard.css';

// ── Score formula ──────────────────────────────────────────────────────────────
// LeetCode  : easy*5 + medium*10 + hard*20 + floor(rating/100)*5
// CodeChef  : problems_solved*8 + floor(rating/100)*6
// Codeforces: problems_solved*8 + floor(rating/100)*7
// CoderNest : direct from backend (difficulty-based points)
// Total     = sum of all four

function calcLCScore(lc) {
  if (!lc) return 0;
  return (lc.easySolved || 0) * 5
    + (lc.mediumSolved || 0) * 10
    + (lc.hardSolved || 0) * 20
    + Math.floor((lc.contestRating || 0) / 100) * 5;
}

function calcCCScore(cc) {
  if (!cc) return 0;
  return (cc.totalSolved || 0) * 8
    + Math.floor((cc.currentRating || 0) / 100) * 6;
}

function calcCFScore(cf) {
  if (!cf) return 0;
  return (cf.problemsSolved || 0) * 8
    + Math.floor((cf.rating || 0) / 100) * 7;
}

function calcHRScore(_hr) {
  return 0;
}

// ── Sub-components ─────────────────────────────────────────────────────────────
const PlatformCell = ({ data, loading, handle, verified }) => {
  if (!handle) return <td className="sb-cell sb-no-handle" colSpan={5}>—</td>;
  if (loading) return <td className="sb-cell sb-loading" colSpan={5}>⏳</td>;
  if (!data) return <td className="sb-cell sb-error" colSpan={5}>N/A</td>;
  return (
    <>
      <td className="sb-cell">{data.totalSolved ?? data.problemsSolved ?? '—'}</td>
      <td className="sb-cell sb-easy">{data.easySolved ?? '—'}</td>
      <td className="sb-cell sb-medium">{data.mediumSolved ?? '—'}</td>
      <td className="sb-cell sb-hard">{data.hardSolved ?? '—'}</td>
      <td className="sb-cell sb-rating">{data.contestRating ?? data.rating ?? '—'}</td>
    </>
  );
};

const SORT_KEYS = ['rank', 'name', 'total', 'codenest', 'lc', 'cc', 'cf'];

// ── Main Component ─────────────────────────────────────────────────────────────
const Scoreboard = ({ fullPage = false }) => {
  const [students, setStudents] = useState([]);
  const [platformStats, setPlatformStats] = useState({});   // { userId: { lc, cc, cf } }
  const [loadingPlatform, setLoadingPlatform] = useState({}); // { userId: { lc, cc, cf } }
  const [baseLoading, setBaseLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Fetch base student list
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/scoreboard/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
        setBaseLoading(false);
      })
      .catch(() => setBaseLoading(false));
  }, []);

  // Fetch platform stats for each student lazily
  useEffect(() => {
    if (!students.length) return;

    students.forEach(s => {
      const uid = s.id;

      // LeetCode
      if (s.leetcode_handle && s.leetcode_verified) {
        setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], lc: true } }));
        fetchLeetCodeStats(s.leetcode_handle).then(data => {
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], lc: data } }));
          setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], lc: false } }));
        });
      }

      // CodeChef
      if (s.codechef_handle && s.codechef_verified) {
        setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], cc: true } }));
        fetchCodeChefStats(s.codechef_handle).then(data => {
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], cc: data } }));
          setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], cc: false } }));
        });
      }

      // Codeforces
      if (s.codeforces_handle && s.codeforces_verified) {
        setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], cf: true } }));
        fetchCodeforcesStats(s.codeforces_handle).then(data => {
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], cf: data } }));
          setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], cf: false } }));
        });
      }

      // HackerRank — removed (no public API available)
    });
  }, [students]);

  // Enrich students with computed scores
  const enriched = students.map(s => {
    const uid = s.id;
    const ps = platformStats[uid] || {};
    const lcScore = calcLCScore(ps.lc);
    const ccScore = calcCCScore(ps.cc);
    const cfScore = calcCFScore(ps.cf);
    const hrScore = calcHRScore(ps.hr);
    const total = s.codenest.score + lcScore + ccScore + cfScore + hrScore;
    return { ...s, lcScore, ccScore, cfScore, hrScore, total };
  });

  // Filter
  const filtered = enriched.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
      || s.username.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'all' || s.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    switch (sortKey) {
      case 'name':    av = a.name; bv = b.name; break;
      case 'codenest': av = a.codenest.score; bv = b.codenest.score; break;
      case 'lc':      av = a.lcScore; bv = b.lcScore; break;
      case 'cc':      av = a.ccScore; bv = b.ccScore; break;
      case 'cf':      av = a.cfScore; bv = b.cfScore; break;
      case 'hr':      av = a.hrScore; bv = b.hrScore; break;
      default:        av = a.total; bv = b.total;
    }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <span className="sb-sort-icon">↕</span>;
    return <span className="sb-sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const branches = [...new Set(students.map(s => s.branch).filter(Boolean))];

  const handleExport = () => {
    const rows = sorted.map((s, idx) => ({
      Rank: idx + 1,
      Name: s.name,
      Username: s.username,
      Branch: s.branch,
      Batch: s.batch,
      TotalScore: s.total,
      CoderNest_Score: s.codenest.score,
      CoderNest_Solved: s.codenest.solved,
      CoderNest_Easy: s.codenest.easy,
      CoderNest_Medium: s.codenest.medium,
      CoderNest_Hard: s.codenest.hard,
      LeetCode_Handle: s.leetcode_handle || '—',
      LeetCode_Score: s.lcScore,
      LeetCode_Solved: platformStats[s.id]?.lc?.totalSolved ?? '—',
      LeetCode_Easy: platformStats[s.id]?.lc?.easySolved ?? '—',
      LeetCode_Medium: platformStats[s.id]?.lc?.mediumSolved ?? '—',
      LeetCode_Hard: platformStats[s.id]?.lc?.hardSolved ?? '—',
      LeetCode_Rating: platformStats[s.id]?.lc?.contestRating ?? '—',
      CodeChef_Handle: s.codechef_handle || '—',
      CodeChef_Score: s.ccScore,
      CodeChef_Solved: platformStats[s.id]?.cc?.totalSolved ?? '—',
      CodeChef_Rating: platformStats[s.id]?.cc?.currentRating ?? '—',
      Codeforces_Handle: s.codeforces_handle || '—',
      Codeforces_Score: s.cfScore,
      Codeforces_Solved: platformStats[s.id]?.cf?.problemsSolved ?? '—',
      Codeforces_Rating: platformStats[s.id]?.cf?.rating ?? '—',
      HackerRank_Handle: s.hackerrank_handle || '—',
      HackerRank_Score: s.hrScore,
      HackerRank_TotalScore: platformStats[s.id]?.hr?.totalScore ?? '—',
      HackerRank_Badges: platformStats[s.id]?.hr?.badges ?? '—',
      HackerRank_Stars: platformStats[s.id]?.hr?.stars ?? '—',
    }));
    exportToCSV(rows, `Scoreboard_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
  };

  if (baseLoading) {
    return <div className="sb-loading-full">Loading scoreboard...</div>;
  }

  return (
    <div className="scoreboard-wrapper">
      {/* Controls */}
      <div className="sb-controls">
        <input
          className="sb-search"
          placeholder="Search student..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="sb-filter"
          value={branchFilter}
          onChange={e => { setBranchFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className="sb-count">{filtered.length} students</span>
        <button className="sb-export-btn" onClick={handleExport}>⬇ Export CSV</button>
      </div>

      {/* Formula legend */}
      <div className="sb-formula">
        <span>Score Formula:</span>
        <span className="sb-tag cn">CoderNest = difficulty pts</span>
        <span className="sb-tag lc">LeetCode = E×5 + M×10 + H×20 + ⌊rating/100⌋×5</span>
        <span className="sb-tag cc">CodeChef = solved×8 + ⌊rating/100⌋×6</span>
        <span className="sb-tag cf">Codeforces = solved×8 + ⌊rating/100⌋×7</span>
        <span className="sb-tag" style={{ background: '#2ec86622', color: '#2ec866' }}>HackerRank = score + badges×5</span>
      </div>

      {/* Table */}
      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr className="sb-header-main">
              <th rowSpan={2} className="sb-th sticky-col" onClick={() => handleSort('rank')}>#<SortIcon k="rank" /></th>
              <th rowSpan={2} className="sb-th sticky-col2" onClick={() => handleSort('name')}>Student<SortIcon k="name" /></th>
              <th rowSpan={2} className="sb-th" onClick={() => handleSort('total')}>Total Score<SortIcon k="total" /></th>
              <th colSpan={5} className="sb-th sb-platform-header cn-header">CoderNest</th>
              <th colSpan={5} className="sb-th sb-platform-header lc-header">LeetCode</th>
              <th colSpan={5} className="sb-th sb-platform-header cc-header">CodeChef</th>
              <th colSpan={5} className="sb-th sb-platform-header cf-header">Codeforces</th>
              <th colSpan={3} className="sb-th sb-platform-header" style={{ background: '#2ec86622', color: '#2ec866' }}>HackerRank</th>
            </tr>
            <tr className="sb-header-sub">
              {/* CoderNest sub-cols */}
              <th className="sb-th sb-sub">Score</th>
              <th className="sb-th sb-sub">Solved</th>
              <th className="sb-th sb-sub sb-easy">Easy</th>
              <th className="sb-th sb-sub sb-medium">Med</th>
              <th className="sb-th sb-sub sb-hard">Hard</th>
              {/* LeetCode sub-cols */}
              <th className="sb-th sb-sub">Solved</th>
              <th className="sb-th sb-sub sb-easy">Easy</th>
              <th className="sb-th sb-sub sb-medium">Med</th>
              <th className="sb-th sb-sub sb-hard">Hard</th>
              <th className="sb-th sb-sub sb-rating">Rating</th>
              {/* CodeChef sub-cols */}
              <th className="sb-th sb-sub">Solved</th>
              <th className="sb-th sb-sub sb-easy">Easy</th>
              <th className="sb-th sb-sub sb-medium">Med</th>
              <th className="sb-th sb-sub sb-hard">Hard</th>
              <th className="sb-th sb-sub sb-rating">Rating</th>
              {/* Codeforces sub-cols */}
              <th className="sb-th sb-sub">Solved</th>
              <th className="sb-th sb-sub sb-easy">Easy</th>
              <th className="sb-th sb-sub sb-medium">Med</th>
              <th className="sb-th sb-sub sb-hard">Hard</th>
              <th className="sb-th sb-sub sb-rating">Rating</th>
              {/* HackerRank sub-cols */}
              <th className="sb-th sb-sub">Score</th>
              <th className="sb-th sb-sub">Badges</th>
              <th className="sb-th sb-sub sb-rating">Stars</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
              const uid = s.id;
              const ps = platformStats[uid] || {};
              const lp = loadingPlatform[uid] || {};
              const lcData = ps.lc;
              const ccData = ps.cc;
              const cfData = ps.cf;
              const hrData = ps.hr;

              return (
                <tr key={uid} className={`sb-row ${rank <= 3 ? `sb-top${rank}` : ''}`}>
                  <td className="sb-cell sticky-col sb-rank">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </td>
                  <td className="sb-cell sticky-col2 sb-name-cell">
                    <img src={s.avatar} alt="" className="sb-avatar" />
                    <div>
                      <div className="sb-student-name">{s.name}</div>
                      <div className="sb-student-meta">{s.branch} · {s.batch}</div>
                    </div>
                  </td>
                  <td className="sb-cell sb-total-score">{s.total}</td>

                  {/* CoderNest */}
                  <td className="sb-cell sb-cn-score">{s.codenest.score}</td>
                  <td className="sb-cell">{s.codenest.solved}</td>
                  <td className="sb-cell sb-easy">{s.codenest.easy}</td>
                  <td className="sb-cell sb-medium">{s.codenest.medium}</td>
                  <td className="sb-cell sb-hard">{s.codenest.hard}</td>

                  {/* LeetCode */}
                  {s.leetcode_handle && s.leetcode_verified ? (
                    lp.lc ? (
                      <td className="sb-cell sb-loading" colSpan={5}>⏳</td>
                    ) : lcData ? (
                      <>
                        <td className="sb-cell">{lcData.totalSolved}</td>
                        <td className="sb-cell sb-easy">{lcData.easySolved}</td>
                        <td className="sb-cell sb-medium">{lcData.mediumSolved}</td>
                        <td className="sb-cell sb-hard">{lcData.hardSolved}</td>
                        <td className="sb-cell sb-rating">{lcData.contestRating || '—'}</td>
                      </>
                    ) : (
                      <td className="sb-cell sb-error" colSpan={5}>N/A</td>
                    )
                  ) : (
                    <td className="sb-cell sb-no-handle" colSpan={5}>
                      {s.leetcode_handle ? '⚠ unverified' : '—'}
                    </td>
                  )}

                  {/* CodeChef */}
                  {s.codechef_handle && s.codechef_verified ? (
                    lp.cc ? (
                      <td className="sb-cell sb-loading" colSpan={5}>⏳</td>
                    ) : ccData ? (
                      <>
                        <td className="sb-cell">{ccData.totalSolved ?? '—'}</td>
                        <td className="sb-cell sb-easy">—</td>
                        <td className="sb-cell sb-medium">—</td>
                        <td className="sb-cell sb-hard">—</td>
                        <td className="sb-cell sb-rating">{ccData.currentRating ?? '—'}</td>
                      </>
                    ) : (
                      <td className="sb-cell sb-error" colSpan={5}>N/A</td>
                    )
                  ) : (
                    <td className="sb-cell sb-no-handle" colSpan={5}>
                      {s.codechef_handle ? '⚠ unverified' : '—'}
                    </td>
                  )}

                  {/* Codeforces */}
                  {s.codeforces_handle && s.codeforces_verified ? (
                    lp.cf ? (
                      <td className="sb-cell sb-loading" colSpan={5}>⏳</td>
                    ) : cfData ? (
                      <>
                        <td className="sb-cell">{cfData.problemsSolved ?? '—'}</td>
                        <td className="sb-cell sb-easy">—</td>
                        <td className="sb-cell sb-medium">—</td>
                        <td className="sb-cell sb-hard">—</td>
                        <td className="sb-cell sb-rating">{cfData.rating ?? '—'}</td>
                      </>
                    ) : (
                      <td className="sb-cell sb-error" colSpan={5}>N/A</td>
                    )
                  ) : (
                    <td className="sb-cell sb-no-handle" colSpan={5}>
                      {s.codeforces_handle ? '⚠ unverified' : '—'}
                    </td>
                  )}

                  {/* HackerRank */}
                  {s.hackerrank_handle && s.hackerrank_verified ? (
                    lp.hr ? (
                      <td className="sb-cell sb-loading" colSpan={3}>⏳</td>
                    ) : hrData ? (
                      <>
                        <td className="sb-cell">{hrData.totalScore ?? '—'}</td>
                        <td className="sb-cell">{hrData.badges ?? '—'}</td>
                        <td className="sb-cell sb-rating">{hrData.stars ?? '—'}</td>
                      </>
                    ) : (
                      <td className="sb-cell sb-error" colSpan={3}>N/A</td>
                    )
                  ) : (
                    <td className="sb-cell sb-no-handle" colSpan={3}>
                      {s.hackerrank_handle ? '⚠ unverified' : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={26} className="sb-empty">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="sb-pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
