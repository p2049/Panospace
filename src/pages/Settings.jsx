import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaUserEdit, FaSignOutAlt, FaShieldAlt, FaQuestionCircle, FaBell, FaTrash, FaExclamationTriangle, FaChevronRight, FaLink, FaFlag, FaBan, FaCamera, FaSmile, FaEnvelope, FaLifeRing } from 'react-icons/fa';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { useUI } from '../context/UIContext';
import ReportModal from '../components/ReportModal';
import { useBlock } from '../hooks/useBlock';
import { getUserNSFWPreference, setUserNSFWPreference } from '../constants/nsfwTags';
import { isFeatureEnabled } from '../config/featureFlags';
import { AccountTypeService } from '../services/AccountTypeService';
import { FEED_CONFIG } from '../config/feedConfig';

const Settings = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { activePost } = useUI();
    const { blockUser, isBlocked } = useBlock();
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

    // Account Type State
    const [accountType, setAccountType] = useState(FEED_CONFIG.DEFAULT_ACCOUNT_TYPE);
    const [loadingAccountType, setLoadingAccountType] = useState(true);

    // Load user's account type on mount
    React.useEffect(() => {
        const loadAccountType = async () => {
            if (currentUser) {
                try {
                    const type = await AccountTypeService.getAccountType(currentUser.uid);
                    setAccountType(type);
                } catch (error) {
                    console.error('Error loading account type:', error);
                } finally {
                    setLoadingAccountType(false);
                }
            }
        };
        loadAccountType();
    }, [currentUser]);

    const toggleAccountType = async () => {
        if (!currentUser || loadingAccountType) return;

        const newType = accountType === 'art' ? 'social' : 'art';
        setLoadingAccountType(true);

        try {
            await AccountTypeService.setAccountType(currentUser.uid, newType);
            setAccountType(newType);
        } catch (error) {
            console.error('Error updating account type:', error);
            alert('Failed to update account type. Please try again.');
        } finally {
            setLoadingAccountType(false);
        }
    };

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

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '500', margin: 0 }}>Settings</h1>
            </div>

            <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>

                {/* Account Section */}
                <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>ACCOUNT</h3>
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/edit-profile')}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #222',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FaUserEdit color="#aaa" />
                            <span>Edit Profile</span>
                        </div>
                        <FaChevronRight color="#444" size={12} />
                    </button>
                    <button
                        onClick={() => navigate('/legal')}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FaShieldAlt color="#aaa" />
                            <span>Privacy & Legal</span>
                        </div>
                        <FaChevronRight color="#444" size={12} />
                    </button>
                </div>

                {/* Account Type Section */}
                <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>ACCOUNT MODE</h3>
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', padding: '0.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.8rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>
                                    {accountType === 'art' ? '🎨' : '👥'}
                                </span>
                                <span style={{ fontWeight: '600' }}>
                                    {accountType === 'art' ? 'Art Account' : 'Social Account'}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                                {accountType === 'art'
                                    ? 'Your posts appear in the Art Feed (photography & creative work)'
                                    : 'Your posts appear in the Social Feed (casual sharing & updates)'}
                            </span>
                        </div>
                        <div
                            onClick={toggleAccountType}
                            style={{
                                width: '50px',
                                height: '26px',
                                background: accountType === 'art' ? '#7FFFD4' : '#FF6B9D',
                                borderRadius: '13px',
                                position: 'relative',
                                cursor: loadingAccountType ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s',
                                opacity: loadingAccountType ? 0.5 : 1,
                                flexShrink: 0,
                                marginLeft: '1rem'
                            }}
                        >
                            <div style={{
                                width: '22px',
                                height: '22px',
                                background: '#fff',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: accountType === 'art' ? '2px' : '26px',
                                transition: 'left 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem'
                            }}>
                                {accountType === 'art' ? '🎨' : '👥'}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        padding: '0.8rem',
                        paddingTop: '0',
                        fontSize: '0.75rem',
                        color: '#7FFFD4',
                        lineHeight: '1.5'
                    }}>
                        💡 Tip: Tap the planet logo on the home screen to switch between feeds
                    </div>
                </div>

                {/* Post Settings Section (Only visible when activePost exists) */}
                {activePost && (
                    <>
                        <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>POST SETTINGS</h3>
                        <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                            {/* Copy Link */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/post/${activePost.id}`);
                                    alert('Link copied!');
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #222',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaLink color="#aaa" />
                                <span>Copy Post Link</span>
                            </button>

                            {/* Owner-only actions */}
                            {currentUser && currentUser.uid === activePost.authorId ? (
                                <>
                                    <button
                                        onClick={() => navigate(`/edit-post/${activePost.id}`)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #222',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaCamera color="#aaa" />
                                        <span>Edit Post</span>
                                    </button>
                                    {/* Convert to Smiley (only for star-rated posts) */}
                                    {activePost.enableRatings && (
                                        <button
                                            onClick={() => setShowConversionConfirm(true)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid #222',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaSmile color="#7FFFD4" />
                                            <span>Convert to Smiley Likes</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (window.confirm("Delete this post?")) {
                                                try {
                                                    await deleteDoc(doc(db, 'posts', activePost.id));
                                                    navigate('/');
                                                } catch (e) {
                                                    console.error(e);
                                                    alert('Failed to delete');
                                                }
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaTrash />
                                        <span>Delete Post</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #222',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaFlag color="#aaa" />
                                        <span>Report Post</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Block ${activePost.username || 'this user'}? You won't see their posts or comments.`)) {
                                                try {
                                                    await blockUser(activePost.authorId, activePost.username);
                                                    alert('User blocked successfully');
                                                    navigate('/');
                                                } catch (error) {
                                                    console.error('Error blocking user:', error);
                                                    alert('Failed to block user');
                                                }
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaBan />
                                        <span>Block User</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* Notifications Section */}
                {isFeatureEnabled('NOTIFICATIONS') && (
                    <>
                        <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>NOTIFICATIONS</h3>
                        <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', padding: '0.5rem' }}>
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.8rem',
                                    borderBottom: '1px solid #222'
                                }}>
                                    <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <div
                                        onClick={() => toggleNotification(key)}
                                        style={{
                                            width: '40px',
                                            height: '20px',
                                            background: value ? 'var(--ice-mint)' : '#333',
                                            borderRadius: '10px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            background: '#fff',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: value ? '22px' : '2px',
                                            transition: 'left 0.2s'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Content Preferences Section */}
                <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>CONTENT PREFERENCES</h3>
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', padding: '0.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.8rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>Show Sensitive Content</span>
                            <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                                Automatically reveal NSFW posts
                            </span>
                        </div>
                        <div
                            onClick={toggleNSFW}
                            style={{
                                width: '40px',
                                height: '20px',
                                background: showNSFW ? 'var(--ice-mint)' : '#333',
                                borderRadius: '10px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{
                                width: '16px',
                                height: '16px',
                                background: '#fff',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: showNSFW ? '22px' : '2px',
                                transition: 'left 0.2s'
                            }} />
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>SUPPORT</h3>
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                    <a
                        href="mailto:support@panospace.com"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #222',
                            color: '#fff',
                            textDecoration: 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FaEnvelope color="#aaa" />
                            <span>Contact Support</span>
                        </div>
                        <FaChevronRight color="#444" size={12} />
                    </a>
                    <a
                        href="https://panospace.com/help"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textDecoration: 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FaLifeRing color="#aaa" />
                            <span>Help Center</span>
                        </div>
                        <FaChevronRight color="#444" size={12} />
                    </a>
                </div>

                {/* Danger Zone */}
                <h3 style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>DANGER ZONE</h3>
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer'
                        }}
                    >
                        <FaTrash />
                        <span>Delete Account</span>
                    </button>
                </div>

                <div style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    <p>Panospace v1.0.0</p>
                    <p>Built for Artists</p>
                </div>

                {/* Logout Button - Bottom of Page */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Delete Account Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                            <FaExclamationTriangle size={40} color="#ff4444" />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Delete Account?</h2>
                            <p style={{ color: '#ccc' }}>
                                This action is <strong>irreversible</strong>. All your photos, profile data, and settings will be permanently deleted.
                            </p>

                            {deleteError && (
                                <div style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', width: '100%' }}>
                                    {deleteError}
                                </div>
                            )}

                            <form onSubmit={handleDeleteAccount} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>
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
                                            background: '#000',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff'
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
                                        opacity: loading || !deletePassword ? 0.5 : 1
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
                                    color: '#aaa',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
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
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                            <FaSmile size={40} color="#7FFFD4" />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Convert to Smiley Likes?</h2>
                            <p style={{ color: '#ccc' }}>
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
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    opacity: converting ? 0.5 : 1,
                                    marginTop: '0.5rem'
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
                                    color: '#aaa',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
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
