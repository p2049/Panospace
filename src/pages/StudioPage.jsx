import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStudio } from '@/hooks/useStudios';
import { StudioService } from '@/core/services/firestore/studios.service';
import { db } from '@/firebase';
import { PageSkeleton, SkeletonGrid } from '@/components/ui/Skeleton';
import {
    FaImage,
    FaFolderOpen,
    FaUsers,
    FaQuestionCircle,
    FaArrowLeft,
    FaUserPlus,
    FaGlobe,
    FaLock,
    FaBriefcase
} from 'react-icons/fa';
import Post from '@/components/Post';
import Walkthrough from '@/components/common/Walkthrough';
import InviteMembersModal from '@/components/studios/InviteStudioMembersModal';
import MagazineSubmissionBox from '@/components/MagazineSubmissionBox';
import { getMagazinesByGallery, getMagazineIssues } from '@/services/magazineService';
import { useStudioProjects } from '@/hooks/useProjects';
import CreateProjectModal from '@/components/CreateProjectModal';
import ProjectCard from '@/components/ProjectCard';
import '@/styles/gallery-page.css';
import { isDevBypassActive } from '@/core/utils/accessControl';

const StudioPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAdmin } = useAuth();

    // Use custom hook for studio data
    const { studio, items, loading, error: studioError, refetch } = useStudio(id);

    const [activeTab, setActiveTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [membersList, setMembersList] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [magazine, setMagazine] = useState(null);
    const [nextIssue, setNextIssue] = useState(null);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showWalkthrough, setShowWalkthrough] = useState(false);

    const walkthroughSteps = [
        {
            title: "Studios",
            description: "Studios are shared collections. Invite people and everyone in the Studio can add posts. Great for teams, groups, or shared themes."
        },
        {
            title: "Invite Members",
            description: "Invite collaborators to join your Studio.",
            targetSelector: "#studio-invite-btn"
        },
        {
            title: "New Project",
            description: "Create shared projects within your studio for organized teamwork.",
            targetSelector: "#studio-new-project-btn"
        }
    ];

    // Fetch projects for this studio
    const { projects, loading: projectsLoading, refetch: refetchProjects } = useStudioProjects(id);

    // Check if current user is owner
    const isOwner = currentUser && studio && studio.ownerId === currentUser.uid;
    const isMember = currentUser && studio && studio.members?.includes(currentUser.uid);

    // Load magazine data when gallery loads
    useEffect(() => {
        const loadMagazineData = async () => {
            if (!studio) return;

            try {
                // Check if this studio has a linked magazine
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
    }, [studio, id]);

    useEffect(() => {
        if (studio) {
            loadContent();
        }
    }, [activeTab, studio]);

    const loadContent = async () => {
        setContentLoading(true);
        try {
            if (activeTab === 'posts') {
                // Extract post IDs from items
                const postIds = (items || []).map(item => item.postId).filter(Boolean);

                if (postIds.length === 0) {
                    setPosts([]);
                } else {
                    const { query, where, getDocs, collection, documentId } = await import('firebase/firestore');
                    const postsQuery = query(
                        collection(db, 'posts'),
                        where(documentId(), 'in', postIds.slice(0, 30))
                    );
                    const snapshot = await getDocs(postsQuery);
                    setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } else if (activeTab === 'members') {
                const { StudioService } = await import('@/core/services/firestore/studios.service');
                const memberList = await StudioService.getMembers(id);

                const uids = memberList.map(m => m.uid);
                if (uids.length === 0) {
                    setMembersList([]);
                } else {
                    const { query, where, getDocs, collection, documentId } = await import('firebase/firestore');
                    const usersQuery = query(
                        collection(db, 'users'),
                        where(documentId(), 'in', uids.slice(0, 30))
                    );
                    const snapshot = await getDocs(usersQuery);
                    setMembersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            }
        } catch (error) {
            logger.error('Error loading studio content:', error);
        } finally {
            setContentLoading(false);
        }
    };


    const handleDeleteStudio = async () => {
        if (window.confirm("Are you sure you want to delete this studio? This cannot be undone.")) {
            try {
                await StudioService.delete(id);
                navigate('/');
            } catch (error) {
                console.error("Error deleting studio:", error);
                alert("Failed to delete studio.");
            }
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    if (!studio) {
        return (
            <div className="gallery-error">
                <h2>Studio Not Found</h2>
                <button onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    return (
        <div className="gallery-page">
            {studio.coverImage && (
                <div
                    className="gallery-cover"
                    style={{ backgroundImage: `url(${studio.coverImage})` }}
                >
                    <div className="cover-overlay" />
                </div>
            )}

            <div className="gallery-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <FaArrowLeft /> Back
                    </button>

                    <button
                        className="help-icon-btn"
                        onClick={() => setShowWalkthrough(true)}
                        title="Show tutorial"
                    >
                        <FaQuestionCircle />
                    </button>
                </div>

                <div className="gallery-info">
                    <div className="gallery-meta">
                        <span className="visibility-badge">
                            {studio.isPublic ? <FaGlobe /> : <FaLock />}
                            {studio.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="content-type-badge">
                            {studio.contentType === 'posts' && 'Posts Only'}
                            {studio.contentType === 'collections' && 'Collections Only'}
                            {studio.contentType === 'both' && 'Posts & Collections'}
                        </span>
                    </div>

                    <h1>{studio.title}</h1>

                    {studio.description && (
                        <p className="gallery-description">{studio.description}</p>
                    )}

                    <div className="gallery-stats">
                        <span>by @{studio.ownerUsername}</span>
                        <span>•</span>
                        <span>{studio.postsCount || 0} posts</span>
                        <span>•</span>
                        <span>{studio.membersCount || 0} members</span>
                    </div>

                    {studio.requiredTags && studio.requiredTags.length > 0 && (
                        <div className="required-tags">
                            <strong>Required tags:</strong>
                            {studio.requiredTags.map(tag => (
                                <span key={tag} className="tag-badge">{tag}</span>
                            ))}
                        </div>
                    )}

                    {isOwner && (
                        <button id="studio-invite-btn" className="invite-btn" onClick={() => setShowInviteModal(true)}>
                            <FaUserPlus /> Invite Members
                        </button>
                    )}
                    {(isOwner || isAdmin || isDevBypassActive()) && (
                        <button
                            onClick={handleDeleteStudio}
                            style={{
                                marginTop: '0.5rem',
                                background: 'rgba(255,0,0,0.2)',
                                border: '1px solid rgba(255,0,0,0.3)',
                                color: '#ff6b6b',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Delete Studio
                        </button>
                    )}
                </div>
            </div>

            <div className="gallery-tabs">
                <button
                    className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <FaImage /> Posts ({studio.postsCount || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('collections')}
                >
                    <FaFolderOpen /> Collections ({studio.collectionsCount || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <FaUsers /> Members ({studio.membersCount || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    <FaBriefcase /> Projects ({projects?.length || 0})
                </button>
            </div>

            <div className="gallery-content">
                {/* Magazine Submission Box */}
                {isMember && magazine && nextIssue && (
                    <MagazineSubmissionBox
                        magazine={magazine}
                        gallery={studio}
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
                                {membersList.length === 0 ? (
                                    <div className="empty-state">
                                        <FaUsers size={48} />
                                        <p>No members yet</p>
                                    </div>
                                ) : (
                                    membersList.map(member => {
                                        // Team Logic
                                        const teamId = studio.teamAssignments?.[member.id];
                                        const team = teamId ? studio.teams?.[teamId] : null;
                                        const teamColor = team?.color;

                                        // Username Color Priority: Team Color (if in studio) > User Theme
                                        const displayColor = teamColor ||
                                            (member.profileTheme?.usernameColor && !member.profileTheme.usernameColor.includes('gradient')
                                                ? member.profileTheme.usernameColor
                                                : '#fff');

                                        return (
                                            <div
                                                key={member.id}
                                                className="member-card"
                                                onClick={() => navigate(`/profile/${member.id}`)}
                                                style={{
                                                    borderColor: teamColor ? teamColor : 'rgba(255,255,255,0.1)',
                                                    borderWidth: teamColor ? '2px' : '1px'
                                                }}
                                            >
                                                <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 1rem' }}>
                                                    <img
                                                        src={member.photoURL || '/default-avatar.png'}
                                                        alt={member.username}
                                                        className="member-avatar"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            border: `2px solid ${teamColor || member.profileTheme?.borderColor || '#7FFFD4'}`
                                                        }}
                                                    />
                                                    {team && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '-5px',
                                                            right: '-5px',
                                                            background: teamColor,
                                                            color: '#000',
                                                            fontSize: '0.6rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                                        }}>
                                                            {team.name}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="member-info">
                                                    <strong style={{
                                                        color: displayColor,
                                                        fontSize: '1.1rem',
                                                        fontFamily: 'var(--font-family-heading)'
                                                    }}>
                                                        {member.displayName || member.username}
                                                    </strong>
                                                    <span style={{ opacity: 0.7 }}>@{member.username}</span>
                                                </div>
                                                {member.id === studio.ownerId && (
                                                    <span className="owner-badge">Owner</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="projects-grid">
                                {isOwner && (
                                    <div style={{
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <button
                                            id="studio-new-project-btn"
                                            onClick={() => setShowCreateProjectModal(true)}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: '#7FFFD4',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <FaBriefcase /> New Project
                                        </button>
                                    </div>
                                )}
                                {projectsLoading ? (
                                    <div className="empty-state">
                                        <p>Loading projects...</p>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="empty-state">
                                        <FaBriefcase size={48} />
                                        <p>No projects yet</p>
                                        {isOwner && <span>Create your first collaborative project!</span>}
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {projects.map(project => (
                                            <ProjectCard key={project.id} project={project} studioId={id} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showInviteModal && (
                <InviteMembersModal
                    galleryId={id}
                    existingMembers={studio.members || []}
                    pendingInvites={studio.pendingInvites || []}
                    onClose={(invitesSent) => {
                        setShowInviteModal(false);
                        if (invitesSent) {
                            refetch();
                        }
                    }}
                />
            )}

            {showCreateProjectModal && (
                <CreateProjectModal
                    isOpen={showCreateProjectModal}
                    onClose={() => setShowCreateProjectModal(false)}
                    studioId={id}
                    onSuccess={(newProject) => {
                        refetchProjects();
                        navigate(`/project/${id}/${newProject.id}`);
                    }}
                />
            )}

            <Walkthrough
                steps={walkthroughSteps}
                onboardingKey="studios"
                forceShow={showWalkthrough}
                onClose={() => setShowWalkthrough(false)}
            />
        </div>
    );
};

export default StudioPage;
