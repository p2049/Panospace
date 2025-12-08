import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getParkById } from '@/core/constants/parksData';
import { useParks } from '@/hooks/useParks';
import { FaArrowLeft, FaMapMarkerAlt, FaMountain, FaTree, FaImage } from 'react-icons/fa';
import { SkeletonGrid } from '@/components/ui/Skeleton';

const ParkGallery = () => {
    const { parkId } = useParams();
    const navigate = useNavigate();
    const { getParkPosts, loading } = useParks();

    const [posts, setPosts] = useState([]);
    const park = getParkById(parkId);

    useEffect(() => {
        const fetchPosts = async () => {
            if (parkId) {
                const parkPosts = await getParkPosts(parkId);
                setPosts(parkPosts);
            }
        };
        fetchPosts();
    }, [parkId, getParkPosts]);

    if (!park) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Park Not Found</h1>
                    <button
                        onClick={() => navigate('/parks')}
                        style={{
                            background: '#7FFFD4',
                            color: '#000',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Parks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '2rem',
                borderBottom: '1px solid #333',
                background: '#000',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate('/parks')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        padding: 0
                    }}
                >
                    <FaArrowLeft /> Back to Parks
                </button>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '16px',
                        background: 'rgba(127, 255, 212, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {park.parkType === 'national' ? (
                            <FaMountain style={{ color: '#7FFFD4', fontSize: '2.5rem' }} />
                        ) : (
                            <FaTree style={{ color: '#7FFFD4', fontSize: '2.5rem' }} />
                        )}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                            {park.parkName}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#888' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMapMarkerAlt size={14} />
                                <span>{park.state}</span>
                            </div>
                            <div style={{
                                padding: '0.25rem 0.75rem',
                                background: park.parkType === 'national' ? 'rgba(127, 255, 212, 0.1)' : 'rgba(100, 200, 255, 0.1)',
                                border: `1px solid ${park.parkType === 'national' ? 'rgba(127, 255, 212, 0.3)' : 'rgba(100, 200, 255, 0.3)'}`,
                                borderRadius: '12px',
                                color: park.parkType === 'national' ? '#7FFFD4' : '#64C8FF',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {park.parkType === 'national' ? 'National Park' : 'State Park'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="container-md">


                {loading ? (
                    <SkeletonGrid count={8} aspectRatio="1/1" columns="repeat(auto-fill, minmax(250px, 1fr))" />
                ) : posts.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => navigate(`/post/${post.id}`)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{
                                    aspectRatio: '1',
                                    background: '#111',
                                    overflow: 'hidden'
                                }}>
                                    {post.images?.[0]?.url || post.imageUrl ? (
                                        <img
                                            src={post.images?.[0]?.url || post.imageUrl}
                                            alt={post.title || ''}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaImage color="#333" size={40} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem' }}>
                                        {post.title || 'Untitled'}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                                        by {post.authorName || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                        <FaImage size={60} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Posts Yet</h3>
                        <p style={{ color: '#888' }}>
                            Be the first to share photos from {park.parkName}!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParkGallery;
