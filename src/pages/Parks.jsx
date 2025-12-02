import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PARKS_DATA } from '../constants/parksData';
import { FaTree, FaMountain, FaMapMarkerAlt } from 'react-icons/fa';

const Parks = () => {
    const navigate = useNavigate();

    const nationalParks = PARKS_DATA.filter(p => p.parkType === 'national');
    const stateParks = PARKS_DATA.filter(p => p.parkType === 'state');

    const ParkCard = ({ park }) => (
        <div
            onClick={() => navigate(`/park/${park.parkId}`)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s, border-color 0.2s',
                padding: '1.5rem'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.3)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(127, 255, 212, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {park.parkType === 'national' ? (
                        <FaMountain style={{ color: '#7FFFD4', fontSize: '1.5rem' }} />
                    ) : (
                        <FaTree style={{ color: '#7FFFD4', fontSize: '1.5rem' }} />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.1rem' }}>
                        {park.parkName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
                        <FaMapMarkerAlt size={12} />
                        <span>{park.state}</span>
                    </div>
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: park.parkType === 'national' ? 'rgba(127, 255, 212, 0.1)' : 'rgba(100, 200, 255, 0.1)',
                        border: `1px solid ${park.parkType === 'national' ? 'rgba(127, 255, 212, 0.3)' : 'rgba(100, 200, 255, 0.3)'}`,
                        borderRadius: '12px',
                        color: park.parkType === 'national' ? '#7FFFD4' : '#64C8FF',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {park.parkType === 'national' ? 'National Park' : 'State Park'}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '2rem',
                borderBottom: '1px solid #333',
                background: '#000',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                    Parks
                </h1>
                <p style={{ color: '#888', margin: 0 }}>
                    Explore photography from National and State Parks
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                {/* National Parks Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        color: '#7FFFD4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <FaMountain />
                        National Parks
                        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                            ({nationalParks.length})
                        </span>
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {nationalParks.map(park => (
                            <ParkCard key={park.parkId} park={park} />
                        ))}
                    </div>
                </div>

                {/* State Parks Section */}
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        color: '#64C8FF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <FaTree />
                        State Parks
                        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                            ({stateParks.length})
                        </span>
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {stateParks.map(park => (
                            <ParkCard key={park.parkId} park={park} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Parks;
