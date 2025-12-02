import React, { useEffect, useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

const FullscreenViewerMobile = ({ post, onClose, onNext, onPrev }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [touchStart, setTouchStart] = useState(null);

    let items = post.items || post.slides || [];
    if (items.length === 0) {
        const url = post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
        if (url) items = [{ type: 'image', url }];
    }

    const totalSlides = items.length;

    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            if (diff > 0) { // Left swipe
                if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
                else if (onNext) onNext();
            } else { // Right swipe
                if (currentSlide > 0) setCurrentSlide(c => c - 1);
                else if (onPrev) onPrev();
            }
        }
        setTouchStart(null);
    };

    if (items.length === 0) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTimes />
                </button>
                <div style={{ color: '#888', fontSize: '1.2rem' }}>No image available</div>
            </div>
        );
    }

    const currentItem = items[currentSlide] || {};
    const imageUrl = currentItem.url || post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, touchAction: 'pan-y' }}
        >
            {/* Close */}
            <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, WebkitTapHighlightColor: 'transparent' }}>
                <FaTimes />
            </button>

            {/* Info */}
            <button onClick={() => setShowInfo(!showInfo)} style={{ position: 'absolute', bottom: '5rem', right: '1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: showInfo ? '#fff' : '#888', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, WebkitTapHighlightColor: 'transparent' }}>
                <FaInfoCircle />
            </button>

            {/* Image */}
            <img
                src={imageUrl}
                alt={post.title || 'Post'}
                style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain' }}
                onError={(e) => { e.target.src = ''; e.target.alt = 'Failed to load'; e.target.style.display = 'none'; }}
            />

            {/* Slide indicator */}
            {totalSlides > 1 && (
                <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '20px', color: '#fff', fontSize: '0.9rem' }}>
                    {currentSlide + 1} / {totalSlides}
                </div>
            )}

            {/* Info Panel */}
            {showInfo && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.95)', padding: '1.5rem', maxHeight: '50vh', overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{post.title || 'Untitled'}</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>{post.authorName || 'Anonymous'}</p>
                    {post.location && (
                        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>📍 {[post.location.city, post.location.state, post.location.country].filter(Boolean).join(', ')}</p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {post.tags.map(tag => <span key={tag} style={{ background: '#222', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: '#aaa' }}>#{tag}</span>)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FullscreenViewerMobile;
