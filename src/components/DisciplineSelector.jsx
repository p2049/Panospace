import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { ART_DISCIPLINES } from '../constants/artDisciplines';

const DisciplineSelector = ({
    selectedMain,
    selectedNiches,
    expandedDiscipline,
    setExpandedDiscipline,
    toggleMainDiscipline,
    toggleNiche
}) => {
    return (
        <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: '#7FFFD4', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Art Disciplines</label>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {selectedMain.length} selected
                </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                Select your main disciplines. Click to deselect. Use arrow to view niches.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {Object.keys(ART_DISCIPLINES).map(discipline => {
                    const isSelected = selectedMain.includes(discipline);
                    const isExpanded = expandedDiscipline === discipline;
                    const nicheCount = selectedNiches[discipline]?.length || 0;

                    return (
                        <div key={discipline} style={{
                            background: isSelected ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                            borderRadius: '12px',
                            border: isSelected ? '1px solid rgba(127, 255, 212, 0.3)' : '1px solid transparent',
                            overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isSelected) {
                                        // If already selected, allow toggling it off OR expanding/collapsing
                                        // Click on the main button area toggles selection
                                        toggleMainDiscipline(discipline);
                                    } else {
                                        // If not selected, select it
                                        toggleMainDiscipline(discipline);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: isSelected ? 'rgba(127, 255, 212, 0.05)' : 'rgba(127, 255, 212, 0.02)',
                                    border: 'none',
                                    color: isSelected ? '#7FFFD4' : '#aaa',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.95rem',
                                    borderRadius: '12px',
                                    transition: 'all 0.2s',
                                    fontWeight: isSelected ? '600' : '400'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isSelected && <FaCheck size={12} color="#4CAF50" />}
                                    {discipline}
                                </div>
                                {isSelected && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {nicheCount > 0 && (
                                            <span style={{ fontSize: '0.75rem', background: '#333', padding: '2px 6px', borderRadius: '10px' }}>
                                                {nicheCount} niches
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedDiscipline(isExpanded ? null : discipline);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#666',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.8rem' }}>
                                                {isExpanded ? '▼' : '▶'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </button>

                            {/* Sub-niches Accordion */}
                            {isExpanded && isSelected && (
                                <div style={{ padding: '1rem', borderTop: '1px solid #333', background: '#1a1a1a' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Select specific niches</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                            {Object.values(selectedNiches).flat().length} selected
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateRows: 'repeat(2, min-content)',
                                        gridAutoFlow: 'column',
                                        gridAutoColumns: 'max-content',
                                        gap: '0.5rem',
                                        rowGap: '0.8rem',
                                        width: '100%',
                                        overflowX: 'auto',
                                        overflowY: 'hidden',
                                        paddingBottom: '0.5rem',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'rgba(127, 255, 212, 0.3) rgba(255, 255, 255, 0.02)'
                                    }}>
                                        {ART_DISCIPLINES[discipline].map(niche => {
                                            const isNicheSelected = selectedNiches[discipline]?.includes(niche);
                                            return (
                                                <button
                                                    key={niche}
                                                    type="button"
                                                    onClick={() => toggleNiche(discipline, niche)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        fontSize: '0.8rem',
                                                        borderRadius: '20px',
                                                        border: isNicheSelected ? '1px solid #7FFFD4' : '1px solid rgba(127, 255, 212, 0.2)',
                                                        background: isNicheSelected ? '#7FFFD4' : 'rgba(127, 255, 212, 0.05)',
                                                        color: isNicheSelected ? '#000' : '#ccc',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                        fontWeight: isNicheSelected ? '600' : '400'
                                                    }}
                                                >
                                                    {niche}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DisciplineSelector;
