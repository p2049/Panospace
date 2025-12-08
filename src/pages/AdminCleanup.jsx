import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cleanupOrphanedPosts, cleanupOrphanedShopItems, cleanupOrphanedUserImages } from '@/core/utils/cleanupOrphanedPosts';
import { FaTrash, FaArrowLeft, FaExclamationTriangle, FaUser, FaBug } from 'react-icons/fa';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import AsyncButton from '@/components/AsyncButton';

const AdminCleanup = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleCleanupPosts = async () => {
        if (!window.confirm('⚠️ This will delete all posts whose images are missing from Storage. This cannot be undone. Continue?')) {
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const result = await cleanupOrphanedPosts();
            setResults({
                type: 'posts',
                ...result
            });
        } catch (error) {
            console.error('Cleanup error:', error);
            alert('Error during cleanup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCleanupShop = async () => {
        if (!window.confirm('⚠️ This will delete all shop items whose images are missing from Storage. This cannot be undone. Continue?')) {
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const result = await cleanupOrphanedShopItems();
            setResults({
                type: 'shop',
                ...result
            });
        } catch (error) {
            console.error('Cleanup error:', error);
            alert('Error during cleanup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCleanupUsers = async () => {
        if (!window.confirm('⚠️ This will remove profile photos for users whose images are missing from Storage. This cannot be undone. Continue?')) {
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const result = await cleanupOrphanedUserImages();
            setResults({
                type: 'users',
                ...result
            });
        } catch (error) {
            console.error('Cleanup error:', error);
            alert('Error during cleanup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBrokenPost = async () => {
        try {
            setLoading(true);
            // Create a post with a URL that looks like a Firebase Storage URL but doesn't exist
            const fakeUrl = "https://firebasestorage.googleapis.com/v0/b/panospace-app.appspot.com/o/posts%2Fthis-does-not-exist.jpg?alt=media&token=fake-token";

            await addDoc(collection(db, 'posts'), {
                imageUrl: fakeUrl,
                images: [{ url: fakeUrl, type: 'image' }],
                title: "Broken Post Test",
                description: "This is a broken post for testing cleanup.",
                userId: currentUser.uid,
                authorId: currentUser.uid,
                username: currentUser.displayName || 'Test User',
                profileImage: currentUser.photoURL || '',
                createdAt: serverTimestamp(),
                likeCount: 0,
                commentCount: 0,
                tags: ['test', 'broken']
            });

            alert("Broken post created! Go to the feed to see it.");
        } catch (error) {
            console.error("Error creating broken post:", error);
            alert("Failed to create broken post: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Please log in to access admin tools.</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem'
                }}
            >
                <FaArrowLeft /> Back
            </button>

            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛠️ Admin Cleanup Tools</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
                Use these tools to clean up orphaned database entries when storage files have been deleted.
            </p>

            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Posts Cleanup */}
                <div style={{
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaTrash color="#ff6b6b" /> Clean Up Orphaned Posts
                    </h2>
                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Deletes all post documents whose images no longer exist in Firebase Storage.
                    </p>
                    <div style={{
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <FaExclamationTriangle color="#ff6b6b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.85rem', color: '#ffb3b3' }}>
                            <strong>Warning:</strong> This action cannot be undone. Make sure you've backed up any important data.
                        </div>
                    </div>
                    <AsyncButton
                        onClick={handleCleanupPosts}
                        loading={loading}
                        loadingText="Cleaning up..."
                        style={{ background: '#ff6b6b', color: '#fff' }}
                    >
                        Run Posts Cleanup
                    </AsyncButton>
                </div>

                {/* Shop Items Cleanup */}
                <div style={{
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaTrash color="#ffa94d" /> Clean Up Orphaned Shop Items
                    </h2>
                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Deletes all shop item documents whose images no longer exist in Firebase Storage.
                    </p>
                    <AsyncButton
                        onClick={handleCleanupShop}
                        loading={loading}
                        loadingText="Cleaning up..."
                        style={{ background: '#ffa94d', color: '#000' }}
                    >
                        Run Shop Cleanup
                    </AsyncButton>
                </div>

                {/* Users Cleanup */}
                <div style={{
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUser color="#4dabf7" /> Clean Up Orphaned User Photos
                    </h2>
                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Removes profile photo references for users whose images no longer exist in Firebase Storage.
                    </p>
                    <AsyncButton
                        onClick={handleCleanupUsers}
                        loading={loading}
                        loadingText="Cleaning up..."
                        style={{ background: '#4dabf7', color: '#fff' }}
                    >
                        Run User Cleanup
                    </AsyncButton>
                </div>

                {/* Results */}
                {results && (
                    <div style={{
                        background: '#0a3d2e',
                        border: '1px solid #7FFFD4',
                        borderRadius: '12px',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#7FFFD4' }}>
                            ✅ Cleanup Complete
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <div>
                                <strong>Type:</strong> {results.type === 'posts' ? 'Posts' : results.type === 'shop' ? 'Shop Items' : 'Users'}
                            </div>
                            <div>
                                <strong>Items Checked:</strong> {results.checked}
                            </div>
                            <div>
                                <strong>Items Deleted/Updated:</strong> {results.deleted || results.updated}
                            </div>
                            {results.errors && results.errors.length > 0 && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <strong style={{ color: '#ff6b6b' }}>Errors:</strong> {results.errors.length}
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ffb3b3' }}>
                                        Check browser console for details
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Debug Tools */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>Debug Tools</h3>
                    <button
                        onClick={handleCreateBrokenPost}
                        disabled={loading}
                        style={{
                            background: '#333',
                            color: '#aaa',
                            border: '1px dashed #666',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaBug /> Create Broken Post (Test)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminCleanup;
