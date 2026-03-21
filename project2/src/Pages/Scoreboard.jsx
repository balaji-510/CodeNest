import React, { useState, useEffect } from 'react';
import { fetchLeetCodeStats, fetchCodeChefStats } from '../services/externalStats';
import { exportToCSV } from '../services/mentorReports';
import '../styles1/Scoreboard.css';

// ── Score formula ──────────────────────────────────────────────────────────────
// LeetCode  : easy*5 + medium*10 + hard*20 + floor(rating/100)*5
// CodeChef  : problems_solved*8 + floor(rating/100)*6
// CoderNest : direct from backend (difficulty-based points)
// Total     = sum of all three

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

// ── Main Component ─────────────────────────────────────────────────────────────
const Scoreboard = () => {
  const [students, setStudents] = useState([]);
  const [platformStats, setPlatformStats] = useState({});
  const [loadingPlatform, setLoadingPlatform] = useState({});
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

  // Fetch platform stats for each student
  useEffect(() => {
    if (!students.length) return;
    students.forEach(s => {
      const uid = s.id;
      if (s.leetcode_handle && s.leetcode_verified) {
        setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], lc: true } }));
        fetchLeetCodeStats(s.leetcode_handle).then(data => {
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], lc: data } }));
          setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], lc: false } }));
        });
      }
      if (s.codechef_handle && s.codechef_verified) {
        setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], cc: true } }));
        fetchCodeChefStats(s.codechef_handle).then(data => {
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], cc: data } }));
          setLoadingPlatform(prev => ({ ...prev, [uid]: { ...prev[uid], cc: false } }));
        });
      }
    });
  }, [students]);

  // Enrich students with computed scores + flat sort fields
  const enriched = students.map(s => {
    const uid = s.id;
    const ps = platformStats[uid] || {};
    const lcScore = calcLCScore(ps.lc);
    const ccScore = calcCCScore(ps.cc);
    const total = s.codenest.score + lcScore + ccScore;
    return {
      ...s,
      lcScore,
      ccScore,
      total,
      // flat fields for sub-column sorting
      cn_score:   s.codenest.score,
      cn_solved:  s.codenest.solved,
      cn_easy:    s.codenest.easy,
      cn_medium:  s.codenest.medium,
      cn_hard:    s.codenest.hard,
      lc_solved:  ps.lc?.totalSolved  ?? -1,
      lc_easy:    ps.lc?.easySolved   ?? -1,
      lc_medium:  ps.lc?.mediumSolved ?? -1,
      lc_hard:    ps.lc?.hardSolved   ?? -1,
      lc_rating:  ps.lc?.contestRating ?? -1,
      cc_solved:  ps.cc?.totalSolved  ?? -1,
      cc_rating:  ps.cc?.currentRating ?? -1,
    };
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
      case 'name':      av = a.name; bv = b.name; break;
      case 'codenest':  av = a.cn_score; bv = b.cn_score; break;
      case 'cn_solved': av = a.cn_solved; bv = b.cn_solved; break;
      case 'cn_easy':   av = a.cn_easy; bv = b.cn_easy; break;
      case 'cn_medium': av = a.cn_medium; bv = b.cn_medium; break;
      case 'cn_hard':   av = a.cn_hard; bv = b.cn_hard; break;
      case 'lc':        av = a.lcScore; bv = b.lcScore; break;
      case 'lc_solved': av = a.lc_solved; bv = b.lc_solved; break;
      case 'lc_easy':   av = a.lc_easy; bv = b.lc_easy; break;
      case 'lc_medium': av = a.lc_medium; bv = b.lc_medium; break;
      case 'lc_hard':   av = a.lc_hard; bv = b.lc_hard; break;
      case 'lc_rating': av = a.lc_rating; bv = b.lc_rating; break;
      case 'cc':        av = a.ccScore; bv = b.ccScore; break;
      case 'cc_solved': av = a.cc_solved; bv = b.cc_solved; break;
      case 'cc_rating': av = a.cc_rating; bv = b.cc_rating; break;
      default:          av = a.total; bv = b.total;
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
      LeetCode_Solved: s.lc_solved >= 0 ? s.lc_solved : '—',
      LeetCode_Easy: s.lc_easy >= 0 ? s.lc_easy : '—',
      LeetCode_Medium: s.lc_medium >= 0 ? s.lc_medium : '—',
      LeetCode_Hard: s.lc_hard >= 0 ? s.lc_hard : '—',
      LeetCode_Rating: s.lc_rating >= 0 ? s.lc_rating : '—',
      CodeChef_Handle: s.codechef_handle || '—',
      CodeChef_Score: s.ccScore,
      CodeChef_Solved: s.cc_solved >= 0 ? s.cc_solved : '—',
      CodeChef_Rating: s.cc_rating >= 0 ? s.cc_rating : '—',
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
              <th colSpan={2} className="sb-th sb-platform-header cc-header">CodeChef</th>
            </tr>
            <tr className="sb-header-sub">
              {/* CoderNest sub-cols */}
              <th className="sb-th sb-sub sb-sortable" onClick={() => handleSort('codenest')}>Score<SortIcon k="codenest" /></th>
              <th className="sb-th sb-sub sb-sortable" onClick={() => handleSort('cn_solved')}>Solved<SortIcon k="cn_solved" /></th>
              <th className="sb-th sb-sub sb-easy sb-sortable" onClick={() => handleSort('cn_easy')}>Easy<SortIcon k="cn_easy" /></th>
              <th className="sb-th sb-sub sb-medium sb-sortable" onClick={() => handleSort('cn_medium')}>Med<SortIcon k="cn_medium" /></th>
              <th className="sb-th sb-sub sb-hard sb-sortable" onClick={() => handleSort('cn_hard')}>Hard<SortIcon k="cn_hard" /></th>
              {/* LeetCode sub-cols */}
              <th className="sb-th sb-sub sb-sortable" onClick={() => handleSort('lc_solved')}>Solved<SortIcon k="lc_solved" /></th>
              <th className="sb-th sb-sub sb-easy sb-sortable" onClick={() => handleSort('lc_easy')}>Easy<SortIcon k="lc_easy" /></th>
              <th className="sb-th sb-sub sb-medium sb-sortable" onClick={() => handleSort('lc_medium')}>Med<SortIcon k="lc_medium" /></th>
              <th className="sb-th sb-sub sb-hard sb-sortable" onClick={() => handleSort('lc_hard')}>Hard<SortIcon k="lc_hard" /></th>
              <th className="sb-th sb-sub sb-rating sb-sortable" onClick={() => handleSort('lc_rating')}>Rating<SortIcon k="lc_rating" /></th>
              {/* CodeChef sub-cols */}
              <th className="sb-th sb-sub sb-sortable" onClick={() => handleSort('cc_solved')}>Solved<SortIcon k="cc_solved" /></th>
              <th className="sb-th sb-sub sb-rating sb-sortable" onClick={() => handleSort('cc_rating')}>Rating<SortIcon k="cc_rating" /></th>
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
                      <td className="sb-cell sb-loading" colSpan={2}>⏳</td>
                    ) : ccData ? (
                      <>
                        <td className="sb-cell">{ccData.totalSolved ?? '—'}</td>
                        <td className="sb-cell sb-rating">{ccData.currentRating ?? '—'}</td>
                      </>
                    ) : (
                      <td className="sb-cell sb-error" colSpan={2}>N/A</td>
                    )
                  ) : (
                    <td className="sb-cell sb-no-handle" colSpan={2}>
                      {s.codechef_handle ? '⚠ unverified' : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={15} className="sb-empty">No students found.</td>
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
