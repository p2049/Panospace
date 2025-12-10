import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaImage } from 'react-icons/fa';
import SpaceCardComponent from './SpaceCardComponent';

const ShopShelfRow = ({ items, kind }) => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    // Simple drag-to-scroll (optional fallback to just css snap)

    if (!items || items.length === 0) {
        return (
            <div style={{
                padding: '2rem',
                border: '1px dashed #333',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '150px'
            }}>
                <FaImage size={24} style={{ opacity: 0.5 }} />
                <span>No active items for sale.</span>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            style={{
                display: 'grid',
                // 2 rows, auto columns based on exact width
                gridTemplateRows: 'repeat(2, auto)',
                gridAutoFlow: 'column',
                gridAutoColumns: kind === 'spacecard' ? '140px' : '200px',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                scrollSnapType: 'x mandatory',
                maskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
            }}
            className="hide-scrollbar"
        >
            {items.map(item => {
                // Determine display price
                const displayPrice = item.priceCents
                    ? `$${(item.priceCents / 100).toFixed(2)}`
                    : (item.printSizes?.[0]?.price ? `$${item.printSizes[0].price}` : '$-.--');

                return (
                    <div
                        key={item.id}
                        onClick={() => navigate(`/shop/${item.id}`)}
                        style={{
                            scrollSnapAlign: 'start',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        {kind === 'spacecard' ? (
                            <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                                {/* Adapt SpaceCardComponent to simple preview */}
                                <div style={{
                                    aspectRatio: '2/3',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    border: '1px solid #333'
                                }}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '0.5rem',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {displayPrice}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Print Item Card
                            <div style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid #333'
                            }}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '0.5rem',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                    color: '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{displayPrice}</span>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaShoppingCart size={10} color="#fff" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ShopShelfRow;
