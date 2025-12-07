import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, addDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useBlock } from '../hooks/useBlock';
import { useCollections } from '../hooks/useCollections';
import { useProfile } from '../hooks/useProfile';
import SEO from '../components/SEO';
import StarBackground from '../components/StarBackground';
import WalletDisplay from '../components/WalletDisplay';
import InfiniteGrid from '../components/InfiniteGrid';
import CreateMuseumModal from '../components/CreateMuseumModal';
import MuseumCard from '../components/MuseumCard';
import ReportModal from '../components/ReportModal';
import CreateCardModal from '../components/CreateCardModal';
import BusinessCardModal from '../components/BusinessCardModal';
import CommissionModal from '../components/monetization/CommissionModal';
import DisciplinesModal from '../components/DisciplinesModal';
import { getUnreadCount } from '../services/notificationService';
import { FaPlus, FaLayerGroup, FaTh, FaShoppingBag, FaRocket, FaCheck, FaCog, FaIdBadge, FaFlag, FaBan, FaUserPlus, FaImage, FaWallet, FaPalette } from 'react-icons/fa';
import FollowListModal from '../components/FollowListModal';
import { getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { isFeatureEnabled } from '../config/featureFlags';


const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { blockUser } = useBlock();
    const [showCreateMuseumModal, setShowCreateMuseumModal] = useState(false);

    const targetId = (id === 'me' || !id) ? currentUser?.uid : id;

    const [activeTab, setActiveTab] = useState('posts');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBusinessCard, setShowBusinessCard] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showDisciplinesModal, setShowDisciplinesModal] = useState(false);
    const [showFollowList, setShowFollowList] = useState(false);
    const [followListType, setFollowListType] = useState('followers');


    const [showAddFunds, setShowAddFunds] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [orders, setOrders] = useState([]);
    const { collections, loading: collectionsLoading } = useCollections(targetId);

    // Use the new useProfile hook
    const {
        user,
        posts,
        shopItems,
        spaceCards,
        badges,
        loading,
        isFollowing,
        followDocId,
        setIsFollowing,
        setFollowDocId
    } = useProfile(targetId, currentUser, activeTab);

    // Fetch orders for Gallery tab
    React.useEffect(() => {
        const fetchOrders = async () => {
            if (activeTab === 'gallery' && targetId) {
                try {
                    // 🔒 SAFETY: Limit to 30 most recent orders
                    // WHY: User with 1000 orders = 1000 reads every profile view
                    // With limit(30): Only 30 reads, can add "Load More" if needed
                    const q = query(
                        collection(db, 'orders'),
                        where('userId', '==', targetId),
                        orderBy('createdAt', 'desc'),
                        limit(30)
                    );
                    const snapshot = await getDocs(q);
                    setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };
        fetchOrders();
    }, [activeTab, targetId]);

    const handleFollow = async () => {
        if (!currentUser || followLoading) return;

        setFollowLoading(true);
        try {
            if (isFollowing && followDocId) {
                await deleteDoc(doc(db, 'follows', followDocId));
                setIsFollowing(false);
                setFollowDocId(null);
            } else {
                const docRef = await addDoc(collection(db, 'follows'), {
                    followerId: currentUser.uid,
                    followerName: currentUser.displayName || 'Anonymous',
                    followingId: targetId,
                    followingName: user.displayName || 'User',
                    createdAt: serverTimestamp()
                });
                setIsFollowing(true);
                setFollowDocId(docRef.id);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            alert('Failed to update follow status');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleBlock = async () => {
        if (!currentUser || !targetId) return;
        if (window.confirm(`Are you sure you want to block ${user.displayName}?`)) {
            try {
                await blockUser(targetId);
                navigate('/');
            } catch (error) {
                console.error('Error blocking user:', error);
                alert('Failed to block user');
            }
        }
    };

    // Fetch unread notification count
    React.useEffect(() => {
        const loadUnreadCount = async () => {
            if (currentUser && targetId === currentUser.uid) {
                try {
                    const count = await getUnreadCount(currentUser.uid);
                    setUnreadNotifications(count);
                } catch (err) {
                    console.error('Error loading unread count:', err);
                }
            }
        };

        loadUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [currentUser, targetId]);

    if (loading) return <div className="ps-loading">Loading...</div>;

    if (!user) {
        return (
            <div className="ps-loading-column">
                <SEO title="User Not Found" />
                <h2>User not found</h2>
                <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>Go Home</button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.uid === user.id;

    return (
        <div className="ps-page">
            <SEO
                title={user.displayName || 'Profile'}
                description={user.bio || `Check out ${user.displayName}'s profile on Panospace.`}
                type="profile"
            />
            {/* Header with Space Theme */}
            <div style={{
                background: '#000',
                paddingTop: '0', // No top padding, content will push down
                paddingBottom: '0.25rem', // Ultra minimal padding
                borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
                width: '100%',
                // height: 'auto', // Let content dictate height
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Stars Background */}
                <StarBackground starColor={user.profileTheme?.starColor || '#7FFFD4'} />

                {/* Content Layer */}
                <div style={{
                    width: '100%',
                    // removed maxWidth/margin auto to allow true left alignment relative to screen
                    position: 'relative',
                    zIndex: 1,
                    padding: window.innerWidth < 768 ? '0 1.5rem' : '0 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                }}>

                    {/* --- ACTIONS & NAVIGATION --- */}

                    {/* Small Planet Home Icon - Fixed Top Left (Global Position) */}
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            position: 'fixed',
                            top: 'max(0.75rem, env(safe-area-inset-top))',
                            left: '1rem',
                            width: '40px',
                            height: '40px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            zIndex: 10000,
                            transition: 'opacity 0.2s',
                            filter: 'drop-shadow(0 0 8px rgba(127,255,212,0.3))'
                        }}
                        title="Go to Home Feed"
                    >
                        <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="planetGradientProfile" cx="40%" cy="40%">
                                    <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                                </radialGradient>
                                <filter id="planetGlowProfile">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <ellipse cx="16" cy="16" rx="11" ry="3" fill="none" stroke="#7FFFD4" strokeWidth="1.2" opacity="0.4" transform="rotate(-20 16 16)" />
                            <circle cx="16" cy="16" r="6" fill="url(#planetGradientProfile)" opacity="0.95" filter="url(#planetGlowProfile)" />
                            <ellipse cx="16" cy="16" rx="11" ry="3" fill="none" stroke="#7FFFD4" strokeWidth="1.2" opacity="0.6" transform="rotate(-20 16 16)" strokeDasharray="0,6,15,100" />
                            <circle cx="16" cy="16" r="6" fill="none" stroke="#7FFFD4" strokeWidth="0.4" opacity="0.3" />
                        </svg>
                    </button>



                    {/* --- LAYER 1: CENTERED USERNAME (With Absolute Elements around) --- */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // Center Username
                        justifyContent: 'center',
                        width: '100%',
                        marginTop: '12px', // Reduced top spacing
                        marginBottom: '4px'
                    }}>
                        {/* Username */}
                        <h1 style={{
                            fontSize: window.innerWidth < 768 ? '1.5rem' : '2.2rem',
                            fontWeight: '800',
                            margin: '0',
                            fontFamily: 'var(--font-family-heading)',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            lineHeight: '1.0',
                            background: (user.profileTheme?.usernameColor && user.profileTheme.usernameColor.includes('gradient'))
                                ? user.profileTheme.usernameColor
                                : 'transparent',
                            WebkitBackgroundClip: (user.profileTheme?.usernameColor && user.profileTheme.usernameColor.includes('gradient'))
                                ? 'text' : 'border-box',
                            WebkitTextFillColor: (user.profileTheme?.usernameColor && user.profileTheme.usernameColor.includes('gradient'))
                                ? 'transparent' : (user.profileTheme?.usernameColor || '#FFFFFF'),
                            color: (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient'))
                                ? user.profileTheme.usernameColor
                                : '#FFFFFF',
                            textShadow: '0 0 30px rgba(0,0,0,0.5)',
                            wordBreak: 'break-word',
                            textAlign: 'center' // Explicitly center text
                        }}>
                            {user.username || user.displayName}
                        </h1>

                        {/* Icons Container - Rendering Children Absolutely */}
                        <div>
                            {/* Wallet (Own Profile Only) */}
                            {isOwnProfile && (
                                <button
                                    onClick={() => setShowAddFunds(true)}
                                    title="Wallet"
                                    style={{
                                        position: 'absolute',
                                        top: '70px', // Moved down slightly to align
                                        right: 'calc(1rem + 5px)', // Moved 5px left
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        color: user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')
                                            ? user.profileTheme.usernameColor
                                            : '#7FFFD4',
                                        opacity: 0.9,
                                        transition: 'transform 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <FaWallet size={window.innerWidth < 768 ? 20 : 24} />
                                </button>
                            )}

                            {/* Business Card (Always Visible) */}
                            <button
                                onClick={() => setShowBusinessCard(true)}
                                title={isOwnProfile ? "Edit Business Card" : "View Business Card"}
                                style={{
                                    position: 'absolute',
                                    top: '70px', // Moved down to match Wallet
                                    left: 'calc(1rem + 5px)', // Moved 5px right
                                    background: 'transparent',
                                    border: 'none', // Ensure no box
                                    outline: 'none', // Ensure no box
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')
                                        ? user.profileTheme.usernameColor
                                        : '#7FFFD4',
                                    opacity: 0.9,
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <FaIdBadge size={window.innerWidth < 768 ? 20 : 24} />
                            </button>
                        </div>
                    </div>

                    {/* --- LAYER 2: STATS & ACTIONS --- */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        marginTop: '0px',
                        marginBottom: '0px'
                    }}>
                        {/* Wrapper for Stats to keep structure if needed, or just list items */}

                        {/* Stats Row (Followers/Following) - Right of Planet */}
                        <div style={{
                            position: 'absolute',
                            top: '23px', // Moved 5px down (18 + 5)
                            left: '60px', // Planet width + gap
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <button
                                onClick={() => { setFollowListType('followers'); setShowFollowList(true); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none', // Removed thick border
                                    padding: '2px 4px', // Minimal padding
                                    cursor: 'pointer',
                                    fontSize: '0.7rem', // Smaller text
                                    color: 'rgba(255,255,255,0.5)', // Gray text
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-family-body)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = user.profileTheme?.usernameColor || '#fff';
                                    e.currentTarget.style.textDecoration = 'underline'; // Hover effect
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                            >
                                <span style={{
                                    fontWeight: 'bold',
                                    color: (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient'))
                                        ? user.profileTheme.usernameColor
                                        : '#fff'
                                }}>
                                    {user.followersCount || 0}
                                </span>
                                Followers
                            </button>

                            <button
                                onClick={() => { setFollowListType('following'); setShowFollowList(true); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '2px 4px',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    color: 'rgba(255,255,255,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-family-body)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = user.profileTheme?.usernameColor || '#fff';
                                    e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                            >
                                <span style={{
                                    fontWeight: 'bold',
                                    color: (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient'))
                                        ? user.profileTheme.usernameColor
                                        : '#fff'
                                }}>
                                    {user.followingCount || 0}
                                </span>
                                Following
                            </button>
                        </div>

                        {/* Badges & Disciplines (Optional, keep if needed for context, but keep small) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginTop: '8px' }}>
                            {user.disciplines?.main?.length > 0 && (
                                <button
                                    onClick={() => setShowDisciplinesModal(true)}
                                    style={{
                                        padding: '0.2rem 0.5rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '4px',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: '0.65rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        fontFamily: 'var(--font-family-heading)',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    <FaPalette size={9} />
                                    {user.disciplines.main.length} {user.disciplines.main.length === 1 ? 'Discipline' : 'Disciplines'}
                                </button>
                            )}
                        </div>

                        {/* Follow / Commission Buttons */}
                        {!isOwnProfile && (
                            <div style={{ marginTop: '12px', display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        background: isFollowing ? 'transparent' : (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)'),
                                        border: `1px solid ${isFollowing ? (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)') : 'transparent'}`,
                                        borderRadius: '2px',
                                        color: isFollowing ? (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)') : '#000',
                                        fontWeight: '700',
                                        cursor: followLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '0.8rem',
                                        opacity: followLoading ? 0.6 : 1,
                                        fontFamily: 'var(--font-family-heading)',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                                    }}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button
                                    onClick={() => setShowCommissionModal(true)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '2px',
                                        color: '#fff',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontFamily: 'var(--font-family-heading)',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                                    }}
                                >
                                    Commission
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- LAYER 3: AVATAR (Relative Centered) --- */}
                    <div style={{
                        position: 'relative', // Resets to flow
                        marginTop: '4px', // Reduced gap
                        marginBottom: '12px', // Matched bottom spacing
                        display: 'flex',
                        justifyContent: 'center',
                        width: 'auto',
                        zIndex: 10
                    }}>
                        <div style={{
                            position: 'relative',
                            width: window.innerWidth < 768 ? '75px' : '90px',
                            height: window.innerWidth < 768 ? '75px' : '90px',
                            borderRadius: '20px', // Slightly sharper rounding
                            background: '#000',
                            zIndex: 10
                        }}>
                            {/* Iridescent/Gradient Border Effect */}
                            {user.profileTheme?.borderColor && user.profileTheme.borderColor.includes('gradient') && (
                                <div style={{
                                    position: 'absolute',
                                    inset: '-3px',
                                    borderRadius: '23px',
                                    background: user.profileTheme.borderColor,
                                    backgroundSize: '200% 200%',
                                    animation: 'iridescent-border 3s linear infinite',
                                    zIndex: 0
                                }} />
                            )}

                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: (user.profileTheme?.borderColor && user.profileTheme.borderColor.includes('gradient'))
                                    ? 'none'
                                    : `2px solid ${user.profileTheme?.borderColor || 'rgba(127, 255, 212, 0.3)'}`,
                                position: 'relative',
                                zIndex: 1,
                                background: '#111',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                            }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#888' }}>{user.displayName?.[0]?.toUpperCase() || '?'}</div>
                                )}
                            </div>

                            {/* Notification Badge */}
                            {isOwnProfile && unreadNotifications > 0 && (
                                <div
                                    onClick={() => navigate('/notifications')}
                                    style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        width: '18px',
                                        height: '18px',
                                        background: '#00ff00',
                                        borderRadius: '50%',
                                        border: '2px solid #000',
                                        boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
                                        cursor: 'pointer',
                                        zIndex: 20,
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Tabs */}
            < div style={{ borderBottom: '1px solid #222', marginBottom: window.innerWidth < 768 ? '0.75rem' : '2rem', overflowX: 'auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center', // Center the tabs
                    width: '100%', // Ensure full width for centering
                    minWidth: 'max-content',
                    // paddingLeft removed to allow centering
                    // paddingRight removed
                }}>
                    {[
                        { id: 'posts', label: 'Posts', icon: FaTh, enabled: true },
                        { id: 'shop', label: 'Shop', icon: FaShoppingBag, enabled: isFeatureEnabled('SHOP') },
                        { id: 'collections', label: 'Collections', icon: FaLayerGroup, enabled: isFeatureEnabled('COLLECTIONS') },
                        { id: 'gallery', label: 'Gallery', icon: FaImage, enabled: isFeatureEnabled('GALLERIES') },
                        { id: 'cards', label: 'Cards', icon: FaRocket, enabled: isFeatureEnabled('SPACECARDS_CREATE') },
                        { id: 'badges', label: 'Badges', icon: FaCheck, enabled: true }
                    ].filter(tab => tab.enabled).map(tab => {
                        const Icon = tab.icon;
                        const isMobile = window.innerWidth < 768;
                        const isSelected = activeTab === tab.id;

                        // Tab Color Logic
                        const usernameColor = user.profileTheme?.usernameColor || '#FFFFFF';
                        const isGradient = usernameColor.includes('gradient');
                        const bioColor = user.profileTheme?.bioColor || 'rgba(255,255,255,0.7)'; // Default dimmed color

                        // Determine styles based on selection and color type
                        let tabStyle = {};

                        if (isSelected) {
                            if (isGradient) {
                                tabStyle = {
                                    background: usernameColor,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    borderBottom: '2px solid transparent', // Can't easily gradient border here without extra div, use white or primary stop for now?
                                    // Hack for gradient border-bottom: use border-image or pseudo element. 
                                    // Simple fallback: use a solid color for border if gradient text.
                                    // Or just use star color for border.
                                    borderBottomColor: user.profileTheme?.starColor || '#7FFFD4'
                                };
                            } else {
                                tabStyle = {
                                    color: usernameColor,
                                    borderBottom: `2px solid ${usernameColor}`
                                };
                            }
                        } else {
                            // Unselected
                            tabStyle = {
                                color: bioColor, // Use the dimmed bio color
                                borderBottom: '2px solid transparent'
                            };
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: '0 0 auto',
                                    padding: isMobile ? '0.5rem 0.75rem' : '1rem 1.5rem',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                                    fontWeight: isSelected ? '700' : '500',
                                    fontFamily: 'var(--font-family-heading)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    ...tabStyle
                                }}
                            >
                                <Icon size={isMobile ? 13 : 16} style={{ color: isSelected && isGradient ? user.profileTheme?.starColor : 'inherit' }} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div >

            {/* Content */}
            < div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                {activeTab === 'posts' && (
                    <InfiniteGrid
                        items={posts}
                        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                        gap="1rem"
                        renderItem={(post, index) => (
                            <div
                                onClick={() => navigate(`/post/${post.id}`, {
                                    state: {
                                        contextPosts: posts,
                                        initialIndex: index
                                    }
                                })}
                                style={{
                                    aspectRatio: '1',
                                    background: '#111',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                {post.images?.[0]?.url || post.imageUrl ? (
                                    <img
                                        src={post.images?.[0]?.url || post.imageUrl}
                                        alt=""
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
                        )}
                    />
                )}

                {
                    activeTab === 'shop' && (
                        <InfiniteGrid
                            items={shopItems}
                            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                            gap="1rem"
                            renderItem={(item) => {
                                const prices = item.printSizes?.map(s => Number(s.price)) || [];
                                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                return (
                                    <div
                                        onClick={() => navigate(`/shop/${item.id}`)}
                                        style={{
                                            aspectRatio: '1',
                                            background: '#111',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            opacity: item.available ? 1 : 0.7
                                        }}
                                    >
                                        <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.8)',
                                            padding: '0.5rem',
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span>{minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'View'}</span>
                                            {!item.available && <span style={{ color: '#aaa', fontStyle: 'italic' }}>Draft</span>}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    )
                }

                {
                    activeTab === 'collections' && (
                        <>
                            {isOwnProfile && (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => navigate('/create-collection')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#7FFFD4',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaPlus /> Create Collection
                                    </button>
                                </div>
                            )}
                            <InfiniteGrid
                                items={collections}
                                columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                                gap="1rem"
                                renderItem={(collection) => (
                                    <div
                                        onClick={() => navigate(`/collection/${collection.id}`)}
                                        style={{
                                            aspectRatio: '1',
                                            background: '#111',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        {collection.coverImage ? (
                                            <img src={collection.coverImage} alt={collection.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '2rem' }}>
                                                <FaLayerGroup />
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.8)',
                                            padding: '0.5rem',
                                            color: '#fff'
                                        }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{collection.title}</div>
                                            <div style={{ color: '#888', fontSize: '0.75rem' }}>{collection.postRefs?.length || 0} posts</div>
                                        </div>
                                    </div>
                                )}
                            />
                        </>
                    )
                }

                {
                    activeTab === 'cards' && (
                        <>
                            {isOwnProfile && (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowCreateCardModal(true)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#7FFFD4',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaPlus /> Create Card
                                    </button>
                                </div>
                            )}
                            <InfiniteGrid
                                items={spaceCards}
                                columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                                gap="1rem"
                                renderItem={(card) => {
                                    const isHighRarity = card.rarity === 'Legendary' || card.rarity === 'Mythic' || card.rarity === 'Epic';
                                    return (
                                        <div style={{
                                            position: 'relative',
                                            aspectRatio: '2/3',
                                            borderRadius: '12px',
                                            overflow: 'visible'
                                        }}>
                                            {/* Iridescent border for high rarity cards */}
                                            {isHighRarity && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: '-3px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                                                    backgroundSize: '300% 300%',
                                                    animation: 'iridescent-border 6s ease infinite',
                                                    zIndex: 0
                                                }} />
                                            )}

                                            {/* Card content */}
                                            <div style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '100%',
                                                background: '#000',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: isHighRarity ? 'none' : '2px solid #7FFFD4',
                                                boxShadow: isHighRarity
                                                    ? '0 0 30px rgba(224, 179, 255, 0.4), 0 8px 32px rgba(0,0,0,0.5)'
                                                    : '0 0 20px rgba(127, 255, 212, 0.3), 0 8px 24px rgba(0,0,0,0.4)',
                                                zIndex: 1
                                            }}>
                                                {(card.images?.front || card.imageUrl) && (
                                                    <img
                                                        src={card.images?.front || card.imageUrl}
                                                        alt={card.title || card.name}
                                                        loading="lazy"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                )}

                                                {/* Card title overlay */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                                    padding: '1.5rem 0.75rem 0.75rem',
                                                    color: '#fff'
                                                }}>
                                                    <div style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {card.title || card.name}
                                                    </div>
                                                    {card.rarity && (
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: isHighRarity ? '#e0b3ff' : '#7FFFD4',
                                                            fontWeight: '500'
                                                        }}>
                                                            {card.rarity}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </>
                    )
                }

                {
                    activeTab === 'badges' && (
                        <InfiniteGrid
                            items={badges}
                            columns={{ mobile: 3, tablet: 4, desktop: 6 }}
                            gap="1rem"
                            renderItem={(badge) => (
                                <div style={{
                                    aspectRatio: '1',
                                    background: '#111',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: `3px solid ${badge.borderColor || '#7FFFD4'}`,
                                    position: 'relative'
                                }}>
                                    <img src={badge.imageUrl} alt={badge.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        />
                    )
                }

                {
                    activeTab === 'gallery' && (
                        <>
                            {/* Purchased Prints Section */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaShoppingBag style={{ color: '#7FFFD4' }} />
                                    Purchased Prints
                                </h3>
                                {orders.length > 0 ? (
                                    <InfiniteGrid
                                        items={orders}
                                        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                                        gap="1rem"
                                        renderItem={(order) => (
                                            <div style={{
                                                background: '#111',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid #333'
                                            }}>
                                                <div style={{ aspectRatio: '1', background: '#222', position: 'relative' }}>
                                                    <img src={order.items?.[0]?.imageUrl} alt="Print" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ padding: '0.75rem' }}>
                                                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Order #{order.id.slice(0, 8)}</div>
                                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{new Date(order.createdAt?.toDate()).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#111', borderRadius: '8px' }}>
                                        No purchased prints yet.
                                    </div>
                                )}
                            </div>

                            {/* Owned Cards Section */}
                            <div>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaRocket style={{ color: '#e0b3ff' }} />
                                    Marketplace Cards
                                </h3>
                                {spaceCards.length > 0 ? (
                                    <InfiniteGrid
                                        items={spaceCards}
                                        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                                        gap="1rem"
                                        renderItem={(card) => {
                                            const isHighRarity = card.rarity === 'Legendary' || card.rarity === 'Mythic' || card.rarity === 'Epic';
                                            return (
                                                <div style={{
                                                    position: 'relative',
                                                    aspectRatio: '2/3',
                                                    borderRadius: '12px',
                                                    overflow: 'visible'
                                                }}>
                                                    {/* Iridescent border for high rarity cards */}
                                                    {isHighRarity && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: '-3px',
                                                            borderRadius: '12px',
                                                            background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                                                            backgroundSize: '300% 300%',
                                                            animation: 'iridescent-border 6s ease infinite',
                                                            zIndex: 0
                                                        }} />
                                                    )}

                                                    {/* Card content */}
                                                    <div style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: '#000',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        border: isHighRarity ? 'none' : '2px solid #7FFFD4',
                                                        boxShadow: isHighRarity
                                                            ? '0 0 30px rgba(224, 179, 255, 0.4), 0 8px 32px rgba(0,0,0,0.5)'
                                                            : '0 0 20px rgba(127, 255, 212, 0.3), 0 8px 24px rgba(0,0,0,0.4)',
                                                        zIndex: 1
                                                    }}>
                                                        {(card.images?.front || card.imageUrl) && (
                                                            <img
                                                                src={card.images?.front || card.imageUrl}
                                                                alt={card.title || card.name}
                                                                loading="lazy"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        )}

                                                        {/* Card title overlay */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                                            padding: '1.5rem 0.75rem 0.75rem',
                                                            color: '#fff'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '0.9rem',
                                                                fontWeight: '600',
                                                                marginBottom: '0.25rem'
                                                            }}>
                                                                {card.title || card.name}
                                                            </div>
                                                            {card.rarity && (
                                                                <div style={{
                                                                    fontSize: '0.75rem',
                                                                    color: isHighRarity ? '#e0b3ff' : '#7FFFD4',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {card.rarity}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#111', borderRadius: '8px' }}>
                                        No marketplace cards owned.
                                    </div>
                                )}
                            </div>
                        </>
                    )
                }

                {/* Empty States */}
                {
                    activeTab === 'posts' && posts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No posts yet.</div>
                    )
                }
                {
                    activeTab === 'shop' && shopItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No items for sale.</div>
                    )
                }
                {
                    activeTab === 'collections' && collections.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                            {isOwnProfile ? 'No collections yet. Create your first collection!' : 'No collections yet.'}
                        </div>
                    )
                }
                {
                    activeTab === 'cards' && spaceCards.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No space cards yet.</div>
                    )
                }
                {
                    activeTab === 'badges' && badges.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No badges earned yet.</div>
                    )
                }
            </div >

            {/* Report Modal */}
            {
                showReportModal && (
                    <ReportModal
                        isOpen={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        contentType="user"
                        contentId={targetId}
                    />
                )
            }

            {
                showCreateCardModal && (
                    <CreateCardModal
                        onClose={() => setShowCreateCardModal(false)}
                        onCreated={(newCard) => {
                            setSpaceCards(prev => [newCard, ...prev]);
                            setShowCreateCardModal(false);
                        }}
                    />
                )
            }

            {
                showBusinessCard && (
                    <BusinessCardModal
                        isOpen={showBusinessCard}
                        onClose={() => setShowBusinessCard(false)}
                        user={user}
                    />
                )
            }

            {
                showCommissionModal && (
                    <CommissionModal
                        editorId={targetId}
                        editorName={user.displayName}
                        onClose={() => setShowCommissionModal(false)}
                        onSuccess={() => {
                            setShowCommissionModal(false);
                            alert('Commission request submitted successfully!');
                        }}
                    />
                )
            }

            <CreateMuseumModal
                isOpen={showCreateMuseumModal}
                onClose={() => setShowCreateMuseumModal(false)}
                onSuccess={(newMuseum) => {
                    window.location.reload();
                }}
            />

            {/* Twinkle Animation CSS */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
                
                @keyframes iridescent-border {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 50% 100%; }
                    50% { background-position: 100% 50%; }
                    75% { background-position: 50% 0%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
                    }
                    50% {
                        box-shadow: 0 0 16px rgba(0, 255, 0, 1);
                    }
                }
                
                /* Profile Action Icons - Mobile Only */
                .profile-mobile-actions {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .profile-mobile-actions {
                        position: absolute !important;
                        top: calc(max(0.75rem, env(safe-area-inset-top)) - 2px) !important;
                        left: 1rem !important;
                        right: auto !important;
                        display: flex !important;
                        gap: 0.75rem !important;
                        align-items: center !important;
                        z-index: 9999 !important;
                    }
                }
                
                @media (min-width: 769px) {
                    .profile-mobile-actions {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Disciplines Modal */}
            {
                showDisciplinesModal && (
                    <DisciplinesModal
                        disciplines={user.disciplines}
                        onClose={() => setShowDisciplinesModal(false)}
                    />
                )
            }

            {/* Follow List Modal */}
            <FollowListModal
                isOpen={showFollowList}
                onClose={() => setShowFollowList(false)}
                userId={user.id}
                type={followListType}
            />
        </div >
    );
};

export default Profile;
