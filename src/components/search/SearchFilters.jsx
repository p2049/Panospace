import React, { useRef } from 'react';
import { FaSortAmountDown, FaTh, FaList } from 'react-icons/fa';
import { SORT_OPTIONS } from '../../constants/searchFilters';
import PSButton from '../PSButton';
import ColorWheelSearch from './ColorWheelSearch';

const SearchFilters = ({
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    selectedColor,
    onColorSelect,
    onColorClear
}) => {
    const sortDropdownRef = useRef(null);

    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
        }}>
            {/* Sort Dropdown - Custom Implementation */}
            <div ref={sortDropdownRef} style={{ position: 'relative', marginRight: '0.5rem' }}>
                <PSButton
                    variant="mint"
                    size="md"
                    active={isSortDropdownOpen}
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    style={{ minWidth: '140px', justifyContent: 'space-between' }}
                >
                    <span>{SORT_OPTIONS.find(opt => opt.id === sortBy)?.label || 'Sort By'}</span>
                    <FaSortAmountDown style={{ fontSize: '0.8rem', opacity: 0.8 }} />
                </PSButton>

                {/* Dropdown Menu */}
                {isSortDropdownOpen && (
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

            {/* Color Search */}
            <ColorWheelSearch
                selectedColor={selectedColor}
                onColorSelect={onColorSelect}
                onClear={onColorClear}
            />

            <PSButton
                variant="mint"
                size="md"
                active={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                icon={<FaTh />}
                style={{ padding: '0.6rem' }}
            />
            <PSButton
                variant="mint"
                size="md"
                active={viewMode === 'feed'}
                onClick={() => setViewMode('feed')}
                icon={<FaList />}
                style={{ padding: '0.6rem' }}
            />
        </div>
    );
};

export default SearchFilters;
