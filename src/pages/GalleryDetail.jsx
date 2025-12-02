import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGallery } from '../hooks/useGallery';
import {
    getGalleryPosts,
    getGalleryCollections
} from '../services/galleryService';
import { db } from '../firebase';
import { PageSkeleton, SkeletonGrid } from '../components/ui/Skeleton';
import {
    FaArrowLeft,
    FaLock,
    FaGlobe,
    FaUserPlus,
    FaImage,
    FaFolderOpen,
    FaUsers
} from 'react-icons/fa';
import Post from '../components/Post';
import InviteMembersModal from '../components/galleries/InviteMembersModal';
import MagazineSubmissionBox from '../components/MagazineSubmissionBox';
import { getMagazinesByGallery, getMagazineIssues } from '../services/magazineService';
import '../styles/gallery-page.css';

const GalleryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Use custom hook for gallery data
    const { gallery, loading, error: galleryError } = useGallery(id);

    const [activeTab, setActiveTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [members, setMembers] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [magazine, setMagazine] = useState(null);
    const [nextIssue, setNextIssue] = useState(null);

    // Check if current user is owner
    const isOwner = currentUser && gallery && gallery.ownerId === currentUser.uid;
    const isMember = currentUser && gallery && gallery.members?.includes(currentUser.uid);

    // Load magazine data when gallery loads
    useEffect(() => {
        const loadMagazineData = async () => {
            if (!gallery) return;

            try {
                // Check if this gallery has a linked magazine
                const magazines = await getMagazinesByGallery(id);
                if (magazines.length > 0) {
                    const mag = magazines[0];
                    setMagazine(mag);

                    // Get next queued issue
                    const issues = await getMagazineIssues(mag.id, 'queued');
                    if (issues.length > 0) {
                        setNextIssue(issues[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading magazine data:', error);
            }
        };

        loadMagazineData();
    }, [gallery, id]);

    useEffect(() => {
        if (gallery) {
            loadContent();
        }
    }, [activeTab, gallery]);

    const loadContent = async () => {
        setContentLoading(true);
        try {
            if (activeTab === 'posts') {
                const galleryPosts = await getGalleryPosts(id);

                // Extract post IDs and batch fetch
                const postIds = galleryPosts.map(gp => gp.postId).filter(Boolean);

                if (postIds.length === 0) {
                    setPosts([]);
                } else {
                    // Firestore 'in' queries support max 30 items, so batch if needed
                    const batchSize = 30;
                    const batches = [];

                    for (let i = 0; i < postIds.length; i += batchSize) {
                        const batchIds = postIds.slice(i, i + batchSize);
                        batches.push(batchIds);
                    }

                    // Execute batched queries in parallel
                    const { query, where, getDocs, collection, documentId } = await import('firebase/firestore');
                    const allPosts = [];

                    await Promise.all(batches.map(async (batchIds) => {
                        const postsQuery = query(
                            collection(db, 'posts'),
                            where(documentId(), 'in', batchIds)
                        );
                        const snapshot = await getDocs(postsQuery);
                        snapshot.docs.forEach(doc => {
                            allPosts.push({ id: doc.id, ...doc.data() });
                        });
                    }));

                    setPosts(allPosts);
                }
            } else if (activeTab === 'collections') {
                const galleryCollections = await getGalleryCollections(id);

                // Extract collection IDs and batch fetch
                const collectionIds = galleryCollections.map(gc => gc.collectionId).filter(Boolean);

                if (collectionIds.length === 0) {
                    setCollections([]);
                } else {
                    // Batch collections queries
                    const batchSize = 30;
                    const batches = [];

                    for (let i = 0; i < collectionIds.length; i += batchSize) {
                        const batchIds = collectionIds.slice(i, i + batchSize);
                        batches.push(batchIds);
                    }

                    const { query, where, getDocs, collection, documentId } = await import('firebase/firestore');
                    const allCollections = [];

                    await Promise.all(batches.map(async (batchIds) => {
                        const collectionsQuery = query(
                            collection(db, 'collections'),
                            where(documentId(), 'in', batchIds)
                        );
                        const snapshot = await getDocs(collectionsQuery);
                        snapshot.docs.forEach(doc => {
                            allCollections.push({ id: doc.id, ...doc.data() });
                        });
                    }));

                    setCollections(allCollections);
                }
            } else if (activeTab === 'members') {
                if (gallery.members && gallery.members.length > 0) {
                    // Batch members queries
                    const memberIds = gallery.members.filter(Boolean);

                    if (memberIds.length === 0) {
                        setMembers([]);
                    } else {
                        const batchSize = 30;
                        const batches = [];

                        for (let i = 0; i < memberIds.length; i += batchSize) {
                            const batchIds = memberIds.slice(i, i + batchSize);
                            batches.push(batchIds);
                        }

                        const { query, where, getDocs, collection, documentId } = await import('firebase/firestore');
                        const allMembers = [];

                        await Promise.all(batches.map(async (batchIds) => {
                            const membersQuery = query(
                                collection(db, 'users'),
                                where(documentId(), 'in', batchIds)
                            );
                            const snapshot = await getDocs(membersQuery);
                            snapshot.docs.forEach(doc => {
                                allMembers.push({ id: doc.id, ...doc.data() });
                            });
                        }));

                        setMembers(allMembers);
                    }
                } else {
                    setMembers([]);
                }
            }
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setContentLoading(false);
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    if (!gallery) {
        return (
            <div className="gallery-error">
                <h2>Gallery Not Found</h2>
                <button onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    return (
        <div className="gallery-page">
            {gallery.coverImage && (
                <div
                    className="gallery-cover"
                    style={{ backgroundImage: `url(${gallery.coverImage})` }}
                >
                    <div className="cover-overlay" />
                </div>
            )}

            <div className="gallery-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FaArrowLeft /> Back
                </button>

                <div className="gallery-info">
                    <div className="gallery-meta">
                        <span className="visibility-badge">
                            {gallery.isPublic ? <FaGlobe /> : <FaLock />}
                            {gallery.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="content-type-badge">
                            {gallery.contentType === 'posts' && 'Posts Only'}
                            {gallery.contentType === 'collections' && 'Collections Only'}
                            {gallery.contentType === 'both' && 'Posts & Collections'}
                        </span>
                    </div>

                    <h1>{gallery.title}</h1>

                    {gallery.description && (
                        <p className="gallery-description">{gallery.description}</p>
                    )}

                    <div className="gallery-stats">
                        <span>by @{gallery.ownerUsername}</span>
                        <span>•</span>
                        <span>{gallery.postsCount || 0} posts</span>
                        <span>•</span>
                        <span>{gallery.membersCount || 0} members</span>
                    </div>

                    {gallery.requiredTags && gallery.requiredTags.length > 0 && (
                        <div className="required-tags">
                            <strong>Required tags:</strong>
                            {gallery.requiredTags.map(tag => (
                                <span key={tag} className="tag-badge">{tag}</span>
                            ))}
                        </div>
                    )}

                    {isOwner && (
                        <button className="invite-btn" onClick={() => setShowInviteModal(true)}>
                            <FaUserPlus /> Invite Members
                        </button>
                    )}
                </div>
            </div>

            <div className="gallery-tabs">
                <button
                    className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <FaImage /> Posts ({gallery.postsCount || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('collections')}
                >
                    <FaFolderOpen /> Collections ({gallery.collectionsCount || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <FaUsers /> Members ({gallery.membersCount || 0})
                </button>
            </div>

            <div className="gallery-content">
                {/* Magazine Submission Box */}
                {isMember && magazine && nextIssue && (
                    <MagazineSubmissionBox
                        magazine={magazine}
                        gallery={gallery}
                        nextIssue={nextIssue}
                    />
                )}

                {contentLoading ? (
                    <SkeletonGrid count={6} aspectRatio="1/1" columns="repeat(auto-fill, minmax(250px, 1fr))" />
                ) : (
                    <>
                        {activeTab === 'posts' && (
                            <div className="posts-grid">
                                {posts.length === 0 ? (
                                    <div className="empty-state">
                                        <FaImage size={48} />
                                        <p>No posts yet</p>
                                        {isMember && <span>Be the first to add a post!</span>}
                                    </div>
                                ) : (
                                    posts.map(post => (
                                        <Post key={post.id} post={post} />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'collections' && (
                            <div className="collections-grid">
                                {collections.length === 0 ? (
                                    <div className="empty-state">
                                        <FaFolderOpen size={48} />
                                        <p>No collections yet</p>
                                        {isMember && <span>Be the first to add a collection!</span>}
                                    </div>
                                ) : (
                                    collections.map(collection => (
                                        <div
                                            key={collection.id}
                                            className="collection-card"
                                            onClick={() => navigate(`/collection/${collection.id}`)}
                                        >
                                            <h3>{collection.title}</h3>
                                            <p>{collection.description}</p>
                                            <span className="collection-count">
                                                {collection.postRefs?.length || 0} posts
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="members-grid">
                                {members.length === 0 ? (
                                    <div className="empty-state">
                                        <FaUsers size={48} />
                                        <p>No members yet</p>
                                    </div>
                                ) : (
                                    members.map(member => (
                                        <div
                                            key={member.id}
                                            className="member-card"
                                            onClick={() => navigate(`/profile/${member.id}`)}
                                        >
                                            <img
                                                src={member.photoURL || '/default-avatar.png'}
                                                alt={member.username}
                                                className="member-avatar"
                                            />
                                            <div className="member-info">
                                                <strong>{member.displayName || member.username}</strong>
                                                <span>@{member.username}</span>
                                            </div>
                                            {member.id === gallery.ownerId && (
                                                <span className="owner-badge">Owner</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showInviteModal && (
                <InviteMembersModal
                    galleryId={id}
                    existingMembers={gallery.members || []}
                    pendingInvites={gallery.pendingInvites || []}
                    onClose={(invitesSent) => {
                        setShowInviteModal(false);
                        if (invitesSent) {
                            loadGallery();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default GalleryPage;
