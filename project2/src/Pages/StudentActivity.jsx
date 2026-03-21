import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { fetchLeetCodeStats, fetchCodeforcesStats, fetchCodeChefStats } from '../services/externalStats';
import { exportToCSV } from '../services/mentorReports';
import API_BASE from '../config';
import '../styles1/StudentActivity.css';

const INACTIVE_HOURS = 24;

// Risk level based on checkpoint misses
function getRiskLevel(student, checkpoints, platformStats) {
  if (!checkpoints.length) return null;
  const ps = platformStats[student.id] || {};

  let totalTargets = 0;
  let missed = 0;

  for (const cp of checkpoints) {
    // Filter by batch/branch
    if (cp.target_batch !== 'All' && cp.target_batch !== student.batch) continue;
    if (cp.target_branch !== 'All' && cp.target_branch !== student.branch) continue;

    const checks = [
      { target: cp.cn_problems, actual: student.codenest_solved },
      { target: cp.cn_score,    actual: student.codenest_score },
      { target: cp.lc_problems, actual: ps.lc?.totalSolved || 0 },
      { target: cp.lc_rating,   actual: ps.lc?.contestRating || 0 },
      { target: cp.cc_problems, actual: ps.cc?.totalSolved || 0 },
      { target: cp.cc_rating,   actual: ps.cc?.currentRating || 0 },
      { target: cp.cf_problems, actual: ps.cf?.problemsSolved || 0 },
      { target: cp.cf_rating,   actual: ps.cf?.rating || 0 },
    ];

    for (const { target, actual } of checks) {
      if (target > 0) {
        totalTargets++;
        if (actual < target) missed++;
      }
    }
  }

  if (totalTargets === 0) return null;
  const pct = missed / totalTargets;
  if (pct >= 0.7) return 'high';
  if (pct >= 0.4) return 'medium';
  if (pct > 0)    return 'low';
  return null;
}

const RISK_LABELS = { high: '🔴 High Risk', medium: '🟡 Medium Risk', low: '🟢 Low Risk' };
const RISK_COLORS = { high: '#f43f5e', medium: '#fbbf24', low: '#4ade80' };

// ── Checkpoint Modal ──────────────────────────────────────────────────────────
const CheckpointModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    title: '', description: '',
    cn_problems: '', cn_score: '',
    lc_problems: '', lc_rating: '',
    cc_problems: '', cc_rating: '',
    cf_problems: '', cf_rating: '',
    target_batch: 'All', target_branch: 'All',
    deadline: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="sa-modal glass-effect" onClick={e => e.stopPropagation()}>
        <div className="sa-modal-header">
          <h3>🎯 Set Checkpoint / Target</h3>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="sa-modal-form">
          <div className="sa-form-row">
            <label>Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Week 3 Target" />
          </div>
          <div className="sa-form-row">
            <label>Description</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional notes" />
          </div>

          <div className="sa-form-section">CoderNest Targets</div>
          <div className="sa-form-grid">
            <div className="sa-form-row"><label>Min Problems Solved</label><input type="number" min="0" value={form.cn_problems} onChange={e => set('cn_problems', e.target.value)} placeholder="0" /></div>
            <div className="sa-form-row"><label>Min Score</label><input type="number" min="0" value={form.cn_score} onChange={e => set('cn_score', e.target.value)} placeholder="0" /></div>
          </div>

          <div className="sa-form-section">LeetCode Targets</div>
          <div className="sa-form-grid">
            <div className="sa-form-row"><label>Min Problems</label><input type="number" min="0" value={form.lc_problems} onChange={e => set('lc_problems', e.target.value)} placeholder="0" /></div>
            <div className="sa-form-row"><label>Min Contest Rating</label><input type="number" min="0" value={form.lc_rating} onChange={e => set('lc_rating', e.target.value)} placeholder="0" /></div>
          </div>

          <div className="sa-form-section">CodeChef Targets</div>
          <div className="sa-form-grid">
            <div className="sa-form-row"><label>Min Problems</label><input type="number" min="0" value={form.cc_problems} onChange={e => set('cc_problems', e.target.value)} placeholder="0" /></div>
            <div className="sa-form-row"><label>Min Rating</label><input type="number" min="0" value={form.cc_rating} onChange={e => set('cc_rating', e.target.value)} placeholder="0" /></div>
          </div>

          <div className="sa-form-section">Codeforces Targets</div>
          <div className="sa-form-grid">
            <div className="sa-form-row"><label>Min Problems</label><input type="number" min="0" value={form.cf_problems} onChange={e => set('cf_problems', e.target.value)} placeholder="0" /></div>
            <div className="sa-form-row"><label>Min Rating</label><input type="number" min="0" value={form.cf_rating} onChange={e => set('cf_rating', e.target.value)} placeholder="0" /></div>
          </div>

          <div className="sa-form-section">Targeting</div>
          <div className="sa-form-grid">
            <div className="sa-form-row">
              <label>Batch</label>
              <select value={form.target_batch} onChange={e => set('target_batch', e.target.value)}>
                <option value="All">All</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div className="sa-form-row">
              <label>Branch</label>
              <select value={form.target_branch} onChange={e => set('target_branch', e.target.value)}>
                <option value="All">All</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <div className="sa-form-row">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>

          <div className="sa-modal-actions">
            <button type="button" className="sa-btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="sa-btn primary">Save Checkpoint</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentActivity = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const [students, setStudents] = useState([]);
  const [platformStats, setPlatformStats] = useState({});
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | inactive | active
  const [riskFilter, setRiskFilter] = useState('all');

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/student-activity/`, { headers: authHeaders }).then(r => r.json()),
      fetch(`${API_BASE}/api/checkpoints/`, { headers: authHeaders }).then(r => r.json()),
    ]).then(([actData, cpData]) => {
      setStudents(Array.isArray(actData) ? actData : []);
      setCheckpoints(Array.isArray(cpData) ? cpData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch platform stats lazily
  useEffect(() => {
    if (!students.length) return;
    students.forEach(s => {
      const uid = s.id;
      if (s.leetcode_handle && s.leetcode_verified) {
        fetchLeetCodeStats(s.leetcode_handle).then(d =>
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], lc: d } }))
        );
      }
      if (s.codechef_handle && s.codechef_verified) {
        fetchCodeChefStats(s.codechef_handle).then(d =>
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], cc: d } }))
        );
      }
      if (s.codeforces_handle && s.codeforces_verified) {
        fetchCodeforcesStats(s.codeforces_handle).then(d =>
          setPlatformStats(prev => ({ ...prev, [uid]: { ...prev[uid], cf: d } }))
        );
      }
    });
  }, [students]);

  const isInactive = (s) => {
    // Active if CoderNest submission within 24h
    if (s.hours_since_codenest !== null && s.hours_since_codenest <= INACTIVE_HOURS) return false;
    // Active if any platform has recent activity (we can't get exact timestamps from APIs,
    // so we treat "has a verified platform" as potentially active — teacher sees the raw data)
    // For now: inactive = no CoderNest submission in 24h AND no verified platform linked
    const hasAnyPlatform = (s.leetcode_handle && s.leetcode_verified)
      || (s.codechef_handle && s.codechef_verified)
      || (s.codeforces_handle && s.codeforces_verified);
    if (hasAnyPlatform) return false; // can't confirm inactivity if they have external platforms
    return true;
  };

  const enriched = students.map(s => ({
    ...s,
    inactive: isInactive(s),
    risk: getRiskLevel(s, checkpoints, platformStats),
  }));

  const filtered = enriched.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
      || s.username.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'all' || s.branch === branchFilter;
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'inactive' && s.inactive)
      || (statusFilter === 'active' && !s.inactive);
    const matchRisk = riskFilter === 'all' || s.risk === riskFilter;
    return matchSearch && matchBranch && matchStatus && matchRisk;
  });

  const inactiveCount = enriched.filter(s => s.inactive).length;
  const highRiskCount = enriched.filter(s => s.risk === 'high').length;

  const handleSaveCheckpoint = async (form) => {
    const res = await fetch(`${API_BASE}/api/checkpoints/`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const cp = await res.json();
      // Refetch checkpoints
      fetch(`${API_BASE}/api/checkpoints/`, { headers: authHeaders })
        .then(r => r.json()).then(d => setCheckpoints(Array.isArray(d) ? d : []));
    }
    setShowModal(false);
  };

  const handleDeleteCheckpoint = async (id) => {
    await fetch(`${API_BASE}/api/checkpoints/${id}/delete/`, {
      method: 'DELETE', headers: authHeaders,
    });
    setCheckpoints(prev => prev.filter(c => c.id !== id));
  };

  const handleExport = () => {
    const rows = filtered.map(s => ({
      Name: s.name,
      Username: s.username,
      Branch: s.branch,
      Batch: s.batch,
      Status: s.inactive ? 'Inactive' : 'Active',
      Risk: s.risk ? RISK_LABELS[s.risk] : 'On Track',
      CoderNest_Solved: s.codenest_solved,
      CoderNest_Score: s.codenest_score,
      Hours_Since_Last_CN_Submission: s.hours_since_codenest ?? 'Never',
      LeetCode: s.leetcode_handle || '—',
      CodeChef: s.codechef_handle || '—',
      Codeforces: s.codeforces_handle || '—',
    }));
    exportToCSV(rows, `StudentActivity_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
  };

  const branches = [...new Set(students.map(s => s.branch).filter(Boolean))];

  if (loading) return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)' }}>Loading activity data...</div>
    </div>
  );

  return (
    <div className="page animate-fade-in" style={{ minHeight: '100vh' }}>
      <Navbar />
      <main className="sa-main">
        {/* Header */}
        <div className="sa-header">
          <div>
            <h1>📊 Student <span style={{ color: 'var(--primary-color)' }}>Activity</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Inactivity = no CoderNest submission in the last 24 hours (or no verified external platform)
            </p>
          </div>
          <div className="sa-header-actions">
            <button className="sa-btn secondary" onClick={handleExport}>⬇ Export CSV</button>
            <button className="sa-btn primary" onClick={() => setShowModal(true)}>🎯 Set Checkpoint</button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="sa-summary">
          <div className="sa-summary-card">
            <span className="sa-summary-val">{enriched.length}</span>
            <span className="sa-summary-label">Total Students</span>
          </div>
          <div className="sa-summary-card inactive">
            <span className="sa-summary-val">{inactiveCount}</span>
            <span className="sa-summary-label">Inactive (24h)</span>
          </div>
          <div className="sa-summary-card risk">
            <span className="sa-summary-val">{highRiskCount}</span>
            <span className="sa-summary-label">High Risk</span>
          </div>
          <div className="sa-summary-card checkpoints">
            <span className="sa-summary-val">{checkpoints.length}</span>
            <span className="sa-summary-label">Active Checkpoints</span>
          </div>
        </div>

        {/* Active Checkpoints */}
        {checkpoints.length > 0 && (
          <section className="sa-checkpoints glass-effect">
            <h3>🎯 Active Checkpoints</h3>
            <div className="sa-cp-list">
              {checkpoints.map(cp => (
                <div key={cp.id} className="sa-cp-card glass-effect">
                  <div className="sa-cp-top">
                    <strong>{cp.title}</strong>
                    <button className="sa-cp-delete" onClick={() => handleDeleteCheckpoint(cp.id)}>✕</button>
                  </div>
                  {cp.description && <p className="sa-cp-desc">{cp.description}</p>}
                  <div className="sa-cp-targets">
                    {cp.cn_problems > 0 && <span className="sa-cp-tag cn">CN: {cp.cn_problems} solved</span>}
                    {cp.cn_score > 0 && <span className="sa-cp-tag cn">CN: {cp.cn_score} pts</span>}
                    {cp.lc_problems > 0 && <span className="sa-cp-tag lc">LC: {cp.lc_problems} solved</span>}
                    {cp.lc_rating > 0 && <span className="sa-cp-tag lc">LC: {cp.lc_rating} rating</span>}
                    {cp.cc_problems > 0 && <span className="sa-cp-tag cc">CC: {cp.cc_problems} solved</span>}
                    {cp.cc_rating > 0 && <span className="sa-cp-tag cc">CC: {cp.cc_rating} rating</span>}
                    {cp.cf_problems > 0 && <span className="sa-cp-tag cf">CF: {cp.cf_problems} solved</span>}
                    {cp.cf_rating > 0 && <span className="sa-cp-tag cf">CF: {cp.cf_rating} rating</span>}
                  </div>
                  <div className="sa-cp-meta">
                    {cp.target_branch !== 'All' && <span>Branch: {cp.target_branch}</span>}
                    {cp.target_batch !== 'All' && <span>Batch: {cp.target_batch}</span>}
                    {cp.deadline && <span>Due: {cp.deadline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="sa-filters">
          <input className="sa-search" placeholder="Search student..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <select className="sa-filter" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="sa-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
          </select>
          <select className="sa-filter" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <span className="sa-count">{filtered.length} students</span>
        </div>

        {/* Table */}
        <section className="sa-table-section glass-effect">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Last CN Submission</th>
                <th>CN Solved</th>
                <th>CN Score</th>
                <th>Platforms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className={s.inactive ? 'sa-row-inactive' : ''}>
                  <td>
                    <div className="sa-student-cell">
                      <img src={s.avatar} alt="" className="sa-avatar" />
                      <div>
                        <div className="sa-student-name">{s.name}</div>
                        <div className="sa-student-meta">{s.branch} · {s.batch}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`sa-status-badge ${s.inactive ? 'inactive' : 'active'}`}>
                      {s.inactive ? '⚫ Inactive' : '🟢 Active'}
                    </span>
                  </td>
                  <td>
                    {s.risk ? (
                      <span className="sa-risk-badge" style={{ color: RISK_COLORS[s.risk] }}>
                        {RISK_LABELS[s.risk]}
                      </span>
                    ) : (
                      <span className="sa-risk-badge on-track">✅ On Track</span>
                    )}
                  </td>
                  <td className="sa-time-cell">
                    {s.hours_since_codenest !== null
                      ? s.hours_since_codenest <= 24
                        ? `${s.hours_since_codenest}h ago`
                        : `${Math.floor(s.hours_since_codenest / 24)}d ago`
                      : 'Never'}
                  </td>
                  <td>{s.codenest_solved}</td>
                  <td>{s.codenest_score}</td>
                  <td>
                    <div className="sa-platforms">
                      {s.leetcode_handle && <span className={`sa-plat-tag lc ${s.leetcode_verified ? '' : 'unverified'}`}>LC</span>}
                      {s.codechef_handle && <span className={`sa-plat-tag cc ${s.codechef_verified ? '' : 'unverified'}`}>CC</span>}
                      {s.codeforces_handle && <span className={`sa-plat-tag cf ${s.codeforces_verified ? '' : 'unverified'}`}>CF</span>}
                      {!s.leetcode_handle && !s.codechef_handle && !s.codeforces_handle && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>None</span>}
                    </div>
                  </td>
                  <td>
                    <button className="sa-view-btn" onClick={() => navigate(`/profile/${s.username}`)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {showModal && <CheckpointModal onClose={() => setShowModal(false)} onSave={handleSaveCheckpoint} />}
      <Footer />
    </div>
  );
};

export default StudentActivity;
