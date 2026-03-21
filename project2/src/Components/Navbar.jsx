import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Bell, User, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import "../styles1/Navbar.css";
// import api from '../services/api'; // Imported inside component logic in previous step, checking...
// Actually, imports should be at top level. Let's fix that.
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "student";

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notificationsRef = useRef(null);
  const userDropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      // Optional: Poll every 60s
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark notifications read", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("linkedAccounts"); // Clear any cached profile data
    localStorage.removeItem("externalStatsCache");
    navigate("/");
    window.location.reload();
  };

  const username = localStorage.getItem("username");

  const handleLogoClick = () => {
    if (isLoggedIn && username) {
      if (userRole === "teacher") {
        navigate("/mentor-dashboard");
      } else {
        navigate(`/dashboard/${username}`);
      }
    } else {
      navigate("/");
    }
  };

  const studentLinks = [
    { path: `/dashboard/${username}`, label: "Dashboard" },
    { path: "/problems", label: "Problems" },
    { path: "/contests", label: "Contests" },
    { path: "/submissions", label: "Submissions" },
    { path: "/achievements", label: "Achievements" },
    { path: "/discuss", label: "Discuss" },
    { path: "/roadmap", label: "Roadmap" },
  ];

  const teacherLinks = [
    { path: "/mentor-dashboard", label: "Mentor Panel" },
    { path: "/problems", label: "Problems" },
    { path: "/analytics", label: "Class Stats" },
    { path: "/scoreboard", label: "Scoreboard" },
    { path: "/student-activity", label: "Activity" },
  ];

  // Only show nav links when logged in
  const navLinks = isLoggedIn ? (userRole === "teacher" ? teacherLinks : studentLinks) : [];

  return (
    <nav className="navbar glass-effect sticky">
      <div className="nav-logo" onClick={handleLogoClick}>
        <div className="logo-symbol">C</div>
        <span className="logo-text">Code<span>Nest</span></span>
      </div>

      <div className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="nav-actions">
        <button className="theme-toggle magnetic-hover" onClick={toggleTheme} title="Toggle Theme">
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        {isLoggedIn && (
          <div className="nav-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Notifications */}
            <div className="notifications-wrapper" ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                className="nav-icon-btn magnetic-hover"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>

              <div className={`dropdown-menu glass-effect ${showNotifications ? 'active' : ''}`} style={{ width: '300px' }}>
                <div className="dropdown-header" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>Notifications ({notifications.filter(n => !n.is_read).length})</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={markAllRead}>Mark all read</span>
                </div>
                <div className="dropdown-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="dropdown-item" style={{ padding: '1rem', color: '#94a3b8' }}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="dropdown-item" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border-light)', cursor: 'pointer', opacity: n.is_read ? 0.6 : 1, background: n.is_read ? 'transparent' : 'rgba(56, 189, 248, 0.1)' }} onClick={() => navigate(n.link || '#')}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: n.is_read ? 'normal' : 'bold' }}>{n.title}</p>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>{n.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* User Profile Dropdown */}
            <div className="user-dropdown-wrapper" ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                className="user-profile-btn glass-effect magnetic-hover"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '12px' }}
              >
                <div className="user-avatar-small" style={{ width: '24px', height: '24px', background: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>{username ? username.slice(0, 2).toUpperCase() : 'U'}</div>
                <ChevronDown size={14} className={showUserDropdown ? 'rotate-180' : ''} style={{ transition: '0.3s' }} />
              </button>

              <div className={`dropdown-menu glass-effect ${showUserDropdown ? 'active' : ''}`} style={{ width: '200px' }}>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                  <User size={16} /> Profile
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowUserDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                  <SettingsIcon size={16} /> Settings
                </Link>
                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
                <button onClick={handleLogout} className="dropdown-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#ef4444', textAlign: 'left', background: 'transparent' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <button onClick={() => navigate("/login")} className="button magnetic-hover">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
