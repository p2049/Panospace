import React, { useState, useEffect, useRef } from 'react';
import StarBackground from '@/components/StarBackground';
import TagFilterPanel from '@/components/TagFilterPanel';
import { TAG_CATEGORIES } from '@/core/constants/tagCategories';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';

const MarketPanels = ({
    selectedTags,
    onTagToggle,
    onClearAll,
    isMobileFiltersOpen,
    onMobileFilterToggle,
    onScroll,
    isMobile,
    children
}) => {
    const [expandedPanels, setExpandedPanels] = useState({
        art_types: true,
        environment: true,
        color: true,
        aesthetics: true,
        location: true,
        objects: true,
        technique: true,
        portraits: true,
        animals: true,
        time: true
    });

    const sidebarRef = useRef(null);

    const togglePanel = (panelId) => {
        setExpandedPanels(prev => ({
            ...prev,
            [panelId]: !prev[panelId]
        }));
    };

    return (
        <div className="search-panels-layout" style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Desktop Sidebar / Mobile Drawer */}
            <aside
                ref={sidebarRef}
                className={`filters-sidebar ${isMobileFiltersOpen ? 'mobile-open' : ''}`}
                style={{
                    width: '320px',
                    background: '#000',
                    border: '1px solid #7FFFD4',
                    boxShadow: '0 0 20px rgba(127, 255, 212, 0.3), 10px 0 40px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 100,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated Stars Background */}
                <StarBackground />

                <style>{`
                    @media (max-width: 768px) {
                        .filters-sidebar {
                            position: fixed !important;
                            top: 0;
                            left: 0;
                            bottom: 0;
                            width: 100% !important;
                            transform: translateX(-100%);
                            background: rgba(0, 0, 0, 0.95) !important;
                            backdrop-filter: blur(10px);
                            flex-shrink: 0 !important;
                            z-index: 9999 !important;
                        }
                        
                        .filters-sidebar.mobile-open {
                            transform: translateX(0);
                        }

                        .mobile-close-btn {
                            display: block !important;
                            background: none;
                            border: none;
                            color: #fff;
                            font-size: 1.2rem;
                            cursor: pointer;
                        }
                        
                        .search-panels-layout {
                            display: block !important;
                        }
                        
                        .search-results-area {
                            width: 100% !important;
                            height: 100% !important;
                            flex: none !important;
                        }
                    }
                    
                    @media (max-height: 768px) and (orientation: landscape) {
                        .filters-sidebar {
                            position: fixed !important;
                            top: 0;
                            left: 0;
                            bottom: 0;
                            width: 100% !important;
                            transform: translateX(-100%);
                            background: rgba(0, 0, 0, 0.95) !important;
                            backdrop-filter: blur(10px);
                            flex-shrink: 0 !important;
                            z-index: 9999 !important;
                        }
                        
                        .filters-sidebar.mobile-open {
                            transform: translateX(0);
                        }
                    }
                `}</style>

                <div className="filters-header" style={{
                    padding: 'max(1rem, env(safe-area-inset-top)) 1.5rem 1rem 1.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2
                        onClick={() => {
                            if (isMobileFiltersOpen) {
                                onMobileFilterToggle(false);
                            }
                        }}
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            margin: 0,
                            fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            userSelect: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            color: '#fff',
                            textShadow: '0 0 10px rgba(127, 255, 212, 0.3)'
                        }}
                    >
                        {isMobile && (
                            <FaArrowLeft
                                size={16}
                                color="var(--ice-mint)"
                                style={{
                                    filter: 'drop-shadow(0 0 5px rgba(127, 255, 212, 0.5))'
                                }}
                            />
                        )}
                        <span style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #7FFFD4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.3))'
                        }}>
                            Filters
                        </span>
                    </h2>
                    {(selectedTags.length > 0) && (
                        <button
                            onClick={onClearAll}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--ice-mint)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                borderBottom: '1px solid var(--ice-mint)',
                                padding: '0',
                                lineHeight: '1.2',
                                opacity: 0.8,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                        >
                            CLEAR ALL
                        </button>
                    )}
                    <button
                        className="mobile-close-btn"
                        onClick={() => onMobileFilterToggle(false)}
                        style={{ display: 'none' }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="filters-content" style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '0.5rem max(1.5rem, env(safe-area-inset-left)) 1.5rem max(1.5rem, env(safe-area-inset-right))'
                }}>
                    <TagFilterPanel
                        category={TAG_CATEGORIES.ART_TYPES}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.art_types}
                        onToggleExpand={() => togglePanel('art_types')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.ENVIRONMENT}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.environment}
                        onToggleExpand={() => togglePanel('environment')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.COLOR}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.color}
                        onToggleExpand={() => togglePanel('color')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.AESTHETICS}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.aesthetics}
                        onToggleExpand={() => togglePanel('aesthetics')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.LOCATION}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.location}
                        onToggleExpand={() => togglePanel('location')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.OBJECTS}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.objects}
                        onToggleExpand={() => togglePanel('objects')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.TECHNIQUE}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.technique}
                        onToggleExpand={() => togglePanel('technique')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.PORTRAITS}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.portraits}
                        onToggleExpand={() => togglePanel('portraits')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.ANIMALS}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.animals}
                        onToggleExpand={() => togglePanel('animals')}
                    />
                    <TagFilterPanel
                        category={TAG_CATEGORIES.TIME}
                        selectedTags={selectedTags}
                        onTagToggle={onTagToggle}
                        isExpanded={expandedPanels.time}
                        onToggleExpand={() => togglePanel('time')}
                    />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="search-results-area" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--black)'
            }}>
                {/* Results Content */}
                <div
                    style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0' }}
                    onScroll={onScroll}
                >
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MarketPanels;
