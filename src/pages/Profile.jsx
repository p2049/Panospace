import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, addDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useBlock } from '../hooks/useBlock';
import { useCollections } from '../hooks/useCollections';
import { useProfile } from '../hooks/useProfile';
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
import { getUnreadCount } from '../services/notificationService';
import { FaPlus, FaLayerGroup, FaTh, FaShoppingBag, FaRocket, FaCheck, FaCog, FaIdBadge, FaEllipsisV, FaFlag, FaBan, FaUserPlus, FaImage, FaWallet } from 'react-icons/fa';
import { getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { isFeatureEnabled } from '../config/featureFlags';


const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { blockUser } = useBlock();
    const [showCreateMuseumModal, setShowCreateMuseumModal] = useState(false);

    const targetId = (id === 'me' || !id) ? currentUser?.uid : id;

    const [activeTab, setActiveTab] = useState('posts');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBusinessCard, setShowBusinessCard] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [orders, setOrders] = useState([]);
    const { collections, loading: collectionsLoading } = useCollections(targetId);

    // Use the new useProfile hook
    const {
        user,
        posts,
        shopItems,
        spaceCards,
        badges,
        loading,
        isFollowing,
        followDocId,
        setIsFollowing,
        setFollowDocId
    } = useProfile(targetId, currentUser, activeTab);

    // Fetch orders for Gallery tab
    React.useEffect(() => {
        const fetchOrders = async () => {
            if (activeTab === 'gallery' && targetId) {
                try {
                    // 🔒 SAFETY: Limit to 30 most recent orders
                    // WHY: User with 1000 orders = 1000 reads every profile view
                    // With limit(30): Only 30 reads, can add "Load More" if needed
                    const q = query(
                        collection(db, 'orders'),
                        where('userId', '==', targetId),
                        orderBy('createdAt', 'desc'),
                        limit(30)
                    );
                    const snapshot = await getDocs(q);
                    setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };
        fetchOrders();
    }, [activeTab, targetId]);

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

    // Fetch unread notification count
    React.useEffect(() => {
        const loadUnreadCount = async () => {
            if (currentUser && targetId === currentUser.uid) {
                try {
                    const count = await getUnreadCount(currentUser.uid);
                    setUnreadNotifications(count);
                } catch (err) {
                    console.error('Error loading unread count:', err);
                }
            }
        };

        loadUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [currentUser, targetId]);

    if (loading) return <div className="ps-loading">Loading...</div>;

    if (!user) {
        return (
            <div className="ps-loading-column">
                <SEO title="User Not Found" />
                <h2>User not found</h2>
                <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>Go Home</button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.uid === user.id;

    return (
        <div className="ps-page">
            <SEO
                title={user.displayName || 'Profile'}
                description={user.bio || `Check out ${user.displayName}'s profile on Panospace.`}
                type="profile"
            />
            {/* Header with Space Theme */}
            <div style={{
                background: '#000',
                paddingTop: window.innerWidth < 768 ? 'max(0.75rem, env(safe-area-inset-top))' : '1.5rem',
                paddingBottom: window.innerWidth < 768 ? '0.75rem' : '1.5rem',
                paddingLeft: window.innerWidth < 768 ? 'max(1rem, env(safe-area-inset-left))' : '2rem',
                paddingRight: window.innerWidth < 768 ? 'max(1rem, env(safe-area-inset-right))' : '2rem',
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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Profile Image + Username */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '1rem' : '1.5rem' }}>
                        <div style={{ position: 'relative', width: window.innerWidth < 768 ? '60px' : '80px', height: window.innerWidth < 768 ? '60px' : '80px', borderRadius: '50%', background: '#333', overflow: 'visible', flexShrink: 0 }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(127, 255, 212, 0.3)' }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#888' }}>{user.displayName?.[0]?.toUpperCase() || '?'}</div>
                                )}
                            </div>
                            {/* Notification Badge - Top Right */}
                            {isOwnProfile && unreadNotifications > 0 && (
                                <div
                                    onClick={() => navigate('/notifications')}
                                    style={{
                                        position: 'absolute',
                                        top: '0px',
                                        right: '0px',
                                        width: '18px',
                                        height: '18px',
                                        background: '#00ff00',
                                        borderRadius: '50%',
                                        border: '2px solid #000',
                                        boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                            )}
                        </div>

                        <div style={{ minWidth: 0, flex: 1, paddingRight: window.innerWidth < 768 ? '3.5rem' : '0' }}>
                            <h1 style={{ fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem', fontWeight: '700', marginBottom: '0.25rem', margin: 0, fontFamily: 'var(--font-family-heading)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user.displayName}</h1>
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
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

                    {/* Action buttons - Fixed position in top right on mobile, below hamburger */}
                    {isOwnProfile && window.innerWidth < 768 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            zIndex: 10,
                            flexDirection: 'column'
                        }}>
                            {/* Compact Wallet Icon Button */}
                            <button
                                onClick={() => setShowAddFunds(true)}
                                className="floating-nav-button"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: '#7FFFD4'
                                }}
                                title="Wallet"
                            >
                                <FaWallet size={18} />
                            </button>

                            {/* Business Card Button */}
                            <button
                                onClick={() => setShowBusinessCard(true)}
                                className="floating-nav-button"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: '#fff'
                                }}
                            >
                                <FaIdBadge size={18} />
                            </button>
                        </div>
                    )}

                    {!isOwnProfile && window.innerWidth < 768 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 10
                        }}>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="floating-nav-button"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        padding: 0,
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
                                        background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(15,15,15,0.98))',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(127, 255, 212, 0.15)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        zIndex: 1000,
                                        minWidth: '150px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(127, 255, 212, 0.05)'
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
                        </div>
                    )}

                    {/* Desktop: Action buttons on the right */}
                    {isOwnProfile && window.innerWidth >= 768 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}>
                            <WalletDisplay userId={currentUser.uid} />

                            <button
                                onClick={() => navigate('/edit-profile')}
                                className="floating-nav-button"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
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
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: '#fff'
                                }}
                            >
                                <FaIdBadge size={18} />
                            </button>
                        </div>
                    )}

                    {!isOwnProfile && window.innerWidth >= 768 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0
                        }}>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="floating-nav-button"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        padding: 0,
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
                                        background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(15,15,15,0.98))',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(127, 255, 212, 0.15)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        zIndex: 1000,
                                        minWidth: '150px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(127, 255, 212, 0.05)'
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
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #222', marginBottom: window.innerWidth < 768 ? '0.75rem' : '2rem', overflowX: 'auto' }}>
                <div style={{
                    display: 'flex',
                    minWidth: 'max-content',
                    paddingLeft: window.innerWidth < 768 ? '1rem' : 'max(1.5rem, env(safe-area-inset-left))',
                    paddingRight: window.innerWidth < 768 ? '1rem' : 'max(1rem, env(safe-area-inset-right))'
                }}>
                    {[
                        { id: 'posts', label: 'Posts', icon: FaTh, enabled: true },
                        { id: 'shop', label: 'Shop', icon: FaShoppingBag, enabled: isFeatureEnabled('SHOP') },
                        { id: 'collections', label: 'Collections', icon: FaLayerGroup, enabled: isFeatureEnabled('COLLECTIONS') },
                        { id: 'gallery', label: 'Gallery', icon: FaImage, enabled: isFeatureEnabled('GALLERIES') },
                        { id: 'cards', label: 'Cards', icon: FaRocket, enabled: isFeatureEnabled('SPACECARDS_CREATE') },
                        { id: 'badges', label: 'Badges', icon: FaCheck, enabled: true }
                    ].filter(tab => tab.enabled).map(tab => {
                        const Icon = tab.icon;
                        const isMobile = window.innerWidth < 768;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: '0 0 auto',
                                    padding: isMobile ? '0.5rem 0.75rem' : '1rem 1.5rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: activeTab === tab.id ? '#7FFFD4' : '#666',
                                    borderBottom: activeTab === tab.id ? '2px solid #7FFFD4' : 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                                    fontWeight: activeTab === tab.id ? '700' : '500',
                                    fontFamily: 'var(--font-family-heading)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}
                            >
                                <Icon size={isMobile ? 13 : 16} /> {tab.label}
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

                {activeTab === 'gallery' && (
                    <>
                        {/* Purchased Prints Section */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaShoppingBag style={{ color: '#7FFFD4' }} />
                                Purchased Prints
                            </h3>
                            {orders.length > 0 ? (
                                <InfiniteGrid
                                    items={orders}
                                    columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                                    gap="1rem"
                                    renderItem={(order) => (
                                        <div style={{
                                            background: '#111',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid #333'
                                        }}>
                                            <div style={{ aspectRatio: '1', background: '#222', position: 'relative' }}>
                                                <img src={order.items?.[0]?.imageUrl} alt="Print" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ padding: '0.75rem' }}>
                                                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Order #{order.id.slice(0, 8)}</div>
                                                <div style={{ color: '#888', fontSize: '0.8rem' }}>{new Date(order.createdAt?.toDate()).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    )}
                                />
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#111', borderRadius: '8px' }}>
                                    No purchased prints yet.
                                </div>
                            )}
                        </div>

                        {/* Owned Cards Section */}
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaRocket style={{ color: '#e0b3ff' }} />
                                Marketplace Cards
                            </h3>
                            {spaceCards.length > 0 ? (
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
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#111', borderRadius: '8px' }}>
                                    No marketplace cards owned.
                                </div>
                            )}
                        </div>
                    </>
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
                
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
                    }
                    50% {
                        box-shadow: 0 0 16px rgba(0, 255, 0, 1);
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
