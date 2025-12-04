import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { usePreferenceLearning } from '../hooks/usePersonalizedFeed';
import { FaStar, FaRegStar, FaSmile, FaRegSmile } from 'react-icons/fa';

const LikeButton = ({ postId, initialLiked, initialCount, enableRatings = true }) => {
    const { currentUser } = useAuth();
    const [userRating, setUserRating] = useState(0); // User's rating (1-5)
    const [averageRating, setAverageRating] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false); // 🔒 Double-tap prevention

    // Legacy like system for non-rated posts
    const [liked, setLiked] = useState(initialLiked || false);
    const [likeCount, setLikeCount] = useState(initialCount || 0);

    useEffect(() => {
        const fetchRatingStatus = async () => {
            if (!currentUser || !postId) return;
            try {
                const postRef = doc(db, 'posts', postId);
                const postSnap = await getDoc(postRef);

                if (postSnap.exists()) {
                    const data = postSnap.data();

                    if (enableRatings) {
                        // Fetch rating data
                        const ratings = data.ratings || {};
                        const userRatingValue = ratings[currentUser.uid] || 0;
                        setUserRating(userRatingValue);

                        // Calculate average
                        const ratingValues = Object.values(ratings);
                        const total = ratingValues.length;
                        const avg = total > 0 ? ratingValues.reduce((a, b) => a + b, 0) / total : 0;
                        setAverageRating(avg);
                        setTotalVotes(total);
                    } else {
                        // Legacy like system
                        const likes = data.likes || [];
                        setLiked(likes.includes(currentUser.uid));
                        setLikeCount(data.likeCount !== undefined ? data.likeCount : likes.length);
                    }
                }
            } catch (error) {
                console.error('Error fetching rating status:', error);
            }
        };
        fetchRatingStatus();
    }, [postId, currentUser?.uid, enableRatings]);

    const { trackLike } = usePreferenceLearning();

    const handleStarClick = async (rating) => {
        setHoveredStar(0); // Fix for sticky hover on mobile
        if (!currentUser) {
            alert('Please log in to rate posts');
            return;
        }

        // 🔒 DOUBLE-TAP PREVENTION
        if (isProcessing) return;
        setIsProcessing(true);

        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);

        const previousRating = userRating;
        setUserRating(rating);

        try {
            const postRef = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const data = postSnap.data();
                const ratings = data.ratings || {};

                // Update user's rating
                ratings[currentUser.uid] = rating;

                // Calculate new average
                const ratingValues = Object.values(ratings);
                const total = ratingValues.length;
                const avg = ratingValues.reduce((a, b) => a + b, 0) / total;

                await updateDoc(postRef, {
                    ratings: ratings,
                    averageRating: avg,
                    totalVotes: total
                });

                setAverageRating(avg);
                setTotalVotes(total);
                trackLike(postId);
            }
        } catch (error) {
            console.error('Error updating rating:', error);
            setUserRating(previousRating);
        } finally {
            // Re-enable after 500ms
            setTimeout(() => setIsProcessing(false), 500);
        }
    };

    const handleLegacyLike = async () => {
        if (!currentUser) {
            alert('Please log in to like posts');
            return;
        }

        // 🔒 DOUBLE-TAP PREVENTION
        if (isProcessing) return;
        setIsProcessing(true);

        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);

        const previousLiked = liked;
        const previousCount = likeCount;

        setLiked(!liked);
        setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);

        try {
            const postRef = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const data = postSnap.data();
                const likes = data.likes || [];

                if (previousLiked) {
                    const newLikes = likes.filter(uid => uid !== currentUser.uid);
                    await updateDoc(postRef, {
                        likes: newLikes,
                        likeCount: newLikes.length
                    });
                } else {
                    const newLikes = [...likes, currentUser.uid];
                    await updateDoc(postRef, {
                        likes: newLikes,
                        likeCount: newLikes.length
                    });
                    trackLike(postId);
                }
            }
        } catch (error) {
            console.error('Error updating like:', error);
            setLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            // Re-enable after 500ms
            setTimeout(() => setIsProcessing(false), 500);
        }
    };

    // Simple smiley mode (non-rated posts)
    if (!enableRatings) {
        return (
            <button
                onClick={handleLegacyLike}
                disabled={isProcessing}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    // ✅ APPLE 44PX TAP TARGET
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    transform: animating ? 'scale(1.2)' : 'scale(1)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '500',
                    filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8))',
                    opacity: isProcessing ? 0.6 : 1
                }}
                onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1)')}
            >
                {liked ? (
                    <FaSmile size={24} style={{ color: '#7fffd4', filter: 'drop-shadow(0 0 6px rgba(127, 255, 212, 0.6))' }} />
                ) : (
                    <FaRegSmile size={24} style={{ color: 'rgba(127, 255, 212, 0.5)' }} />
                )}
                <span style={{ color: '#7FFFD4' }}>{likeCount > 0 ? likeCount : ''}</span>
            </button>
        );
    }

    // 5-Star rating mode (rated posts)
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8))'
        }}>
            {/* Star Rating Input */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.15rem'
                }}
                onMouseLeave={() => setHoveredStar(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoveredStar || userRating);

                    return (
                        <div
                            key={star}
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            style={{
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                transform: animating && star === userRating ? 'scale(1.3) rotate(15deg)' :
                                    hoveredStar === star ? 'scale(1.15)' : 'scale(1)',
                                filter: isFilled ? 'drop-shadow(0 0 4px rgba(127, 255, 212, 0.6))' : 'none',
                                // ✅ APPLE 44PX TAP TARGET
                                minWidth: '44px',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                // Negative margin to maintain visual spacing
                                margin: '-14px -14px',
                                opacity: isProcessing ? 0.6 : 1
                            }}
                        >
                            {isFilled ? (
                                <FaStar
                                    size={16}
                                    style={{
                                        color: '#7FFFD4',
                                        filter: 'brightness(1.2)'
                                    }}
                                />
                            ) : (
                                <FaRegStar
                                    size={16}
                                    style={{
                                        color: 'rgba(127, 255, 212, 0.3)',
                                        transition: 'color 0.2s'
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Compact Rating Info */}
            {totalVotes > 0 && (
                <span style={{
                    color: '#7FFFD4',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                    opacity: 0.9
                }}>
                    {averageRating.toFixed(1)} ({totalVotes})
                </span>
            )}
        </div>
    );
};

export default React.memo(LikeButton);
