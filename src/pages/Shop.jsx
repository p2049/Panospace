import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FaShoppingBag, FaTag } from 'react-icons/fa';
import SmartImage from '../components/SmartImage';

// Helper to sanitize and validate shop items from Firestore
const sanitizeShopItem = (raw) => {
    if (!raw || typeof raw !== 'object') return null;

    // 1. Must be available/active
    if (raw.available !== true) return null;

    // 2. Must have valid image
    if (!raw.imageUrl || typeof raw.imageUrl !== 'string') return null;

    // 3. Sanitize print sizes
    let validSizes = [];
    if (Array.isArray(raw.printSizes)) {
        validSizes = raw.printSizes.map(size => {
            if (!size || typeof size !== 'object') return null;
            const price = Number(size.price);
            if (!Number.isFinite(price) || price <= 0) return null;
            return {
                ...size,
                price: price, // Ensure numeric
                label: size.label || 'Print',
                id: size.id || 'unknown'
            };
        }).filter(Boolean);
    }

    // 4. Must have at least one valid size (or we can't sell it)
    // The prompt says "Skip any Firestore doc that is missing... valid printSizes"
    // However, to be safe and show "View Details" for broken items if desired, we could keep them.
    // But prompt explicitly says "Skip...". So we filter if no valid sizes.
    if (validSizes.length === 0) return null;

    // 5. Compute safe minPrice
    const prices = validSizes.map(s => s.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    return {
        id: raw.id,
        title: raw.title || 'Untitled',
        imageUrl: raw.imageUrl,
        printSizes: validSizes,
        minPrice: minPrice,
        available: true
    };
};

const Shop = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopItems = async () => {
            try {
                const q = query(
                    collection(db, 'shopItems'),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const fetchedItems = querySnapshot.docs
                    .map(doc => sanitizeShopItem({ id: doc.id, ...doc.data() }))
                    .filter(Boolean); // Filter out nulls (drafts, broken items)

                setItems(fetchedItems);
            } catch (err) {
                console.error("Error fetching shop items:", err);
                // Graceful error handling - don't crash, just show empty or error state
                setError("Failed to load shop items.");
            } finally {
                setLoading(false);
            }
        };

        fetchShopItems();
    }, []);

    if (loading) {
        return (
            <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner" style={{ width: '30px', height: '30px', border: '2px solid #333', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#ff6b6b' }}>Unable to load shop</h2>
                <p style={{ color: '#aaa', maxWidth: '400px', marginBottom: '1.5rem' }}>{error}</p>
                <button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.2rem', background: '#333', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '2rem', borderBottom: '1px solid #222', position: 'sticky', top: 0, background: '#000', zIndex: 10 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaShoppingBag /> Shop
                </h1>
            </div>

            {/* Grid */}
            <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        <FaTag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No items available in the shop yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '2px' }}>
                        {items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/shop/${item.id}`)}
                                style={{
                                    background: '#111',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    border: '1px solid #0a0a0a'
                                }}
                            >
                                {/* Fixed height container with 1:1 aspect ratio */}
                                <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: '#000' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <SmartImage
                                            src={item.imageUrl}
                                            alt={item.title}
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                        />
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                                        padding: '1rem 0.5rem 0.5rem',
                                        color: '#fff',
                                        zIndex: 2
                                    }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#7FFFD4', marginTop: '0.2rem' }}>
                                            {item.minPrice !== null ? `From $${item.minPrice.toFixed(2)}` : 'View Details'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
