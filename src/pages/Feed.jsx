import React, { useState, useEffect, useRef } from 'react';
import { usePersonalizedFeed } from '../hooks/usePersonalizedFeed';
import { FaRedo, FaCalendarAlt, FaRocket } from 'react-icons/fa';
import Post from '../components/Post';
import { getCurrentTheme } from '../constants/monthlyThemes';
import { useBlock } from '../hooks/useBlock';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import StarBackground from '../components/StarBackground';
import { useFeedType } from '../hooks/useFeedType';
import FeedTypeIndicator from '../components/FeedTypeIndicator';
import { isDualFeedsEnabled } from '../config/feedConfig';
import { filterVisiblePosts } from '../utils/filterHelpers';

// Feed component - Main home feed view
const Feed = () => {
    const { feedType, toggleFeed } = useFeedType();
    const [showIndicator, setShowIndicator] = useState(false);
    const [switchCount, setSwitchCount] = useState(0);

    // Pass feedType to hook if dual feeds enabled, otherwise null (show all)
    const { posts, loading, error, hasMore, loadMore, refresh } = usePersonalizedFeed(
        'HOME',
        {},
        isDualFeedsEnabled() ? feedType : null
    );

    const currentTheme = getCurrentTheme();
    const { blockedUsers } = useBlock();
    const navigate = useNavigate();

    // Filter out blocked content
    const visiblePosts = filterVisiblePosts(posts, blockedUsers);

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#000', overflow: 'hidden', position: 'relative' }}>
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
                height: '40px' // Ensure consistent height container
            }}>
                <svg
                    width="40"
                    height="40"
                    viewBox="-5 -5 34 34"
                    onClick={() => {
                        if (isDualFeedsEnabled()) {
                            toggleFeed();
                            setSwitchCount(prev => prev + 1);
                            setShowIndicator(true);
                        } else {
                            navigate('/search');
                        }
                    }}
                    style={{
                        flexShrink: 0,
                        filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.4))',
                        cursor: 'pointer',
                        overflow: 'visible'
                    }}
                    title={isDualFeedsEnabled() ? "Switch Feed" : "Go to Search"}
                >
                    <defs>
                        <radialGradient id="planetGradient" cx="40%" cy="40%">
                            <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                        </radialGradient>
                        <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                    <circle cx="12" cy="12" r="7" fill="url(#planetGradient)" opacity="0.95" filter="url(#planetGlow)" />
                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                    <circle cx="12" cy="12" r="7" fill="none" stroke="#7FFFD4" strokeWidth="0.5" opacity="0.3" />
                </svg>
            </div>

            {/* Feed Type Indicator Overlay */}
            <FeedTypeIndicator feedType={feedType} show={showIndicator} switchCount={switchCount} />

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
                                {isDualFeedsEnabled() && feedType === 'social'
                                    ? 'Lost in Space'
                                    : 'No posts yet'}
                            </h2>
                            <p style={{
                                color: '#aaa',
                                marginBottom: '1.5rem',
                                fontSize: '1.1rem'
                            }}>
                                {isDualFeedsEnabled() && feedType === 'social'
                                    ? 'The Social Feed is empty. Be the first to share something!'
                                    : 'Follow some creators to see their work here!'}
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
                                {isDualFeedsEnabled() && feedType === 'social' ? (
                                    <>
                                        <FaRocket /> Explore PanoSpace
                                    </>
                                ) : (
                                    'Find Creators'
                                )}
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
                        className="no-scrollbar"
                        style={{
                            height: '100%',
                            overflowY: 'scroll',
                            scrollSnapType: 'y mandatory',
                            scrollBehavior: 'smooth'
                        }}
                    >
                        {visiblePosts.map((post, index) => (
                            <div key={`${post.id}-${index}`} style={{ height: '100vh', scrollSnapAlign: 'start' }}>
                                <Post
                                    post={post}
                                    displayMode="feed"
                                />
                            </div>
                        ))}
                        {loading && (
                            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', scrollSnapAlign: 'start' }}>
                                Loading more...
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Feed;
