import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { User, Bell, Shield, Eye, Code, Palette, Save, Link } from 'lucide-react';
import '../styles1/Hero.css';

import { getVerificationToken, verifyLeetCode, verifyCodeforces, verifyCodeChef } from '../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [editorFontSize, setEditorFontSize] = useState(16);
    // const [notificationsEnbled, setNotificationsEnabled] = useState(true); // Unused

    // Verification State
    const [verificationToken, setVerificationToken] = useState(null);
    const [verifiedStatus, setVerifiedStatus] = useState({
        leetcode: false,
        codechef: false,
        codeforces: false
    });
    const [verifying, setVerifying] = useState({
        leetcode: false,
        codechef: false,
        codeforces: false
    });

    const [accounts, setAccounts] = useState({ leetcode: '', codechef: '', codeforces: '' });

    // Load fresh data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // We can use the already existing getUserStats to get profile data including linked accounts
                // Or create a specific endpoint. For now, let's use getUserStats with current user ID
                const userId = localStorage.getItem('user_id');
                if (userId) {
                    const data = await getUserStats(userId);
                    setAccounts({
                        leetcode: data.leetcode_handle || '',
                        codechef: data.codechef_handle || '',
                        codeforces: data.codeforces_handle || ''
                    });
                    // Also set verification status
                    setVerifiedStatus({
                        leetcode: !!data.leetcode_handle, // Assume verified if present for now, or fetch token logic
                        codechef: !!data.codechef_handle,
                        codeforces: !!data.codeforces_handle
                    });
                }
            } catch (error) {
                console.error("Failed to load profile for settings", error);
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
                        codeforces: data.codeforces_verified
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

            if (result.success) {
                alert(result.message);
                setVerifiedStatus(prev => ({ ...prev, [platform]: true }));
                handleSave(); // Save to localStorage as well
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert(`Verification failed for ${platform}. Check console/logs.`);
        } finally {
            setVerifying(prev => ({ ...prev, [platform]: false }));
        }
    };

    const handleSave = () => {
        if (activeTab === 'linkedAccounts') {
            localStorage.setItem('linkedAccounts', JSON.stringify(accounts));
            localStorage.removeItem('externalStatsCache'); // Clear cache to force refetch
            alert('Linked accounts saved!');
        } else {
            // Placeholder for other tabs save logic
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
                                            justifyContent: 'center'
                                        }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Change</span>
                                        </div>
                                        <div>
                                            <button className="magnetic-hover" style={{ padding: '0.5rem 1.5rem', background: 'var(--primary-color)', borderRadius: '8px', color: 'white', fontWeight: '500' }}>
                                                Upload New Photo
                                            </button>
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>JPG, GIF or PNG. Max size of 800K</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Display Name</label>
                                            <input type="text" defaultValue="Alex Rivera" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Public Email</label>
                                            <input type="email" defaultValue="alex@example.com" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
                                        <textarea rows="4" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', resize: 'none' }} defaultValue="Full-stack developer | Open source enthusiast | Problem solver at heart. Always learning and building something new."></textarea>
                                    </div>
                                </div>
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
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button style={{ padding: '0.75rem 2rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }}>Cancel</button>
                            <button onClick={handleSave} className="magnetic-hover" style={{ padding: '0.75rem 2rem', background: 'var(--primary-color)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                <Save size={18} /> Save Changes
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
