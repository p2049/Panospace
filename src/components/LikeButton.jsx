import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaSmile, FaRegSmile } from 'react-icons/fa';

const LikeButton = ({ postId }) => {
    const { currentUser } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (!currentUser || !postId) return;
            try {
                const postRef = doc(db, 'posts', postId);
                const postSnap = await getDoc(postRef);
                if (postSnap.exists()) {
                    const data = postSnap.data();
                    const likes = data.likes || [];
                    setLiked(likes.includes(currentUser.uid));
                    // Use likeCount if available, otherwise fallback to array length
                    setLikeCount(data.likeCount !== undefined ? data.likeCount : likes.length);
                }
            } catch (error) {
                console.error('Error fetching like status:', error);
            }
        };
        fetchLikeStatus();
    }, [postId, currentUser]);

    const handleLike = async () => {
        if (!currentUser) {
            alert('Please log in to like posts');
            return;
        }

        // Optimistic update - update UI immediately for better UX
        const previousLiked = liked;
        const previousCount = likeCount;

        setAnimating(true);
        setTimeout(() => setAnimating(false), 300);

        // Update UI optimistically
        if (liked) {
            setLiked(false);
            setLikeCount(prev => Math.max(0, prev - 1));
        } else {
            setLiked(true);
            setLikeCount(prev => prev + 1);
        }

        try {
            const postRef = doc(db, 'posts', postId);
            if (previousLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid),
                    likeCount: increment(-1)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid),
                    likeCount: increment(1)
                });
            }
        } catch (error) {
            console.error('Error updating like:', error);
            // Rollback on error
            setLiked(previousLiked);
            setLikeCount(previousCount);
        }
    };

    return (
        <button
            onClick={handleLike}
            style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: animating ? 'scale(1.2)' : 'scale(1)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            {liked ? (
                <FaSmile size={20} style={{ color: '#7fffd4' }} />
            ) : (
                <FaRegSmile size={20} />
            )}
            <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>
    );
};

export default React.memo(LikeButton);
