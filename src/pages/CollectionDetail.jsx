import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, query, where, collection as firestoreCollection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCollection, useCreateCollection } from '../hooks/useCollections';
import { FaArrowLeft, FaLock, FaUsers, FaGlobe, FaStore, FaEdit, FaShoppingCart, FaPlus } from 'react-icons/fa';

const CollectionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { collection, loading, error, refetch } = useCollection(id);
    const { addPostToCollection } = useCreateCollection();

    const [allImages, setAllImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [owner, setOwner] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [showAddPostModal, setShowAddPostModal] = useState(false);

    useEffect(() => {
        const fetchCollectionImages = async () => {
            if (!collection) {
                setImagesLoading(false);
                return;
            }

            try {
                setImagesLoading(true);

                const images = [];

                // 1. Add initial collection items (manually uploaded images)
                if (collection.items && collection.items.length > 0) {
                    collection.items.forEach(item => {
                        images.push({
                            type: 'collection-item',
                            imageUrl: item.imageUrl,
                            exif: item.exif,
                            aspectRatio: item.aspectRatio
                        });
                    });
                }

                // 2. Add images from referenced posts
                if (collection.postRefs && collection.postRefs.length > 0) {
                    const postPromises = collection.postRefs.map(postId =>
                        getDoc(doc(db, 'posts', postId))
                    );

                    const postDocs = await Promise.all(postPromises);

                    postDocs.forEach(postDoc => {
                        if (postDoc.exists()) {
                            const postData = postDoc.data();
                            const postImages = postData.images || postData.items || [];

                            postImages.forEach(img => {
                                images.push({
                                    type: 'post-image',
                                    postId: postDoc.id,
                                    postTitle: postData.title,
                                    imageUrl: img.url || img.imageUrl,
                                    exif: img.exif,
                                    aspectRatio: img.aspectRatio
                                });
                            });
                        }
                    });
                }

                setAllImages(images);

                // Fetch owner info
                if (collection.ownerId) {
                    const ownerDoc = await getDoc(doc(db, 'users', collection.ownerId));
                    if (ownerDoc.exists()) {
                        setOwner({ id: ownerDoc.id, ...ownerDoc.data() });
                    }
                }

                // Fetch user's posts if owner
                if (currentUser && collection.ownerId === currentUser.uid) {
                    const postsQuery = query(
                        firestoreCollection(db, 'posts'),
                        where('authorId', '==', currentUser.uid)
                    );
                    const postsSnap = await getDocs(postsQuery);
                    const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setUserPosts(posts);
                }
            } catch (err) {
                console.error('Error fetching collection images:', err);
            } finally {
                setImagesLoading(false);
            }
        };

        fetchCollectionImages();
    }, [collection, currentUser]);

    const handleAddPost = async (postId) => {
        try {
            await addPostToCollection(id, postId);
            setShowAddPostModal(false);
            refetch();
        } catch (err) {
            console.error('Error adding post:', err);
            alert('Failed to add post to collection');
        }
    };

    if (loading || imagesLoading) {
        return (
            <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Loading collection...
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <h2>Collection not found</h2>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.75rem 1.5rem', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isOwner = currentUser?.uid === collection.ownerId;
    const canView = collection.visibility === 'public' || isOwner ||
        (collection.visibility === 'followers' && currentUser);

    if (!canView) {
        return (
            <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <FaLock style={{ fontSize: '3rem', color: '#666' }} />
                <h2>This collection is private</h2>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.75rem 1.5rem', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const visibilityIcon = {
        public: FaGlobe,
        followers: FaUsers,
        private: FaLock
    }[collection.visibility];

    const VisibilityIcon = visibilityIcon || FaGlobe;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '2rem'
                    }}
                >
                    <FaArrowLeft /> Back
                </button>

                {/* Collection Info */}
                <div style={{ marginBottom: '3rem' }}>
                    {collection.coverImage && (
                        <div style={{
                            width: '100%',
                            maxHeight: '400px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '2rem'
                        }}>
                            <img
                                src={collection.coverImage}
                                alt={collection.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {collection.title}
                            </h1>

                            {collection.description && (
                                <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                                    {collection.description}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', color: '#888', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <VisibilityIcon />
                                    <span>{collection.visibility}</span>
                                </div>

                                {owner && (
                                    <div
                                        onClick={() => navigate(`/profile/${owner.id}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                    >
                                        by <span style={{ color: '#7FFFD4' }}>{owner.displayName}</span>
                                    </div>
                                )}

                                <div>{allImages.length} images</div>
                                <div>{collection.items?.length || 0} original</div>
                                <div>{collection.postRefs?.length || 0} posts added</div>

                                {collection.shopSettings?.showInStore && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7FFFD4' }}>
                                        <FaStore />
                                        <span>In Store</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => setShowAddPostModal(true)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#333',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <FaPlus /> Add Post
                                    </button>
                                    <button
                                        onClick={() => navigate(`/collection/${id}/edit`)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#333',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                </>
                            )}

                            {collection.shopSettings?.bundlePrice && collection.shopSettings?.showInStore && (
                                <button
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#7FFFD4',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#000',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    <FaShoppingCart /> ${collection.shopSettings.bundlePrice.toFixed(2)}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Images Grid */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.75rem' }}>
                        All Images
                    </h2>

                    {allImages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                            No images in this collection yet.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {allImages.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => image.type === 'post-image' && navigate(`/post/${image.postId}`)}
                                    style={{
                                        aspectRatio: image.aspectRatio || '1',
                                        background: '#111',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: image.type === 'post-image' ? 'pointer' : 'default',
                                        transition: 'transform 0.2s',
                                        border: '1px solid #222',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => image.type === 'post-image' && (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => image.type === 'post-image' && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {image.type === 'post-image' && image.postTitle && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.8)',
                                            padding: '0.5rem',
                                            fontSize: '0.85rem',
                                            color: '#7FFFD4'
                                        }}>
                                            From: {image.postTitle}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Post Modal */}
            {showAddPostModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        border: '1px solid #333',
                        padding: '2rem'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add Post to Collection</h2>

                        {userPosts.filter(p => !collection.postRefs?.includes(p.id)).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                No posts available to add.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                                {userPosts
                                    .filter(p => !collection.postRefs?.includes(p.id))
                                    .map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => handleAddPost(post.id)}
                                            style={{
                                                aspectRatio: '1',
                                                background: '#222',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: '2px solid transparent',
                                                transition: 'border 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7FFFD4'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            {post.images?.[0]?.url || post.imageUrl ? (
                                                <img
                                                    src={post.images?.[0]?.url || post.imageUrl}
                                                    alt={post.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                                    {post.title}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowAddPostModal(false)}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem 1.5rem',
                                background: '#333',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionDetail;
