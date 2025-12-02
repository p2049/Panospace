import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useBlock } from '../hooks/useBlock';
import { useCollections } from '../hooks/useCollections';
import { SpaceCardService } from '../services/SpaceCardService';
import SEO from '../components/SEO';
import StarBackground from '../components/StarBackground';
import WalletDisplay from '../components/WalletDisplay';
import InfiniteGrid from '../components/InfiniteGrid';
import CreateMuseumModal from '../components/CreateMuseumModal';
import MuseumCard from '../components/MuseumCard';
import ReportModal from '../components/ReportModal';
import CreateCardModal from '../components/CreateCardModal';
import BusinessCardModal from '../components/BusinessCardModal';
import CommissionModal from '../components/monetization/CommissionModal';
import { FaUniversity, FaPlus, FaLayerGroup, FaTh, FaShoppingBag, FaRocket, FaCheck, FaCog, FaIdBadge, FaEllipsisV, FaFlag, FaBan, FaUserPlus } from 'react-icons/fa';


const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { blockUser } = useBlock();
    const [showCreateMuseumModal, setShowCreateMuseumModal] = useState(false);

    const targetId = (id === 'me' || !id) ? currentUser?.uid : id;
    const isMountedRef = useRef(true);

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [shopItems, setShopItems] = useState([]);
    const [spaceCards, setSpaceCards] = useState([]);
    const [purchasedPrints, setPurchasedPrints] = useState([]);
    const [badges, setBadges] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBusinessCard, setShowBusinessCard] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followDocId, setFollowDocId] = useState(null);
    const [followLoading, setFollowLoading] = useState(false);
    const { collections, loading: collectionsLoading } = useCollections(targetId);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (!targetId) {
                setLoading(false);
                return;
            }

            // If we already have the user and it matches target, don't refetch
            if (user && user.id === targetId) return;

            try {
                setLoading(true);
                let userData = null;

                try {
                    const userDoc = await getDoc(doc(db, 'users', targetId));
                    if (userDoc.exists()) {
                        userData = { id: userDoc.id, ...userDoc.data() };
                    }
                } catch (e) {
                    console.warn('Error fetching user doc:', e);
                }

                if (!userData && currentUser && targetId === currentUser.uid) {
                    userData = {
                        id: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous',
                        photoURL: currentUser.photoURL,
                        bio: 'Welcome to your profile!'
                    };
                }

                if (isMountedRef.current) {
                    setUser(userData);
                    // Reset data when user changes
                    setPosts([]);
                    setShopItems([]);
                    setSpaceCards([]);
                    setPurchasedPrints([]);
                    setBadges([]);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                if (isMountedRef.current) setLoading(false);
            }
        };

        fetchUser();
    }, [targetId, currentUser?.uid]);

    // Lazy load tab data
    useEffect(() => {
        const fetchTabData = async () => {
            if (!user || !targetId || !isMountedRef.current) return;

            try {
                // Posts - only show posts that are marked to show in profile
                if (activeTab === 'posts' && posts.length === 0) {
                    const userPostsQuery = query(
                        collection(db, 'posts'),
                        where('authorId', '==', targetId),
                        orderBy('createdAt', 'desc'),
                        limit(20)
                    );
                    const postsSnap = await getDocs(userPostsQuery);
                    if (isMountedRef.current) {
                        // Filter to only show posts where:
                        // 1. showInProfile is true, OR
                        // 2. showInProfile is undefined (old posts), OR
                        // 3. collectionId is null (not in a collection)
                        const filteredPosts = postsSnap.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(post => {
                                // If showInProfile is explicitly false, hide it
                                if (post.showInProfile === false) return false;
                                // Otherwise show it (true, undefined, or null)
                                return true;
                            });
                        setPosts(filteredPosts);
                    }
                }

                // Shop
                if (activeTab === 'shop' && shopItems.length === 0) {
                    const shopQuery = query(
                        collection(db, 'shopItems'),
                        where('userId', '==', targetId),
                        orderBy('createdAt', 'desc'),
                        limit(20)
                    );
                    const shopSnap = await getDocs(shopQuery);
                    if (isMountedRef.current) {
                        setShopItems(shopSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                    }
                }

                // Cards
                if (activeTab === 'cards' && spaceCards.length === 0) {
                    const userCards = await SpaceCardService.getOwnedCards(targetId);
                    if (isMountedRef.current) {
                        setSpaceCards(userCards);
                    }
                }

                // Badges (fetch if tab is badges OR if we need them for header showcase)
                // Note: We might want to always fetch badges for the header, but let's lazy load for now
                // Actually, header shows badges. So we should fetch badges on mount?
                // The original code fetched everything.
                // Let's fetch badges on mount because they are in the header.
            } catch (err) {
                console.error(`Error fetching ${activeTab} data:`, err);
            }
        };

        fetchTabData();
    }, [activeTab, user, targetId]);

    // Fetch badges separately since they are shown in header
    useEffect(() => {
        const fetchBadges = async () => {
            if (!user || !targetId || badges.length > 0) return;
            try {
                const badgesQuery = query(
                    collection(db, 'users', targetId, 'badges'),
                    orderBy('earnedAt', 'desc'),
                    limit(20)
                );
                const badgesSnap = await getDocs(badgesQuery);
                if (isMountedRef.current) {
                    setBadges(badgesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            } catch (err) {
                console.error('Error fetching badges:', err);
            }
        };
        fetchBadges();
    }, [user, targetId]);

    // Check follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser || !targetId || currentUser.uid === targetId) {
                return;
            }

            try {
                const q = query(
                    collection(db, 'follows'),
                    where('followerId', '==', currentUser.uid),
                    where('followingId', '==', targetId)
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
            }
        };

        checkFollowStatus();
    }, [targetId, currentUser?.uid]);

    const handleFollow = async () => {
        if (!currentUser || followLoading) return;

        setFollowLoading(true);
        try {
            if (isFollowing && followDocId) {
                await deleteDoc(doc(db, 'follows', followDocId));
                setIsFollowing(false);
                setFollowDocId(null);
            } else {
                const docRef = await addDoc(collection(db, 'follows'), {
                    followerId: currentUser.uid,
                    followerName: currentUser.displayName || 'Anonymous',
                    followingId: targetId,
                    followingName: user.displayName || 'User',
                    createdAt: serverTimestamp()
                });
                setIsFollowing(true);
                setFollowDocId(docRef.id);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            alert('Failed to update follow status');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleBlock = async () => {
        if (!currentUser || !targetId) return;
        if (window.confirm(`Are you sure you want to block ${user.displayName}?`)) {
            try {
                await blockUser(targetId);
                navigate('/');
            } catch (error) {
                console.error('Error blocking user:', error);
                alert('Failed to block user');
            }
        }
    };

    if (loading) return <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading...</div>;

    if (!user) {
        return (
            <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', gap: '1rem' }}>
                <SEO title="User Not Found" />
                <h2>User not found</h2>
                <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>Go Home</button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.uid === user.id;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            <SEO
                title={user.displayName || 'Profile'}
                description={user.bio || `Check out ${user.displayName}'s profile on Panospace.`}
                type="profile"
            />
            {/* Header with Space Theme */}
            <div style={{
                background: '#000',
                padding: '1.5rem 2rem',
                borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Stars Background */}
                <StarBackground starColor={user.profileTheme?.starColor || '#7FFFD4'} />

                {/* Content Layer */}
                <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    alignItems: 'center',
                    gap: '1.5rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Profile Image + Username - Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid rgba(127, 255, 212, 0.3)', flexShrink: 0 }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#888' }}>{user.displayName?.[0]?.toUpperCase() || '?'}</div>
                            )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem', margin: 0, fontFamily: 'var(--font-family-heading)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user.displayName}</h1>
                            <p style={{ color: '#ccc', margin: 0, fontSize: '0.9rem' }}>{user.bio || 'No bio yet.'}</p>

                            {/* Badge Showcase Row */}
                            {badges.filter(b => b.showcased).length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    {badges.filter(b => b.showcased).slice(0, 5).map(badge => (
                                        <div key={badge.id} title={badge.title} style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: `2px solid ${badge.borderColor || '#7FFFD4'}`,
                                            flexShrink: 0
                                        }}>
                                            <img src={badge.imageUrl} alt={badge.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isOwnProfile && (
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            background: 'var(--ice-mint)',
                                            border: 'none',
                                            borderRadius: '20px',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            cursor: followLoading ? 'not-allowed' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            opacity: followLoading ? 0.6 : 1,
                                            fontFamily: 'var(--font-family-heading)',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {isFollowing ? <><FaCheck /> Following</> : <><FaUserPlus /> Follow</>}
                                    </button>

                                    <button
                                        onClick={() => setShowCommissionModal(true)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            background: '#7FFFD4',
                                            border: 'none',
                                            borderRadius: '20px',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontFamily: 'var(--font-family-heading)',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        Request Commission
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spacer - Middle */}
                    <div></div>

                    {/* Settings + Business Card - Right */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifySelf: 'end' }}>
                        {isOwnProfile ? (
                            <>
                                <WalletDisplay userId={currentUser.uid} />
                                <button
                                    onClick={() => navigate('/edit-profile')}
                                    className="floating-nav-button"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        color: '#fff'
                                    }}
                                >
                                    <FaCog size={18} />
                                </button>
                                <button
                                    onClick={() => setShowBusinessCard(true)}
                                    className="floating-nav-button"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        color: '#fff'
                                    }}
                                >
                                    <FaIdBadge size={18} />
                                </button>
                            </>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="floating-nav-button"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        position: 'relative'
                                    }}
                                >
                                    <FaEllipsisV size={16} />
                                </button>
                                {showMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '0.5rem',
                                        background: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        zIndex: 1000,
                                        minWidth: '150px'
                                    }}>
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                setShowReportModal(true);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <FaFlag /> Report
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                handleBlock();
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <FaBan /> Block
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #222', marginBottom: '2rem', overflowX: 'auto' }}>
                <div style={{
                    display: 'flex',
                    minWidth: 'max-content',
                    paddingLeft: 'max(1.5rem, env(safe-area-inset-left))', // Moved right to avoid island
                    paddingRight: 'max(1rem, env(safe-area-inset-right))'
                }}>
                    {[
                        { id: 'posts', label: 'Posts', icon: FaTh },
                        { id: 'shop', label: 'Shop', icon: FaShoppingBag },
                        { id: 'collections', label: 'Collections', icon: FaLayerGroup },
                        { id: 'cards', label: 'Cards', icon: FaRocket },
                        { id: 'badges', label: 'Badges', icon: FaCheck }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: '0 0 auto',
                                    padding: '1rem 1.5rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: activeTab === tab.id ? '#7FFFD4' : '#666',
                                    borderBottom: activeTab === tab.id ? '2px solid #7FFFD4' : 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: activeTab === tab.id ? '700' : '500',
                                    fontFamily: 'var(--font-family-heading)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                {activeTab === 'posts' && (
                    <InfiniteGrid
                        items={posts}
                        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                        gap="1rem"
                        renderItem={(post, index) => (
                            <div
                                onClick={() => navigate(`/post/${post.id}`, {
                                    state: {
                                        contextPosts: posts,
                                        initialIndex: index
                                    }
                                })}
                                style={{
                                    aspectRatio: '1',
                                    background: '#111',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                {post.images?.[0]?.url || post.imageUrl ? (
                                    <img
                                        src={post.images?.[0]?.url || post.imageUrl}
                                        alt=""
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
                        )}
                    />
                )}

                {activeTab === 'shop' && (
                    <InfiniteGrid
                        items={shopItems}
                        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                        gap="1rem"
                        renderItem={(item) => {
                            const prices = item.printSizes?.map(s => Number(s.price)) || [];
                            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                            return (
                                <div
                                    onClick={() => navigate(`/shop/${item.id}`)}
                                    style={{
                                        aspectRatio: '1',
                                        background: '#111',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        opacity: item.available ? 1 : 0.7
                                    }}
                                >
                                    <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '0.5rem',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>{minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'View'}</span>
                                        {!item.available && <span style={{ color: '#aaa', fontStyle: 'italic' }}>Draft</span>}
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}

                {activeTab === 'collections' && (
                    <>
                        {isOwnProfile && (
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
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaPlus /> Create Collection
                                </button>
                            </div>
                        )}
                        <InfiniteGrid
                            items={collections}
                            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                            gap="1rem"
                            renderItem={(collection) => (
                                <div
                                    onClick={() => navigate(`/collection/${collection.id}`)}
                                    style={{
                                        aspectRatio: '1',
                                        background: '#111',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {collection.coverImage ? (
                                        <img src={collection.coverImage} alt={collection.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '2rem' }}>
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
                                        color: '#fff'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{collection.title}</div>
                                        <div style={{ color: '#888', fontSize: '0.75rem' }}>{collection.postRefs?.length || 0} posts</div>
                                    </div>
                                </div>
                            )}
                        />
                    </>
                )}

                {activeTab === 'cards' && (
                    <>
                        {isOwnProfile && (
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowCreateCardModal(true)}
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
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaPlus /> Create Card
                                </button>
                            </div>
                        )}
                        <InfiniteGrid
                            items={spaceCards}
                            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                            gap="1rem"
                            renderItem={(card) => {
                                const isHighRarity = card.rarity === 'Legendary' || card.rarity === 'Mythic' || card.rarity === 'Epic';
                                return (
                                    <div style={{
                                        position: 'relative',
                                        aspectRatio: '2/3',
                                        borderRadius: '12px',
                                        overflow: 'visible'
                                    }}>
                                        {/* Iridescent border for high rarity cards */}
                                        {isHighRarity && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: '-3px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                                                backgroundSize: '300% 300%',
                                                animation: 'iridescent-border 6s ease infinite',
                                                zIndex: 0
                                            }} />
                                        )}

                                        {/* Card content */}
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            background: '#000',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: isHighRarity ? 'none' : '2px solid #7FFFD4',
                                            boxShadow: isHighRarity
                                                ? '0 0 30px rgba(224, 179, 255, 0.4), 0 8px 32px rgba(0,0,0,0.5)'
                                                : '0 0 20px rgba(127, 255, 212, 0.3), 0 8px 24px rgba(0,0,0,0.4)',
                                            zIndex: 1
                                        }}>
                                            {(card.images?.front || card.imageUrl) && (
                                                <img
                                                    src={card.images?.front || card.imageUrl}
                                                    alt={card.title || card.name}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}

                                            {/* Card title overlay */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                                padding: '1.5rem 0.75rem 0.75rem',
                                                color: '#fff'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {card.title || card.name}
                                                </div>
                                                {card.rarity && (
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: isHighRarity ? '#e0b3ff' : '#7FFFD4',
                                                        fontWeight: '500'
                                                    }}>
                                                        {card.rarity}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </>
                )}

                {activeTab === 'badges' && (
                    <InfiniteGrid
                        items={badges}
                        columns={{ mobile: 3, tablet: 4, desktop: 6 }}
                        gap="1rem"
                        renderItem={(badge) => (
                            <div style={{
                                aspectRatio: '1',
                                background: '#111',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: `3px solid ${badge.borderColor || '#7FFFD4'}`,
                                position: 'relative'
                            }}>
                                <img src={badge.imageUrl} alt={badge.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    />
                )}

                {/* Empty States */}
                {activeTab === 'posts' && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No posts yet.</div>
                )}
                {activeTab === 'shop' && shopItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No items for sale.</div>
                )}
                {activeTab === 'collections' && collections.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        {isOwnProfile ? 'No collections yet. Create your first collection!' : 'No collections yet.'}
                    </div>
                )}
                {activeTab === 'cards' && spaceCards.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No space cards yet.</div>
                )}
                {activeTab === 'badges' && badges.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No badges earned yet.</div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    contentType="user"
                    contentId={targetId}
                />
            )}

            {showCreateCardModal && (
                <CreateCardModal
                    onClose={() => setShowCreateCardModal(false)}
                    onCreated={(newCard) => {
                        setSpaceCards(prev => [newCard, ...prev]);
                        setShowCreateCardModal(false);
                    }}
                />
            )}

            {showBusinessCard && (
                <BusinessCardModal
                    isOpen={showBusinessCard}
                    onClose={() => setShowBusinessCard(false)}
                    user={user}
                />
            )}

            {showCommissionModal && (
                <CommissionModal
                    editorId={targetId}
                    editorName={user.displayName}
                    onClose={() => setShowCommissionModal(false)}
                    onSuccess={() => {
                        setShowCommissionModal(false);
                        alert('Commission request submitted successfully!');
                    }}
                />
            )}

            <CreateMuseumModal
                isOpen={showCreateMuseumModal}
                onClose={() => setShowCreateMuseumModal(false)}
                onSuccess={(newMuseum) => {
                    window.location.reload();
                }}
            />

            {/* Twinkle Animation CSS */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
                
                @keyframes iridescent-border {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 50% 100%; }
                    50% { background-position: 100% 50%; }
                    75% { background-position: 50% 0%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
