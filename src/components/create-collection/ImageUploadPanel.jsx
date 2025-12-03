import React from 'react';
import { FaImage, FaTimes, FaPlus, FaBook, FaUniversity } from 'react-icons/fa';

const ImageUploadPanel = ({
    images,
    activeImageIndex,
    setActiveImageIndex,
    removeImage,
    handleFileSelect,
    fileInputRef,
    creationMode
}) => {
    const activeImage = images[activeImageIndex];

    return (
        <div>
            {creationMode === 'magazine' ? (
                /* Magazine Mode - Image Upload Preview */
                <div style={{
                    aspectRatio: '0.7727', // 8.5:11 magazine ratio
                    background: images.length > 0 ? `url(${images[0].preview})` : '#111',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    position: 'relative'
                }}>
                    {images.length === 0 && (
                        <>
                            <FaBook style={{ fontSize: '4rem', color: '#7FFFD4', opacity: 0.5 }} />
                            <div style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>
                                Magazine Preview
                                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>8.5" × 11" Aspect Ratio</div>
                            </div>
                        </>
                    )}
                </div>
            ) : creationMode === 'museum' ? (
                /* Museum Mode - Image Upload Preview */
                <div style={{
                    aspectRatio: '3/2',
                    background: images.length > 0 ? `url(${images[0].preview})` : '#111',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    position: 'relative'
                }}>
                    {images.length === 0 && (
                        <>
                            <FaUniversity style={{ fontSize: '4rem', color: '#7FFFD4', opacity: 0.5 }} />
                            <div style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>
                                Museum Preview
                            </div>
                        </>
                    )}
                </div>
            ) : images.length === 0 ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        aspectRatio: '3/2',
                        background: '#111',
                        border: '2px dashed #333',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        gap: '1rem'
                    }}
                >
                    <FaImage style={{ fontSize: '3rem', color: '#666' }} />
                    <div style={{ color: '#888', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Add Images to {creationMode === 'gallery' ? 'Studio' : 'Collection'}
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>1-10 images required</div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{
                        aspectRatio: activeImage?.aspectRatio || '3/2',
                        background: '#111',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                    }}>
                        <img
                            src={activeImage?.preview}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {images.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => setActiveImageIndex(index)}
                                style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    flexShrink: 0,
                                    border: activeImageIndex === index ? '2px solid #7FFFD4' : '2px solid transparent',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <img
                                    src={img.preview}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'rgba(0,0,0,0.7)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#fff'
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                        {images.length < 10 && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    flexShrink: 0,
                                    border: '2px dashed #333',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                <FaPlus />
                            </div>
                        )}
                    </div>
                </>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ImageUploadPanel;
