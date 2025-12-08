import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/hooks/useProjects';
import { useProjectManagement } from '@/hooks/useProjects';
import { FaUsers, FaImage, FaHeart, FaRegHeart, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import SEO from '@/components/SEO';
import StarBackground from '@/components/StarBackground';
import GridPostCard from '@/components/GridPostCard';

const ProjectPage = () => {
    const { studioId, projectId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { project, loading: projectLoading, refetch } = useProject(studioId, projectId);
    const { toggleFollow } = useProjectManagement();

    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [studio, setStudio] = useState(null);

    // Fetch studio details
    useEffect(() => {
        const fetchStudio = async () => {
            if (!studioId) return;
            try {
                const studioDoc = await getDoc(doc(db, 'galleries', studioId));
                if (studioDoc.exists()) {
                    setStudio({ id: studioDoc.id, ...studioDoc.data() });
                }
            } catch (error) {
                console.error('Error fetching studio:', error);
            }
        };
        fetchStudio();
    }, [studioId]);

    // Fetch posts for this project
    useEffect(() => {
        const fetchPosts = async () => {
            if (!project?.postIds || project.postIds.length === 0) {
                setPosts([]);
                setPostsLoading(false);
                return;
            }

            try {
                setPostsLoading(true);
                const postsRef = collection(db, 'posts');
                const postPromises = project.postIds.map(postId =>
                    getDoc(doc(db, 'posts', postId))
                );

                const postDocs = await Promise.all(postPromises);
                const fetchedPosts = postDocs
                    .filter(doc => doc.exists())
                    .map(doc => ({ id: doc.id, ...doc.data() }));

                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setPostsLoading(false);
            }
        };

        fetchPosts();
    }, [project?.postIds]);

    // Check if user is following
    useEffect(() => {
        if (currentUser && project) {
            setIsFollowing(project.followers?.includes(currentUser.uid) || false);
        }
    }, [currentUser, project]);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            await toggleFollow(studioId, projectId, currentUser.uid, !isFollowing);
            setIsFollowing(!isFollowing);
            refetch();
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const isContributor = project?.contributors?.some(c => c.uid === currentUser?.uid);
    const isOwner = project?.createdBy === currentUser?.uid;

    if (projectLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
            }}>
                Loading project...
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                color: '#888'
            }}>
                <h2>Project not found</h2>
                <button
                    onClick={() => navigate(`/gallery/${studioId}`)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#7FFFD4',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Back to Studio
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <SEO
                title={`${project.title} - ${studio?.title || 'Studio'}`}
                description={project.description}
            />

            <StarBackground />

            {/* Header */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
                borderBottom: '1px solid #333',
                padding: '2rem 0',
                position: 'relative'
            }}>
                <div className="container-md" style={{ padding: '0 1rem' }}>
                    {/* Breadcrumb */}
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#888',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span
                            onClick={() => navigate(`/gallery/${studioId}`)}
                            style={{ cursor: 'pointer', color: '#7FFFD4' }}
                        >
                            {studio?.title || 'Studio'}
                        </span>
                        <span>/</span>
                        <span>Projects</span>
                        <span>/</span>
                        <span>{project.title}</span>
                    </div>

                    {/* Project Title & Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            {project.title}
                            {project.isTemporary && (
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '0.25rem 0.75rem',
                                    background: 'rgba(255, 165, 0, 0.2)',
                                    border: '1px solid rgba(255, 165, 0, 0.5)',
                                    borderRadius: '20px',
                                    color: '#ffb84d'
                                }}>
                                    Temporary
                                </span>
                            )}
                        </h1>
                        {project.description && (
                            <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                {project.description}
                            </p>
                        )}
                    </div>

                    {/* Stats & Actions */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
                            <FaUsers />
                            <span>{project.contributors?.length || 0} Contributors</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
                            <FaImage />
                            <span>{posts.length} Posts</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
                            <FaHeart />
                            <span>{project.followersCount || 0} Followers</span>
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
                            {currentUser && (
                                <button
                                    onClick={handleFollowToggle}
                                    style={{
                                        padding: '0.5rem 1.5rem',
                                        background: isFollowing ? 'transparent' : '#7FFFD4',
                                        color: isFollowing ? '#7FFFD4' : '#000',
                                        border: `1px solid ${isFollowing ? '#7FFFD4' : 'transparent'}`,
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isFollowing ? <FaHeart /> : <FaRegHeart />}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}

                            {isOwner && (
                                <button
                                    onClick={() => navigate(`/project/${studioId}/${projectId}/edit`)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'transparent',
                                        color: '#888',
                                        border: '1px solid #333',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaEdit /> Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container-md" style={{ padding: '2rem 1rem' }}>
                {/* Contributors Section */}
                {project.contributors && project.contributors.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            borderBottom: '1px solid #333',
                            paddingBottom: '1rem'
                        }}>
                            Contributors
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1rem'
                        }}>
                            {project.contributors.map((contributor, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/profile/${contributor.uid}`)}
                                    style={{
                                        background: '#111',
                                        border: '1px solid #222',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#7FFFD4'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                        {contributor.displayName}
                                    </div>
                                    <div style={{ color: '#7FFFD4', fontSize: '0.9rem' }}>
                                        {contributor.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Posts Section */}
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid #333',
                        paddingBottom: '1rem'
                    }}>
                        Project Posts
                    </h2>

                    {postsLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                            Loading posts...
                        </div>
                    ) : posts.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: '#888',
                            background: '#111',
                            borderRadius: '12px',
                            border: '1px dashed #333'
                        }}>
                            <FaImage size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No posts in this project yet</p>
                            {isContributor && (
                                <button
                                    onClick={() => navigate('/create')}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.5rem 1.5rem',
                                        background: '#7FFFD4',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaPlus style={{ marginRight: '0.5rem' }} />
                                    Create Post
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {posts.map(post => (
                                <GridPostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectPage;
