import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { FaCamera, FaChevronLeft, FaChevronRight, FaInfoCircle, FaUserCircle, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import LikeButton from './LikeButton';

const ExifDisplay = ({ exif }) => {
    if (!exif) return null;
    return (
        <div style={{
            position: 'absolute',
            bottom: '120px',
            left: '20px',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ccc',
            fontSize: '0.8rem',
            maxWidth: '300px',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                <FaCamera /> Photography Data
            </div>
            {exif.make && <div><strong>Camera:</strong> {exif.make} {exif.model}</div>}
            {exif.lens && <div><strong>Lens:</strong> {exif.lens}</div>}
            <div style={{ display: 'flex', gap: '1rem' }}>
                {exif.focalLength && <div>{exif.focalLength}</div>}
                {exif.aperture && <div>f/{exif.aperture}</div>}
                {exif.iso && <div>ISO {exif.iso}</div>}
                {exif.shutterSpeed && <div>{exif.shutterSpeed}s</div>}
            </div>
            {exif.date && <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{exif.date}</div>}
        </div>
    );
};

const Post = ({ post }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    // Detect mobile vs desktop
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle legacy 'slides' vs new 'items' vs current 'images' structure
    const items = post.images || post.items || post.slides || [];

    // If no items exist but we have an imageUrl or shopImageUrl, create a single item
    if (items.length === 0) {
        const fallbackUrl = post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
        if (fallbackUrl) {
            items.push({ type: 'image', url: fallbackUrl });
        }
    }

    // DEBUG: Log post data structure
    console.log('🔍 POST DATA:', {
        postId: post.id,
        hasImages: !!post.images,
        imagesLength: post.images?.length,
        hasItems: !!post.items,
        hasSlides: !!post.slides,
        firstImageUrl: items[0]?.url,
        fallbackImageUrl: post?.images?.[0]?.url || post.imageUrl,
        shopImageUrl: post.shopImageUrl,
        itemsArray: items
    });

    const totalSlides = items.length;
    const currentItem = items[currentSlide] || {};

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
            containerRef.current?.children[0]?.scrollTo({
                left: (currentSlide + 1) * window.innerWidth,
                behavior: 'smooth'
            });
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
            containerRef.current?.children[0]?.scrollTo({
                left: (currentSlide - 1) * window.innerWidth,
                behavior: 'smooth'
            });
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'posts', post.id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    };

    const postContainerStyle = {
        height: '100vh',
        width: '100vw',
        scrollSnapAlign: 'start',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.4s ease-out',
        marginBottom: '10px',
        backgroundColor: '#000'
    };

    const slideContainerStyle = {
        display: 'flex',
        height: '100%',
        width: '100%',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    };

    const slideStyle = {
        minWidth: '100%',
        height: '100%',
        scrollSnapAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    };

    // ANTI-CROP: Use contain, show full image at any aspect ratio
    const imageSlideStyle = {
        width: '100%',
        height: 'auto',
        maxHeight: '100vh',
        objectFit: 'contain', // NEVER CROP - show full image
        backgroundColor: '#000',
        transition: 'opacity 0.3s ease-in-out'
    };

    const textSlideStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        fontSize: '2rem',
        textAlign: 'center',
        color: '#fff',
        background: 'radial-gradient(circle at center, rgba(40,40,40,0.9) 0%, rgba(10,10,10,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '300',
        lineHeight: '1.6',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
    };

    const authorOverlayStyle = {
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(5px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 10,
        cursor: 'pointer',
        maxWidth: '200px'
    };

    // DESKTOP ONLY: Show arrows
    const arrowButtonStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: isMobile ? 'none' : 'flex', // HIDE ON MOBILE
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '1.5rem',
        zIndex: 20,
        transition: 'all 0.2s ease',
        opacity: 0.7
    };

    return (
        <div ref={containerRef} style={postContainerStyle} data-testid="post-item">
            {items.length === 0 ? (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: '1.2rem'
                }}>
                    No content available
                </div>
            ) : (
                <div style={slideContainerStyle}>
                    {items.map((item, index) => (
                        <div key={index} style={slideStyle}>
                            {item.url ? (
                                <img
                                    src={item.url || post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || ''}
                                    alt={`Slide ${index + 1}`}
                                    style={imageSlideStyle}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const placeholder = document.createElement('div');
                                        placeholder.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #888; font-size: 1.2rem;';
                                        placeholder.textContent = 'Image unavailable';
                                        e.target.parentNode.appendChild(placeholder);
                                    }}
                                />
                            ) : (
                                <div style={textSlideStyle}>
                                    {item.content || item.text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation Arrows - DESKTOP ONLY */}
            {!isMobile && totalSlides > 1 && currentSlide > 0 && (
                <button
                    onClick={prevSlide}
                    style={{ ...arrowButtonStyle, left: '2rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                    <FaChevronLeft />
                </button>
            )}

            {!isMobile && totalSlides > 1 && currentSlide < totalSlides - 1 && (
                <button
                    onClick={nextSlide}
                    style={{ ...arrowButtonStyle, right: '2rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                    <FaChevronRight />
                </button>
            )}

            {/* Slide Indicator */}
            {totalSlides > 1 && (
                <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    zIndex: 10
                }}>
                    {currentSlide + 1} / {totalSlides}
                </div>
            )}

            {/* Title & Tags Overlay */}
            {(post.title || (post.tags && post.tags.length > 0)) && (
                <div style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '2rem',
                    maxWidth: '80%',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    {post.title && <h2 style={{ fontSize: '1.5rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>{post.title}</h2>}
                    {post.tags && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {post.tags.map(tag => (
                                <span key={tag} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Info Toggle Button (for EXIF) */}
            {currentItem?.exif && (
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    style={{
                        position: 'absolute',
                        bottom: '70px',
                        right: '20px',
                        background: showInfo ? '#fff' : 'rgba(0,0,0,0.5)',
                        color: showInfo ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 20
                    }}
                >
                    <FaInfoCircle />
                </button>
            )}

            {/* EXIF Display Overlay */}
            {showInfo && currentItem?.exif && <ExifDisplay exif={currentItem.exif} />}

            {/* Author Info & Location */}
            <div
                style={authorOverlayStyle}
                onClick={() => navigate(`/profile/${post.userId || post.authorId}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <FaUserCircle size={32} style={{ color: '#fff' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontWeight: '500', fontSize: '1rem' }}>
                        {post.username || post.authorName || 'Anonymous'}
                    </span>
                    {post.location && (post.location.city || post.location.country) && (
                        <span style={{ color: '#ccc', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FaMapMarkerAlt size={10} />
                            {[post.location.city, post.location.state, post.location.country].filter(Boolean).join(', ')}
                        </span>
                    )}
                </div>
            </div>

            {/* Like Button */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 10
            }}>
                <LikeButton postId={post.id} />
            </div>

            {/* Edit & Delete Buttons (Owner Only) */}
            {currentUser && currentUser.uid === post.authorId && (
                <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: totalSlides > 1 ? '6rem' : '2rem',
                    display: 'flex',
                    gap: '1rem',
                    zIndex: 20
                }}>
                    <button
                        onClick={() => navigate(`/edit-post/${post.id}`)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backdropFilter: 'blur(5px)'
                        }}
                        title="Edit Post"
                    >
                        <FaCamera size={14} />
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            background: 'rgba(200, 0, 0, 0.6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        title="Delete Post"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            )}

            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default React.memo(Post);
