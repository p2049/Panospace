import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEventSystem } from '@/hooks/useEventSystem';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

const EventSubmissionModal = ({ isOpen, onClose, eventId, eventTitle, isExpired }) => {
    const { currentUser } = useAuth();
    const { submitToEvent, loading: submitting } = useEventSystem();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchUserPosts();
        }
    }, [isOpen, currentUser]);

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            // Fetch user's recent posts to choose from
            // Supports both 'userId' and 'authorId' for backward compatibility
            const q = query(
                collection(db, 'posts'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const userPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(userPosts);
        } catch (err) {
            console.error("Error fetching user posts:", err);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleSubmit = async () => {
        if (isExpired) {
            alert("This event has ended. You can no longer submit.");
            onClose();
            return;
        }
        if (!selectedPost) return;
        try {
            await submitToEvent(eventId, selectedPost, currentUser);
            alert("Successfully submitted to " + eventTitle);
            onClose();
            // Optionally trigger a refresh in parent
        } catch (err) {
            alert(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '90%', maxWidth: '600px', maxHeight: '80vh',
                background: '#111', border: '1px solid #333', borderRadius: '12px',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Submit to {eventTitle}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}><FaTimes /></button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>Select a photo from your profile:</p>

                    {loadingPosts ? (
                        <div style={{ color: '#888', textAlign: 'center' }}>Loading your photos...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {posts.map(post => {
                                const imgUrl = post.imageUrl || post.images?.[0]?.url;
                                const isSelected = selectedPost?.id === post.id;
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => setSelectedPost(post)}
                                        style={{
                                            aspectRatio: '1',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            border: isSelected ? '3px solid #7FFFD4' : 'none',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 1 : 0.7 }} />
                                        {isSelected && (
                                            <div style={{ position: 'absolute', top: '5px', right: '5px', color: '#7FFFD4', background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}>
                                                <FaCheckCircle />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {posts.length === 0 && !loadingPosts && (
                        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                            You haven't posted any photos yet.
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedPost || submitting}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: !selectedPost ? '#333' : '#7FFFD4',
                            color: !selectedPost ? '#666' : '#000',
                            border: 'none', borderRadius: '8px', cursor: !selectedPost ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Photo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventSubmissionModal;
