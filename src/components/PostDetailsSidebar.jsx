import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, deleteDoc, collection, query, where, limit, getDocs, getDoc } from 'firebase/firestore';
import { FaCamera, FaInfoCircle, FaShoppingBag, FaSmile, FaStar } from 'react-icons/fa';
import { logger } from '@/core/utils/logger';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { formatExifForDisplay } from '@/core/utils/exif';
import FollowButton from './FollowButton';
import PlanetUserIcon from './PlanetUserIcon';

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
    const [stats, setStats] = useState({ likeCount: 0, averageRating: 0, totalVotes: 0 });
    const [authorPhoto, setAuthorPhoto] = useState(
        post?.authorPhotoUrl || post?.userPhotoUrl || post?.userAvatar || post?.profileImage || null
    );
    const [authorTheme, setAuthorTheme] = useState({
        usernameColor: '#7FFFD4',
        borderColor: '#7FFFD4'
    });

    // Fetch author photo and theme if not available
    useEffect(() => {
        const fetchAuthorData = async () => {
            const authorId = post?.userId || post?.authorId || post?.uid;
            if (!authorId) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', authorId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    // Update photo if needed
                    if (data.photoURL && (!authorPhoto || !authorPhoto.startsWith('http'))) {
                        setAuthorPhoto(data.photoURL);
                    }
                    // Update theme colors
                    if (data.profileTheme) {
                        setAuthorTheme({
                            usernameColor: data.profileTheme.usernameColor || '#7FFFD4',
                            borderColor: data.profileTheme.borderColor || '#7FFFD4'
                        });
                    }
                }
            } catch (err) {
                logger.warn("Failed to fetch author data for sidebar", err);
            }
        };
        if (isVisible && post) {
            fetchAuthorData();
        }
    }, [isVisible, post, authorPhoto]);

    // Fetch live stats
    useEffect(() => {
        if (isVisible && post?.id) {
            const fetchStats = async () => {
                try {
                    const docSnap = await getDoc(doc(db, 'posts', post.id));
                    if (docSnap.exists()) {
                        const data = docSnap.data();

                        // Rating Stats
                        const ratings = data.ratings || {};
                        const ratingVals = Object.values(ratings);
                        const avg = ratingVals.length > 0 ? ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length : 0;

                        // Like Stats
                        const likes = data.likes || [];
                        const count = data.likeCount !== undefined ? data.likeCount : likes.length;

                        setStats({
                            likeCount: count,
                            averageRating: data.averageRating || avg, // Use stored or calculated
                            totalVotes: data.totalVotes || ratingVals.length
                        });
                    }
                } catch (err) {
                    console.error("Error fetching stats:", err);
                }
            };
            fetchStats();
        }
    }, [isVisible, post]);

    const [linkedPosts, setLinkedPosts] = useState([]);

    // Fetch Linked Posts
    useEffect(() => {
        if (isVisible && post?.linkedPostIds?.length > 0) {
            const fetchLinkedPosts = async () => {
                try {
                    const promises = post.linkedPostIds.map(id => getDoc(doc(db, 'posts', id)));
                    const snapshots = await Promise.all(promises);
                    const loaded = snapshots
                        .filter(s => s.exists())
                        .map(s => ({ id: s.id, ...s.data() }));
                    setLinkedPosts(loaded);
                } catch (err) {
                    logger.error("Error fetching linked posts:", err);
                }
            };
            fetchLinkedPosts();
        } else {
            setLinkedPosts([]);
        }
    }, [isVisible, post]);

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
            {/* Backdrop - MUST be rendered BEFORE Sidebar for correct stacking */}
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

            {/* Sidebar - Foreground Layer */}
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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

                {/* Author Profile Section - Prominent at top */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.8rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Large Profile Picture */}
                    <div
                        onClick={() => navigate(`/profile/${post.userId || post.authorId}`)}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px', // Matches Profile page styling
                            overflow: 'hidden',
                            border: `2px solid ${authorTheme.borderColor}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            boxShadow: `0 0 20px ${authorTheme.borderColor}4D`
                        }}
                    >
                        {authorPhoto && authorPhoto.startsWith('http') ? (
                            <img
                                src={authorPhoto}
                                alt={post.username || 'Author'}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <PlanetUserIcon size={48} color={authorTheme.usernameColor} />
                        )}
                    </div>

                    {/* Username */}
                    <div
                        onClick={() => navigate(`/profile/${post.userId || post.authorId}`)}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        <span style={{
                            color: authorTheme.usernameColor,
                            fontWeight: '700',
                            fontSize: '1rem',
                            fontFamily: '"Rajdhani", monospace',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            {renderCosmicUsername(post.username || post.authorName || 'ANONYMOUS', authorTheme.borderColor)}
                        </span>
                    </div>

                    {/* Follow Button (only if not own post) */}
                    {currentUser?.uid !== (post.userId || post.authorId || post.uid) && (
                        <FollowButton
                            targetUserId={post.userId || post.authorId || post.uid}
                            targetUserName={post.username}
                            style={{
                                background: 'transparent',
                                border: `1px solid ${authorTheme.usernameColor}`,
                                color: authorTheme.usernameColor,
                                padding: '0.5rem 1.5rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem'
                            }}
                        />
                    )}
                </div>

                {/* Post Title - Only for image posts (text posts show title in content area) */}
                {post.postType !== 'text' && post.title && (
                    <div>
                        <h2 style={{
                            margin: 0,
                            color: '#fff',
                            fontSize: '1.2rem',
                            fontFamily: '"Orbitron", sans-serif',
                            fontWeight: '700',
                            letterSpacing: '0.05em',
                            lineHeight: 1.3,
                            textTransform: 'uppercase',
                            textShadow: '0 0 15px rgba(127, 255, 212, 0.2)'
                        }}>
                            {renderCosmicUsername(post.title)}
                        </h2>
                    </div>
                )}

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

                {/* Linked Posts (New) */}
                {linkedPosts.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <FaInfoCircle color="#7FFFD4" size={14} /> RELATED
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {linkedPosts.map(lp => (
                                <div
                                    key={lp.id}
                                    onClick={() => navigate(`/post/${lp.id}`)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        padding: '0.6rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ width: 40, height: 40, borderRadius: '4px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                                        {lp.postType === 'image' && (lp.thumbnailUrls?.[0] || lp.images?.[0]?.url) ? (
                                            <img src={lp.thumbnailUrls?.[0] || lp.images?.[0]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold' }}>T</div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {lp.title || 'Untitled Post'}
                                        </div>
                                        <div style={{ color: '#aaa', fontSize: '0.75rem' }}>
                                            {lp.postType === 'text' ? 'Text Post' : 'Image Post'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Engagement Stats - "Footnote" Style */}
                <div style={{ padding: '0 0.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '1rem',
                        opacity: 0.6, // Dimmer overall
                        fontSize: '0.85rem'
                    }}>
                        {stats.totalVotes > 0 ? (
                            /* Show Rating */
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaStar color="#7FFFD4" size={12} />
                                <span style={{ color: '#fff', fontFamily: 'monospace' }}>
                                    {Number(stats.averageRating).toFixed(1)} <span style={{ opacity: 0.7 }}>({stats.totalVotes})</span>
                                </span>
                            </div>
                        ) : (
                            /* Show Likes */
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaSmile color="#7FFFD4" size={12} />
                                <span style={{ color: '#fff', fontFamily: 'monospace' }}>
                                    {stats.likeCount} Stars
                                </span>
                            </div>
                        )}
                    </div>
                </div>

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
                            <button onClick={async () => {
                                if (window.confirm("Delete this post?")) {
                                    try {
                                        await deleteDoc(doc(db, "posts", post.id));
                                        navigate('/');
                                    } catch (error) {
                                        console.error("Error deleting post:", error);
                                        alert(`Failed to delete post: ${error.message}`);
                                    }
                                }
                            }} style={{ padding: '0.8rem', background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '4px', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left' }}>
                                Delete Post
                            </button>
                        </>
                    ) : (
                        <>
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
        </>
    );
};

export default PostDetailsSidebar;
