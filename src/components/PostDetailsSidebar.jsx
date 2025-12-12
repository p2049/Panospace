import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, deleteDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { FaCamera, FaInfoCircle, FaShoppingBag } from 'react-icons/fa';
import { logger } from '@/core/utils/logger';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { formatExifForDisplay } from '@/core/utils/exif';
import FollowButton from './FollowButton';

const PostDetailsSidebar = ({
    isVisible,
    onClose,
    post,
    items = [],
    currentSlide = 0
}) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [shopLinkTarget, setShopLinkTarget] = useState(null);

    // Check for linked shop item or general shop existence
    useEffect(() => {
        if (isVisible && post) {
            const checkShopStatus = async () => {
                const authorId = post.userId || post.authorId || post.uid;
                if (!authorId) return;

                try {
                    const shopItemsRef = collection(db, 'shopItems');

                    // 1. Check if THIS post is listed
                    const checks = [post.id];
                    if (post.spaceCardId) checks.push(post.spaceCardId);

                    const specificItemQuery = query(
                        shopItemsRef,
                        where('ownerId', '==', authorId),
                        where('sourcePostId', 'in', checks),
                        where('status', '==', 'active'),
                        limit(1)
                    );
                    const specificSnapshot = await getDocs(specificItemQuery);

                    if (!specificSnapshot.empty) {
                        setShopLinkTarget({ type: 'item', id: specificSnapshot.docs[0].id });
                        return;
                    }

                    // 2. Fallback: Check if user has ANY active shop items
                    const generalQuery = query(
                        shopItemsRef,
                        where('ownerId', '==', authorId),
                        where('status', '==', 'active'),
                        limit(1)
                    );
                    const generalSnapshot = await getDocs(generalQuery);

                    if (!generalSnapshot.empty) {
                        setShopLinkTarget({ type: 'profile', id: authorId });
                    } else {
                        setShopLinkTarget(null);
                    }
                } catch (error) {
                    logger.error("Error checking shop status:", error);
                }
            };
            checkShopStatus();
        }
    }, [isVisible, post]);

    const handleEditPost = () => {
        navigate(`/edit-post/${post.id}`);
    };

    const handleReportPost = () => {
        alert("Report feature coming soon");
    };

    const handleBlockUser = async () => {
        if (window.confirm(`Block ${post.username || 'user'}?`)) {
            alert("User blocked");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert("Link copied");
    };

    const handleTagClick = (tag, e) => {
        e.stopPropagation();
        navigate(`/search?tags=${tag}`);
    };

    if (!isVisible || !post) return null;

    return (
        <>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '300px',
                    maxWidth: '80vw',
                    background: 'rgba(10, 10, 10, 0.95)',
                    backdropFilter: 'blur(15px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 1000,
                    paddingTop: 'max(1rem, env(safe-area-inset-top))',
                    paddingLeft: 'max(2.8rem, env(safe-area-inset-left))',
                    paddingRight: '1.5rem',
                    paddingBottom: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    overflowY: 'auto',
                    animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <style>{`
                    @keyframes slideInLeft {
                        from { transform: translateX(-100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}</style>

                {/* Header / Close */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <h3 style={{ margin: 0, marginLeft: '40px', color: '#7FFFD4', fontFamily: '"Orbitron", sans-serif', letterSpacing: '2px', lineHeight: 1 }}>POST INFO</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#7FFFD4',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            filter: 'drop-shadow(0 0 6px rgba(127, 255, 212, 0.5))'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <FaInfoCircle color="#7FFFD4" size={14} /> TAGS
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {post.tags.map(tag => (
                                <span
                                    key={tag}
                                    onClick={(e) => handleTagClick(tag, e)}
                                    style={{
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        border: '1px solid rgba(127, 255, 212, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        color: '#7FFFD4',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px'
                                    }}
                                >
                                    #{renderCosmicUsername(tag)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exif Data */}
                {items[currentSlide]?.exif && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <FaCamera color="#7FFFD4" size={14} /> SHOT DETAILS
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                        }}>
                            {formatExifForDisplay(items[currentSlide].exif)?.camera && <div><strong style={{ color: '#fff' }}>Camera:</strong> {formatExifForDisplay(items[currentSlide].exif).camera}</div>}
                            {formatExifForDisplay(items[currentSlide].exif)?.lens && <div><strong style={{ color: '#fff' }}>Lens:</strong> {formatExifForDisplay(items[currentSlide].exif).lens}</div>}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                                {formatExifForDisplay(items[currentSlide].exif)?.specs.map((spec, i) => (
                                    <span key={i} style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{spec}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Post Options */}
                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                    {/* Shop Link */}
                    {(shopLinkTarget || currentUser?.uid === (post.userId || post.authorId || post.uid)) && (
                        <button
                            onClick={() => {
                                if (shopLinkTarget?.type === 'item') {
                                    navigate(`/shop/${shopLinkTarget.id}`);
                                } else {
                                    const targetId = post.userId || post.authorId || post.uid;
                                    navigate(`/profile/${targetId}?tab=shop`);
                                }
                            }}
                            style={{
                                padding: '0.8rem',
                                background: 'rgba(127, 255, 212, 0.1)',
                                border: '1px solid #7FFFD4',
                                borderRadius: '4px',
                                color: '#7FFFD4',
                                cursor: 'pointer',
                                textAlign: 'center',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <FaShoppingBag />
                            {shopLinkTarget?.type === 'item' ? 'View in Shop' :
                                (currentUser?.uid === (post.userId || post.authorId || post.uid) ? 'My Shop' : 'Visit Shop')}
                        </button>
                    )}

                    {currentUser?.uid === (post.userId || post.authorId || post.uid) ? (
                        <>
                            <button onClick={handleEditPost} style={{ padding: '0.8rem', background: '#333', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                                Edit Post
                            </button>
                            <button onClick={() => {
                                if (window.confirm("Delete this post?")) {
                                    deleteDoc(doc(db, "posts", post.id)).then(() => navigate('/'));
                                }
                            }} style={{ padding: '0.8rem', background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '4px', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left' }}>
                                Delete Post
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <FollowButton
                                    targetUserId={post.userId || post.authorId || post.uid}
                                    targetUserName={post.username}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        background: 'transparent',
                                        border: '1px solid #7FFFD4',
                                        color: '#7FFFD4',
                                        padding: '0.8rem',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <button onClick={handleReportPost} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#ccc', cursor: 'pointer', textAlign: 'left' }}>
                                Report Post
                            </button>
                            <button onClick={handleBlockUser} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#ccc', cursor: 'pointer', textAlign: 'left' }}>
                                Block User
                            </button>
                        </>
                    )}
                    <button onClick={handleCopyLink} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#7FFFD4', cursor: 'pointer', textAlign: 'left' }}>
                        Copy Link
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 999,
                    backdropFilter: 'blur(2px)'
                }}
            />
        </>
    );
};

export default PostDetailsSidebar;
