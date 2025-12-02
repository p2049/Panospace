import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FaCog, FaCheck, FaUserPlus, FaTh, FaShoppingBag, FaSignOutAlt, FaLayerGroup, FaPlus } from 'react-icons/fa';
import { useCollections } from '../hooks/useCollections';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [shopItems, setShopItems] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    // Resolve target user id ("me" or undefined -> current user)
    const targetId = (id === 'me' || !id) ? currentUser?.uid : id;

    // Fetch collections for this user
    const { collections, loading: collectionsLoading } = useCollections(targetId);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!targetId) {
                setLoading(false);
                return;
            }

            console.log('Fetching profile for targetId:', targetId);

            try {
                setLoading(true);

                // 1. Fetch user profile
                let userData = null;
                try {
                    const userDoc = await getDoc(doc(db, 'users', targetId));
                    if (userDoc.exists()) {
                        userData = { id: userDoc.id, ...userDoc.data() };
                    } else {
                        console.warn('User document not found for:', targetId);
                    }
                } catch (e) {
                    console.warn('Error fetching user doc:', e);
                }

                // Fallback to auth user if doc missing or fetch failed (and it's the current user)
                if (!userData && currentUser && targetId === currentUser.uid) {
                    console.log('Using currentUser fallback');
                    userData = {
                        id: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous',
                        photoURL: currentUser.photoURL,
                        bio: 'Welcome to your profile!'
                    };
                }

                setUser(userData);

                if (userData) {
                    // 2. Fetch user's posts
                    // Note: Using 'authorId' as it is the consistent field across service.ts and legacy data.
                    // Removed orderBy to avoid index issues.
                    try {
                        console.log('Querying posts for authorId:', targetId);
                        const userPostsQuery = query(
                            collection(db, 'posts'),
                            where('authorId', '==', targetId)
                        );
                        const postsSnap = await getDocs(userPostsQuery);
                        const userPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                        console.log('Raw fetched posts count:', userPosts.length);

                        // Sort by createdAt desc
                        userPosts.sort((a, b) => {
                            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                            return dateB - dateA;
                        });

                        setPosts(userPosts);
                    } catch (err) {
                        console.error('Error fetching posts:', err);
                    }

                    // 3. Fetch shop items for this user
                    try {
                        console.log('Querying shop items for userId:', targetId);
                        const shopQuery = query(
                            collection(db, 'shopItems'),
                            where('userId', '==', targetId)
                        );
                        const shopSnap = await getDocs(shopQuery);
                        const fetchedShopItems = shopSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                        // Sort by createdAt desc
                        fetchedShopItems.sort((a, b) => {
                            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                            return dateB - dateA;
                        });

                        console.log('Fetched shop items:', fetchedShopItems.length);
                        setShopItems(fetchedShopItems);
                    } catch (err) {
                        console.error('Error fetching shop items:', err);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [targetId, currentUser]);

    if (loading) return <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading...</div>;

    if (!user) {
        return (
            <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', gap: '1rem' }}>
                <h2>User not found</h2>
                <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>Go Home</button>
                {currentUser && (
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px' }}>Sign Out</button>
                )}
            </div>
        );
    }

    const isOwnProfile = currentUser?.uid === user.id;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid #444' }}>
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#888' }}>{user.displayName?.[0]?.toUpperCase() || '?'}</div>
                    )}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>{user.displayName}</h1>
                    <p style={{ color: '#888', maxWidth: '400px' }}>{user.bio || 'No bio yet.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {isOwnProfile ? (
                        <>
                            <button onClick={() => navigate('/edit-profile')} style={{ padding: '0.5rem 1.5rem', background: '#333', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCog /> Edit Profile
                            </button>
                            <button onClick={handleLogout} style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,68,68,0.2)', border: '1px solid rgba(255,68,68,0.5)', borderRadius: '20px', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </>
                    ) : (
                        <button style={{ padding: '0.5rem 1.5rem', background: '#fff', border: 'none', borderRadius: '20px', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isFollowing ? <><FaCheck /> Following</> : <><FaUserPlus /> Follow</>}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderTop: '1px solid #222', borderBottom: '1px solid #222', marginBottom: '1rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex' }}>
                    <button onClick={() => setActiveTab('posts')} style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'posts' ? '#fff' : '#666', borderBottom: activeTab === 'posts' ? '2px solid #fff' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FaTh /> Posts
                    </button>
                    <button onClick={() => setActiveTab('collections')} style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'collections' ? '#fff' : '#666', borderBottom: activeTab === 'collections' ? '2px solid #fff' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FaLayerGroup /> Collections
                    </button>
                    <button onClick={() => setActiveTab('shop')} style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'shop' ? '#fff' : '#666', borderBottom: activeTab === 'shop' ? '2px solid #fff' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FaShoppingBag /> Shop
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
                {/* Create Collection Button (Own Profile Only) */}
                {activeTab === 'collections' && isOwnProfile && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => navigate('/create-collection')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#7FFFD4',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaPlus /> Create Collection
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {activeTab === 'posts' ? (
                        posts.map(post => (
                            <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} style={{ aspectRatio: '1', background: '#111', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }}>
                                {post.images?.[0]?.url || post.imageUrl || post.items?.[0]?.url ? (
                                    <img src={post.images?.[0]?.url || post.imageUrl || post.items?.[0]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>Text Post</div>
                                )}
                            </div>
                        ))
                    ) : activeTab === 'collections' ? (
                        collections.map(collection => {
                            const coverImage = collection.coverImage || '';
                            return (
                                <div
                                    key={collection.id}
                                    onClick={() => navigate(`/collection/${collection.id}`)}
                                    style={{
                                        aspectRatio: '1',
                                        background: '#111',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {coverImage ? (
                                        <img src={coverImage} alt={collection.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#666',
                                            fontSize: '2rem'
                                        }}>
                                            <FaLayerGroup />
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '0.5rem',
                                        color: '#fff',
                                        fontSize: '0.8rem'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{collection.title}</div>
                                        <div style={{ color: '#888', fontSize: '0.7rem' }}>{collection.postIds?.length || 0} posts</div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        shopItems.map(item => {
                            const prices = item.printSizes?.map(s => Number(s.price)) || [];
                            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                            return (
                                <div key={item.id} onClick={() => navigate(`/shop/${item.id}`)} style={{ aspectRatio: '1', background: '#111', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', position: 'relative', opacity: item.available ? 1 : 0.7, filter: item.available ? 'none' : 'grayscale(100%)' }}>
                                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.5rem', color: '#fff', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'View'}</span>
                                        {!item.available && <span style={{ color: '#aaa', fontStyle: 'italic' }}>Draft</span>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                {activeTab === 'posts' && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No posts yet.</div>
                )}
                {activeTab === 'collections' && collections.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        {isOwnProfile ? 'No collections yet. Create your first collection!' : 'No collections yet.'}
                    </div>
                )}
                {activeTab === 'shop' && shopItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No items for sale.</div>
                )}
            </div>
        </div>
    );
};

export default Profile;
