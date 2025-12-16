import React, { useState, useRef } from 'react';
import { FaImage, FaTimes, FaCalendar, FaClock, FaUpload, FaCheck } from 'react-icons/fa';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { getSubmissionLimit } from '@/core/constants/magazineConfig';
import { notifyNewSubmission } from '@/services/notificationService';

const MagazineSubmissionBox = ({ magazine, gallery, nextIssue }) => {
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const memberCount = gallery?.members?.length || 0;
    const submissionLimit = getSubmissionLimit(memberCount);
    const submissionDeadline = nextIssue?.scheduledPublishDate?.toDate ? nextIssue.scheduledPublishDate.toDate() : null;

    // Calculate deadline (1 day before publish date)
    const imageDeadline = submissionDeadline ? new Date(submissionDeadline.getTime() - 24 * 60 * 60 * 1000) : null;
    const now = new Date();
    const isBeforeDeadline = imageDeadline ? now < imageDeadline : false;

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const remainingSlots = submissionLimit - images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newImages = await Promise.all(
            filesToAdd.map(async (file) => {
                const preview = URL.createObjectURL(file);
                return { file, preview, caption: '' };
            })
        );

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const updateCaption = (index, caption) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            alert('Please select at least one image to submit');
            return;
        }

        if (!isBeforeDeadline) {
            alert('Submission deadline has passed');
            return;
        }

        try {
            setUploading(true);

            // Upload images
            const uploadedImages = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const path = `magazines/${magazine.id}/submissions/${currentUser.uid}/${Date.now()}_${i}_${image.file.name}`;

                const { uploadFile } = await import('@/services/storageUploader');
                const result = await uploadFile({
                    file: image.file,
                    path
                });

                const imageUrl = result.downloadURL;

                uploadedImages.push({
                    imageUrl,
                    storagePath: fileName,
                    caption: image.caption,
                    submittedAt: serverTimestamp()
                });
            }

            // Create submission document
            const submissionData = {
                magazineId: magazine.id,
                issueId: nextIssue.id,
                galleryId: gallery.id,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                images: uploadedImages,
                status: 'pending',
                reviewedAt: null,
                submissionDeadline: imageDeadline,
                submittedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'magazineSubmissions'), submissionData);

            // Notify magazine creator
            await notifyNewSubmission(
                magazine.ownerId,
                magazine.title,
                currentUser.displayName || 'Anonymous',
                nextIssue.issueNumber
            );

            setSubmitted(true);
            setImages([]);
            alert('Submission successful! The magazine creator will review your photos.');
        } catch (err) {
            console.error('Error submitting images:', err);
            alert(`Failed to submit: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (!magazine?.collaborationEnabled || !gallery || !nextIssue) {
        return null;
    }

    return (
        <div style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <FaImage style={{ color: '#7FFFD4', fontSize: '1.5rem' }} />
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#7FFFD4' }}>
                        Magazine Submission: {magazine.title}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.9rem' }}>
                        Issue #{nextIssue.issueNumber}
                    </p>
                </div>
            </div>

            {/* Deadlines */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#000', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <FaCalendar style={{ color: '#7FFFD4' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Publish Date</div>
                        <div style={{ fontSize: '0.9rem' }}>
                            {submissionDeadline?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: isBeforeDeadline ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${isBeforeDeadline ? 'rgba(127, 255, 212, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`
                }}>
                    <FaClock style={{ color: isBeforeDeadline ? '#7FFFD4' : '#ff4444' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Submission Deadline</div>
                        <div style={{ fontSize: '0.9rem', color: isBeforeDeadline ? '#7FFFD4' : '#ff4444' }}>
                            {imageDeadline?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Limit Info */}
            <div style={{
                background: 'rgba(127, 255, 212, 0.1)',
                border: '1px solid rgba(127, 255, 212, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: '#7FFFD4'
            }}>
                You can submit up to <strong>{submissionLimit}</strong> photo{submissionLimit > 1 ? 's' : ''}
                {' '}(Gallery size: {memberCount} members)
            </div>

            {submitted ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'rgba(127, 255, 212, 0.1)',
                    border: '1px solid rgba(127, 255, 212, 0.3)',
                    borderRadius: '8px'
                }}>
                    <FaCheck style={{ fontSize: '3rem', color: '#7FFFD4', marginBottom: '1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#7FFFD4' }}>Submission Received!</h4>
                    <p style={{ margin: 0, color: '#888' }}>
                        The magazine creator will review your photos and select the final images for publication.
                    </p>
                </div>
            ) : !isBeforeDeadline ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'rgba(255, 68, 68, 0.1)',
                    border: '1px solid rgba(255, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ff4444'
                }}>
                    <FaClock style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Submission Deadline Passed</h4>
                    <p style={{ margin: 0, color: '#888' }}>
                        The deadline for this issue was {imageDeadline?.toLocaleDateString()}
                    </p>
                </div>
            ) : (
                <>
                    {/* Image Upload Area */}
                    {images.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed #333',
                                borderRadius: '8px',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: '#000',
                                marginBottom: '1rem'
                            }}
                        >
                            <FaUpload style={{ fontSize: '2rem', color: '#666', marginBottom: '1rem' }} />
                            <div style={{ color: '#888' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    Click to upload images
                                </div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    Up to {submissionLimit} image{submissionLimit > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                {images.map((img, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <div style={{
                                            aspectRatio: '1',
                                            background: `url(${img.preview})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '8px',
                                            border: '1px solid #333'
                                        }} />
                                        <button
                                            onClick={() => removeImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                background: 'rgba(0,0,0,0.8)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#fff'
                                            }}
                                        >
                                            <FaTimes />
                                        </button>
                                        <input
                                            type="text"
                                            value={img.caption}
                                            onChange={(e) => updateCaption(index, e.target.value)}
                                            placeholder="Caption (optional)"
                                            style={{
                                                width: '100%',
                                                marginTop: '0.5rem',
                                                padding: '0.5rem',
                                                background: '#000',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {images.length < submissionLimit && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#000',
                                        border: '1px dashed #333',
                                        borderRadius: '8px',
                                        color: '#7FFFD4',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <FaUpload /> Add More ({submissionLimit - images.length} remaining)
                                </button>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    {images.length > 0 && (
                        <button
                            onClick={handleSubmit}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: uploading ? '#333' : '#7FFFD4',
                                color: uploading ? '#666' : '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: uploading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {uploading ? 'Submitting...' : 'Submit Photos'}
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
                </>
            )}
        </div>
    );
};

export default MagazineSubmissionBox;
