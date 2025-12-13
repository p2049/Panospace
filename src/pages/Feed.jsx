import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { FaRedo, FaCalendarAlt, FaRocket } from 'react-icons/fa';
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
import VirtualizedPostContainer from '@/components/feed/VirtualizedPostContainer';

// Feed component - Main home feed view
const Feed = () => {
    const { accentColor, secondaryColor, glowColorStrong } = useThemeColors();
    const { showToast } = useToast();
    const scrollContainerRef = useRef(null);
    const location = useLocation();
    const lastScrollPositionRef = useRef(0);
    const isRestoringScrollRef = useRef(false);

    // Pass currentFeed to hook if dual feeds enabled

    const { currentFeed, followingOnly, customFeedEnabled, activeCustomFeedId } = useFeedStore();
    const showSocialPosts = currentFeed === 'social';

    const { posts, loading, error, hasMore, loadMore, refresh } = usePersonalizedFeed(
        'HOME',
        {},
        showSocialPosts,
        followingOnly,
        customFeedEnabled,
        activeCustomFeedId
    );

    const currentTheme = getCurrentTheme();
    const { blockedUsers } = useBlock();
    const navigate = useNavigate();
    const { setFollowingOnly } = useFeedStore(); // Needed for switch button

    // Filter out blocked content - memoized to prevent re-renders
    // STABILITY: Ensure posts is always an array
    const visiblePosts = React.useMemo(() =>
        filterVisiblePosts(posts || [], blockedUsers),
        [posts, blockedUsers]
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

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#000',
            overflow: 'hidden',
            position: 'relative',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
        }}>
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
                        navigate('/profile/me');
                    }}
                    style={{
                        flexShrink: 0,
                        filter: `drop-shadow(0 0 8px ${glowColorStrong})`,
                        cursor: 'pointer',
                        overflow: 'visible',
                        transition: 'filter 0.2s ease'
                    }}
                    title="Go to Profile"
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

            {
                !loading && !error && visiblePosts.length === 0 && (
                    <div style={{
                        height: '100vh',
                        width: '100vw',
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
                            padding: '2rem'
                        }}>
                            <h2 style={{
                                fontSize: '2rem',
                                marginBottom: '1rem',
                                color: '#7FFFD4',
                                textShadow: '0 0 10px rgba(127, 255, 212, 0.5)',
                                fontFamily: "'Rajdhani', sans-serif",
                                fontWeight: '700',
                                letterSpacing: '0.05em'
                            }}>
                                No posts yet
                            </h2>
                            <p style={{
                                color: '#aaa',
                                marginBottom: '1.5rem',
                                fontSize: '1.1rem'
                            }}>
                                Follow some creators to see their work here!
                            </p>
                            <button
                                onClick={() => navigate('/search')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(127, 255, 212, 0.1)',
                                    color: '#7FFFD4',
                                    border: '1px solid #7FFFD4',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 20px rgba(127, 255, 212, 0.2)',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    backdropFilter: 'blur(5px)',
                                    margin: '0 auto'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.background = 'rgba(127, 255, 212, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(127, 255, 212, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.background = 'rgba(127, 255, 212, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(127, 255, 212, 0.2)';
                                }}
                            >
                                Find Creators
                            </button>
                        </div>
                    </div>
                )
            }

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
                    <div
                        style={{
                            height: '100%',
                            background: '#000' // Ensure background is black specifically for the container
                        }}
                    >
                        {/* We import VirtualizedPostContainer dynamically or assume it is imported at top. 
                             Since I cannot add top-level imports easily in a small replace block without risk,
                             I will use a lazy import or assume the previous step's context allows me to add the import separately.
                             However, standard practice is to add import at top. 
                             
                             I will update this block to use VirtualizedPostContainer. 
                             I'll handle the import in a separate tool call if needed or just replace the whole file content section if I need to add import.
                             
                             Actually, I'll replace the block assuming 'VirtualizedPostContainer' is available, 
                             and I will add the import line in a separate call or use a multi-replace to add it at the top.
                          */}
                        <VirtualizedPostContainer
                            posts={visiblePosts}
                            initialIndex={0}
                            renderPost={(post, index, isCurrent) => (
                                <Post
                                    post={post}
                                    displayMode="feed"
                                    priority={isCurrent ? 'high' : 'normal'}
                                />
                            )}
                        />
                    </div>
                </>
            )}
        </div>
    );
};


export default Feed;
