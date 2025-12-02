import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { FaImage, FaTimes, FaPlus, FaArrowLeft, FaBook, FaCheck, FaGripVertical } from 'react-icons/fa';
import { MAGAZINE_CONFIG } from '../constants/magazineConfig';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CreateMagazineIssue = () => {
    const { id: magazineId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);

    const [magazine, setMagazine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [slides, setSlides] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [includeCover, setIncludeCover] = useState(true);

    useEffect(() => {
        const fetchMagazine = async () => {
            try {
                const magazineRef = doc(db, 'magazines', magazineId);
                const magazineSnap = await getDoc(magazineRef);

                if (magazineSnap.exists()) {
                    const data = { id: magazineSnap.id, ...magazineSnap.data() };
                    setMagazine(data);

                    // Check if user is owner
                    if (data.ownerId !== currentUser?.uid) {
                        alert('You do not have permission to create issues for this magazine');
                        navigate(`/magazine/${magazineId}`);
                    }
                } else {
                    alert('Magazine not found');
                    navigate('/');
                }
            } catch (err) {
                console.error('Error fetching magazine:', err);
                alert('Failed to load magazine');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (magazineId && currentUser) {
            fetchMagazine();
        }
    }, [magazineId, currentUser, navigate]);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const maxSlides = includeCover ? MAGAZINE_CONFIG.MAX_SLIDES + 1 : MAGAZINE_CONFIG.MAX_SLIDES;
        const remainingSlots = maxSlides - slides.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newSlides = await Promise.all(
            filesToAdd.map(async (file) => {
                const preview = URL.createObjectURL(file);

                // Check aspect ratio
                const img = new Image();
                img.src = preview;
                await new Promise(resolve => { img.onload = resolve; });

                const aspectRatio = img.width / img.height;
                const expectedRatio = MAGAZINE_CONFIG.ASPECT_RATIO;
                const tolerance = 0.05;

                if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
                    console.warn(`Image ${file.name} has incorrect aspect ratio: ${aspectRatio.toFixed(2)} (expected ${expectedRatio.toFixed(2)})`);
                }

                return {
                    file,
                    preview,
                    caption: '',
                    aspectRatio,
                    width: img.width,
                    height: img.height,
                    order: slides.length + filesToAdd.indexOf(file)
                };
            })
        );

        setSlides(prev => [...prev, ...newSlides]);
    };

    const removeSlide = (index) => {
        setSlides(prev => prev.filter((_, i) => i !== index).map((slide, i) => ({ ...slide, order: i })));
    };

    const updateCaption = (index, caption) => {
        setSlides(prev => prev.map((slide, i) => i === index ? { ...slide, caption } : slide));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(slides);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order
        const reorderedSlides = items.map((slide, index) => ({ ...slide, order: index }));
        setSlides(reorderedSlides);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const minSlides = includeCover ? MAGAZINE_CONFIG.MIN_SLIDES + 1 : MAGAZINE_CONFIG.MIN_SLIDES;
        const maxSlides = includeCover ? MAGAZINE_CONFIG.MAX_SLIDES + 1 : MAGAZINE_CONFIG.MAX_SLIDES;

        if (slides.length < minSlides) {
            alert(`Please add at least ${minSlides} slides (including ${includeCover ? 'cover' : 'no cover'})`);
            return;
        }

        if (slides.length > maxSlides) {
            alert(`Maximum ${maxSlides} slides allowed (including ${includeCover ? 'cover' : 'no cover'})`);
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            // Upload all slides
            const uploadedSlides = [];
            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                const fileName = `magazines/${magazineId}/issues/${Date.now()}_slide_${i.toString().padStart(3, '0')}_${slide.file.name}`;
                const storageRef = ref(storage, fileName);

                await uploadBytes(storageRef, slide.file);
                const imageUrl = await getDownloadURL(storageRef);

                uploadedSlides.push({
                    imageUrl,
                    storagePath: fileName,
                    caption: slide.caption,
                    contributorId: currentUser.uid,
                    order: i
                });

                setUploadProgress(((i + 1) / slides.length) * 100);
            }

            // Create issue document
            const issueData = {
                magazineId,
                issueNumber: (magazine.issueCount || 0) + 1,
                status: 'queued',
                scheduledPublishDate: magazine.nextReleaseDate,
                publishedAt: null,
                slides: uploadedSlides,
                includeCover,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const issueRef = await addDoc(collection(db, 'magazineIssues'), issueData);
            console.log('Issue created:', issueRef.id);

            alert('Issue queued successfully! It will be published on the scheduled date.');
            navigate(`/magazine/${magazineId}`);
        } catch (err) {
            console.error('Error creating issue:', err);
            alert(`Failed to create issue: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>;
    if (!magazine) return null;

    const minSlides = includeCover ? MAGAZINE_CONFIG.MIN_SLIDES + 1 : MAGAZINE_CONFIG.MIN_SLIDES;
    const maxSlides = includeCover ? MAGAZINE_CONFIG.MAX_SLIDES + 1 : MAGAZINE_CONFIG.MAX_SLIDES;
    const isValid = slides.length >= minSlides && slides.length <= maxSlides;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: '#000',
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate(`/magazine/${magazineId}`)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaArrowLeft /> Cancel
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Create Issue #{(magazine.issueCount || 0) + 1}</h1>
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !isValid}
                    style={{
                        background: uploading || !isValid ? '#333' : '#7FFFD4',
                        color: uploading || !isValid ? '#666' : '#000',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        cursor: uploading || !isValid ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? `${Math.round(uploadProgress)}%` : 'Queue Issue'}
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                {/* Magazine Info */}
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <FaBook style={{ color: '#7FFFD4', fontSize: '1.5rem' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{magazine.title}</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.9rem' }}>
                                Next Release: {magazine.nextReleaseDate?.toDate ? magazine.nextReleaseDate.toDate().toLocaleDateString() : 'Not scheduled'}
                            </p>
                        </div>
                    </div>

                    {/* Cover Slide Toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>
                        <input
                            type="checkbox"
                            checked={includeCover}
                            onChange={(e) => setIncludeCover(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div>
                            <div style={{ fontWeight: '600', color: '#ccc' }}>Include Cover Slide</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                First slide will be used as the issue cover
                            </div>
                        </div>
                    </label>
                </div>

                {/* Slide Counter */}
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: slides.length >= minSlides && slides.length <= maxSlides ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                    border: `1px solid ${slides.length >= minSlides && slides.length <= maxSlides ? 'rgba(127, 255, 212, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
                    borderRadius: '8px',
                    color: slides.length >= minSlides && slides.length <= maxSlides ? '#7FFFD4' : '#ff4444',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                }}>
                    {slides.length} / {minSlides}-{maxSlides} slides
                    {slides.length < minSlides && ` (need ${minSlides - slides.length} more)`}
                    {slides.length > maxSlides && ` (remove ${slides.length - maxSlides})`}
                </div>

                {/* Slide Grid */}
                {slides.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            aspectRatio: '3/2',
                            background: '#111',
                            border: '2px dashed #333',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}
                    >
                        <FaImage style={{ fontSize: '3rem', color: '#666' }} />
                        <div style={{ color: '#888', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                Add Slides to Issue
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                {minSlides}-{maxSlides} slides required • 8.5" × 11" aspect ratio
                            </div>
                        </div>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="slides">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}
                                >
                                    {slides.map((slide, index) => (
                                        <Draggable key={index} draggableId={`slide-${index}`} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        background: '#111',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                        border: '1px solid #333',
                                                        display: 'grid',
                                                        gridTemplateColumns: 'auto 200px 1fr auto',
                                                        gap: '1rem',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#666' }}>
                                                        <FaGripVertical />
                                                    </div>

                                                    <div style={{
                                                        aspectRatio: '0.7727',
                                                        background: `url(${slide.preview})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        borderRadius: '8px',
                                                        border: '1px solid #333'
                                                    }} />

                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', color: '#7FFFD4', marginBottom: '0.5rem' }}>
                                                            {index === 0 && includeCover ? 'Cover Slide' : `Slide ${index + 1}`}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={slide.caption}
                                                            onChange={(e) => updateCaption(index, e.target.value)}
                                                            placeholder="Caption (optional)"
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.5rem',
                                                                background: '#000',
                                                                border: '1px solid #333',
                                                                borderRadius: '8px',
                                                                color: '#fff',
                                                                fontSize: '0.9rem'
                                                            }}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => removeSlide(index)}
                                                        style={{
                                                            background: 'rgba(255, 68, 68, 0.2)',
                                                            border: '1px solid rgba(255, 68, 68, 0.5)',
                                                            borderRadius: '8px',
                                                            width: '40px',
                                                            height: '40px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            color: '#ff4444'
                                                        }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                {/* Add More Button */}
                {slides.length > 0 && slides.length < maxSlides && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#111',
                            border: '2px dashed #333',
                            borderRadius: '12px',
                            color: '#7FFFD4',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        <FaPlus /> Add More Slides ({maxSlides - slides.length} remaining)
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default CreateMagazineIssue;
