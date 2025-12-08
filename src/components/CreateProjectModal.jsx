import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaUsers } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useProjectManagement } from '@/hooks/useProjects';
import PSButton from './PSButton';

const CreateProjectModal = ({ isOpen, onClose, studioId, onSuccess }) => {
    const { currentUser } = useAuth();
    const { create, loading, error } = useProjectManagement();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isTemporary: false,
        contributors: [],
        roles: []
    });

    const [newContributor, setNewContributor] = useState({
        uid: '',
        displayName: '',
        role: ''
    });

    const [newRole, setNewRole] = useState('');

    if (!isOpen) return null;

    const handleAddRole = () => {
        if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
            setFormData(prev => ({
                ...prev,
                roles: [...prev.roles, newRole.trim()]
            }));
            setNewRole('');
        }
    };

    const handleRemoveRole = (roleToRemove) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.filter(role => role !== roleToRemove)
        }));
    };

    const handleAddContributor = () => {
        if (newContributor.displayName.trim() && newContributor.role.trim()) {
            setFormData(prev => ({
                ...prev,
                contributors: [...prev.contributors, {
                    uid: newContributor.uid || currentUser.uid,
                    displayName: newContributor.displayName.trim(),
                    role: newContributor.role.trim()
                }]
            }));
            setNewContributor({ uid: '', displayName: '', role: '' });
        }
    };

    const handleRemoveContributor = (index) => {
        setFormData(prev => ({
            ...prev,
            contributors: prev.contributors.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Please enter a project title');
            return;
        }

        try {
            const projectData = {
                ...formData,
                createdBy: currentUser.uid,
                contributors: formData.contributors.length > 0
                    ? formData.contributors
                    : [{
                        uid: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous',
                        role: 'Creator'
                    }]
            };

            const newProject = await create(studioId, projectData);

            if (onSuccess) {
                onSuccess(newProject);
            }

            onClose();
        } catch (err) {
            console.error('Failed to create project:', err);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    background: '#111',
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUsers style={{ color: '#7FFFD4' }} />
                        New Project
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex'
                        }}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid #ff4444',
                            borderRadius: '8px',
                            color: '#ff4444',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Summer Campaign 2024"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this project..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Temporary Project Toggle */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            background: '#222',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            <input
                                type="checkbox"
                                checked={formData.isTemporary}
                                onChange={e => setFormData({ ...formData, isTemporary: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <div>
                                <div style={{ color: '#fff', fontWeight: '600' }}>Temporary Project</div>
                                <div style={{ color: '#666', fontSize: '0.85rem' }}>
                                    Mark this as a short-term collaboration
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Roles */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Project Roles (Optional)
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={newRole}
                                onChange={e => setNewRole(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                                placeholder="e.g., Photographer, Editor, Designer"
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddRole}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaPlus />
                            </button>
                        </div>
                        {formData.roles.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {formData.roles.map((role, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        border: '1px solid rgba(127, 255, 212, 0.3)',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        color: '#7FFFD4'
                                    }}>
                                        {role}
                                        <FaTimes
                                            size={12}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleRemoveRole(role)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contributors */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Contributors (Optional)
                        </label>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={newContributor.displayName}
                                onChange={e => setNewContributor({ ...newContributor, displayName: e.target.value })}
                                placeholder="Contributor name"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={newContributor.role}
                                    onChange={e => setNewContributor({ ...newContributor, role: e.target.value })}
                                    placeholder="Role"
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddContributor}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#7FFFD4',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>
                        {formData.contributors.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {formData.contributors.map((contributor, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px'
                                    }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 'bold' }}>
                                                {contributor.displayName}
                                            </div>
                                            <div style={{ color: '#7FFFD4', fontSize: '0.85rem' }}>
                                                {contributor.role}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveContributor(index)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff4444',
                                                cursor: 'pointer',
                                                padding: '0.5rem'
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #222'
                    }}>
                        <PSButton
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </PSButton>
                        <PSButton
                            variant="mint"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </PSButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
