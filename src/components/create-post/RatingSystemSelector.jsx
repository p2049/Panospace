import React from 'react';
import { FaSmile, FaStar } from 'react-icons/fa';

/**
 * RatingSystemSelector Component
 * 
 * Displays a toggle to choose between standard "Smiley" likes
 * or a 5-star rating system for the post.
 * 
 * @param {boolean} enableRatings - Whether 5-star ratings are enabled
 * @param {Function} setEnableRatings - Handler to toggle rating system
 */
const RatingSystemSelector = ({
    enableRatings,
    setEnableRatings
}) => {
    return (
        <div className="form-section" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Rating System</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>
                    {enableRatings ? 'Users can rate 1-5 stars' : 'Standard like button'}
                </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    type="button"
                    onClick={() => setEnableRatings(false)}
                    style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: !enableRatings ? '1px solid #7FFFD4' : '1px solid #333',
                        background: !enableRatings ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                        color: !enableRatings ? '#7FFFD4' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaSmile size={16} /> Smiley
                </button>
                <button
                    type="button"
                    onClick={() => setEnableRatings(true)}
                    style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: enableRatings ? '1px solid #7FFFD4' : '1px solid #333',
                        background: enableRatings ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                        color: enableRatings ? '#7FFFD4' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaStar size={16} /> 5-Star
                </button>
            </div>
        </div>
    );
};

export default RatingSystemSelector;
