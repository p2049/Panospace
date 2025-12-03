import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaImage, FaHeart } from 'react-icons/fa';

const ProjectCard = ({ project, studioId }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/project/${studioId}/${project.id}`)}
            style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#7FFFD4';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Temporary Badge */}
            {project.isTemporary && (
                <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255, 165, 0, 0.9)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#000',
                    zIndex: 1
                }}>
                    Temporary
                </div>
            )}

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    color: '#fff'
                }}>
                    {project.title}
                </h3>

                {project.description && (
                    <p style={{
                        margin: '0 0 1rem 0',
                        color: '#888',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {project.description}
                    </p>
                )}

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    color: '#666',
                    marginTop: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUsers />
                        <span>{project.contributors?.length || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaImage />
                        <span>{project.postsCount || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaHeart />
                        <span>{project.followersCount || 0}</span>
                    </div>
                </div>

                {/* Contributors Preview */}
                {project.contributors && project.contributors.length > 0 && (
                    <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #222'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                            Contributors
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {project.contributors.slice(0, 3).map((contributor, index) => (
                                <div key={index} style={{
                                    padding: '0.25rem 0.75rem',
                                    background: 'rgba(127, 255, 212, 0.1)',
                                    border: '1px solid rgba(127, 255, 212, 0.2)',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    color: '#7FFFD4'
                                }}>
                                    {contributor.displayName}
                                </div>
                            ))}
                            {project.contributors.length > 3 && (
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#222',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    color: '#666'
                                }}>
                                    +{project.contributors.length - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
