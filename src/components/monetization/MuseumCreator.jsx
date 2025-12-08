import React, { useState } from 'react';
import { FaTimes, FaImage } from 'react-icons/fa';
import { createMuseum } from '@/core/services/firestore/monetization.service';
import { useAuth } from '@/context/AuthContext';

const MuseumCreator = ({ onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [type, setType] = useState('city');
    const [description, setDescription] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Museum name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const museumData = {
                name: name.trim(),
                type,
                description: description.trim(),
                bannerImage: bannerImage.trim(),
                galleries: []
            };

            const newMuseum = await createMuseum(currentUser.uid, museumData);
            onSuccess?.(newMuseum);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create museum');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#fff', margin: 0 }}>Create Digital Museum</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Museum Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Downtown Art Museum"
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#2a2a2a',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Museum Type *
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#2a2a2a',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="city">City Museum</option>
                            <option value="campus">Campus Museum</option>
                            <option value="park">Park Museum</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your museum..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#2a2a2a',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Banner Image URL
                        </label>
                        <input
                            type="url"
                            value={bannerImage}
                            onChange={(e) => setBannerImage(e.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#2a2a2a',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                        {bannerImage && (
                            <div style={{
                                marginTop: '0.5rem',
                                height: '150px',
                                background: `url(${bannerImage}) center/cover`,
                                borderRadius: '8px',
                                border: '1px solid #555'
                            }} />
                        )}
                    </div>

                    {error && (
                        <div style={{
                            background: '#ff000020',
                            border: '1px solid #ff0000',
                            borderRadius: '8px',
                            padding: '0.8rem',
                            color: '#ff6b6b',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#555' : '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Museum'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MuseumCreator;
