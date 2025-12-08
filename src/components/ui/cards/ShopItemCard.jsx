import React from 'react';
import { useNavigate } from 'react-router-dom';
import SmartImage from '@/components/SmartImage';

const ShopItemCard = ({ item }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/shop/${item.id}`)}
            style={{
                background: '#111',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                border: '1px solid #0a0a0a'
            }}
        >
            {/* Fixed height container with 1:1 aspect ratio */}
            <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: '#000' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <SmartImage
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    padding: '1rem 0.5rem 0.5rem',
                    color: '#fff',
                    zIndex: 2
                }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7FFFD4', marginTop: '0.2rem' }}>
                        {item.minPrice !== null ? `From $${item.minPrice.toFixed(2)}` : 'View Details'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopItemCard;
