import React from 'react';
import { FaGlobe, FaUsers, FaLock } from 'react-icons/fa';
// import { getPrintifyProducts, PRINT_TIERS, calculateBundlePricing } from '@/domain/shop/pricing';

// const PRINT_SIZES = getPrintifyProducts();

const CollectionModePanel = ({
    description,
    setDescription,
    visibility,
    setVisibility,
    postToFeed,
    setPostToFeed,
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

            {/* Shop Settings - Disabled for now */}
            {/*
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
                ... (rest of shop settings logic)
            </>
            */}
        </>
    );
};

export default CollectionModePanel;
