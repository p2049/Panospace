import React from 'react';
import { PRINT_TIERS } from '../../utils/printifyPricing';

/**
 * ShopConfiguration Component
 * 
 * Displays shop/print settings for the active image with:
 * - Header with "Add All to Shop" button
 * - Toggle to sell current image
 * - Copyright warning
 * - Product tier selection (Economy, Premium, Limited)
 * - Stickers add-on option
 * 
 * @param {Object} activeSlide - The currently active slide object
 * @param {number} activeSlideIndex - Index of active slide
 * @param {Array} slides - All slides array
 * @param {Function} updateSlide - Handler to update slide properties
 * @param {Function} handleAddAllToShop - Handler to add/remove all slides from shop
 */
const ShopConfiguration = ({
    activeSlide,
    activeSlideIndex,
    slides,
    updateSlide,
    handleAddAllToShop
}) => {
    return (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#7FFFD4', margin: 0 }}>Shop Configuration</h4>
                <button
                    type="button"
                    onClick={handleAddAllToShop}
                    style={{
                        background: 'transparent',
                        border: '1px solid #7FFFD4',
                        color: '#7FFFD4',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    {slides.every(s => s.addToShop) ? 'Remove All from Shop' : 'Add All to Shop'}
                </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input
                    type="checkbox"
                    checked={activeSlide.addToShop}
                    onChange={(e) => updateSlide(activeSlideIndex, { addToShop: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                />
                Sell this image
            </label>

            {/* Copyright Warning for Shop Items */}
            {activeSlide.addToShop && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(127, 255, 212, 0.1)',
                    border: '1px solid rgba(127, 255, 212, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#7FFFD4',
                    lineHeight: '1.4'
                }}>
                    ℹ️ <strong>Shop Draft:</strong> This will create a shop draft. Visit your Shop Drafts page to publish it after confirming copyright ownership.
                </div>
            )}

            {activeSlide.addToShop && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <button
                        onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.ECONOMY })}
                        style={{
                            padding: '0.5rem',
                            background: activeSlide.productTier === PRINT_TIERS.ECONOMY ? 'rgba(127, 255, 212, 0.2)' : '#222',
                            color: activeSlide.productTier === PRINT_TIERS.ECONOMY ? '#7FFFD4' : '#888',
                            border: activeSlide.productTier === PRINT_TIERS.ECONOMY ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Economy
                    </button>
                    <button
                        onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.PREMIUM })}
                        style={{
                            padding: '0.5rem',
                            background: activeSlide.productTier === PRINT_TIERS.PREMIUM ? 'rgba(127, 255, 212, 0.2)' : '#222',
                            color: activeSlide.productTier === PRINT_TIERS.PREMIUM ? '#7FFFD4' : '#888',
                            border: activeSlide.productTier === PRINT_TIERS.PREMIUM ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Premium
                    </button>
                    <button
                        onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.LIMITED })}
                        style={{
                            padding: '0.5rem',
                            background: activeSlide.productTier === PRINT_TIERS.LIMITED ? 'rgba(127, 255, 212, 0.2)' : '#222',
                            color: activeSlide.productTier === PRINT_TIERS.LIMITED ? '#7FFFD4' : '#888',
                            border: activeSlide.productTier === PRINT_TIERS.LIMITED ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Limited
                    </button>
                    <button
                        onClick={() => updateSlide(activeSlideIndex, { includeStickers: !activeSlide.includeStickers })}
                        style={{
                            padding: '0.5rem',
                            background: activeSlide.includeStickers ? 'rgba(127, 255, 212, 0.2)' : '#222',
                            color: activeSlide.includeStickers ? '#7FFFD4' : '#888',
                            border: activeSlide.includeStickers ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        + Stickers
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShopConfiguration;
