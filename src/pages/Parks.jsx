import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PARKS_DATA } from '@/core/constants/parksData';
import { FaTree, FaMountain } from 'react-icons/fa';
import ParkCard from '@/components/ui/cards/ParkCard';

const Parks = () => {
    const navigate = useNavigate();

    const nationalParks = PARKS_DATA.filter(p => p.parkType === 'national');
    const stateParks = PARKS_DATA.filter(p => p.parkType === 'state');

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

            <div className="container-md">
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
