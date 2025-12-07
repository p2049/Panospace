import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const DisciplinesModal = ({ disciplines, onClose }) => {
    const navigate = useNavigate();

    if (!disciplines || (!disciplines.main?.length && !Object.keys(disciplines.niches || {}).length)) {
        return null;
    }

    const handleTagClick = (tag) => {
        navigate(`/search?tags=${encodeURIComponent(tag)}`);
        onClose();
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#111',
                    borderRadius: '16px',
                    border: '1px solid rgba(127, 255, 212, 0.2)',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 0 30px rgba(127, 255, 212, 0.1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#7FFFD4',
                        fontFamily: 'var(--font-family-heading)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        Art Disciplines
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {disciplines.main?.map(mainDiscipline => {
                        const niches = disciplines.niches?.[mainDiscipline] || [];

                        return (
                            <div key={mainDiscipline} style={{ marginBottom: '1.5rem' }}>
                                {/* Main Discipline */}
                                <button
                                    onClick={() => handleTagClick(mainDiscipline)}
                                    style={{
                                        padding: '0.6rem 1rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '8px',
                                        border: '1px solid #7FFFD4',
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        color: '#7FFFD4',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        marginBottom: niches.length > 0 ? '0.75rem' : '0',
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        fontFamily: 'var(--font-family-heading)',
                                        letterSpacing: '0.05em'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(127, 255, 212, 0.2)';
                                        e.target.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(127, 255, 212, 0.1)';
                                        e.target.style.transform = 'translateX(0)';
                                    }}
                                >
                                    {mainDiscipline}
                                </button>

                                {/* Sub-niches */}
                                {niches.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        paddingLeft: '1rem'
                                    }}>
                                        {niches.map(niche => (
                                            <button
                                                key={niche}
                                                onClick={() => handleTagClick(niche)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid rgba(127, 255, 212, 0.3)',
                                                    background: 'rgba(127, 255, 212, 0.05)',
                                                    color: '#aaa',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'rgba(127, 255, 212, 0.15)';
                                                    e.target.style.color = '#7FFFD4';
                                                    e.target.style.borderColor = '#7FFFD4';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'rgba(127, 255, 212, 0.05)';
                                                    e.target.style.color = '#aaa';
                                                    e.target.style.borderColor = 'rgba(127, 255, 212, 0.3)';
                                                }}
                                            >
                                                {niche}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DisciplinesModal;
