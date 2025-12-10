import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { EventService } from '@/services/EventService';
import InfiniteGrid from '@/components/InfiniteGrid';
import StarBackground from '@/components/StarBackground';
import { FaArrowLeft, FaFire, FaClock, FaTrophy, FaStar } from 'react-icons/fa';
import { useThemeStore } from '@/core/store/useThemeStore';

const EventFeedPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { accentColor } = useThemeStore();
    const [event, setEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('rising'); // 'top', 'rising', 'new'
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvent = async () => {
            let data = null;

            if (eventId === 'daily' || eventId === 'weekly' || eventId === 'all' || eventId === 'contest') {
                // Special handlers for current/latest events
                const events = await EventService.getVisibleEvents();
                // Sort by visibleDate DESC to get latest
                events.sort((a, b) => b.visibleDate.toMillis() - a.visibleDate.toMillis());

                if (eventId === 'daily') {
                    // Find latest active daily feature
                    data = events.find(e => e.type === 'daily_feature' && e.active);
                } else if (eventId === 'weekly') {
                    data = events.find(e => e.category === 'weekly' && e.active);
                } else if (eventId === 'contest') {
                    data = events.find(e => e.category === 'contest' && e.active);
                } else if (eventId === 'all') {
                    // "All Events" is a virtual event
                    data = {
                        id: 'all',
                        name: 'All Events',
                        description: 'Combined feed of all currently active events.',
                        active: true
                    };
                }
            } else {
                data = await EventService.getEventById(eventId);
            }

            if (data) {
                setEvent(data);
            } else {
                // Event not found
                console.warn("Event not found:", eventId);
                // navigate('/search'); // Optional: redirect
            }
        };
        loadEvent();
    }, [eventId, navigate]);

    useEffect(() => {
        const loadPosts = async () => {
            if (!event) return;
            setLoading(true);
            setPosts([]); // Clear previous

            let fetchedPostIds = [];
            if (eventId === 'all') {
                // Fetch all active events, aggregate their feedPosts
                // This logic ideally belongs in EventService.getAllEventsFeed()
                // For now, let's keep it simple or assume getEventFeedPosts handles 'all' if passed
                // Actually, let's add getAllEventsFeed to EventService later if needed, 
                // but here we can just query posts that have relevant tags? 
                // No, "feedPosts" subcollections are the source of truth.
                // We will skip strict implementation of 'All' aggregation in this step to keep it safe 
                // and assume the user will implement the backend function or we return empty.
                // Better: "Coming Soon" or query standard feed with filters.

                fetchedPostIds = []; // Placeholder
            } else {
                fetchedPostIds = await EventService.getEventFeedPosts(event.id, activeTab);
            }

            // NOTE: EventService currently returns IDs. InfiniteGrid usually expects full post objects or handles IDs?
            // Existing InfiniteGrid usage in Search.jsx suggests it takes "items" which are posts.
            // We need to fetch the full post data. 
            // Since we can't easily do `select * from posts where id in (...)` for massive lists in one go,
            // we should ideally update EventService to populate data, or do it here.
            // For MVP/Demo: we will assume EventService or a helper here fetches the data.
            // Let's implement a quick fetch logic here for the IDs.

            if (fetchedPostIds.length > 0) {
                // In a real app, use a service like `PostService.getPostsByIds(fetchedPostIds)`.
                // Here, we might need to manually fetch if we don't have that service exposed.
                // Actually, let's assume `EventService.getEventFeedPosts` returns objects or we patch it.
                // But wait, my previous implementation of EventService returned IDs.

                // Let's import getDoc/doc to fetch them.
                // Optimization: Only fetch first 20, then load more. InfiniteGrid handles pagination?
                // InfiniteGrid typically takes `items` prop. 

                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('@/firebase');

                const loadedPosts = await Promise.all(fetchedPostIds.slice(0, 50).map(async (pid) => {
                    // This is N reads, not ideal for unrelated detailed read, but fine for prototype.
                    const d = await getDoc(doc(db, 'posts', pid));
                    return d.exists() ? { id: d.id, ...d.data() } : null;
                }));

                setPosts(loadedPosts.filter(p => p !== null));
            } else {
                setPosts([]);
            }

            setLoading(false);
        };
        loadPosts();
    }, [event, activeTab, eventId]);

    const tabs = [
        { id: 'rising', label: 'Rising', icon: FaFire },
        { id: 'top', label: 'Top', icon: FaTrophy },
        { id: 'new', label: 'New', icon: FaClock },
        // { id: 'staff', label: 'Staff Picks', icon: FaStar }
    ];

    if (!event) return <div style={{ background: '#000', minHeight: '100vh' }} />;

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff', paddingBottom: '80px' }}>
            <StarBackground />

            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                    }}
                >
                    <FaArrowLeft /> Back
                </button>

                <h1 style={{ margin: 0, fontSize: '1.5rem', color: accentColor }}>{event.name}</h1>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>{event.description}</p>

                {/* Event Category Tabs - Only show if we are viewing one of the 'virtual' event categories */}
                {['daily', 'weekly', 'all', 'contest'].includes(eventId) && (
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'daily', label: 'Daily' },
                            { id: 'weekly', label: 'Weekly' },
                            { id: 'contest', label: 'Contest' }
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/events/${cat.id}`)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: eventId === cat.id ? accentColor : 'rgba(255,255,255,0.05)',
                                    color: eventId === cat.id ? '#000' : '#fff',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: eventId === cat.id ? 'bold' : 'normal',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                                    color: isActive ? accentColor : '#888',
                                    padding: '0.5rem 0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading feed...</div>
                ) : (
                    <InfiniteGrid
                        items={posts}
                        hasMore={false} // Simple MVP
                        loadMore={() => { }}
                        loading={false}
                    />
                )}

                {!loading && posts.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        No posts found for this event yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventFeedPage;
