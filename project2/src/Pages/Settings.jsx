import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { User, Bell, Shield, Code, Palette, Save, Link, AlertCircle } from 'lucide-react';
import '../styles1/Hero.css';

import { getVerificationToken, verifyLeetCode, verifyCodeforces, verifyCodeChef, verifyHackerRank, getCurrentUserStats, updateProfile } from '../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [editorFontSize, setEditorFontSize] = useState(16);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: '',
        skills: [],
        github_link: '',
        linkedin_link: '',
        twitter_link: ''
    });

    // Verification State
    const [verificationToken, setVerificationToken] = useState(null);
    const [verifiedStatus, setVerifiedStatus] = useState({
        leetcode: false,
        codechef: false,
        codeforces: false,
        hackerrank: false,
    });
    const [verifying, setVerifying] = useState({
        leetcode: false,
        codechef: false,
        codeforces: false,
        hackerrank: false,
    });

    const [accounts, setAccounts] = useState({ leetcode: '', codechef: '', codeforces: '', hackerrank: '' });

    // Load fresh data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await getCurrentUserStats();
                
                // Set profile data
                setProfileData({
                    name: data.full_name || data.username,
                    email: data.email || '',
                    bio: data.bio || '',
                    avatar: data.avatar || '',
                    skills: data.skills || [],
                    github_link: data.github_link || '',
                    linkedin_link: data.linkedin_link || '',
                    twitter_link: data.twitter_link || ''
                });

                // Set accounts
                setAccounts({
                    leetcode: data.leetcode_handle || '',
                    codechef: data.codechef_handle || '',
                    codeforces: data.codeforces_handle || '',
                    hackerrank: data.hackerrank_handle || '',
                });
                
                // Set verification status
                setVerifiedStatus({
                    leetcode: data.is_leetcode_verified || false,
                    codechef: data.is_codechef_verified || false,
                    codeforces: data.is_codeforces_verified || false,
                    hackerrank: data.is_hackerrank_verified || false,
                });
            } catch (error) {
                console.error("Failed to load profile for settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Fetch Token on load or tab switch
    useEffect(() => {
        if (activeTab === 'linkedAccounts') {
            const fetchToken = async () => {
                try {
                    const data = await getVerificationToken();
                    setVerificationToken(data.token);
                    setVerifiedStatus({
                        leetcode: data.leetcode_verified,
                        codechef: data.codechef_verified,
                        codeforces: data.codeforces_verified,
                        hackerrank: data.hackerrank_verified || false,
                    });
                } catch (error) {
                    console.error("Failed to fetch verification token", error);
                }
            };
            fetchToken();
        }
    }, [activeTab]);

    const handleVerify = async (platform) => {
        const handle = accounts[platform];
        if (!handle) return alert(`Please enter a ${platform} username first`);

        setVerifying(prev => ({ ...prev, [platform]: true }));
        try {
            let result;
            if (platform === 'leetcode') result = await verifyLeetCode(handle);
            else if (platform === 'codeforces') result = await verifyCodeforces(handle);
            else if (platform === 'codechef') result = await verifyCodeChef(handle);
            else if (platform === 'hackerrank') result = await verifyHackerRank(handle);

            if (result.success) {
                alert(result.message);
                setVerifiedStatus(prev => ({ ...prev, [platform]: true }));
                localStorage.removeItem('externalStatsCache'); // Clear cache to force refetch
            } else {
                alert(result.error || 'Verification failed. Please check your profile and try again.');
            }
        } catch (error) {
            console.error(`Verification error for ${platform}:`, error);
            alert(`Verification failed for ${platform}. ${error.response?.data?.error || 'Please check console for details.'}`);
        } finally {
            setVerifying(prev => ({ ...prev, [platform]: false }));
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile(profileData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        if (activeTab === 'profile') {
            handleSaveProfile();
        } else if (activeTab === 'linkedAccounts') {
            localStorage.setItem('linkedAccounts', JSON.stringify(accounts));
            localStorage.removeItem('externalStatsCache');
            alert('Settings saved!');
        } else {
            alert('Settings saved!');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'editor', label: 'Editor Preferences', icon: Code },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'linkedAccounts', label: 'Linked Accounts', icon: Link }
    ];

    return (
        <div className="settings-page animate-fade-in">
            <Navbar />
            <main className="page-section">
                <header className="section-title">
                    <h1>Account <span>Settings</span></h1>
                    <p>Manage your account preferences and customize your coding experience.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
                    {/* Sidebar Tabs */}
                    <aside className="glass-effect" style={{ padding: '1rem', borderRadius: '24px', height: 'fit-content' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="magnetic-hover"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    borderRadius: '12px',
                                    background: activeTab === tab.id ? 'var(--primary-glow)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                    textAlign: 'left',
                                    fontWeight: activeTab === tab.id ? '600' : '400'
                                }}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    {/* Settings Content */}
                    <section className="glass-effect" style={{ padding: '3rem', borderRadius: '24px' }}>
                        {activeTab === 'profile' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Personal Information</h2>
                                {loading ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Loading profile...
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                background: 'var(--surface-color)',
                                                border: '2px dashed var(--glass-border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}>
                                                {profileData.avatar ? (
                                                    <img src={profileData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No Photo</span>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Avatar URL"
                                                    value={profileData.avatar}
                                                    onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                                                    style={{ width: '300px', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginBottom: '0.5rem' }}
                                                />
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter avatar URL or use Dicebear API</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Display Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    placeholder="Your name"
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    readOnly
                                                    disabled
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                                                />
                                                <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email cannot be changed</small>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
                                            <textarea
                                                rows="4"
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                placeholder="Tell us about yourself..."
                                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', resize: 'none' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Skills (comma-separated)</label>
                                            <input
                                                type="text"
                                                value={Array.isArray(profileData.skills) ? profileData.skills.join(', ') : profileData.skills}
                                                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                                placeholder="React, Python, JavaScript, etc."
                                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>GitHub</label>
                                                <input
                                                    type="url"
                                                    value={profileData.github_link}
                                                    onChange={(e) => setProfileData({ ...profileData, github_link: e.target.value })}
                                                    placeholder="https://github.com/username"
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>LinkedIn</label>
                                                <input
                                                    type="url"
                                                    value={profileData.linkedin_link}
                                                    onChange={(e) => setProfileData({ ...profileData, linkedin_link: e.target.value })}
                                                    placeholder="https://linkedin.com/in/username"
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Twitter</label>
                                                <input
                                                    type="url"
                                                    value={profileData.twitter_link}
                                                    onChange={(e) => setProfileData({ ...profileData, twitter_link: e.target.value })}
                                                    placeholder="https://twitter.com/username"
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'editor' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Coding Preferences</h2>
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '0.25rem' }}>Font Size</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Adjust the size of the code in the editor.</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button onClick={() => setEditorFontSize(f => Math.max(12, f - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-color)', color: 'white' }}>-</button>
                                            <span>{editorFontSize}px</span>
                                            <button onClick={() => setEditorFontSize(f => Math.min(24, f + 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-color)', color: 'white' }}>+</button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '0.25rem' }}>Autocomplete</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Show code suggestions while typing.</p>
                                        </div>
                                        <div style={{ width: '50px', height: '26px', background: 'var(--primary-color)', borderRadius: '13px', position: 'relative', cursor: 'pointer' }}>
                                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'linkedAccounts' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Linked Accounts</h2>
                                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                                    Connect your external coding profiles to sync your stats and progress to the Dashboard.
                                </p>

                                {/* Verification Section */}
                                {verificationToken && (
                                    <div style={{ padding: '1rem', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '12px', marginBottom: '2rem' }}>
                                        <h4 style={{ color: '#ffc107', marginTop: 0 }}>⚠️ Verify Account Ownership</h4>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>To prevent impersonation, please add the following code to your <strong>Bio (LeetCode)</strong> or <strong>First Name (Codeforces)</strong> temporarily:</p>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                                            <code style={{ fontSize: '1rem', color: '#fff', flex: 1 }}>{verificationToken}</code>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(verificationToken); alert("Copied!"); }}
                                                style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'var(--surface-color)', color: 'white' }}>
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Instructions */}
                                <div style={{ padding: '1.2rem 1.5rem', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '0.75rem' }}>📋 How to Verify Your Accounts</h4>
                                    <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                                        <li>Click <strong style={{ color: 'var(--text-primary)' }}>Copy</strong> on the verification token above.</li>
                                        <li><strong style={{ color: '#ffa116' }}>LeetCode</strong> — Go to <a href="https://leetcode.com/profile/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>leetcode.com/profile</a> → Edit Profile → paste token in <em>Summary/Bio</em> → Save → click Verify here.</li>
                                        <li><strong style={{ color: '#818cf8' }}>CodeChef</strong> — Go to <a href="https://www.codechef.com/settings/profile" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>codechef.com/settings/profile</a> → paste token in <em>About</em> → Save → click Verify here.</li>
                                        <li><strong style={{ color: '#1f8acb' }}>Codeforces</strong> — Go to <a href="https://codeforces.com/settings/social" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>codeforces.com/settings/social</a> → paste token in <em>First name</em> → Save → click Verify here.</li>
                                        <li><strong style={{ color: '#2ec866' }}>HackerRank</strong> — Go to <a href="https://www.hackerrank.com/settings/profile" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>hackerrank.com/settings/profile</a> → paste token in <em>About Me</em> → Save → click Verify here.</li>
                                        <li>After verification succeeds, you can remove the token from your profile.</li>
                                    </ol>
                                </div>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {/* LeetCode */}
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>LeetCode Username</label>
                                            {verifiedStatus.leetcode && <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>✅ Verified</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                value={accounts.leetcode}
                                                onChange={(e) => setAccounts({ ...accounts, leetcode: e.target.value })}
                                                placeholder="e.g. tourist"
                                                disabled={verifiedStatus.leetcode}
                                                style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${verifiedStatus.leetcode ? '#4caf50' : 'var(--glass-border)'}`, borderRadius: '8px', color: 'white' }}
                                            />
                                            {!verifiedStatus.leetcode && (
                                                <button
                                                    onClick={() => handleVerify('leetcode')}
                                                    disabled={verifying.leetcode}
                                                    style={{ padding: '0 1.5rem', background: 'var(--primary-color)', borderRadius: '8px', color: 'white', fontWeight: '500' }}>
                                                    {verifying.leetcode ? 'Checking...' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Codeforces */}
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Codeforces Handle</label>
                                            {verifiedStatus.codeforces && <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>✅ Verified</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                value={accounts.codeforces}
                                                onChange={(e) => setAccounts({ ...accounts, codeforces: e.target.value })}
                                                placeholder="e.g. tourist"
                                                disabled={verifiedStatus.codeforces}
                                                style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${verifiedStatus.codeforces ? '#4caf50' : 'var(--glass-border)'}`, borderRadius: '8px', color: 'white' }}
                                            />
                                            {!verifiedStatus.codeforces && (
                                                <button
                                                    onClick={() => handleVerify('codeforces')}
                                                    disabled={verifying.codeforces}
                                                    style={{ padding: '0 1.5rem', background: 'var(--primary-color)', borderRadius: '8px', color: 'white', fontWeight: '500' }}>
                                                    {verifying.codeforces ? 'Checking...' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* CodeChef */}
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>CodeChef Handle</label>
                                            {verifiedStatus.codechef && <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>✅ Verified</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                value={accounts.codechef}
                                                onChange={(e) => setAccounts({ ...accounts, codechef: e.target.value })}
                                                placeholder="e.g. tourist"
                                                disabled={verifiedStatus.codechef}
                                                style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${verifiedStatus.codechef ? '#4caf50' : 'var(--glass-border)'}`, borderRadius: '8px', color: 'white' }}
                                            />
                                            {!verifiedStatus.codechef && (
                                                <button
                                                    onClick={() => handleVerify('codechef')}
                                                    disabled={verifying.codechef}
                                                    style={{ padding: '0 1.5rem', background: 'var(--primary-color)', borderRadius: '8px', color: 'white', fontWeight: '500' }}>
                                                    {verifying.codechef ? 'Checking...' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* HackerRank */}
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>HackerRank Username</label>
                                            {verifiedStatus.hackerrank && <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>✅ Verified</span>}
                                        </div>
                                        {verificationToken && !verifiedStatus.hackerrank && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                Add <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 4px', borderRadius: '4px' }}>{verificationToken}</code> to your HackerRank <strong>About</strong> section, then click Verify.
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                value={accounts.hackerrank}
                                                onChange={(e) => setAccounts({ ...accounts, hackerrank: e.target.value })}
                                                placeholder="e.g. tourist"
                                                disabled={verifiedStatus.hackerrank}
                                                style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${verifiedStatus.hackerrank ? '#4caf50' : 'var(--glass-border)'}`, borderRadius: '8px', color: 'white' }}
                                            />
                                            {!verifiedStatus.hackerrank && (
                                                <button
                                                    onClick={() => handleVerify('hackerrank')}
                                                    disabled={verifying.hackerrank}
                                                    style={{ padding: '0 1.5rem', background: 'var(--primary-color)', borderRadius: '8px', color: 'white', fontWeight: '500' }}>
                                                    {verifying.hackerrank ? 'Checking...' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Notification Preferences</h2>
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }}>
                                        <AlertCircle size={24} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                                        <h4 style={{ marginBottom: '0.5rem' }}>Coming Soon</h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Notification settings will be available in a future update. You'll be able to customize email notifications, push notifications, and more.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Security Settings</h2>
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }}>
                                        <Shield size={24} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                                        <h4 style={{ marginBottom: '0.5rem' }}>Coming Soon</h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Security features like password change, two-factor authentication, and session management will be available soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Appearance Settings</h2>
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }}>
                                        <Palette size={24} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                                        <h4 style={{ marginBottom: '0.5rem' }}>Coming Soon</h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Theme customization, color schemes, and UI preferences will be available in a future update.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{ padding: '0.75rem 2rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="magnetic-hover"
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: saving ? 'var(--surface-color)' : 'var(--primary-color)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '600',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.6 : 1
                                }}
                            >
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Settings;
