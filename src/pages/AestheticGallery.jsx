import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaArrowLeft } from 'react-icons/fa';
import InfiniteGrid from '@/components/InfiniteGrid';

const AestheticStudio = () => {
    const { type, tag } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Map URL type to Firestore field
                let fieldName = 'tags'; // Default
                if (type === 'color') fieldName = 'colorTags';
                if (type === 'mood') fieldName = 'moodTags';
                if (type === 'season') fieldName = 'seasonalTags';
                if (type === 'time') fieldName = 'timeOfDayTags';


                const q = query(
                    collection(db, 'posts'),
                    where(fieldName, 'array-contains', tag)
                    // orderBy('createdAt', 'desc'),
                    // limit(50)
                );

                const snapshot = await getDocs(q);

                const fetchedPosts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching aesthetic studio:", error);
            } finally {
                setLoading(false);
            }
        };

        if (tag) {
            fetchPosts();
        }
    }, [type, tag]);

    // Format title
    const formatTitle = () => {
        if (!tag) return 'Studio';
        return `${tag} ${type === 'time' ? '' : 'Aesthetic'}`;
    };

    return (
        <div className="aesthetic-studio-page">
            <div className="studio-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FaArrowLeft />
                </button>
                <h1>{formatTitle()}</h1>
            </div>

            <div className="studio-content">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts found for this aesthetic yet.</p>
                        <p>Be the first to post in <strong>{tag}</strong>!</p>
                    </div>
                ) : (
                    <InfiniteGrid
                        items={posts}
                        columns={{ mobile: 3, tablet: 3, desktop: 4 }}
                        gap="4px"
                        renderItem={(post) => (
                            <div
                                key={post.id}
                                className="post-thumbnail"
                                onClick={() => navigate(`/post/${post.id}`)}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <img src={post.items?.[0]?.url || post.images?.[0]?.url || post.imageUrl} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    />
                )}
            </div>

            <style>{`
                .aesthetic-studio-page {
                    min-height: 100vh;
                    background: #000;
                    color: #fff;
                    padding-bottom: 80px;
                }
                .studio-header {
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    position: sticky;
                    top: 0;
                    background: rgba(0,0,0,0.9);
                    z-index: 10;
                    border-bottom: 1px solid #333;
                }
                .studio-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-transform: capitalize;
                    margin: 0;
                    background: linear-gradient(45deg, #fff, #ccc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .back-btn {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .studio-content {
                    padding: 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 4px;
                }
                .post-thumbnail {
                    aspect-ratio: 1;
                    background: #111;
                    cursor: pointer;
                    overflow: hidden;
                }
                .post-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                .post-thumbnail:hover img {
                    transform: scale(1.05);
                }
                .loading-state, .empty-state {
                    padding: 4rem;
                    text-align: center;
                    color: #888;
                }
                
                @media (min-width: 768px) {
                    .posts-grid {
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AestheticStudio;
