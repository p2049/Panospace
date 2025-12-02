import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

const FollowButton = ({ targetUserId, targetUserName }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followDocId, setFollowDocId] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        checkFollowStatus();
    }, [targetUserId, currentUser]);

    const checkFollowStatus = async () => {
        if (!currentUser || currentUser.uid === targetUserId) {
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'follows'),
                where('followerId', '==', currentUser.uid),
                where('followingId', '==', targetUserId)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setIsFollowing(true);
                setFollowDocId(snapshot.docs[0].id);
            } else {
                setIsFollowing(false);
                setFollowDocId(null);
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser || loading) return;

        setLoading(true);
        try {
            if (isFollowing && followDocId) {
                // Unfollow
                await deleteDoc(doc(db, 'follows', followDocId));
                setIsFollowing(false);
                setFollowDocId(null);
            } else {
                // Follow
                const docRef = await addDoc(collection(db, 'follows'), {
                    followerId: currentUser.uid,
                    followerName: currentUser.displayName || 'Anonymous',
                    followingId: targetUserId,
                    followingName: targetUserName || 'User',
                    createdAt: new Date()
                });
                setIsFollowing(true);
                setFollowDocId(docRef.id);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            alert('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Don't show button if viewing own profile
    if (!currentUser || currentUser.uid === targetUserId) {
        return null;
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            style={{
                padding: '0.7rem 1.5rem',
                background: isFollowing
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: isFollowing ? '2px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                fontSize: '0.95rem',
                backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;
