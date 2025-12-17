import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, addDoc, deleteDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useBlock } from '@/hooks/useBlock';
import { useCollections } from '@/hooks/useCollections';
import { useProfile } from '@/hooks/useProfile';
import SEO from '@/components/SEO';
import StarBackground from '@/components/StarBackground';
import WalletDisplay from '@/components/WalletDisplay';
import InfiniteGrid from '@/components/InfiniteGrid';
import CreateMuseumModal from '@/components/CreateMuseumModal';
import MuseumCard from '@/components/MuseumCard';
import ReportModal from '@/components/ReportModal';
import CreateCardModal from '@/components/CreateCardModal';
import { CityCardFrame } from '@/components/CityCardFrame';
import BusinessCardModal from '@/components/BusinessCardModal';
import CommissionModal from '@/components/monetization/CommissionModal';
import WalletModal from '@/components/WalletModal';
import UpgradeModal from '@/components/monetization/AddFundsModal';
import DisciplinesModal from '@/components/DisciplinesModal';
import { getUnreadCount } from '@/services/notificationService';
import { FaPlus, FaLayerGroup, FaTh, FaShoppingBag, FaRocket, FaCheck, FaCog, FaIdBadge, FaFlag, FaBan, FaUserPlus, FaImage, FaWallet, FaPalette, FaStar, FaStore, FaAlignLeft } from 'react-icons/fa';
import FollowListModal from '@/components/FollowListModal';
import { getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { isFeatureEnabled } from '@/config/featureFlags';
import { RocketIcon, AstronautIcon, PlanetIcon } from '@/components/SpaceIcons';
import PlanetUserIcon from '@/components/PlanetUserIcon'; // Import new shared icon
import ShopShelfRow from '@/components/ShopShelfRow'; // NEW: Shop Shelf Component
import { COLORS, getGradientCss, getThemeGradient } from '@/core/theme/colors';
import { RARITY_TIERS, getRarityInfo, normalizeRarity } from '@/services/SpaceCardService';
import '@/styles/rarity-system.css';
import { useThemeStore } from '@/core/store/useThemeStore';
import { useFeedStore } from '@/core/store/useFeedStore';

import { useLayoutEngine } from '@/core/responsive/useLayoutEngine';
import SmartImage from '@/components/SmartImage';
import { renderCosmicUsername } from '@/utils/usernameRenderer';


import BannerThemeRenderer from '@/components/profile/BannerThemeRenderer';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { blockUser } = useBlock();
    const { t } = useTranslation();
    const { showSuccess } = useToast();
    const { setProfileAccent, resetProfileAccent } = useThemeStore();
    const [showCreateMuseumModal, setShowCreateMuseumModal] = useState(false);

    // Responsive Layout Engine
    const { layout, isMobile, getSafeSpacing } = useLayoutEngine('profile');

    const targetId = (id === 'me' || !id) ? currentUser?.uid : id;

    const [activeTab, setActiveTab] = useState('posts');

    // Handle initial tab from URL query params
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [location.search]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBusinessCard, setShowBusinessCard] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showDisciplinesModal, setShowDisciplinesModal] = useState(false);
    const [showFollowList, setShowFollowList] = useState(false);
    const [followListType, setFollowListType] = useState('followers');

    const { currentFeed: feedType, toggleFeed, profileDefault, switchToFeed } = useFeedStore();

    // Enforce default profile feed type on mount
    React.useEffect(() => {
        if (profileDefault) {
            switchToFeed(profileDefault);
        }
    }, []);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showProfilePopout, setShowProfilePopout] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [orders, setOrders] = useState([]);
    const { collections, loading: collectionsLoading } = useCollections(targetId);

    const {
        user,
        posts,
        textPosts,
        shopItems,
        spaceCards,
        badges,
        loading,
        isFollowing,
        followDocId,
        setIsFollowing,
        setFollowDocId,
        setSpaceCards
    } = useProfile(targetId, currentUser, activeTab, feedType);

    const [cardFilter, setCardFilter] = useState('custom');

    const filteredSpaceCards = React.useMemo(() => {
        return spaceCards.filter(c => {
            if (cardFilter === 'app') return c.cardType === 'official';
            return c.cardType !== 'official';
        });
    }, [spaceCards, cardFilter]);

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
                showSuccess('Added to Spaces');
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

    // Determine Banner Background and Mode - moved up for Hooks
    const bannerMode = user?.profileTheme?.bannerMode || 'stars';
    const bannerGradientId = user?.profileTheme?.gradientId || 'aurora-horizon';
    const bannerGradient = getGradientCss(bannerGradientId);

    let effectiveUsernameColor = user?.profileTheme?.usernameColor || '#FFFFFF';
    const isGradientMode = ['gradient', 'simple_gradient'].includes(bannerMode);

    // Calculate contrast and other colors...
    // (Note: I am not modifying the lines I don't need to. I will target specific blocks)
    // --- SMART CONTRAST CHECK ---
    // Ensure username is visible against the background
    if (effectiveUsernameColor) {
        const uc = effectiveUsernameColor.toLowerCase();

        // 1. Simple Gradient: Direct Color Match
        if (bannerMode === 'simple_gradient') {
            const bg = user.profileTheme?.bannerColor?.toLowerCase();
            if (bg && uc === bg) effectiveUsernameColor = '#FFFFFF';
        }
        // 2. Presets: Check if color is part of the gradient definition (excluding white)
        else if (bannerMode === 'gradient') {
            const grad = getThemeGradient(bannerGradientId);
            if (grad?.background?.toLowerCase().includes(uc) && uc !== '#ffffff') {
                effectiveUsernameColor = '#FFFFFF';
            }
        }
        // 3. Dark Themes (City, Ocean, Stars, Neon): Clash with Black/Dark
        else if (['stars', 'neonGrid', 'cyberpunkLines'].includes(bannerMode) || bannerMode.startsWith('city') || bannerMode.startsWith('ocean')) {
            if (['#000000', '#050505', '#000', '#111', '#0a0a0a'].includes(uc)) {
                effectiveUsernameColor = '#FFFFFF';
            }
        }
    }

    const solidPlanetColor = (effectiveUsernameColor?.match(/#[0-9a-fA-F]{6}/) || [COLORS.iceMint])[0];

    const isFadingToBlack = isGradientMode &&
        (bannerGradientId?.endsWith('black') ||
            ['night-sky'].includes(bannerGradientId));



    // Set Global Profile Accent for MobileNavigation
    React.useEffect(() => {
        if (user && !loading) {
            setProfileAccent(effectiveUsernameColor);
        }
        return () => resetProfileAccent();
    }, [effectiveUsernameColor, setProfileAccent, resetProfileAccent, user, loading]);

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

    // Derived state that requires user to be present (though user is present here due to checks above)
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
                background: isGradientMode ? bannerGradient : COLORS.black,
                paddingTop: '0',
                paddingBottom: '0', // Removed minimal padding
                // Hide border if fading to black
                borderBottom: isFadingToBlack ? '1px solid rgba(127, 255, 212, 0.06)' : '1px solid rgba(127, 255, 212, 0.2)',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
            }}>
                {/* Animated Stars Background - Only if enabled */}
                {/* Animated Stars Background - Only if enabled (Delegate to BannerRenderer for City/Ocean) */}
                {(bannerMode === 'stars' || (user.profileTheme?.useStarsOverlay && !bannerMode.startsWith('city') && !bannerMode.startsWith('ocean'))) && (
                    <StarBackground
                        starColor={user.profileTheme?.starColor === 'brand' ? '#7FFFD4' : (user.profileTheme?.starColor || COLORS.iceMint)}
                        multiColor={user.profileTheme?.starColor === 'brand'}
                        transparent={isGradientMode || bannerMode === 'neonGrid'}
                        maskTop={bannerMode === 'neonGrid'}
                    />
                )}

                {/* Modular Banner Theme Renderer */}

                <BannerThemeRenderer
                    mode={bannerMode}
                    color={user.profileTheme?.bannerColor || user.profileTheme?.borderColor || '#7FFFD4'}
                    starSettings={{
                        enabled: user.profileTheme?.useStarsOverlay,
                        color: user.profileTheme?.starColor
                    }}
                />

                {/* Gradient Polish Overlays (Noise + Vignette) - Only if gradient mode */}
                {(isGradientMode) && (
                    <>


                        {/* 2. Bottom Vignette (Soft Fade) */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40%', // Fade covers bottom 40%
                            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }} />
                    </>
                )}

                {/* Content Layer */}
                <div style={{
                    width: '100%',
                    // removed maxWidth/margin auto to allow true left alignment relative to screen
                    position: 'relative',
                    zIndex: 1,
                    padding: `0.25rem ${layout.paddingX}`,
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
                            top: getSafeSpacing('top', '0.75rem'),
                            left: '1rem',
                            width: layout.profile.actionButtonSize,
                            height: layout.profile.actionButtonSize,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            zIndex: 10000,
                            transition: 'opacity 0.2s',
                            filter: `drop-shadow(0 0 8px ${solidPlanetColor}4D)`
                        }}
                        title="Go to Home Feed"
                    >
                        <svg width={layout.profile.actionButtonSize} height={layout.profile.actionButtonSize} viewBox="-5 -5 34 34" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="planetGradientProfile" cx="40%" cy="40%">
                                    <stop offset="0%" style={{ stopColor: solidPlanetColor, stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: solidPlanetColor, stopOpacity: 0.8 }} />
                                </radialGradient>
                                <filter id="planetGlowProfile">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={solidPlanetColor} strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                            <circle cx="12" cy="12" r="7" fill="url(#planetGradientProfile)" opacity="0.95" filter="url(#planetGlowProfile)" />
                            <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={solidPlanetColor} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                            <circle cx="12" cy="12" r="7" fill="none" stroke={solidPlanetColor} strokeWidth="0.5" opacity="0.3" />
                        </svg>
                    </button>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // Center Username
                        justifyContent: 'center',
                        width: '100%',
                        marginTop: '0', // Tightened to 0
                        marginBottom: '0'
                    }}>
                        {/* Username - Single Source of Truth */}
                        <h1 style={{
                            fontSize: layout.profile.usernameSize,
                            fontWeight: '800',
                            margin: '0',
                            fontFamily: 'var(--font-family-heading)',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            lineHeight: '1.0',
                            background: (effectiveUsernameColor && effectiveUsernameColor.includes('gradient'))
                                ? effectiveUsernameColor
                                : 'transparent',
                            WebkitBackgroundClip: (effectiveUsernameColor && effectiveUsernameColor.includes('gradient'))
                                ? 'text' : 'border-box',
                            WebkitTextFillColor: (effectiveUsernameColor && effectiveUsernameColor.includes('gradient'))
                                ? 'transparent' : (effectiveUsernameColor || '#FFFFFF'),
                            color: (effectiveUsernameColor && !effectiveUsernameColor.includes('gradient'))
                                ? effectiveUsernameColor
                                : '#FFFFFF',
                            textShadow: user.profileTheme?.textGlow
                                ? `0 0 12px ${solidPlanetColor}80, 0 0 24px ${solidPlanetColor}40`
                                : '0 0 30px rgba(0,0,0,0.5)',
                            wordBreak: 'break-word',
                            textAlign: 'center' // Explicitly center text
                        }}>
                            {renderCosmicUsername(user.username, user.profileTheme?.borderColor, user.profileTheme?.textGlow)}
                        </h1>

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




                        {/* Follow / Commission Buttons */}
                        {false && !isOwnProfile && (
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
                                    {isFollowing ? 'ADDED' : 'ADD'}
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
                    <div
                        style={{
                            position: 'relative', // Resets to flow
                            marginTop: '2px',
                            marginBottom: '0.5rem', // Added space between avatar and username
                            display: 'flex',
                            justifyContent: 'center',
                            width: 'auto',
                            zIndex: 10
                        }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); setShowProfilePopout(prev => !prev); }}
                            style={{
                                position: 'relative',
                                width: layout.profile.avatarSize,
                                height: layout.profile.avatarSize,
                                borderRadius: '20px', // Slightly sharper rounding
                                background: '#000',
                                zIndex: 10,
                                cursor: 'pointer'
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
                                boxShadow: user.profileTheme?.textGlow
                                    ? `0 0 15px ${user.profileTheme?.borderColor || solidPlanetColor}66, 0 8px 32px rgba(0,0,0,0.5)`
                                    : '0 8px 32px rgba(0,0,0,0.5)'
                            }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <PlanetUserIcon size={parseInt(layout.profile.avatarSize, 10) * 0.7} color={user.profileTheme?.usernameColor || '#7FFFD4'} />
                                    </div>
                                )}
                            </div>

                            {/* Notification Badge */}
                            {isOwnProfile && unreadNotifications > 0 && (
                                <div
                                    onClick={(e) => { e.stopPropagation(); navigate('/notifications'); }}
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

                            {/* Profile Info Popout */}
                            {showProfilePopout && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 99, cursor: 'default' }} onClick={(e) => { e.stopPropagation(); setShowProfilePopout(false); }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 12px)',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(10, 10, 10, 0.95)',
                                        backdropFilter: 'blur(16px)',
                                        border: `1px solid ${user.profileTheme?.borderColor || '#7FFFD4'}`,
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        zIndex: 100,
                                        width: 'max-content',
                                        minWidth: '220px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                                        display: 'flex',
                                        cursor: 'default',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        textAlign: 'left'
                                    }} onClick={(e) => e.stopPropagation()}>
                                        {/* Social Section */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                                <h4 style={{ margin: '0', fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', color: user.profileTheme?.usernameColor }}>Social</h4>

                                                {!isOwnProfile ? (
                                                    <button
                                                        onClick={handleFollow}
                                                        disabled={followLoading}
                                                        style={{
                                                            padding: '2px 8px',
                                                            fontSize: '0.65rem',
                                                            background: 'transparent',
                                                            border: `1px solid ${user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)'}`,
                                                            borderRadius: '4px',
                                                            color: user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)',
                                                            fontWeight: '600',
                                                            cursor: followLoading ? 'wait' : 'pointer',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            fontFamily: 'var(--font-family-heading)',
                                                            opacity: followLoading ? 0.5 : 1
                                                        }}
                                                    >
                                                        {isFollowing ? 'ADDED' : 'ADD'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/edit-profile')}
                                                        style={{
                                                            padding: '2px 8px',
                                                            fontSize: '0.65rem',
                                                            background: 'transparent',
                                                            border: `1px solid ${user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)'}`,
                                                            borderRadius: '4px',
                                                            color: user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient') ? user.profileTheme.usernameColor : 'var(--ice-mint)',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            fontFamily: 'var(--font-family-heading)'
                                                        }}
                                                    >
                                                        {t('profile.editProfile')}
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                <div onClick={() => { setFollowListType('following'); setShowFollowList(true); setShowProfilePopout(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: '800', fontFamily: 'var(--font-family-heading)', color: user.profileTheme?.usernameColor }}>{user.followingCount || 0}</span>
                                                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Spaces</span>
                                                </div>
                                                <div onClick={() => { setFollowListType('followers'); setShowFollowList(true); setShowProfilePopout(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: '800', fontFamily: 'var(--font-family-heading)', color: user.profileTheme?.usernameColor }}>{user.followersCount || 0}</span>
                                                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Visitors</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Creative Section */}
                                        {(user.disciplines?.main?.length > 0) && (
                                            <div>
                                                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', color: user.profileTheme?.usernameColor }}>Creative</h4>
                                                <div onClick={() => { setShowDisciplinesModal(true); setShowProfilePopout(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaPalette size={14} color={(user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff'} />
                                                    <span style={{ fontSize: '0.9rem' }}>{user.disciplines.main.length} Disciplines</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Collectibles Section */}
                                        {spaceCards?.length > 0 && (
                                            <div>
                                                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', color: user.profileTheme?.usernameColor }}>Collectibles</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <PlanetIcon size={14} color={(user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff'} />
                                                    <span style={{ fontSize: '0.9rem' }}>{spaceCards.length} Space Cards</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Identity/Wallet Section */}
                                        <div>
                                            <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', color: user.profileTheme?.usernameColor }}>Identity</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div onClick={() => { setShowBusinessCard(true); setShowProfilePopout(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaIdBadge size={14} color={(user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff'} />
                                                    <span style={{ fontSize: '0.9rem' }}>{t('profile.businessCard')}</span>
                                                </div>
                                                {isOwnProfile && (
                                                    <div onClick={() => { setShowAddFunds(true); setShowProfilePopout(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <FaWallet size={14} color={(user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff'} />
                                                        <span style={{ fontSize: '0.9rem' }}>{t('profile.wallet')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Section */}

                                    </div>
                                </>
                            )}
                        </div>
                    </div>



                    {/* --- NEW STATS ROW (HIDDEN) --- */}
                    {false && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2rem', // Generous spacing
                            marginTop: '4px', // Symmetric space above
                            marginBottom: '4px', // Symmetric space below
                            zIndex: 50
                        }}>
                            {/* Following */}
                            <button
                                onClick={() => { setFollowListType('following'); setShowFollowList(true); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff',
                                    fontFamily: 'var(--font-family-heading)',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                <RocketIcon size={20} color={(user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff'} />
                                {user.followingCount || 0}
                            </button>

                            {/* Followers */}
                            <button
                                onClick={() => { setFollowListType('followers'); setShowFollowList(true); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff',
                                    fontFamily: 'var(--font-family-heading)',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                <AstronautIcon size={20} color={(user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff'} />
                                {user.followersCount || 0}
                            </button>

                            {/* Disciplines */}
                            {user.disciplines?.main?.length > 0 && (
                                <button
                                    onClick={() => setShowDisciplinesModal(true)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient')) ? user.profileTheme.usernameColor : '#fff',
                                        fontFamily: 'var(--font-family-heading)',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <FaPalette size={20} />
                                    {user.disciplines.main.length}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* Tabs */}
            <style>{`
                .profile-tabs-scroll::-webkit-scrollbar { 
                    display: none; 
                }
            `}</style>
            <div className="profile-tabs-scroll" style={{
                borderBottom: '1px solid #222',
                marginBottom: isMobile ? '0.75rem' : '2rem',
                marginTop: '1rem', // Balanced spacing
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE 10+
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center', // Center the tabs
                    width: '100%', // Ensure full width for centering
                    minWidth: 'max-content',
                    // paddingLeft removed to allow centering
                    // paddingRight removed
                }}>
                    {[
                        { id: 'posts', label: t('tab.posts'), icon: FaTh, enabled: true },
                        { id: 'writings', label: 'Writings', icon: FaAlignLeft, enabled: true },
                        { id: 'collections', label: 'Collections', icon: FaLayerGroup, enabled: isFeatureEnabled('COLLECTIONS') },
                        { id: 'shop', label: t('tab.shop'), icon: FaShoppingBag, enabled: true },
                        { id: 'gallery', label: t('tab.galleries'), icon: FaImage, enabled: isFeatureEnabled('GALLERIES') },
                        { id: 'cards', label: 'Cards', icon: PlanetIcon, enabled: isFeatureEnabled('SPACECARDS_CREATE') }
                    ].filter(tab => tab.enabled).map(tab => {
                        const Icon = tab.icon;
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

                        // Add Glow if selected and enabled
                        if (isSelected && user.profileTheme?.textGlow) {
                            tabStyle.textShadow = `0 0 10px ${usernameColor}`;
                            // Removed box shadow per user request
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'posts' && activeTab === 'posts') {
                                        toggleFeed();
                                    } else {
                                        setActiveTab(tab.id);
                                    }
                                }}
                                style={{
                                    flex: '0 0 auto',
                                    height: isMobile ? '1.5rem' : '2rem', // Match username height (1.5rem)
                                    // Use only longhand padding to avoid React style warning
                                    paddingTop: '2px', // Micro-adjustment for visual centering of all-caps font
                                    paddingBottom: '0',
                                    paddingLeft: isMobile ? '12px' : '1.5rem',
                                    paddingRight: isMobile ? '12px' : '1.5rem',
                                    boxSizing: 'border-box',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                                    lineHeight: '1',
                                    fontWeight: isSelected ? '700' : '500',
                                    fontFamily: 'var(--font-family-heading)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    ...tabStyle
                                }}
                            >
                                <Icon
                                    size={tab.id === 'cards' ? (isMobile ? 24 : 28) : (isMobile ? 13 : 16)}
                                    style={{ color: isSelected && isGradient ? user.profileTheme?.starColor : 'inherit' }}
                                />
                                {tab.label}

                                {/* Feed Switcher - Only next to Posts tab */}
                                {tab.id === 'posts' && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent tab switching if clicked directly (though we are on buttons)
                                            toggleFeed();
                                        }}
                                        style={{
                                            marginLeft: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            opacity: isSelected ? 1 : 0.5,
                                            transition: 'transform 0.2s',
                                        }}
                                        title={`Switch to ${feedType === 'art' ? 'Social' : 'Art'} Orbit`}
                                    >
                                        {feedType === 'art' ? <FaPalette size={14} /> : <FaUserPlus size={14} />}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div >

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `0 ${layout.paddingX}` }}>
                {activeTab === 'posts' && (
                    <>

                        <InfiniteGrid
                            items={posts}
                            columns={layout.gridColumns}
                            gap={layout.gridGap}
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
                                    {(() => {
                                        const displaySrc = post.thumbnailUrl || post.items?.[0]?.thumbnailUrl || post.items?.[0]?.url || post.imageUrl || post.image;
                                        const previewSrc = post.previewUrl || post.items?.[0]?.previewUrl;

                                        return displaySrc ? (
                                            <SmartImage
                                                src={displaySrc}
                                                previewSrc={previewSrc}
                                                thumbnailSrc={previewSrc}
                                                alt=""
                                                eager={false}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                                No Image
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        />
                    </>
                )}

                {/* Writings Tab - Text Posts Only */}
                {activeTab === 'writings' && (
                    <>
                        {(!textPosts || textPosts.length === 0) ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem 1rem',
                                color: '#888'
                            }}>
                                <FaAlignLeft size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No writings yet</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Text posts will appear here</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}>
                                {textPosts.map((post, index) => (
                                    <div
                                        key={post.id}
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        style={{
                                            background: '#111',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            cursor: 'pointer',
                                            border: '1px solid #222',
                                            transition: 'border-color 0.2s'
                                        }}
                                    >
                                        {post.title && (
                                            <h3 style={{
                                                margin: '0 0 0.75rem 0',
                                                fontSize: '1.2rem',
                                                fontWeight: '600',
                                                color: '#fff'
                                            }}>
                                                {post.title}
                                            </h3>
                                        )}
                                        {post.body && (
                                            <p style={{
                                                margin: 0,
                                                color: '#aaa',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {post.body}
                                            </p>
                                        )}
                                        {post.linkedPostIds?.length > 0 && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                fontSize: '0.8rem',
                                                color: '#7FFFD4',
                                                opacity: 0.8
                                            }}>
                                                {post.linkedPostIds.length} linked post{post.linkedPostIds.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}



                {
                    activeTab === 'collections' && (
                        <>
                            {isOwnProfile && (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => navigate('/create-collection')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: effectiveUsernameColor || '#7FFFD4',
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
                                columns={layout.gridColumns}
                                gap={layout.gridGap}
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
                                            <SmartImage
                                                src={collection.coverImage}
                                                alt={collection.title}
                                                eager={false}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
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
                            {/* Card Filter Tabs */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                <button
                                    onClick={() => setCardFilter('custom')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: cardFilter === 'custom' ? '#fff' : '#888',
                                        fontWeight: cardFilter === 'custom' ? '700' : '400',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderBottom: cardFilter === 'custom' ? `2px solid ${effectiveUsernameColor || '#7FFFD4'}` : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Custom Cards
                                </button>
                                <button
                                    onClick={() => setCardFilter('app')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: cardFilter === 'app' ? '#fff' : '#888',
                                        fontWeight: cardFilter === 'app' ? '700' : '400',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderBottom: cardFilter === 'app' ? `2px solid ${effectiveUsernameColor || '#7FFFD4'}` : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    App Cards
                                </button>
                            </div>

                            {isOwnProfile && (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setShowCreateCardModal(true)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: effectiveUsernameColor || '#7FFFD4',
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
                            {filteredSpaceCards.length > 0 ? (
                                <InfiniteGrid

                                    items={filteredSpaceCards}
                                    columns={layout.gridColumns}
                                    gap={layout.gridGap}
                                    renderItem={(card) => {

                                        const rarityInfo = getRarityInfo(card.rarity);
                                        const normalizedRarity = normalizeRarity(card.rarity);
                                        const isGalactic = normalizedRarity === 'Galactic';

                                        const layout = card.cardLayout || 'bordered';
                                        const isCity = layout === 'bordered' && card.cityThemeId;

                                        if (isCity) {
                                            return (
                                                <div
                                                    className={rarityInfo.cssClass}
                                                    style={{
                                                        position: 'relative',
                                                        aspectRatio: '2/3',
                                                        borderRadius: '12px',
                                                        overflow: isGalactic ? 'visible' : 'hidden',
                                                        boxShadow: rarityInfo.glow ? `0 0 20px ${rarityInfo.colorHex}40` : 'none'
                                                    }}
                                                >
                                                    <CityCardFrame
                                                        themeId={card.cityThemeId}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ position: 'absolute', inset: 0 }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                                            {/* Image Panel - Top (Standard) */}
                                                            <div style={{
                                                                flex: '0 0 55%',
                                                                margin: '6px 6px 0 6px',
                                                                borderRadius: '6px',
                                                                overflow: 'hidden',
                                                                border: `1px solid ${rarityInfo.colorHex}30`
                                                            }}>
                                                                <SmartImage
                                                                    src={card.images?.front || card.imageUrl || card.frontImage}
                                                                    alt={card.title || card.name}
                                                                    eager={false}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        objectPosition: card.images?.position
                                                                            ? `${card.images.position.x}% ${card.images.position.y}%`
                                                                            : card.imagePosition
                                                                                ? `${card.imagePosition.x}% ${card.imagePosition.y}%`
                                                                                : 'center'
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* Info Panel - Bottom (Standard) */}
                                                            <div style={{
                                                                flex: 1,
                                                                padding: '8px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '3px'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '700',
                                                                    color: '#fff',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.02em',
                                                                    lineHeight: 1.2,
                                                                    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                                                }}>
                                                                    {card.title || card.name}
                                                                </div>
                                                                {card.subjectTag && (
                                                                    <div style={{
                                                                        fontSize: '0.65rem',
                                                                        color: 'rgba(255,255,255,0.6)',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {card.subjectTag}
                                                                    </div>
                                                                )}
                                                                {card.description && (
                                                                    <div style={{
                                                                        fontSize: '0.6rem',
                                                                        color: 'rgba(255,255,255,0.8)',
                                                                        marginTop: '2px',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        lineHeight: 1.2,
                                                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                                                    }}>
                                                                        {card.description}
                                                                    </div>
                                                                )}
                                                                <div style={{
                                                                    marginTop: 'auto',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <span
                                                                        className={`rarity-text-${normalizedRarity.toLowerCase()}`}
                                                                        style={{
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: '700',
                                                                            textTransform: 'uppercase'
                                                                        }}
                                                                    >
                                                                        {normalizedRarity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CityCardFrame>
                                                </div>
                                            );
                                        }

                                        // Default to bordered if undefined (legacy cards) or explicitly bordered
                                        const isBordered = card.cardLayout === 'bordered' || !card.cardLayout;
                                        const isFullbleed = card.cardLayout === 'fullbleed'; // Explicit check for fullbleed
                                        const showBordered = !isFullbleed;

                                        // Rarity-matched gradient for bordered layout
                                        const getRarityGradient = () => {
                                            switch (normalizedRarity) {
                                                case 'Galactic': return 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
                                                case 'Ultra': return 'linear-gradient(180deg, #1a0a12 0%, #2d1420 50%, rgba(255, 107, 157, 0.15) 100%)';
                                                case 'Super': return 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, rgba(108, 92, 231, 0.15) 100%)';
                                                case 'Rare': return 'linear-gradient(180deg, #0a1a1a 0%, #0d2530 50%, rgba(76, 201, 240, 0.15) 100%)';
                                                default: return 'linear-gradient(180deg, #0a1a15 0%, #0d2520 50%, rgba(127, 255, 212, 0.1) 100%)';
                                            }
                                        };

                                        return (
                                            <div
                                                className={rarityInfo.cssClass}
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '2/3',
                                                    borderRadius: '12px',
                                                    overflow: isGalactic ? 'visible' : 'hidden',
                                                    boxShadow: rarityInfo.glow ? `0 0 20px ${rarityInfo.colorHex}40` : 'none'
                                                }}
                                            >
                                                {/* Inner content container */}
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    background: showBordered ? getRarityGradient() : '#000',
                                                    display: showBordered ? 'flex' : 'block',
                                                    flexDirection: 'column'
                                                }}>
                                                    {/* Image Area */}
                                                    {showBordered ? (
                                                        // Bordered: Landscape image at top
                                                        <div style={{
                                                            flex: '0 0 55%',
                                                            margin: '6px 6px 0 6px',
                                                            borderRadius: '6px',
                                                            overflow: 'hidden',
                                                            border: `1px solid ${rarityInfo.colorHex}30`
                                                        }}>
                                                            {(card.images?.front || card.imageUrl || card.frontImage) && (
                                                                <SmartImage
                                                                    src={card.images?.front || card.imageUrl || card.frontImage}
                                                                    alt={card.title || card.name}
                                                                    eager={false}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        objectPosition: card.images?.position
                                                                            ? `${card.images.position.x}% ${card.images.position.y}%`
                                                                            : card.imagePosition
                                                                                ? `${card.imagePosition.x}% ${card.imagePosition.y}%`
                                                                                : 'center'
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Fullbleed: Full image
                                                        (card.images?.front || card.imageUrl || card.frontImage) && (
                                                            <SmartImage
                                                                src={card.images?.front || card.imageUrl || card.frontImage}
                                                                alt={card.title || card.name}
                                                                eager={false}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    objectPosition: card.images?.position
                                                                        ? `${card.images.position.x}% ${card.images.position.y}%`
                                                                        : card.imagePosition
                                                                            ? `${card.imagePosition.x}% ${card.imagePosition.y}%`
                                                                            : 'center'
                                                                }}
                                                            />
                                                        )
                                                    )}

                                                    {/* Card Info */}
                                                    {showBordered ? (
                                                        // Bordered: Info panel at bottom
                                                        <div style={{
                                                            flex: 1,
                                                            padding: '8px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '3px'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '0.85rem',
                                                                fontWeight: '700',
                                                                color: '#fff',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.02em',
                                                                lineHeight: 1.2,
                                                                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                                            }}>
                                                                {card.title || card.name}
                                                            </div>
                                                            {card.subjectTag && (
                                                                <div style={{
                                                                    fontSize: '0.65rem',
                                                                    color: 'rgba(255,255,255,0.6)',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {card.subjectTag}
                                                                </div>
                                                            )}
                                                            {card.description && (
                                                                <div style={{
                                                                    fontSize: '0.6rem',
                                                                    color: 'rgba(255,255,255,0.8)',
                                                                    marginTop: '2px',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    lineHeight: 1.2
                                                                }}>
                                                                    {card.description}
                                                                </div>
                                                            )}
                                                            <div style={{
                                                                marginTop: 'auto',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <span
                                                                    className={`rarity-text-${normalizedRarity.toLowerCase()}`}
                                                                    style={{
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: '700',
                                                                        textTransform: 'uppercase'
                                                                    }}
                                                                >
                                                                    {normalizedRarity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Fullbleed: Overlay at bottom
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
                                                                <div
                                                                    className={`rarity-text-${normalizedRarity.toLowerCase()}`}
                                                                    style={{
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '500'
                                                                    }}
                                                                >
                                                                    {normalizedRarity}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#111', borderRadius: '8px' }}>
                                    No {cardFilter === 'app' ? 'official' : 'custom'} cards found.
                                </div>
                            )}
                        </>
                    )}

                {activeTab === 'shop' && (
                    <div className="tab-content" style={{ padding: '0 2rem 2rem 2rem' }}>

                        {/* SELLER VERIFICATION GATE (OWNER ONLY) */}
                        {isOwnProfile && user?.sellerStatus !== 'verified' && (
                            <div style={{
                                padding: '3rem',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                textAlign: 'center',
                                marginBottom: '2rem'
                            }}>
                                <FaStore size={48} color="#7FFFD4" style={{ marginBottom: '1rem' }} />
                                <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Become a Seller</h2>
                                <p style={{ color: '#888', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                                    To ensure the highest quality prints and verify artist identity,
                                    all sellers must complete a quick verification process.
                                </p>
                                <button
                                    onClick={() => navigate('/shop/verification')}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        background: '#7FFFD4',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {user?.sellerStatus === 'pending' ? 'View Application Status' : 'Start Verification'}
                                </button>
                            </div>
                        )}

                        {/* SHOP CONTENT (Verified Owners OR Visitors) */}
                        {(!isOwnProfile || user?.sellerStatus === 'verified') && (
                            (() => {
                                const activeShopItems = shopItems.filter(item => item.status === 'active');
                                const printItems = activeShopItems.filter(item => item.kind !== 'spacecard');
                                const spaceCardItems = activeShopItems.filter(item => item.kind === 'spacecard');

                                if (activeShopItems.length === 0) {
                                    return (
                                        <div className="ps-empty-state" style={{
                                            padding: '4rem 2rem',
                                            textAlign: 'center',
                                            color: '#888',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <FaShoppingBag size={48} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Your shop is looking empty</h3>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Add items to your shop to start selling.</p>

                                            {isOwnProfile && (
                                                <button
                                                    onClick={() => navigate('/create-post')}
                                                    style={{
                                                        marginTop: '1rem',
                                                        padding: '0.75rem 1.5rem',
                                                        background: effectiveUsernameColor || '#7FFFD4',
                                                        color: '#000',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    Create Your First Item
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                        {/* Prints Shelf */}
                                        <section>
                                            <h3 style={{
                                                marginBottom: '1rem',
                                                color: user.profileTheme?.usernameColor || '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '1.2rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                <FaImage /> Prints
                                            </h3>
                                            <ShopShelfRow items={printItems} kind="print" />
                                        </section>

                                        {/* Space Cards Shelf */}
                                        <section>
                                            <h3 style={{
                                                marginBottom: '1rem',
                                                color: user.profileTheme?.usernameColor || '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '1.2rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                <PlanetIcon size={18} /> Space Cards
                                            </h3>
                                            <ShopShelfRow items={spaceCardItems} kind="spacecard" />
                                        </section>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                )}

                {
                    activeTab === 'badges' && (
                        <InfiniteGrid
                            items={badges}
                            columns={{ mobile: 3, tablet: 4, desktop: 6 }}
                            gap={layout.gridGap}
                            renderItem={(badge) => (
                                <div style={{
                                    aspectRatio: '1',
                                    background: '#111',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: `3px solid ${badge.borderColor || '#7FFFD4'}`,
                                    position: 'relative'
                                }}>
                                    <SmartImage
                                        src={badge.imageUrl}
                                        alt={badge.title}
                                        eager={false}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
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
                                        columns={layout.gridColumns}
                                        gap={layout.gridGap}
                                        renderItem={(order) => (
                                            <div style={{
                                                background: '#111',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid #333',
                                                padding: '1rem',
                                                color: '#fff'
                                            }}>
                                                Order #{order.id}
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
                                    <FaRocket style={{ color: 'var(--brand-purple)' }} />
                                    Marketplace Cards
                                </h3>
                                {spaceCards.length > 0 ? (
                                    <InfiniteGrid
                                        items={spaceCards}
                                        columns={layout.gridColumns}
                                        gap={layout.gridGap}
                                        renderItem={(card) => {
                                            const rarityInfo = getRarityInfo(card.rarity);
                                            const normalizedRarity = normalizeRarity(card.rarity);
                                            const isGalactic = normalizedRarity === 'Galactic';

                                            const layout = card.cardLayout || 'bordered';

                                            if (layout === 'city') {
                                                return (
                                                    <div
                                                        className={rarityInfo.cssClass}
                                                        style={{
                                                            position: 'relative',
                                                            aspectRatio: '2/3',
                                                            borderRadius: '12px',
                                                            overflow: isGalactic ? 'visible' : 'hidden',
                                                            boxShadow: rarityInfo.glow ? `0 0 20px ${rarityInfo.colorHex}40` : 'none'
                                                        }}
                                                    >
                                                        <CityCardFrame
                                                            themeId={card.cityThemeId}
                                                            width="100%"
                                                            height="100%"
                                                            style={{ position: 'absolute', inset: 0 }}
                                                        >
                                                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                                                <div style={{ flex: '0 0 55%', padding: '10px 10px 0 10px' }}>
                                                                    <div style={{ width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                                                        <SmartImage
                                                                            src={card.images?.front || card.imageUrl || card.frontImage}
                                                                            alt={card.title || card.name}
                                                                            eager={false}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'cover',
                                                                                objectPosition: card.images?.position
                                                                                    ? `${card.images.position.x}% ${card.images.position.y}%`
                                                                                    : card.imagePosition
                                                                                        ? `${card.imagePosition.x}% ${card.imagePosition.y}%`
                                                                                        : 'center'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                    <div style={{
                                                                        flex: 1,
                                                                        background: 'rgba(0,0,0,0.6)',
                                                                        backdropFilter: 'blur(4px)',
                                                                        borderRadius: '8px',
                                                                        padding: '10px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                                    }}>
                                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 4px #000', marginBottom: '4px' }}>
                                                                            {card.title || card.name}
                                                                        </div>
                                                                        {card.subjectTag && <div style={{ fontSize: '0.65rem', color: '#ccc' }}>{card.subjectTag}</div>}
                                                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span className={`rarity-text-${normalizedRarity.toLowerCase()}`} style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{normalizedRarity}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CityCardFrame>
                                                    </div>
                                                );
                                            }

                                            // Default to bordered if undefined (legacy cards) or explicitly bordered
                                            const isBordered = card.cardLayout === 'bordered' || !card.cardLayout;
                                            const isFullbleed = card.cardLayout === 'fullbleed';
                                            const showBordered = !isFullbleed;

                                            // Rarity-matched gradient for bordered layout
                                            const getRarityGradient = () => {
                                                switch (normalizedRarity) {
                                                    case 'Galactic': return 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
                                                    case 'Ultra': return 'linear-gradient(180deg, #1a0a12 0%, #2d1420 50%, rgba(255, 107, 157, 0.15) 100%)';
                                                    case 'Super': return 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, rgba(108, 92, 231, 0.15) 100%)';
                                                    case 'Rare': return 'linear-gradient(180deg, #0a1a1a 0%, #0d2530 50%, rgba(76, 201, 240, 0.15) 100%)';
                                                    default: return 'linear-gradient(180deg, #0a1a15 0%, #0d2520 50%, rgba(127, 255, 212, 0.1) 100%)';
                                                }
                                            };

                                            return (
                                                <div
                                                    className={rarityInfo.cssClass}
                                                    style={{
                                                        position: 'relative',
                                                        aspectRatio: '2/3',
                                                        borderRadius: '12px',
                                                        overflow: isGalactic ? 'visible' : 'hidden',
                                                        boxShadow: rarityInfo.glow ? `0 0 20px ${rarityInfo.colorHex}40` : 'none'
                                                    }}
                                                >
                                                    <div style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        background: showBordered ? getRarityGradient() : '#000',
                                                        display: showBordered ? 'flex' : 'block',
                                                        flexDirection: 'column'
                                                    }}>
                                                        {showBordered ? (
                                                            <div style={{
                                                                flex: '0 0 55%',
                                                                margin: '6px 6px 0 6px',
                                                                borderRadius: '6px',
                                                                overflow: 'hidden',
                                                                border: `1px solid ${rarityInfo.colorHex}30`
                                                            }}>
                                                                {(card.images?.front || card.imageUrl || card.frontImage) && (
                                                                    <SmartImage
                                                                        src={card.images?.front || card.imageUrl || card.frontImage}
                                                                        alt={card.title || card.name}
                                                                        eager={false}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            objectPosition: card.images?.position
                                                                                ? `${card.images.position.x}% ${card.images.position.y}%`
                                                                                : card.imagePosition
                                                                                    ? `${card.imagePosition.x}% ${card.imagePosition.y}%`
                                                                                    : 'center'
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            // Fullbleed: Full image
                                                            (card.images?.front || card.imageUrl || card.frontImage) && (
                                                                <SmartImage
                                                                    src={card.images?.front || card.imageUrl || card.frontImage}
                                                                    alt={card.title || card.name}
                                                                    eager={false}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        objectPosition: card.images?.position
                                                                            ? `${card.images.position.x}% ${card.images.position.y}%`
                                                                            : card.imagePosition
                                                                                ? `${card.imagePosition.x}% ${card.imagePosition.y}%`
                                                                                : 'center'
                                                                    }}
                                                                />
                                                            )
                                                        )}

                                                        {isBordered ? (
                                                            <div style={{
                                                                flex: 1,
                                                                padding: '8px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '3px'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '700',
                                                                    color: '#fff',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.02em',
                                                                    lineHeight: 1.2,
                                                                    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                                                }}>
                                                                    {card.title || card.name}
                                                                </div>
                                                                {card.subjectTag && (
                                                                    <div style={{
                                                                        fontSize: '0.65rem',
                                                                        color: 'rgba(255,255,255,0.6)',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {card.subjectTag}
                                                                    </div>
                                                                )}
                                                                <div style={{
                                                                    marginTop: 'auto',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <span
                                                                        className={`rarity-text-${normalizedRarity.toLowerCase()}`}
                                                                        style={{
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: '700',
                                                                            textTransform: 'uppercase'
                                                                        }}
                                                                    >
                                                                        {normalizedRarity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
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
                                                                    <div
                                                                        className={`rarity-text-${normalizedRarity.toLowerCase()}`}
                                                                        style={{
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        {normalizedRarity}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
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

            {
                showWalletModal && (
                    <WalletModal
                        onClose={() => setShowWalletModal(false)}
                    />
                )
            }

            {
                showUpgradeModal && (
                    <UpgradeModal
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )
            }

            <CreateMuseumModal
                isOpen={showCreateMuseumModal}
                onClose={() => setShowCreateMuseumModal(false)}
                onSuccess={() => {
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
