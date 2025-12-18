import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { FaRedo, FaCalendarAlt, FaRocket, FaUserCircle, FaSearch } from 'react-icons/fa';
import Post from '@/components/Post';
import { getCurrentTheme } from '@/core/constants/monthlyThemes';
import { useBlock } from '@/hooks/useBlock';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';
import StarBackground from '@/components/StarBackground';
import { useThemeColors } from '@/core/store/useThemeStore';
import { filterVisiblePosts } from '@/core/utils/filterHelpers';
import { useToast } from '@/context/ToastContext';
import { useFeedStore } from '@/core/store/useFeedStore';
import { useAuth } from '@/context/AuthContext';
import VirtualizedPostContainer from '@/components/feed/VirtualizedPostContainer';
import ListViewContainer from '@/components/feed/ListViewContainer';
import FeedViewMenu from '@/components/feed/FeedViewMenu';
import PlanetUserIcon from '@/components/PlanetUserIcon';

// Feed component - Main home feed view
const Feed = () => {
    const { currentUser } = useAuth();
    const { accentColor, secondaryColor, glowColorStrong } = useThemeColors();
    const { showToast } = useToast();
    const scrollContainerRef = useRef(null);
    const location = useLocation();

    // Feed State
    const {
        currentFeed,
        followingOnly,
        customFeedEnabled,
        activeCustomFeedId,
        activeCustomFeedName,
        feedDefault,
        switchToFeed,
        setFollowingOnly,
        setCustomFeedEnabled,
        feedViewMode,
        setFeedViewMode
    } = useFeedStore();

    const showSocialPosts = currentFeed === 'social';

    const [activeIndex, setActiveIndex] = useState(0);
    const [menuConfig, setMenuConfig] = useState(null);
    const longPressTimerRef = useRef(null);

    // Enforce default feed type on mount
    useEffect(() => {
        if (feedDefault) {
            switchToFeed(feedDefault);
        }
    }, []); // Run once on mount

    const { posts, loading, error, hasMore, loadMore, refresh } = usePersonalizedFeed(
        'HOME',
        {},
        showSocialPosts,
        followingOnly,
        customFeedEnabled,
        activeCustomFeedId
    );


    const currentTheme = getCurrentTheme();
    const { blockedUsers: rawBlockedUsers } = useBlock();

    // SAFETY FIX: Ensure blockedUsers is always a Set to prevent crashes in filter logic
    const blockedUsers = React.useMemo(() => {
        if (rawBlockedUsers instanceof Set) return rawBlockedUsers;
        if (Array.isArray(rawBlockedUsers)) return new Set(rawBlockedUsers);
        return new Set();
    }, [rawBlockedUsers]);

    const navigate = useNavigate();

    // Filter out blocked content - memoized to prevent re-renders
    // STABILITY: Ensure posts is always an array
    const visiblePosts = React.useMemo(() =>
        filterVisiblePosts(posts || [], blockedUsers),
        [posts, blockedUsers]
    );

    // Filter for image feed only - excludes text posts (postType === 'text')
    // Legacy posts without postType field are included (they are image posts)
    const imageOnlyPosts = React.useMemo(() =>
        visiblePosts.filter(p => p.postType !== 'text'),
        [visiblePosts]
    );

    // Scroll behavior: Always start at top
    // Previous scroll restoration logic removed as per user request
    useEffect(() => {
        // Reset scroll to top on mount if needed, though default browser behavior handles this mostly.
        // Ensuring it for good measure.
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [location.pathname]); // Run on navigation to this page

    // --- VIEW MODE INTERACTION LOGIC ---

    const isSafeTarget = (target) => {
        // Exclude interactive elements and media
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO') return false;
        if (target.closest('a, button, input, textarea, .interactive')) return false;
        return true;
    };

    const handleContextMenu = (e) => {
        // Desktop Right Click
        if (isSafeTarget(e.target)) {
            e.preventDefault();
            setMenuConfig({ x: e.clientX, y: e.clientY, isMobile: false });
        }
    };

    const handleTouchStart = (e) => {
        if (!isSafeTarget(e.target)) return;
        // Start long press timer
        longPressTimerRef.current = setTimeout(() => {
            // Trigger Mobile Menu
            if (navigator.vibrate) navigator.vibrate(50);
            setMenuConfig({ isMobile: true });
        }, 500);
    };

    const handleTouchCancel = () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };

    // Keyboard Shortcut 'V'
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
                e.key.toLowerCase() === 'v' &&
                !e.metaKey && !e.ctrlKey && !e.altKey && // No modifiers
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA' &&
                !document.activeElement.isContentEditable
            ) {
                const newMode = feedViewMode === 'image' ? 'list' : 'image';
                setFeedViewMode(newMode);
                showToast(`Switched to ${newMode === 'image' ? 'Image Feed' : 'List View'}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [feedViewMode, setFeedViewMode, showToast]);

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                background: '#000',
                overflow: 'hidden',
                position: 'relative',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
            }}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchCancel}
            onTouchMove={handleTouchCancel}
        >
            <SEO title="Home" description="Your personalized feed of amazing art and photography." />

            {/* Deep Space Background - Only show when empty */}
            {visiblePosts.length === 0 && <StarBackground />}

            {/* Planet Logo - Top Left (avoiding Dynamic Island) */}
            <div style={{
                position: 'absolute',
                top: 'max(0.75rem, env(safe-area-inset-top))',
                left: '1rem',
                zIndex: 50,
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                height: '40px',
            }}>
                <svg
                    width="40"
                    height="40"
                    viewBox="-5 -5 34 34"
                    onClick={() => {
                        const newMode = feedViewMode === 'image' ? 'list' : 'image';
                        setFeedViewMode(newMode);
                        showToast(`Switched to ${newMode === 'image' ? 'Image Feed' : 'List View'}`);
                    }}
                    style={{
                        flexShrink: 0,
                        filter: `drop-shadow(0 0 8px ${glowColorStrong})`,
                        cursor: 'pointer',
                        overflow: 'visible',
                        transition: 'filter 0.2s ease'
                    }}
                    title="Switch View"
                >
                    <defs>
                        <radialGradient id="planetGradient" cx="40%" cy="40%">
                            <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
                        </radialGradient>
                        <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                    <circle cx="12" cy="12" r="7" fill="url(#planetGradient)" opacity="0.95" filter="url(#planetGlow)" />
                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                    <circle cx="12" cy="12" r="7" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
                </svg>
            </div>

            {
                loading && posts.length === 0 && (
                    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 10, position: 'relative' }}>
                        Loading...
                    </div>
                )
            }

            {
                !loading && error && (
                    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', gap: '1rem', textAlign: 'center', padding: '2rem', zIndex: 10, position: 'relative' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Unable to load feed</h2>
                        <p style={{ color: '#aaa', maxWidth: '400px', marginBottom: '1.5rem' }}>{error}</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={refresh} style={{ background: 'var(--ice-mint)', border: 'none', color: '#000', padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                <FaRedo /> Try Again
                            </button>
                        </div>
                    </div>
                )
            }



            {!loading && visiblePosts.length === 0 && (
                <div style={{
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    gap: '1rem',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 5
                }}>
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        textAlign: 'center',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '0.5rem',
                            color: '#7FFFD4',
                            textShadow: '0 0 10px rgba(127, 255, 212, 0.5)',
                            fontFamily: "'Rajdhani', sans-serif",
                            fontWeight: '700',
                            letterSpacing: '0.05em'
                        }}>
                            {customFeedEnabled ? (activeCustomFeedName || 'No Matching Posts') : 'No Posts Yet'}
                        </h2>
                        <p style={{
                            color: '#aaa',
                            marginBottom: '1rem',
                            fontSize: '1.1rem',
                            maxWidth: '300px'
                        }}>
                            {customFeedEnabled
                                ? "This custom orbit didn't capture anything."
                                : "Follow some creators to see their work here!"}
                        </p>


                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '250px' }}>
                            {/* Home Button */}
                            <button
                                onClick={() => {
                                    setCustomFeedEnabled(false);
                                    switchToFeed('HOME');
                                }}
                                style={emptyStateButtonStyle}
                            >
                                <FaRocket size={16} /> Return Home
                            </button>

                            {/* Profile Button */}
                            <button
                                onClick={() => navigate(`/profile/${currentUser?.uid}`)}
                                style={emptyStateButtonStyle}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(127, 255, 212, 0.4)'
                                }}>
                                    {currentUser?.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <PlanetUserIcon size={16} color="#7FFFD4" />
                                    )}
                                </div>
                                My Profile
                            </button>

                            {/* Search Button */}
                            <button
                                onClick={() => navigate('/search')}
                                style={emptyStateButtonStyle}
                            >
                                <FaSearch size={16} /> Search
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {visiblePosts.length > 0 && (
                <>
                    <style>
                        {`
                            .no-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                            .no-scrollbar {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }
                        `}
                    </style>

                    {/* Render Container Based on Mode */}
                    {feedViewMode === 'image' ? (
                        <div
                            style={{
                                height: '100%',
                                background: '#000'
                            }}
                        >
                            <VirtualizedPostContainer
                                posts={imageOnlyPosts}
                                initialIndex={activeIndex}
                                onIndexChange={setActiveIndex}
                                onRefresh={refresh}
                                renderPost={(post, index, isCurrent) => (
                                    <Post
                                        post={post}
                                        contextPosts={imageOnlyPosts}
                                        viewMode="image"
                                        displayMode="feed"
                                        priority={isCurrent ? 'high' : 'normal'}
                                    />
                                )}
                            />
                        </div>
                    ) : (
                        <ListViewContainer
                            posts={visiblePosts}
                            initialIndex={activeIndex}
                            onIndexChange={setActiveIndex}
                            onRefresh={refresh}
                            renderPost={(post, index, isCurrent) => (
                                <Post
                                    post={post}
                                    contextPosts={visiblePosts}
                                    viewMode="list"
                                    displayMode="feed"
                                    priority={isCurrent ? 'high' : 'normal'}
                                    onClick={() => {
                                        // Find index in image feed
                                        let targetIndex = imageOnlyPosts.findIndex(p => p.id === post.id);

                                        // If not found (e.g. mixed content), default to first item to guarantee switch
                                        if (targetIndex === -1) {
                                            targetIndex = 0;
                                        }

                                        setActiveIndex(targetIndex);
                                        setFeedViewMode('image');
                                        showToast('Switched to Image Feed');
                                    }}
                                />
                            )}
                        />
                    )}
                </>
            )}

            {/* View Mode Menu */}
            {menuConfig && (
                <FeedViewMenu
                    anchorPoint={menuConfig}
                    isMobile={menuConfig.isMobile}
                    onClose={() => setMenuConfig(null)}
                />
            )}
        </div>
    );
};

const emptyStateButtonStyle = {
    padding: '0.8rem 1.5rem',
    background: 'rgba(127, 255, 212, 0.1)',
    color: '#7FFFD4',
    border: '1px solid rgba(127, 255, 212, 0.3)',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    transition: 'all 0.2s',
    width: '100%',
    backdropFilter: 'blur(5px)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

export default Feed;
