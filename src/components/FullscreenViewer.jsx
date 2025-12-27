import React, { useEffect, useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaInfoCircle, FaCamera } from 'react-icons/fa';
import { formatExifForDisplay } from '@/core/utils/exif';
import { preloadImage } from '@/core/utils/imageCache';
import { motion, AnimatePresence } from 'framer-motion';

const FullscreenViewer = ({ post, onClose, onNext, onPrev }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [width, setWidth] = useState(0);
    const carouselRef = useRef(null);

    // Track container width for pixel-perfect carousel movement
    useEffect(() => {
        if (!carouselRef.current) return;

        const updateWidth = () => {
            if (carouselRef.current) {
                setWidth(carouselRef.current.offsetWidth);
            }
        };

        const observer = new ResizeObserver(updateWidth);
        observer.observe(carouselRef.current);
        updateWidth();

        return () => observer.disconnect();
    }, []);

    // Normalize items
    let items = post.items || post.slides || [];
    if (items.length === 0) {
        const url = post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
        if (url) items = [{ type: 'image', url, exif: post.exif || null }];
    }

    const totalSlides = items.length;

    // Mobile detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset slide on post change
    useEffect(() => {
        setCurrentSlide(0);
        setShowInfo(false);
    }, [post.id]);

    // Preload next/prev images
    useEffect(() => {
        if (!items || items.length <= 1) return;

        const indicesToPreload = [
            (currentSlide + 1) % items.length,
            (currentSlide - 1 + items.length) % items.length
        ];

        indicesToPreload.forEach(index => {
            const item = items[index];
            const url = item?.url || (typeof item === 'string' ? item : null);
            if (url) preloadImage(url);
        });
    }, [currentSlide, items]);

    const handleDragEnd = (e, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const currentWidth = width || window.innerWidth;

        // IG Style One-at-a-time snap:
        if (offset < -currentWidth * 0.2 || velocity < -500) {
            // Commit next
            if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
            else if (onNext) onNext();
        } else if (offset > currentWidth * 0.2 || velocity > 500) {
            // Commit prev
            if (currentSlide > 0) setCurrentSlide(c => c - 1);
            else if (onPrev) onPrev();
        }
        // Snap back happens automatically if state doesn't change
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') {
                if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
                else if (onNext) onNext();
            }
            if (e.key === 'ArrowLeft') {
                if (currentSlide > 0) setCurrentSlide(c => c - 1);
                else if (onPrev) onPrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, totalSlides, onNext, onPrev, onClose]);

    if (items.length === 0) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                <button onClick={onClose} aria-label="Close viewer" style={{ position: 'absolute', top: '1rem', right: '1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTimes />
                </button>
                <div style={{ color: '#888', fontSize: '1.2rem' }}>No image available</div>
            </div>
        );
    }

    const currentItem = items[currentSlide] || {};
    const imageUrl = currentItem.url || post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
    const exif = currentItem.exif;
    const displayExif = exif ? formatExifForDisplay(exif) : null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                overflow: 'hidden',
                touchAction: 'pan-y pinch-zoom'
            }}
            ref={carouselRef}
        >
            {/* Close */}
            <button onClick={onClose} aria-label="Close viewer" style={{ position: 'absolute', top: '1rem', right: '1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, WebkitTapHighlightColor: 'transparent' }}>
                <FaTimes />
            </button>

            {/* Navigation Arrows - DESKTOP ONLY */}
            {!isMobile && totalSlides > 1 && currentSlide > 0 && (
                <button
                    onClick={() => setCurrentSlide(c => c - 1)}
                    className="slide-nav-arrow"
                    style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s ease, transform 0.2s ease', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                    <FaChevronLeft />
                </button>
            )}

            {!isMobile && totalSlides > 1 && currentSlide < totalSlides - 1 && (
                <button
                    onClick={() => setCurrentSlide(c => c + 1)}
                    className="slide-nav-arrow"
                    style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s ease, transform 0.2s ease', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                    <FaChevronRight />
                </button>
            )}

            {/* Info Toggle */}
            <button onClick={() => setShowInfo(!showInfo)} aria-label="Toggle details" style={{ position: 'absolute', bottom: '5rem', right: '1rem', width: '50px', height: '50px', borderRadius: '50%', background: showInfo ? '#fff' : 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: showInfo ? '#000' : '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, WebkitTapHighlightColor: 'transparent' }}>
                <FaInfoCircle />
            </button>

            {/* Slides Container */}
            {items.map((item, index) => {
                const url = item?.url || (typeof item === 'string' ? item : post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '');
                return (
                    <motion.div
                        key={index}
                        drag="x"
                        dragDirectionLock
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        dragMomentum={false}
                        onDragEnd={handleDragEnd}
                        animate={{ x: (index - currentSlide) * width }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            willChange: 'transform'
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            <img
                                src={url}
                                alt={post.title || `Slide ${index + 1}`}
                                loading={Math.abs(index - currentSlide) <= 1 ? "eager" : "lazy"}
                                decoding="async"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100vh',
                                    objectFit: 'contain',
                                    userSelect: 'none',
                                    WebkitUserDrag: 'none'
                                }}
                                onError={(e) => { e.target.src = ''; e.target.alt = 'Failed to load'; e.target.style.display = 'none'; }}
                            />
                        </div>
                    </motion.div>
                );
            })}

            {/* Slide indicator */}
            {totalSlides > 1 && (
                <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.9rem', borderRadius: '16px', color: '#fff', fontSize: '0.85rem', fontWeight: '500' }}>
                    {currentSlide + 1} / {totalSlides}
                </div>
            )}

            {/* Info Panel */}
            {showInfo && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.95)', padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 10001 }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{post.title || 'Untitled'}</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>{post.authorName || 'Anonymous'}</p>

                    {post.location && (
                        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem' }}>📍 {[post.location.city, post.location.state, post.location.country].filter(Boolean).join(', ')}</p>
                    )}

                    {/* EXIF Data */}
                    {displayExif && (
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff', fontWeight: 'bold' }}>
                                <FaCamera /> Photo Details
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {displayExif.camera && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ color: '#888', fontSize: '0.7rem' }}>Camera</div>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{displayExif.camera}</div>
                                    </div>
                                )}
                                {displayExif.lens && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ color: '#888', fontSize: '0.7rem' }}>Lens</div>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{displayExif.lens}</div>
                                    </div>
                                )}
                                {displayExif.specs.map((spec, i) => (
                                    <div key={i}>
                                        <div style={{ color: '#888', fontSize: '0.7rem' }}>Spec</div>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{spec}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {post.tags.map(tag => <span key={tag} style={{ background: '#222', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: '#aaa' }}>#{tag}</span>)}
                        </div>
                    )}
                </div>
            )}
        </div >
    );
};

export default FullscreenViewer;
