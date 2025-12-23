import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import PageHeader from '@/components/PageHeader';
import { FaChevronLeft, FaPenFancy, FaCamera } from 'react-icons/fa';
import Post from '@/components/Post';
import ListViewContainer from '@/components/feed/ListViewContainer';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { logger } from '@/core/utils/logger';

const SignalGallery = () => {
    const { signatureTag } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResponseOptions, setShowResponseOptions] = useState(false);

    useEffect(() => {
        const fetchSignalData = async () => {
            const decodedTag = decodeURIComponent(signatureTag);
            setLoading(true);
            try {
                logger.log('[SignalGallery] Fetching posts for tag:', decodedTag);
                const postsRef = collection(db, 'posts');
                // Fetch all posts containing the signature tag
                const q = query(
                    postsRef,
                    where('tags', 'array-contains', decodedTag)
                );

                const snapshot = await getDocs(q);
                let fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Client-side sort to bypass missing composite index requirement
                fetchedPosts.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeA - timeB;
                });

                // Identify parent signal (tagged with #Signal)
                const parent = fetchedPosts.find(p => p.tags?.includes('Signal') || p.tags?.includes('#Signal'));
                const responses = fetchedPosts.filter(p => !p.tags?.includes('Signal') && !p.tags?.includes('#Signal'));

                // Put parent at top
                if (parent) {
                    setPosts([parent, ...responses]);
                } else {
                    setPosts(fetchedPosts);
                }
            } catch (err) {
                logger.error('[PromptGallery] Error fetching prompt data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (signatureTag) {
            fetchSignalData();
        }
    }, [signatureTag]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            color: '#fff',
            position: 'relative',
            overflowX: 'hidden',
            fontFamily: '"Rajdhani", sans-serif'
        }}>
            {/* --- ATMOSPHERIC OVERLAYS --- */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'radial-gradient(circle at 50% -20%, #1a3a3a 0%, transparent 70%)',
                opacity: 0.4,
                pointerEvents: 'none',
                zIndex: 0
            }} />
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 4px, 3px 100%',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: 0.3
            }} />

            <style>{`
                .signal-header-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: "Rajdhani", sans-serif;
                    position: relative;
                    left: 30px;
                }
                @media (max-width: 768px) {
                    .signal-header-title {
                        top: 10px;
                    }
                    /* Prevent clipping when moving title down */
                    .page-header-title {
                        overflow: visible !important;
                    }
                }
            `}</style>

            <PageHeader
                style={{ background: '#050505', borderBottom: '1px solid #333', paddingBottom: '28px' }}
                contentStyle={{ pointerEvents: 'auto' }}
                title={
                    <div className="signal-header-title">
                        <span style={{ fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>PANOSPACE</span>
                        <span style={{ fontWeight: '400', letterSpacing: '2px', color: '#7FFFD4', fontSize: '0.9em' }}>SIGNALS</span>
                    </div>
                }
                leftAction={
                    <button onClick={() => navigate(-1)} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        left: '1rem',
                        top: 'max(0.75rem, env(safe-area-inset-top))',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        padding: 0,
                        zIndex: 20
                    }}>
                        <FaChevronLeft size={12} />
                    </button>
                }
                rightAction={
                    posts.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            right: '3.5rem', // Moved left as requested
                            top: 'calc(max(0.75rem, env(safe-area-inset-top)) + 10px)',
                            zIndex: 20
                        }}>
                            {!showResponseOptions ? (
                                <button
                                    onClick={() => {
                                        // Default to generic signal response logic for now
                                        navigate('/create', {
                                            state: {
                                                parentSignalTag: decodeURIComponent(signatureTag),
                                                initialPostType: 'text'
                                            }
                                        });
                                    }}
                                    style={{
                                        background: '#7FFFD4',
                                        border: 'none',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        color: '#000',
                                        fontWeight: '800',
                                        fontSize: '0.6rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        letterSpacing: '2px'
                                    }}
                                >
                                    <FaPenFancy size={10} />
                                    JOIN SIGNAL
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Options... */}
                                </div>
                            )}
                        </div>
                    )
                }
            />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 100px 20px', position: 'relative', zIndex: 10 }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#7FFFD4', letterSpacing: '2px', fontWeight: '800' }}>
                        INITIALIZING_THREAD...
                    </div>
                ) : error ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#ff6666' }}>
                        <h3 style={{ fontSize: '1.5rem' }}>SYNC_ERROR</h3>
                        <p style={{ opacity: 0.6 }}>{error}</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                        <h3 style={{ color: '#fff' }}>THREAD_UNAVAILABLE</h3>
                        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', background: '#7FFFD4', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}>RETURN_TO_BASE</button>
                    </div>
                ) : (
                    <div>
                        {/* --- THE PROMPT ANCHOR --- */}
                        <div style={{ position: 'relative' }}>
                            {/* Connection Needle */}
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: '-80px',
                                width: '2px',
                                height: '80px',
                                background: 'linear-gradient(to bottom, #7FFFD4, transparent)',
                                boxShadow: '0 0 15px #7FFFD4',
                                transform: 'translateX(-50%)'
                            }} />

                            <div style={{
                                position: 'relative',
                                background: 'rgba(10, 15, 15, 0.8)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(127, 255, 212, 0.15)',
                                padding: 'clamp(20px, 5vw, 40px)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(127, 255, 212, 0.03)',
                                overflow: 'visible'
                            }}>
                                {/* Cyber Decor */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '1px', background: '#7FFFD4' }} />
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '40px', background: '#7FFFD4' }} />
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '1px', background: '#7FFFD4' }} />
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '1px', height: '40px', background: '#7FFFD4' }} />

                                <div style={{
                                    fontSize: '0.65rem',
                                    color: '#7FFFD4',
                                    fontWeight: '900',
                                    letterSpacing: '4px',
                                    marginBottom: '20px',
                                    opacity: 0.8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7FFFD4', boxShadow: '0 0 10px #7FFFD4' }} />
                                    {posts[0]?.tags?.some(t => t.includes('Contest')) ? 'ORIGINAL_CONTEST' :
                                        posts[0]?.tags?.some(t => t.includes('Event')) ? 'ORIGINAL_EVENT' : 'ORIGINAL_SIGNAL'}
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <Post post={posts[0]} priority="high" isNested={true} />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '20px'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'monospace' }}>
                                        TAG_REF: <span style={{ color: '#7FFFD4' }}>{decodeURIComponent(signatureTag)}</span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.6rem',
                                        color: '#7FFFD4',
                                        padding: '4px 10px',
                                        border: '1px solid #7FFFD4',
                                        borderRadius: '2px',
                                        fontWeight: '800'
                                    }}>
                                        STATUS: ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- RESPONSES FEED --- */}
                        <div style={{ marginTop: '80px' }}>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '40px'
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '8px 24px',
                                    background: 'rgba(127, 255, 212, 0.05)',
                                    border: '1px solid rgba(127, 255, 212, 0.1)',
                                    borderRadius: '50px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    letterSpacing: '2px',
                                    color: '#7FFFD4'
                                }}>
                                    {posts.length - 1} {posts.length - 1 === 1 ? 'RESPONSE' : 'RESPONSES'}
                                </div>
                            </div>

                            {posts.length > 1 ? (
                                <ListViewContainer
                                    posts={posts.slice(1)}
                                    style={{ height: 'auto', overflow: 'visible', background: 'transparent', paddingTop: 0, paddingBottom: 0 }}
                                />
                            ) : (
                                <div style={{
                                    padding: '60px',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    color: '#444',
                                    fontWeight: '700',
                                    letterSpacing: '1px'
                                }}>
                                    NO_RESPONSES_DETECTED
                                    <p style={{ fontSize: '0.7rem', marginTop: '10px', opacity: 0.5 }}>Syncing for first interaction...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default SignalGallery;
