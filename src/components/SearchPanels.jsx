import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StarBackground from './StarBackground';
import TagFilterPanel from './TagFilterPanel';
import ModernIcon from './ModernIcon';
import CustomDropdown from './CustomDropdown';
import { TAG_CATEGORIES } from '@/core/constants/tagCategories';
import { PARKS_DATA } from '@/core/constants/parksData';
import { CAMERA_MODELS, FILM_STOCKS, ASPECT_RATIOS, ORIENTATIONS } from '@/core/constants/searchFilters';
import { formatDateForDisplay, formatDateForInput } from '@/core/utils/dates';
import { FaFilter, FaTimes, FaMountain, FaTree, FaCalendar, FaCamera, FaCrop, FaFilm, FaChevronDown, FaChevronUp, FaArrowLeft, FaShoppingBag, FaAlignLeft } from 'react-icons/fa';  // ADDED FaArrowLeft, FaAlignLeft
import CurrentAppEventsBox from '@/components/search/CurrentAppEventsBox';
import PanoDateInput from '@/components/common/PanoDateInput';
import TopicContextBanner from '@/components/search/TopicContextBanner';

const SearchPanels = ({
    selectedTags,
    onTagToggle,
    selectedPark,
    onParkSelect,
    selectedDate,
    onDateSelect,
    selectedCamera,
    onCameraSelect,
    selectedFilm,
    onFilmSelect,
    selectedOrientation,
    onOrientationSelect,
    selectedAspectRatio,
    onAspectRatioSelect,
    onClearAll,
    resultsCount,
    currentMode = 'posts',
    isMobileFiltersOpen,
    onMobileFilterToggle,
    onScroll,
    isMobile, // NEW
    isMarketplaceMode, // NEW
    onMarketplaceToggle, // NEW
    children
}) => {
    const [expandedPanels, setExpandedPanels] = useState({
        date: true,
        parks: false,
        gear: false,
        composition: false,
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

    const [parkType, setParkType] = useState('national'); // Track national vs state parks
    const sidebarRef = useRef(null);



    const togglePanel = (panelId) => {
        setExpandedPanels(prev => ({
            ...prev,
            [panelId]: !prev[panelId]
        }));
    };

    // Close mobile filters when results change (optional UX choice, keeping open for now allows multi-select)

    return (
        <div className="search-panels-layout" style={{
            display: 'flex',
            height: '100vh', // Full page usage
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
                    zIndex: 1000,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated Stars Background */}
                <StarBackground />

                {/* Distant Galaxy Effect */}
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(ellipse at center, rgba(127, 255, 212, 0.08) 0%, rgba(76, 201, 240, 0.05) 30%, transparent 70%)',
                    filter: 'blur(40px)',
                    opacity: 0.6,
                    pointerEvents: 'none',
                    zIndex: 0,
                    animation: 'galaxyRotate 20s linear infinite'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        width: '300px',
                        height: '100px',
                        background: 'radial-gradient(ellipse at center, rgba(127, 255, 212, 0.1) 0%, transparent 70%)',
                        filter: 'blur(30px)'
                    }}></div>
                </div>

                <style>{`
                    @keyframes twinkle {
                        0%, 100% { opacity: 0.2; }
                        50% { opacity: 0.6; }
                    }
                    @keyframes galaxyRotate {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to { transform: translate(-50%, -50%) rotate(360deg); }
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
                            // Tapping the title closes the panel on mobile
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
                            gap: '0.8rem', // Increased gap
                            color: '#fff', // Default color for non-gradient items
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
                            filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.3))',
                            fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                            fontWeight: '800'
                        }}>
                            FILTERS
                        </span>
                    </h2>
                    {(selectedTags.length > 0 || selectedPark || selectedDate || selectedCamera || selectedFilm || selectedOrientation || selectedAspectRatio) && (
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
                        style={{ display: 'none' }} // Visible only on mobile via CSS
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="filters-content" style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden', // Prevent horizontal scrolling completely
                    padding: '0.5rem max(1.5rem, env(safe-area-inset-left)) 1.5rem max(1.5rem, env(safe-area-inset-right))'
                }}>

                    {/* Current App Events Box */}
                    {(currentMode === 'posts' || currentMode === 'events') && (
                        <CurrentAppEventsBox />
                    )}





                    {/* Date Filter Panel - Show for Posts, Events, and Text */}
                    {(currentMode === 'posts' || currentMode === 'events' || currentMode === 'text') && (
                        <div style={{ marginBottom: '0.8rem' }}>
                            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                                <PanoDateInput
                                    selected={selectedDate}
                                    onChange={(date) => onDateSelect(date)}
                                    placeholder="Filter by Date"
                                    isClearable
                                />
                            </div>
                        </div>
                    )}

                    {/* Parks Filter Panel - Show for Posts and Events */}
                    {(currentMode === 'posts' || currentMode === 'events') && (
                        <div style={{
                            marginBottom: '0.8rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '16px',
                            border: '1px solid rgba(127, 255, 212, 0.3)',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(127, 255, 212, 0.05)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            overflow: 'hidden'
                        }}>
                            <div
                                onClick={() => togglePanel('parks')}
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: expandedPanels.parks ? '1px solid rgba(255, 255, 255, 0.03)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <ModernIcon icon={FaMountain} size={14} />
                                    <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem', textShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>Parks</span>
                                </div>
                                <FaChevronDown size={10} color="rgba(255, 255, 255, 0.3)" style={{ display: expandedPanels.parks ? 'none' : 'block' }} />
                                <FaChevronUp size={10} color="var(--ice-mint)" style={{ display: expandedPanels.parks ? 'block' : 'none' }} />
                            </div>
                            {expandedPanels.parks && (
                                <div style={{ padding: '0.5rem 1.2rem 1rem 1.2rem' }}>
                                    {/* National/State Toggle */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        padding: '0.3rem',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        <button
                                            onClick={() => setParkType('national')}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: parkType === 'national' ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                                border: parkType === 'national' ? '1px solid var(--ice-mint)' : '1px solid transparent',
                                                borderRadius: '6px',
                                                color: parkType === 'national' ? 'var(--ice-mint)' : '#ffffff',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: parkType === 'national' ? 700 : 400,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                transition: 'all 0.2s',
                                                fontFamily: 'var(--font-family-mono)'
                                            }}
                                        >
                                            National
                                        </button>
                                        <button
                                            onClick={() => setParkType('state')}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: parkType === 'state' ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                                border: parkType === 'state' ? '1px solid var(--ice-mint)' : '1px solid transparent',
                                                borderRadius: '6px',
                                                color: parkType === 'state' ? 'var(--ice-mint)' : '#ffffff',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: parkType === 'state' ? 700 : 400,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                transition: 'all 0.2s',
                                                fontFamily: 'var(--font-family-mono)'
                                            }}
                                        >
                                            State
                                        </button>
                                    </div>

                                    {/* Parks Grid */}
                                    <div className="parks-grid" style={{
                                        display: 'grid',
                                        gridTemplateRows: 'repeat(2, min-content)',
                                        gridAutoFlow: 'column',
                                        gridAutoColumns: 'max-content',
                                        gap: '0.4rem',
                                        rowGap: '0.5rem',
                                        width: '100%',
                                        overflowX: 'auto',
                                        overflowY: 'hidden',
                                        paddingBottom: '0.5rem',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'rgba(127, 255, 212, 0.3) rgba(255, 255, 255, 0.02)',
                                        touchAction: 'auto' // Allow both horizontal and vertical scrolling
                                    }}>
                                        <button
                                            onClick={() => onParkSelect(null)}
                                            style={{
                                                padding: '0.4rem 0.65rem',
                                                background: !selectedPark ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                border: !selectedPark ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '6px',
                                                color: !selectedPark ? 'var(--ice-mint)' : '#ffffff',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                fontFamily: 'var(--font-family-mono)',
                                                letterSpacing: '0.05em',
                                                textTransform: 'uppercase',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            All Parks
                                        </button>
                                        {PARKS_DATA.filter(park => park.parkType === parkType).map(park => (
                                            <button
                                                key={park.parkId}
                                                onClick={() => onParkSelect(park.parkId)}
                                                style={{
                                                    padding: '0.4rem 0.65rem',
                                                    background: selectedPark === park.parkId ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                    border: selectedPark === park.parkId ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                    borderRadius: '6px',
                                                    color: selectedPark === park.parkId ? 'var(--ice-mint)' : '#ffffff',
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem',
                                                    textAlign: 'left',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    fontFamily: 'var(--font-family-mono)',
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {park.parkType === 'national' ? <ModernIcon icon={FaMountain} size={12} glow={false} /> : <ModernIcon icon={FaTree} size={12} glow={false} />}
                                                <span>{park.parkName}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gear Filter Panel - Show for Posts only */}
                    {currentMode === 'posts' && (
                        <div style={{
                            marginBottom: '0.8rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '16px',
                            border: '1px solid rgba(127, 255, 212, 0.3)',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(127, 255, 212, 0.05)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            overflow: 'hidden'
                        }}>
                            <div
                                onClick={() => togglePanel('gear')}
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: expandedPanels.gear ? '1px solid rgba(255, 255, 255, 0.03)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <ModernIcon icon={FaCamera} size={14} />
                                    <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem', textShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>Gear & Film</span>
                                </div>
                                <FaChevronDown size={10} color="rgba(255, 255, 255, 0.3)" style={{ display: expandedPanels.gear ? 'none' : 'block' }} />
                                <FaChevronUp size={10} color="var(--ice-mint)" style={{ display: expandedPanels.gear ? 'block' : 'none' }} />
                            </div>
                            {expandedPanels.gear && (
                                <div style={{ padding: '0.5rem 1.2rem 1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Camera Select */}
                                    <div>
                                        <label style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.05em' }}>CAMERA SYSTEM</label>
                                        <CustomDropdown
                                            value={selectedCamera || ''}
                                            onChange={(value) => onCameraSelect(value || null)}
                                            options={[{ id: '', label: 'Any Camera' }, ...CAMERA_MODELS]}
                                            placeholder="Any Camera"
                                        />
                                    </div>

                                    {/* Film Stock Select */}
                                    <div>
                                        <label style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.05em' }}>FILM STOCK</label>
                                        <CustomDropdown
                                            value={selectedFilm || ''}
                                            onChange={(value) => onFilmSelect(value || null)}
                                            options={[{ id: '', label: 'Any Film' }, ...FILM_STOCKS]}
                                            placeholder="Any Film"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Composition Filter Panel - Show for Posts only */}
                    {currentMode === 'posts' && (
                        <div style={{
                            marginBottom: '0.8rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '16px',
                            border: '1px solid rgba(127, 255, 212, 0.3)',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(127, 255, 212, 0.05)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            overflow: 'hidden'
                        }}>
                            <div
                                onClick={() => togglePanel('composition')}
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: expandedPanels.composition ? '1px solid rgba(255, 255, 255, 0.03)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <ModernIcon icon={FaCrop} size={14} />
                                    <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem', textShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>Composition</span>
                                </div>
                                <FaChevronDown size={10} color="rgba(255, 255, 255, 0.3)" style={{ display: expandedPanels.composition ? 'none' : 'block' }} />
                                <FaChevronUp size={10} color="var(--ice-mint)" style={{ display: expandedPanels.composition ? 'block' : 'none' }} />
                            </div>
                            {expandedPanels.composition && (
                                <div style={{ padding: '0.5rem 1.2rem 1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Orientation Select */}
                                    <div>
                                        <label style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.05em' }}>ORIENTATION</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {ORIENTATIONS.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => onOrientationSelect(selectedOrientation === opt.id ? null : opt.id)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        background: selectedOrientation === opt.id ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                        border: selectedOrientation === opt.id ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                        borderRadius: '8px',
                                                        color: selectedOrientation === opt.id ? 'var(--ice-mint)' : '#ffffff',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        fontFamily: 'var(--font-family-mono)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Aspect Ratio Select */}
                                    <div>
                                        <label style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.05em' }}>ASPECT RATIO</label>
                                        <CustomDropdown
                                            value={selectedAspectRatio || ''}
                                            onChange={(value) => onAspectRatioSelect(value || null)}
                                            options={[{ id: '', label: 'Any Ratio' }, ...ASPECT_RATIOS]}
                                            placeholder="Any Ratio"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


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

                {/* Topic Context Banner - Appears when 2+ tags are active */}
                {currentMode === 'posts' && (
                    <TopicContextBanner
                        selectedTags={selectedTags}
                        onOpenTopic={(tags) => {
                            // Canonicalize tags: sort alphabetically, join with '+'
                            const canonicalSlug = [...tags].sort().join('+');
                            window.location.href = `/start/topic/${canonicalSlug}`;
                        }}
                    />
                )}

                {/* Results Content */}
                <div
                    style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0' }}
                    onScroll={onScroll}

                >
                    {children}
                </div>
            </main>

            <style>{`
                /* Custom Scrollbar for Horizontal Grids */
                .parks-grid::-webkit-scrollbar,
                .tags-grid::-webkit-scrollbar {
                    display: none;
                }



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
                        z-index: 70000 !important;
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
                
                /* Also hide sidebar in landscape mode on mobile/tablet */
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
            `}</style>
        </div>
    );
};

export default SearchPanels;
