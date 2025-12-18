import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaCheck, FaArrowLeft, FaFilter, FaMapMarkerAlt, FaPalette, FaCompass, FaUsers, FaGlobe, FaSmile, FaBan } from 'react-icons/fa';
import { useCustomFeeds } from '@/hooks/useCustomFeeds';
import { useFeedStore } from '@/core/store/useFeedStore';

const CustomFeedManager = () => {
    const navigate = useNavigate();
    const { feeds, loading, deleteFeed } = useCustomFeeds();
    const {
        customFeedEnabled,
        activeCustomFeedId,
        setCustomFeedEnabled,
        setActiveCustomFeed,
        switchToFeed
    } = useFeedStore();

    const handleSelectFeed = (feed) => {
        setActiveCustomFeed(feed.id, feed.name);
        setCustomFeedEnabled(true);
        // Ensure we are in a mode that renders content (Feed.jsx handles this now)
        navigate('/');
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this custom feed?")) {
            await deleteFeed(id);
        }
    };

    const handleCreateNew = () => {
        navigate('/custom-feeds/create');
    };

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
                    onClick={() => navigate('/')}
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
                }}>Custom Feeds</h1>
            </div>

            <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                <p style={{
                    color: 'var(--text-secondary, #6b7f78)',
                    background: 'rgba(110, 255, 216, 0.05)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(110, 255, 216, 0.1)',
                    marginBottom: '2rem',
                    fontSize: '0.9rem'
                }}>
                    Create personalized feeds based on specific tags, locations, colors, or orientation.
                    Switch to these feeds anytime from the main menu.
                </p>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : feeds.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        border: '1px dashed rgba(110, 255, 216, 0.2)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary, #6b7f78)'
                    }}>
                        <FaFilter size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No custom feeds yet.</p>
                        <button
                            onClick={handleCreateNew}
                            style={{
                                marginTop: '1rem',
                                padding: '0.8rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid var(--accent, #6effd8)',
                                color: 'var(--accent, #6effd8)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Create Your First Feed
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {feeds.map(feed => {
                            const isActive = customFeedEnabled && activeCustomFeedId === feed.id;
                            return (
                                <div
                                    key={feed.id}
                                    onClick={() => handleSelectFeed(feed)}
                                    style={{
                                        background: isActive ? 'rgba(110, 255, 216, 0.1)' : 'var(--bg-card, #050808)',
                                        border: isActive ? '1px solid var(--accent, #6effd8)' : '1px solid rgba(110, 255, 216, 0.1)',
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <h3 style={{
                                            margin: 0,
                                            color: 'var(--text-primary, #d8fff1)',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {feed.name}
                                            {isActive && <FaCheck size={14} color="var(--accent)" />}
                                        </h3>
                                        <button
                                            onClick={(e) => handleDelete(feed.id, e)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff4444',
                                                opacity: 0.7,
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    {/* Filters Summary */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {feed.includeGlobal && (
                                            <span style={pillStyle}><FaGlobe size={10} /> Global</span>
                                        )}
                                        {feed.includeFollowing && (
                                            <span style={pillStyle}><FaUsers size={10} /> Following</span>
                                        )}
                                        {feed.orientation !== 'any' && (
                                            <span style={pillStyle}><FaCompass size={10} /> {feed.orientation}</span>
                                        )}
                                        {feed.locations && feed.locations.length > 0 && (
                                            <span style={pillStyle}><FaMapMarkerAlt size={10} /> {feed.locations.length} Locations</span>
                                        )}
                                        {feed.tags && feed.tags.length > 0 && (
                                            <span style={pillStyle}><FaFilter size={10} /> {feed.tags.length} Tags</span>
                                        )}

                                        {feed.humorSetting === 'hide' && (
                                            <span style={pillStyle}><FaBan size={10} /> No Humor</span>
                                        )}
                                        {feed.humorSetting === 'only' && (
                                            <span style={pillStyle}><FaSmile size={10} /> Humor Only</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={handleCreateNew}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--accent, #6effd8)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 100
                }}
            >
                <FaPlus size={20} />
            </button>
        </div>
    );
};

const pillStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '100px',
    padding: '4px 10px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary, #6b7f78)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
};

export default CustomFeedManager;
