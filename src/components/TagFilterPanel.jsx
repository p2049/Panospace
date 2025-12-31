import React, { useState } from 'react';
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TagFilterPanel = ({
    category,
    selectedTags = [],
    onTagToggle,
    isExpanded = true,
    onToggleExpand
}) => {
    if (!category) return null;

    // Get subcategories
    const subcategories = category.subcategories || {};
    const firstLevelNames = Object.keys(subcategories);

    // State for 2-level navigation
    const [selectedFirst, setSelectedFirst] = useState(null);
    const [selectedSecond, setSelectedSecond] = useState(null);

    // Build breadcrumb path
    const selectedPath = selectedSecond
        ? [selectedFirst, selectedSecond]
        : selectedFirst
            ? [selectedFirst]
            : [];

    // Determine what to render
    let contentToRender = null;

    if (!selectedFirst) {
        // Show first-level subcategories
        contentToRender = firstLevelNames;
    } else if (selectedFirst && !selectedSecond) {
        // Show second-level options (children of selectedFirst)
        const firstLevelData = subcategories[selectedFirst];
        if (Array.isArray(firstLevelData)) {
            // Simple array - these are the tags
            contentToRender = firstLevelData;
        } else {
            // Has second level - show second-level subcategories
            contentToRender = firstLevelData;
        }
    } else {
        // Show tags (children of selectedSecond)
        const firstLevelData = subcategories[selectedFirst];
        contentToRender = firstLevelData[selectedSecond] || firstLevelData;
    }

    // Check if current level has tags (not subcategories)
    const isTagLevel = selectedFirst && Array.isArray(subcategories[selectedFirst]);

    return (
        <>
            <style>{`
                .tags-grid::-webkit-scrollbar,
                .subcategory-row::-webkit-scrollbar {
                    height: 4px;
                }
                .tags-grid::-webkit-scrollbar-track,
                .subcategory-row::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 3px;
                }
                .tags-grid::-webkit-scrollbar-thumb,
                .subcategory-row::-webkit-scrollbar-thumb {
                    background: rgba(127, 255, 212, 0.3);
                    border-radius: 3px;
                }
                .tags-grid::-webkit-scrollbar-thumb:hover,
                .subcategory-row::-webkit-scrollbar-thumb:hover {
                    background: rgba(127, 255, 212, 0.5);
                }
            `}</style>
            <div className="tag-filter-panel" style={{
                marginBottom: '0.8rem',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                border: '1px solid rgba(127, 255, 212, 0.3)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(127, 255, 212, 0.05)',
                /* backdropFilter: 'blur(12px)', Removed for iOS stability */
                /* WebkitBackdropFilter: 'blur(12px)', Removed for iOS stability */
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div
                    className="panel-header"
                    onClick={onToggleExpand}
                    style={{
                        padding: '0.8rem 1.2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.03)' : 'none',
                        boxSizing: 'border-box'
                    }}
                >
                    <span style={{
                        fontWeight: 700,
                        color: 'var(--ice-mint)',
                        fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif",
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        textShadow: '0 0 10px rgba(127, 255, 212, 0.2)'
                    }}>
                        {category.label}
                    </span>
                    {isExpanded ?
                        <FaChevronUp size={10} color="var(--ice-mint)" style={{ opacity: 0.8, filter: 'drop-shadow(0 0 5px rgba(127, 255, 212, 0.5))', flexShrink: 0, marginLeft: '0.5rem' }} /> :
                        <FaChevronDown size={10} color="rgba(255, 255, 255, 0.3)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                    }
                </div>

                {isExpanded && (
                    <div className="panel-content" style={{
                        padding: '0.5rem 1.2rem 1rem 1.2rem',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                    }}>
                        {/* Breadcrumb / Subcategory Row */}
                        <div className="subcategory-row" style={{
                            display: 'flex',
                            gap: '0.4rem',
                            marginBottom: '0.7rem',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            paddingBottom: '0.3rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(127, 255, 212, 0.3) rgba(255, 255, 255, 0.02)',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {selectedPath.length > 0 ? (
                                // Show breadcrumb path
                                selectedPath.map((pathItem, index) => (
                                    <button
                                        key={pathItem}
                                        onClick={() => {
                                            if (index === 0) {
                                                // Clicked first level - clear all
                                                setSelectedFirst(null);
                                                setSelectedSecond(null);
                                            } else if (index === 1) {
                                                // Clicked second level - clear only second
                                                setSelectedSecond(null);
                                            }
                                        }}
                                        style={{
                                            background: 'rgba(127, 255, 212, 0.2)',
                                            border: '1px solid var(--ice-mint)',
                                            color: 'var(--ice-mint)',
                                            padding: '0.35rem 0.65rem',
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            fontFamily: 'var(--font-family-mono)',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 0 10px rgba(127, 255, 212, 0.2)'
                                        }}
                                    >
                                        {pathItem}
                                    </button>
                                ))
                            ) : (
                                // Show first-level subcategories
                                firstLevelNames.map(subcat => (
                                    <button
                                        key={subcat}
                                        onClick={() => setSelectedFirst(subcat)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            padding: '0.35rem 0.65rem',
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            fontFamily: 'var(--font-family-mono)',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            fontWeight: 500,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {subcat}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Content Row - Second-level subcategories OR Tags */}
                        {selectedFirst && (
                            <div className="tags-grid" style={{
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
                                touchAction: 'pan-y pan-x',
                                WebkitOverflowScrolling: 'touch'
                            }}>
                                {isTagLevel || selectedSecond ? (
                                    // Render tags
                                    (Array.isArray(contentToRender) ? contentToRender : []).map(tag => {
                                        const isSelected = selectedTags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => onTagToggle(tag)}
                                                style={{
                                                    background: isSelected ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                                    border: isSelected ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                    color: isSelected ? 'var(--ice-mint)' : '#ffffff',
                                                    padding: '0.5rem 0.9rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.72rem',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    whiteSpace: 'nowrap',
                                                    fontFamily: 'var(--font-family-mono)',
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    boxShadow: isSelected ? '0 0 15px rgba(127, 255, 212, 0.15), inset 0 0 10px rgba(127, 255, 212, 0.05)' : 'none',
                                                    position: 'relative',
                                                    overflow: 'visible',
                                                    /* backdropFilter: 'blur(5px)', Removed for iOS stability */
                                                    minWidth: 'fit-content',
                                                    width: 'auto'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                                        e.currentTarget.style.color = '#fff';
                                                        e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.05)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }
                                                }}
                                            >
                                                {isSelected && <FaCheck size={9} style={{ filter: 'drop-shadow(0 0 2px var(--ice-mint))' }} />}
                                                {tag}
                                            </button>
                                        );
                                    })
                                ) : (
                                    // Render second-level subcategories
                                    Object.keys(contentToRender || {}).map(secondLevel => (
                                        <button
                                            key={secondLevel}
                                            onClick={() => setSelectedSecond(secondLevel)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                padding: '0.5rem 0.9rem',
                                                borderRadius: '6px',
                                                fontSize: '0.72rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                fontFamily: 'var(--font-family-mono)',
                                                letterSpacing: '0.05em',
                                                textTransform: 'uppercase',
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease',
                                                minWidth: 'fit-content',
                                                width: 'auto'
                                            }}
                                        >
                                            {secondLevel}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default TagFilterPanel;
