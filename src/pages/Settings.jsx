import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaUserEdit, FaSignOutAlt, FaShieldAlt, FaBell, FaTrash, FaExclamationTriangle, FaChevronRight, FaEnvelope, FaLock, FaGlobe, FaPalette, FaCreditCard, FaHistory, FaFileContract, FaLifeRing, FaAward, FaSmile } from 'react-icons/fa';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { useUI } from '../context/UIContext';
import ReportModal from '../components/ReportModal';
import { useBlock } from '../hooks/useBlock';
import { getUserNSFWPreference, setUserNSFWPreference } from '../constants/nsfwTags';
import { isFeatureEnabled } from '../config/featureFlags';

const Settings = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { activePost } = useUI();
    const { blockUser } = useBlock();
    const [loading, setLoading] = useState(false);

    // Report Modal State
    const [showReportModal, setShowReportModal] = useState(false);

    // Notification State (Local only for now)
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        newFollowers: true,
        mentions: true,
        marketing: false
    });

    // Content Preferences
    const [showNSFW, setShowNSFW] = useState(getUserNSFWPreference());

    const toggleNSFW = () => {
        const newValue = !showNSFW;
        setShowNSFW(newValue);
        setUserNSFWPreference(newValue);
    };

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // Rating Conversion State
    const [showConversionConfirm, setShowConversionConfirm] = useState(false);
    const [converting, setConverting] = useState(false);
    const [conversionError, setConversionError] = useState('');

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDeleteError('');

        try {
            // 1. Re-authenticate
            const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
            await reauthenticateWithCredential(currentUser, credential);

            // 2. Cleanup Data (Best effort client-side)
            const batch = writeBatch(db);

            // Delete User Profile
            const userRef = doc(db, 'users', currentUser.uid);
            batch.delete(userRef);

            // Delete User's Posts (Limit to 500 for batch size limits)
            const postsQuery = query(collection(db, 'posts'), where('authorId', '==', currentUser.uid));
            const postsSnapshot = await getDocs(postsQuery);
            postsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Commit Batch
            await batch.commit();

            // 3. Delete Auth Account
            await deleteUser(currentUser);

            // 4. Redirect
            navigate('/login');
        } catch (error) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/wrong-password') {
                setDeleteError('Incorrect password.');
            } else {
                setDeleteError('Failed to delete account. Please try again or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConvertToSmiley = async () => {
        if (!activePost || !currentUser) return;

        setConverting(true);
        setConversionError('');

        try {
            const postRef = doc(db, 'posts', activePost.id);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                throw new Error('Post not found');
            }

            const postData = postSnap.data();
            const ratings = postData.ratings || {};

            // Extract user IDs who rated
            const userIds = Object.keys(ratings);

            // Update post to smiley system
            await updateDoc(postRef, {
                enableRatings: false,
                likes: userIds,
                likeCount: userIds.length,
                ratings: deleteField(),
                averageRating: deleteField(),
                totalVotes: deleteField()
            });

            setShowConversionConfirm(false);
            // Refresh the page to show updated post
            window.location.reload();
        } catch (error) {
            console.error('Error converting post:', error);
            setConversionError('Failed to convert post. Please try again.');
        } finally {
            setConverting(false);
        }
    };

    // Reusable Settings Row Component
    const SettingsRow = ({ icon: Icon, label, onClick, isDestructive = false, showChevron = true }) => (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                background: 'transparent',
                border: '1px solid rgba(110, 255, 216, 0.15)',
                borderRadius: '8px',
                color: isDestructive ? '#ff4444' : 'var(--text-primary, #d8fff1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '8px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = isDestructive ? 'rgba(255, 68, 68, 0.05)' : 'rgba(110, 255, 216, 0.05)';
                e.currentTarget.style.borderColor = isDestructive ? 'rgba(255, 68, 68, 0.3)' : 'var(--accent, #6effd8)';
                e.currentTarget.style.boxShadow = isDestructive ? '0 0 15px rgba(255, 68, 68, 0.2)' : '0 0 15px var(--accent-glow, rgba(110,255,216,0.35))';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(110, 255, 216, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Icon size={18} color={isDestructive ? '#ff4444' : 'var(--accent, #6effd8)'} />
                <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{label}</span>
            </div>
            {showChevron && <FaChevronRight size={14} color={isDestructive ? '#ff4444' : 'var(--accent, #6effd8)'} />}
        </button>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-darker, #020404)',
            color: 'var(--text-primary, #d8fff1)',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(110, 255, 216, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent, #6effd8)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--accent, #6effd8)',
                    fontFamily: 'var(--font-family-heading)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: 0
                }}>Settings</h1>
            </div>

            <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>

                {/* Account Section */}
                <h3 style={{
                    color: 'var(--text-secondary, #6b7f78)',
                    fontSize: '0.75rem',
                    marginBottom: '12px',
                    marginLeft: '4px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                }}>Account</h3>
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid rgba(110, 255, 216, 0.1)'
                }}>
                    <SettingsRow icon={FaUserEdit} label="Edit Profile" onClick={() => navigate('/edit-profile')} />
                    <SettingsRow icon={FaEnvelope} label="Change Email" onClick={() => alert('Coming soon')} />
                    <SettingsRow icon={FaLock} label="Change Password" onClick={() => alert('Coming soon')} />
                    <SettingsRow icon={FaTrash} label="Delete Account" onClick={() => setShowDeleteConfirm(true)} isDestructive={true} />
                </div>

                {/* App Section */}
                <h3 style={{
                    color: 'var(--text-secondary, #6b7f78)',
                    fontSize: '0.75rem',
                    marginBottom: '12px',
                    marginLeft: '4px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                }}>App</h3>
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid rgba(110, 255, 216, 0.1)'
                }}>
                    {isFeatureEnabled('NOTIFICATIONS') && (
                        <SettingsRow icon={FaBell} label="Notifications" onClick={() => alert('Coming soon')} />
                    )}
                    <SettingsRow icon={FaShieldAlt} label="Privacy & Safety" onClick={() => navigate('/legal')} />
                    <SettingsRow icon={FaGlobe} label="Language" onClick={() => alert('Coming soon')} />
                    <SettingsRow icon={FaPalette} label="Theme" onClick={() => alert('Coming soon')} />
                </div>

                {/* Billing Section */}
                <h3 style={{
                    color: 'var(--text-secondary, #6b7f78)',
                    fontSize: '0.75rem',
                    marginBottom: '12px',
                    marginLeft: '4px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                }}>Billing</h3>
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid rgba(110, 255, 216, 0.1)'
                }}>
                    <SettingsRow icon={FaCreditCard} label="Manage Subscription" onClick={() => alert('Coming soon')} />
                    <SettingsRow icon={FaCreditCard} label="Payment Methods" onClick={() => alert('Coming soon')} />
                    <SettingsRow icon={FaHistory} label="Purchase History" onClick={() => alert('Coming soon')} />
                </div>

                {/* About Section */}
                <h3 style={{
                    color: 'var(--text-secondary, #6b7f78)',
                    fontSize: '0.75rem',
                    marginBottom: '12px',
                    marginLeft: '4px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                }}>About</h3>
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid rgba(110, 255, 216, 0.1)'
                }}>
                    <SettingsRow icon={FaFileContract} label="Terms of Service" onClick={() => navigate('/legal')} />
                    <SettingsRow icon={FaShieldAlt} label="Privacy Policy" onClick={() => navigate('/legal')} />
                    <SettingsRow icon={FaLifeRing} label="Contact Support" onClick={() => window.location.href = 'mailto:support@panospace.com'} />
                    <SettingsRow icon={FaAward} label="Credits" onClick={() => navigate('/credits')} />
                </div>

                {/* Sign Out */}
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid rgba(110, 255, 216, 0.1)'
                }}>
                    <SettingsRow icon={FaSignOutAlt} label="Sign Out" onClick={handleLogout} isDestructive={true} showChevron={false} />
                </div>

                {/* Version Info */}
                <div style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary, #6b7f78)',
                    fontSize: '0.75rem',
                    marginTop: '2rem',
                    opacity: 0.6
                }}>
                    <p style={{ margin: '0 0 0.25rem 0' }}>Panospace v1.0.0</p>
                    <p style={{ margin: 0 }}>Built for Artists</p>
                </div>

            </div>

            {/* Delete Account Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'var(--bg-card, #050808)',
                        border: '1px solid rgba(110, 255, 216, 0.2)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 0 40px var(--accent-glow, rgba(110,255,216,0.35))'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                            <FaExclamationTriangle size={40} color="#ff4444" />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary, #d8fff1)' }}>Delete Account?</h2>
                            <p style={{ color: 'var(--text-secondary, #6b7f78)' }}>
                                This action is <strong>irreversible</strong>. All your photos, profile data, and settings will be permanently deleted.
                            </p>

                            {deleteError && (
                                <div style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', width: '100%' }}>
                                    {deleteError}
                                </div>
                            )}

                            <form onSubmit={handleDeleteAccount} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #6b7f78)', marginBottom: '0.5rem', display: 'block' }}>
                                        Confirm Password to Delete
                                    </label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            background: 'var(--bg-darker, #020404)',
                                            border: '1px solid rgba(110, 255, 216, 0.2)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary, #d8fff1)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !deletePassword}
                                    style={{
                                        padding: '1rem',
                                        background: '#ff4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        opacity: loading || !deletePassword ? 0.5 : 1,
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading ? 'Deleting...' : 'Permanently Delete Account'}
                                </button>
                            </form>

                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword('');
                                    setDeleteError('');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary, #6b7f78)',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel, keep my account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversion Confirmation Modal */}
            {showConversionConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'var(--bg-card, #050808)',
                        border: '1px solid rgba(110, 255, 216, 0.2)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 0 40px var(--accent-glow, rgba(110,255,216,0.35))'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                            <FaSmile size={40} color="var(--accent, #6effd8)" />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary, #d8fff1)' }}>Convert to Smiley Likes?</h2>
                            <p style={{ color: 'var(--text-secondary, #6b7f78)' }}>
                                This will convert your star rating system to simple smiley likes. Each user who rated will count as 1 like.
                            </p>
                            <p style={{ color: '#ff4444', fontSize: '0.9rem', background: 'rgba(255,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', width: '100%' }}>
                                ⚠️ This action cannot be reversed. Original star ratings will be permanently lost.
                            </p>

                            {conversionError && (
                                <div style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', width: '100%' }}>
                                    {conversionError}
                                </div>
                            )}

                            <button
                                onClick={handleConvertToSmiley}
                                disabled={converting}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--accent, #6effd8)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    opacity: converting ? 0.5 : 1,
                                    marginTop: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            >
                                {converting ? 'Converting...' : 'Convert to Smiley Likes'}
                            </button>

                            <button
                                onClick={() => {
                                    setShowConversionConfirm(false);
                                    setConversionError('');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary, #6b7f78)',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && activePost && (
                <ReportModal
                    isOpen={showReportModal}
                    targetType="post"
                    targetId={activePost.id}
                    targetTitle={activePost.caption || activePost.title || 'Post'}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default Settings;
