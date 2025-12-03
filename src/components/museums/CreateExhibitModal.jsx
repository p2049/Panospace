import React, { useState, useRef } from 'react';
import { FaTimes, FaImage, FaClock, FaCloudUploadAlt } from 'react-icons/fa';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import PSButton from '../PSButton';

const CreateExhibitModal = ({ isOpen, onClose, museumId }) => {
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [duration, setDuration] = useState('24h'); // 24h, 48h, 7d, 30d
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size must be less than 10MB');
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !image) {
            setError('Please provide a title and an image');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Upload Image
            const fileName = `exhibits/${museumId}/${Date.now()}_${image.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, image);
            const imageUrl = await getDownloadURL(storageRef);

            // 2. Calculate Expiration
            const now = new Date();
            let expiresAt = new Date();

            switch (duration) {
                case '24h': expiresAt.setHours(now.getHours() + 24); break;
                case '48h': expiresAt.setHours(now.getHours() + 48); break;
                case '7d': expiresAt.setDate(now.getDate() + 7); break;
                case '30d': expiresAt.setDate(now.getDate() + 30); break;
                default: expiresAt.setHours(now.getHours() + 24);
            }

            // 3. Create Document
            const exhibitData = {
                title: title.trim(),
                description: description.trim(),
                imageUrl,
                storagePath: fileName,
                museumId,
                createdBy: currentUser.uid,
                creatorName: currentUser.displayName || 'Anonymous',
                createdAt: serverTimestamp(),
                expiresAt: Timestamp.fromDate(expiresAt),
                duration
            };

            await addDoc(collection(db, 'museums', museumId, 'exhibits'), exhibitData);

            onClose(true); // Success
        } catch (err) {
            console.error('Error creating exhibit:', err);
            setError('Failed to create exhibit: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
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
                maxWidth: '500px',
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
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>New Exhibit</h2>
                    <button
                        onClick={() => onClose(false)}
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
                <div style={{ padding: '1.5rem' }}>
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

                    {/* Image Upload */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            aspectRatio: '16/9',
                            background: '#222',
                            borderRadius: '12px',
                            border: '2px dashed #444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginBottom: '1.5rem',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#888' }}>
                                <FaCloudUploadAlt size={32} style={{ marginBottom: '0.5rem' }} />
                                <div>Click to upload exhibit image</div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Exhibit Title"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe this exhibit..."
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

                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Duration</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['24h', '48h', '7d', '30d'].map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDuration(d)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: duration === d ? '#7FFFD4' : '#222',
                                            color: duration === d ? '#000' : '#888',
                                            border: duration === d ? '1px solid #7FFFD4' : '1px solid #333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaClock size={12} />
                                Exhibit will auto-delete after this duration
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <PSButton
                        variant="ghost"
                        onClick={() => onClose(false)}
                        disabled={loading}
                    >
                        Cancel
                    </PSButton>
                    <PSButton
                        variant="mint"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Exhibit'}
                    </PSButton>
                </div>
            </div>
        </div>
    );
};

export default CreateExhibitModal;
