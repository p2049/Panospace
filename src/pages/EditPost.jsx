import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaTags, FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import Toast from '../components/Toast';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [post, setPost] = useState(null);

    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [location, setLocation] = useState({ city: '', state: '', country: '' });
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            if (!currentUser) return;

            try {
                const docRef = doc(db, 'posts', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.authorId !== currentUser.uid) {
                        alert("You are not authorized to edit this post.");
                        navigate('/');
                        return;
                    }
                    setPost(data);
                    setTitle(data.title || '');
                    setTags(data.tags ? data.tags.join(', ') : '');
                    setLocation({
                        city: data.location?.city || '',
                        state: data.location?.state || '',
                        country: data.location?.country || ''
                    });
                } else {
                    alert("Post not found.");
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, currentUser, navigate]);

    const generateSearchKeywords = (text) => {
        if (!text) return [];
        const words = text.toLowerCase().split(/[\s,]+/);
        const keywords = new Set();

        words.forEach(word => {
            keywords.add(word);
            for (let i = 2; i <= word.length; i++) {
                keywords.add(word.substring(0, i));
            }
        });

        return Array.from(keywords);
    };

    const handleSave = async () => {
        if (!currentUser || !post) return;
        setSaving(true);

        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

            const searchKeywords = [
                ...generateSearchKeywords(currentUser.displayName || ''),
                ...generateSearchKeywords(title),
                ...tagList.map(t => t.toLowerCase()),
                ...generateSearchKeywords(location.city),
                ...generateSearchKeywords(location.state),
                ...generateSearchKeywords(location.country)
            ];

            const docRef = doc(db, 'posts', id);
            await updateDoc(docRef, {
                title: title,
                tags: tagList,
                location: {
                    city: location.city.trim(),
                    state: location.state.trim(),
                    country: location.country.trim()
                },
                searchKeywords: [...new Set(searchKeywords)],
                updatedAt: serverTimestamp()
            });

            setShowToast(true);
            setTimeout(() => {
                navigate(-1); // Go back
            }, 1500);

        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update post.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10
            }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', opacity: 0.8 }}>
                    <FaArrowLeft /> Cancel
                </button>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.05em', fontFamily: 'var(--font-family-heading)', textTransform: 'uppercase' }}>EDIT POST</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        opacity: saving ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaSave /> Save
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

                {/* Preview Image (First Slide) */}
                {post.items && post.items.length > 0 && post.items[0].type === 'image' && (
                    <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
                        <img src={post.items[0].url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>

                    {/* Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888', fontSize: '0.9rem' }}>Title / Caption</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '1.2rem', padding: '0.5rem', outline: 'none' }}
                        />
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaTags /> Tags</label>
                        <input
                            type="text"
                            placeholder="nature, portrait, b&w"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '1rem', padding: '0.5rem', outline: 'none' }}
                        />
                    </div>

                    {/* Location */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMapMarkerAlt /> Location</label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="City"
                                value={location.city}
                                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                style={{ flex: 1, minWidth: '150px', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '0.8rem', outline: 'none' }}
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={location.state}
                                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                style={{ flex: 1, minWidth: '150px', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '0.8rem', outline: 'none' }}
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                value={location.country}
                                onChange={(e) => setLocation({ ...location, country: e.target.value })}
                                style={{ flex: 1, minWidth: '150px', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '0.8rem', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showToast && (
                <Toast
                    message="Post updated successfully!"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default EditPost;
