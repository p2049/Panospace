import React, { useRef } from 'react';
import { FaSortAmountDown, FaTh, FaList } from 'react-icons/fa';
import { SORT_OPTIONS } from '@/core/constants/searchFilters';
import PSButton from '@/components/PSButton';

const MarketFilters = ({
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    selectedSize,
    setSelectedSize,
    selectedType,
    setSelectedType,
    hideViewToggle = false,
    disableDropdowns = false,
    onFilterClick = () => { }
}) => {
    const sortDropdownRef = useRef(null);
    const [isSizeOpen, setIsSizeOpen] = React.useState(false);
    const [isTypeOpen, setIsTypeOpen] = React.useState(false);

    const handleFilterClick = (type, toggleFunc) => {
        if (disableDropdowns) {
            onFilterClick(type);
        } else {
            toggleFunc();
        }
    };

    const SIZES = [
        { id: '', label: 'All Sizes' },
        { id: 'small', label: 'Small (Top 10")' },
        { id: 'medium', label: 'Medium (11"-20")' },
        { id: 'large', label: 'Large (21"-30")' },
        { id: 'xl', label: 'Extra Large (30"+)' }
    ];

    const TYPES = [
        { id: '', label: 'All Types' },
        { id: 'print', label: 'Art Print' },
        { id: 'canvas', label: 'Canvas' },
        { id: 'metal', label: 'Metal' },
        { id: 'poster', label: 'Poster' }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'nowrap' // Prevent wrapping in scroll containers
        }}>
            {/* Size Filter */}
            <div style={{ position: 'relative' }}>
                <PSButton
                    variant="mint"
                    size="sm"
                    active={isSizeOpen || !!selectedSize}
                    onClick={() => handleFilterClick('size', () => { setIsSizeOpen(!isSizeOpen); setIsTypeOpen(false); setIsSortDropdownOpen(false); })}
                    style={{ minWidth: '100px', justifyContent: 'space-between', height: '32px' }}
                >
                    <span>{SIZES.find(s => s.id === selectedSize)?.label.split(' ')[0] || 'Size'}</span>
                    <FaSortAmountDown style={{ fontSize: '0.8rem', opacity: 0.8 }} />
                </PSButton>
                {(!disableDropdowns && isSizeOpen) && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', width: '160px',
                        background: '#000', border: '1px solid var(--ice-mint)', borderRadius: '12px',
                        zIndex: 100, overflow: 'hidden'
                    }}>
                        {SIZES.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { setSelectedSize(opt.id); setIsSizeOpen(false); }}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.8rem',
                                    background: selectedSize === opt.id ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    color: selectedSize === opt.id ? 'var(--ice-mint)' : '#fff',
                                    fontSize: '0.85rem', cursor: 'pointer',
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: '500',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Type Filter */}
            <div style={{ position: 'relative' }}>
                <PSButton
                    variant="mint"
                    size="sm"
                    active={isTypeOpen || !!selectedType}
                    onClick={() => handleFilterClick('type', () => { setIsTypeOpen(!isTypeOpen); setIsSizeOpen(false); setIsSortDropdownOpen(false); })}
                    style={{ minWidth: '100px', justifyContent: 'space-between', height: '32px' }}
                >
                    <span>{TYPES.find(t => t.id === selectedType)?.label || 'Type'}</span>
                    <FaSortAmountDown style={{ fontSize: '0.8rem', opacity: 0.8 }} />
                </PSButton>
                {(!disableDropdowns && isTypeOpen) && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', width: '160px',
                        background: '#000', border: '1px solid var(--ice-mint)', borderRadius: '12px',
                        zIndex: 100, overflow: 'hidden'
                    }}>
                        {TYPES.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { setSelectedType(opt.id); setIsTypeOpen(false); }}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.8rem',
                                    background: selectedType === opt.id ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    color: selectedType === opt.id ? 'var(--ice-mint)' : '#fff',
                                    fontSize: '0.85rem', cursor: 'pointer',
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: '500',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sort Dropdown */}
            <div ref={sortDropdownRef} style={{ position: 'relative' }}>
                <PSButton
                    variant="mint"
                    size="sm"
                    active={isSortDropdownOpen}
                    onClick={() => handleFilterClick('sort', () => { setIsSortDropdownOpen(!isSortDropdownOpen); setIsSizeOpen(false); setIsTypeOpen(false); })}
                    style={{ minWidth: '140px', justifyContent: 'space-between', height: '32px' }}
                >
                    <span>{SORT_OPTIONS.find(opt => opt.id === sortBy)?.label || 'Sort By'}</span>
                    <FaSortAmountDown style={{ fontSize: '0.8rem', opacity: 0.8 }} />
                </PSButton>

                {(!disableDropdowns && isSortDropdownOpen) && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        width: '180px',
                        background: '#000',
                        border: '1px solid var(--ice-mint)',
                        borderRadius: '12px',
                        boxShadow: '0 0 20px rgba(127, 255, 212, 0.2), 0 10px 30px rgba(0,0,0,0.8)',
                        zIndex: 100,
                        overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {SORT_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    setSortBy(opt.id);
                                    setIsSortDropdownOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.8rem 1rem',
                                    background: sortBy === opt.id ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    color: sortBy === opt.id ? 'var(--ice-mint)' : '#fff',
                                    fontSize: '0.85rem',
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: sortBy === opt.id ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                                onMouseEnter={(e) => {
                                    if (sortBy !== opt.id) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.color = 'var(--ice-mint)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (sortBy !== opt.id) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                }}
                            >
                                {opt.label}
                                {sortBy === opt.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ice-mint)', boxShadow: '0 0 5px var(--ice-mint)' }} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {!hideViewToggle && (
                <>
                    <PSButton
                        variant="mint"
                        size="sm"
                        active={viewMode === 'grid'}
                        onClick={() => setViewMode('grid')}
                        icon={<FaTh />}
                        style={{ padding: '0.6rem', height: '32px' }}
                    />
                    <PSButton
                        variant="mint"
                        size="sm"
                        active={viewMode === 'feed'}
                        onClick={() => setViewMode('feed')}
                        icon={<FaList />}
                        style={{ padding: '0.6rem', height: '32px' }}
                    />
                </>
            )}
        </div>
    );
};

export default MarketFilters;
