import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaShoppingBag, FaTag } from 'react-icons/fa';
import SmartImage from '@/components/SmartImage';
import ShopItemCard from '@/components/ui/cards/ShopItemCard';
import { PageSkeleton } from '@/components/ui/Skeleton';

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
        return <PageSkeleton />;
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
            <div className="container-md-1rem">
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        <FaTag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No items available in the shop yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '2px' }}>
                        {items.map(item => (
                            <ShopItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
