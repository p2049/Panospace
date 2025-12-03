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
                <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Art Disciplines</label>
                <span style={{ fontSize: '0.8rem', color: selectedMain.length >= 3 ? '#ff4444' : '#888' }}>
                    {selectedMain.length}/3 Main
                </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                Select up to 3 main disciplines. Tap one to reveal sub-niches.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {Object.keys(ART_DISCIPLINES).map(discipline => {
                    const isSelected = selectedMain.includes(discipline);
                    const isExpanded = expandedDiscipline === discipline;
                    const nicheCount = selectedNiches[discipline]?.length || 0;

                    return (
                        <div key={discipline} style={{
                            background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderRadius: '12px',
                            border: isSelected ? '1px solid #444' : '1px solid transparent',
                            overflow: 'hidden'
                        }}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isSelected) toggleMainDiscipline(discipline);
                                    else setExpandedDiscipline(isExpanded ? null : discipline);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: isSelected ? '#222' : '#111',
                                    border: 'none',
                                    color: isSelected ? '#fff' : '#aaa',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.95rem',
                                    borderRadius: '12px'
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
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {isExpanded ? '▼' : '▶'}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {/* Sub-niches Accordion */}
                            {isExpanded && isSelected && (
                                <div style={{ padding: '1rem', borderTop: '1px solid #333', background: '#1a1a1a' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Select specific niches</span>
                                        <span style={{ fontSize: '0.8rem', color: Object.values(selectedNiches).flat().length >= 5 ? '#ff4444' : '#888' }}>
                                            {Object.values(selectedNiches).flat().length}/5 Total
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
                                                        border: isNicheSelected ? '1px solid #fff' : '1px solid #444',
                                                        background: isNicheSelected ? '#fff' : 'transparent',
                                                        color: isNicheSelected ? '#000' : '#ccc',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap'
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
