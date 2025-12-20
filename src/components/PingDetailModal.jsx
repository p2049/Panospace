import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { FaHeart, FaTimes, FaEdit, FaTrash, FaFlag, FaBan, FaLink, FaCalendarAlt } from 'react-icons/fa';
import { logger } from '@/core/utils/logger';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import FollowButton from './FollowButton';
import PlanetUserIcon from './PlanetUserIcon';

const PingDetailModal = ({ isVisible, onClose, post, onDelete }) => {
    const navigate = useNavigate();
    const { currentUser, isAdmin, isGodMode } = useAuth();

    // Get post owner ID - check all possible field names for backwards compatibility
    const postOwnerId = post?.userId || post?.authorId || post?.uid || post?.creatorId || post?.owner || post?.ownerId;
    const isOwnPost = currentUser?.uid && postOwnerId && currentUser.uid === postOwnerId;
    const canManageContent = isOwnPost || isAdmin || isGodMode;

    // Debug log for ownership
    if (post) {
        console.log('[PingDetailModal] Ownership check:', {
            currentUserId: currentUser?.uid,
            postOwnerId,
            isOwnPost,
            canManageContent,
            postFields: { userId: post?.userId, authorId: post?.authorId, uid: post?.uid }
        });
    }

    const [authorPhoto, setAuthorPhoto] = useState(
        post?.authorPhotoUrl || post?.userPhotoUrl || post?.userAvatar || post?.profileImage || null
    );
    const [authorTheme, setAuthorTheme] = useState({
        usernameColor: '#7FFFD4',
        borderColor: '#7FFFD4'
    });
    const [stats, setStats] = useState({ likeCount: 0 });
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Fetch author photo and theme
    useEffect(() => {
        const fetchAuthorData = async () => {
            const authorId = post?.userId || post?.authorId || post?.uid;
            if (!authorId) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', authorId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.photoURL && (!authorPhoto || !authorPhoto.startsWith('http'))) {
                        setAuthorPhoto(data.photoURL);
                    }
                    if (data.profileTheme) {
                        setAuthorTheme({
                            usernameColor: data.profileTheme.usernameColor || '#7FFFD4',
                            borderColor: data.profileTheme.borderColor || '#7FFFD4'
                        });
                    }
                }
            } catch (err) {
                logger.warn("Failed to fetch author data for ping modal", err);
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
                        const likes = data.likes || [];
                        const count = data.likeCount !== undefined ? data.likeCount : likes.length;
                        setStats({ likeCount: count });
                    }
                } catch (err) {
                    console.error("Error fetching stats:", err);
                }
            };
            fetchStats();
        }
    }, [isVisible, post]);

    const handleEditPost = () => {
        onClose();
        navigate(`/edit-post/${post.id}`);
    };

    const handleDeletePost = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        // First click: show confirmation
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            // Auto-reset after 3 seconds if not confirmed
            setTimeout(() => setDeleteConfirm(false), 3000);
            return;
        }

        // Second click: actually delete
        try {
            console.log('[PingDetailModal] Deleting post:', post.id);
            await deleteDoc(doc(db, "posts", post.id));
            console.log('[PingDetailModal] Delete successful');
            setDeleteConfirm(false);
            onClose();
            if (onDelete) onDelete();
        } catch (error) {
            console.error("[PingDetailModal] Error deleting post:", error);
            alert(`Failed to delete ping: ${error.message}`);
            setDeleteConfirm(false);
        }
    };

    const handleReportPost = () => {
        alert("Report feature coming soon");
    };

    const handleBlockUser = async () => {
        if (window.confirm(`Block ${post.username || 'this user'}?`)) {
            alert("User blocked");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert("Link copied!");
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (!isVisible || !post) return null;

    const plainTextContent = post.body || post.description || post.caption;

    // Use createPortal to render at document body level for proper z-index
    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        background: 'rgba(10, 10, 10, 0.98)',
                        border: '1px solid rgba(127, 255, 212, 0.5)',
                        boxShadow: '0 0 30px rgba(127, 255, 212, 0.15)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'pingModalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    <style>{`
                        @keyframes pingModalIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>

                    {/* Header: Close Button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '1rem 1rem 0 1rem'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                            }}
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>

                    {/* Author Section */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '0.5rem 1.5rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {/* Large Profile Picture */}
                        <div
                            onClick={() => {
                                onClose();
                                navigate(`/profile/${post.userId || post.authorId}`);
                            }}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: `3px solid ${authorTheme.borderColor}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.3)',
                                boxShadow: `0 0 25px ${authorTheme.borderColor}4D`
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
                            onClick={() => {
                                onClose();
                                navigate(`/profile/${post.userId || post.authorId}`);
                            }}
                            style={{
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            <span style={{
                                color: authorTheme.usernameColor,
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                fontFamily: '"Rajdhani", monospace',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                textShadow: `0 0 10px ${authorTheme.usernameColor}4D`
                            }}>
                                {renderCosmicUsername(post.username || post.authorName || 'ANONYMOUS', authorTheme.borderColor)}
                            </span>
                        </div>

                        {/* Follow Button (only if not own post) */}
                        {!isOwnPost && (
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

                    {/* Scrollable Content Area */}
                    <div style={{
                        padding: '1.5rem',
                        overflowY: 'auto',
                        flex: 1,
                        color: '#fff'
                    }}>
                        {/* Title */}
                        {post.title && (
                            <h2 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.5rem',
                                fontFamily: '"Rajdhani", sans-serif',
                                fontWeight: '700',
                                lineHeight: 1.2,
                                textTransform: 'uppercase',
                                color: '#fff'
                            }}>
                                {post.title}
                            </h2>
                        )}

                        {/* Body */}
                        <div style={{
                            fontSize: '1rem',
                            lineHeight: 1.6,
                            marginBottom: '1.5rem',
                            color: '#e0e0e0'
                        }}>
                            {post.bodyRichText ? (
                                <RichTextRenderer content={post.bodyRichText} textColor="#e0e0e0" />
                            ) : (
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{plainTextContent}</p>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            fontSize: '0.85rem',
                            opacity: 0.7,
                            marginBottom: '1rem'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FaCalendarAlt size={12} />
                                {formatDate(post.createdAt)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FaHeart size={12} />
                                {stats.likeCount} Stars
                            </span>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => {
                                            onClose();
                                            navigate(`/search?tags=${tag}`);
                                        }}
                                        style={{
                                            background: 'rgba(127, 255, 212, 0.1)',
                                            border: '1px solid rgba(127, 255, 212, 0.3)',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            color: '#7FFFD4',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions Footer */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        position: 'relative',
                        zIndex: 10,
                        pointerEvents: 'auto'
                    }}>
                        {canManageContent ? (
                            <>
                                {isOwnPost && (
                                    <button
                                        onClick={handleEditPost}
                                        style={{
                                            padding: '0.8rem',
                                            background: 'rgba(127, 255, 212, 0.1)',
                                            border: '1px solid rgba(127, 255, 212, 0.3)',
                                            borderRadius: '8px',
                                            color: '#7FFFD4',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <FaEdit size={14} />
                                        Edit Ping
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleDeletePost}
                                    style={{
                                        padding: '0.8rem',
                                        background: deleteConfirm ? 'rgba(255,0,0,0.4)' : 'rgba(255,0,0,0.1)',
                                        border: deleteConfirm ? '2px solid #ff4444' : '1px solid rgba(255,0,0,0.3)',
                                        borderRadius: '8px',
                                        color: deleteConfirm ? '#fff' : '#ff6b6b',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        width: '100%',
                                        pointerEvents: 'auto',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FaTrash size={14} />
                                    {deleteConfirm ? 'TAP AGAIN TO DELETE' : (isAdmin || isGodMode ? 'Admin: Delete' : 'Delete Ping')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleReportPost}
                                    style={{
                                        padding: '0.8rem',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#ccc',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaFlag size={14} />
                                    Report
                                </button>
                                <button
                                    onClick={handleBlockUser}
                                    style={{
                                        padding: '0.8rem',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#ccc',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaBan size={14} />
                                    Block User
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleCopyLink}
                            style={{
                                padding: '0.8rem',
                                background: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#7FFFD4',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaLink size={14} />
                            Copy Link
                        </button>
                    </div>
                </div>
            </div >
        </>,
        document.body
    );
};

export default PingDetailModal;
