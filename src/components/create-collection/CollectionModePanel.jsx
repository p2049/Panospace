import React from 'react';
import { FaGlobe, FaUsers, FaLock, FaStore, FaTag } from 'react-icons/fa';
import { getPrintifyProducts, PRINT_TIERS, calculateBundlePricing } from '@/core/utils/pricing';

const PRINT_SIZES = getPrintifyProducts();

const CollectionModePanel = ({
    description,
    setDescription,
    visibility,
    setVisibility,
    postToFeed,
    setPostToFeed,
    showInStore,
    setShowInStore,
    productTier,
    setProductTier,
    defaultSizeId,
    setDefaultSizeId,
    images,
    setImages,
    creationMode
}) => {
    return (
        <>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`Describe this ${creationMode}...`}
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem',
                        resize: 'vertical'
                    }}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Visibility
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                        { value: 'public', icon: FaGlobe, label: 'Public' },
                        { value: 'followers', icon: FaUsers, label: 'Followers' },
                        { value: 'private', icon: FaLock, label: 'Private' }
                    ].map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setVisibility(value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: visibility === value ? 'rgba(127, 255, 212, 0.2)' : '#111',
                                border: visibility === value ? '1px solid #7FFFD4' : '1px solid #333',
                                borderRadius: '8px',
                                color: visibility === value ? '#7FFFD4' : '#888',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: '600'
                            }}
                        >
                            <Icon /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Post to Feed */}
            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={postToFeed}
                        onChange={(e) => setPostToFeed(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div>
                        <div style={{ fontWeight: '600', color: '#ccc' }}>Post to Feed</div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                            Posts added to this {creationMode} will appear in the global feed
                        </div>
                    </div>
                </label>
            </div>

            {/* Shop Settings */}
            <>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                    <input
                        type="checkbox"
                        checked={showInStore}
                        onChange={(e) => setShowInStore(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <FaStore style={{ color: '#7FFFD4' }} />
                    <div>
                        <div style={{ fontWeight: '600' }}>Show in Store</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            Make this {creationMode} available for purchase
                        </div>
                    </div>
                </label>

                {showInStore && (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                                Print Quality
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setProductTier(PRINT_TIERS.ECONOMY)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: productTier === PRINT_TIERS.ECONOMY ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                        border: productTier === PRINT_TIERS.ECONOMY ? '1px solid #7FFFD4' : '1px solid #333',
                                        borderRadius: '8px',
                                        color: productTier === PRINT_TIERS.ECONOMY ? '#7FFFD4' : '#888',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Economy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProductTier(PRINT_TIERS.PREMIUM)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: productTier === PRINT_TIERS.PREMIUM ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                        border: productTier === PRINT_TIERS.PREMIUM ? '1px solid #7FFFD4' : '1px solid #333',
                                        borderRadius: '8px',
                                        color: productTier === PRINT_TIERS.PREMIUM ? '#7FFFD4' : '#888',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Premium
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                                Default Print Size
                            </label>
                            <select
                                value={defaultSizeId}
                                onChange={(e) => {
                                    const newSizeId = e.target.value;
                                    setDefaultSizeId(newSizeId);
                                    setImages(prev => prev.map(img => ({
                                        ...img,
                                        sizeId: newSizeId,
                                        sizeLabel: PRINT_SIZES.find(s => s.id === newSizeId)?.label || newSizeId
                                    })));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {PRINT_SIZES.map(size => (
                                    <option key={size.id} value={size.id}>
                                        {size.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {images.length > 0 && (() => {
                            const pricing = calculateBundlePricing(
                                images.map(img => ({
                                    sizeId: img.sizeId,
                                    sizeLabel: img.sizeLabel
                                })),
                                productTier
                            );

                            return (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(127, 255, 212, 0.1)',
                                    border: '1px solid rgba(127, 255, 212, 0.3)',
                                    borderRadius: '8px',
                                    marginTop: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <FaTag style={{ color: '#7FFFD4' }} />
                                        <div style={{ fontWeight: 'bold', color: '#7FFFD4' }}>Bundle Pricing</div>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.6' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>If bought separately:</span>
                                            <span style={{ fontWeight: '600' }}>${pricing.baseCollectionPrice.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                                            <span>Bundle discount ({pricing.bundleDiscountPercent}%):</span>
                                            <span style={{ fontWeight: '600' }}>-${pricing.savingsAmount.toFixed(2)}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(127, 255, 212, 0.3)',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            color: '#fff'
                                        }}>
                                            <span>Bundle Price:</span>
                                            <span>${pricing.finalBundlePrice.toFixed(2)}</span>
                                        </div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                                            ✓ Pricing automatically calculated<br />
                                            ✓ Artist & platform margins protected
                                        </div>
                                    </div>
                                </div>

                            );
                        })()}
                    </>
                )}
            </>
        </>
    );
};

export default CollectionModePanel;
