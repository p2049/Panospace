import React, { useState, useEffect } from 'react';
import { FaStore, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { getValidSizesForImage, calculateTieredPricing } from '@/domain/shop/pricing';
import { formatPrice } from '@/core/utils/helpers';
import { useNavigate } from 'react-router-dom';

const ShopOptionsPanel = ({
    activeSlide,
    updateSlide,
    sellerStatus,
    isPremium
}) => {
    const navigate = useNavigate();
    const [loadingDimensions, setLoadingDimensions] = useState(false);
    const [validSizes, setValidSizes] = useState([]);
    const [dimensions, setDimensions] = useState(null);

    // Load dimensions when panel opens or file changes
    useEffect(() => {
        if (!activeSlide?.file || !activeSlide?.addToShop) return;

        // If we already have dimensions in the slide, use them
        if (activeSlide.width && activeSlide.height) {
            setDimensions({ width: activeSlide.width, height: activeSlide.height });
            const sizes = getValidSizesForImage(activeSlide.width, activeSlide.height);
            setValidSizes(sizes);
            return;
        }

        // Otherwise load them
        setLoadingDimensions(true);
        const img = new Image();
        img.src = activeSlide.preview;
        img.onload = () => {
            setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            const sizes = getValidSizesForImage(img.naturalWidth, img.naturalHeight);
            setValidSizes(sizes);

            // Save back to slide so we don't recalculate
            updateSlide({
                width: img.naturalWidth,
                height: img.naturalHeight
            });

            // Auto-select all valid sizes if first time enabling?
            // Or maybe just let them select. Let's auto-select all for convenience.
            if (!activeSlide.printSizes || activeSlide.printSizes.length === 0) {
                updateSlide({ printSizes: sizes.map(s => s.id) });
            }

            setLoadingDimensions(false);
        };
        img.onerror = () => {
            console.error("Failed to load image for dimensions");
            setLoadingDimensions(false);
        };
    }, [activeSlide?.file, activeSlide?.addToShop, activeSlide?.preview]);

    // Handle toggle
    const handleToggleShop = (e) => {
        const checked = e.target.checked;
        updateSlide({ addToShop: checked });
        if (!checked) {
            updateSlide({ printSizes: [] });
        }
    };

    // Handle size toggle
    const handleSizeToggle = (sizeId) => {
        const current = activeSlide.printSizes || [];
        let newSizes;
        if (current.includes(sizeId)) {
            newSizes = current.filter(id => id !== sizeId);
        } else {
            newSizes = [...current, sizeId];
        }
        updateSlide({ printSizes: newSizes });
    };

    const isVerified = sellerStatus === 'verified';

    if (!isVerified) {
        return (
            <div className="form-section" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <FaStore style={{ color: '#aaa' }} />
                    <span style={{ fontWeight: '600', color: '#aaa' }}>Sell as Print</span>
                </div>
                <div style={{
                    background: 'rgba(255,165,0,0.1)',
                    border: '1px solid rgba(255,165,0,0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.9rem',
                    color: '#ffd700'
                }}>
                    <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaExclamationTriangle />
                        Seller Verification Required
                    </p>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem' }}>
                        You must verify your identity before selling prints on Panospace.
                    </p>
                    <button
                        onClick={() => window.open('/shop/verification', '_blank')}
                        style={{
                            marginTop: '0.75rem',
                            background: 'transparent',
                            border: '1px solid #ffd700',
                            color: '#ffd700',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}
                    >
                        Verify Account
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="form-section">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: activeSlide.addToShop ? '1rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaStore style={{ color: activeSlide.addToShop ? '#7FFFD4' : '#aaa' }} />
                    <span style={{ fontWeight: '600', fontSize: '1rem', color: activeSlide.addToShop ? '#7FFFD4' : '#fff' }}>
                        Sell as Print
                    </span>
                </div>
                <div style={{ position: 'relative', width: '40px', height: '20px' }}>
                    <input
                        type="checkbox"
                        checked={activeSlide.addToShop || false}
                        onChange={handleToggleShop}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: activeSlide.addToShop ? '#7FFFD4' : '#333',
                        borderRadius: '20px', transition: '0.3s'
                    }}></div>
                    <div style={{
                        position: 'absolute', top: '2px', left: activeSlide.addToShop ? '22px' : '2px',
                        width: '16px', height: '16px', background: '#fff',
                        borderRadius: '50%', transition: '0.3s'
                    }}></div>
                </div>
            </label>

            {activeSlide.addToShop && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {loadingDimensions ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', fontSize: '0.9rem', padding: '1rem 0' }}>
                            <FaSpinner className="spin" /> Checking image resolution...
                        </div>
                    ) : (
                        <>
                            {dimensions && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#aaa',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>Original Resolution:</span>
                                    <span style={{ color: '#fff' }}>{dimensions.width} x {dimensions.height} px</span>
                                </div>
                            )}

                            {validSizes.length === 0 ? (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(255,0,0,0.1)',
                                    border: '1px solid rgba(255,0,0,0.3)',
                                    borderRadius: '8px',
                                    color: '#ff6b6b',
                                    fontSize: '0.85rem'
                                }}>
                                    Resolution too low for print. Minimum 300 DPI required.
                                    Max print size for this image is less than 4x6".
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr auto',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#aaa',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <div>Size</div>
                                        <div style={{ textAlign: 'right' }}>Your Earnings</div>
                                        <div style={{ width: '24px' }}></div>
                                    </div>

                                    {validSizes.map(size => {
                                        // Calculate earnings for display
                                        const pricing = calculateTieredPricing(size.id, isPremium ? 'premium' : 'economy', isPremium);
                                        const isSelected = (activeSlide.printSizes || []).includes(size.id);

                                        return (
                                            <label
                                                key={size.id}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'auto 1fr auto',
                                                    alignItems: 'center',
                                                    padding: '0.75rem',
                                                    background: isSelected ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: isSelected ? '1px solid rgba(127, 255, 212, 0.3)' : '1px solid transparent',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{size.label}</div>
                                                <div style={{ textAlign: 'right', color: '#7FFFD4', fontSize: '0.9rem', paddingRight: '1rem' }}>
                                                    {pricing ? formatPrice(pricing.artistProfit) : '-'}
                                                </div>
                                                <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSizeToggle(size.id)}
                                                        style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                                                    />
                                                    <div style={{
                                                        width: '20px', height: '20px',
                                                        borderRadius: '4px',
                                                        border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.3)',
                                                        background: isSelected ? '#7FFFD4' : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <FaCheck size={12} color="#000" />}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopOptionsPanel;
