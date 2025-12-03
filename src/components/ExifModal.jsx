import React from 'react';
import { FaTimes, FaCamera } from 'react-icons/fa';
import { formatAperture, formatExifDate } from '../utils/exifUtils';

const ExifModal = ({ exifData, onClose }) => {
    if (!exifData) return null;

    const exifFields = [
        { label: 'Camera', key: 'make', format: (val) => val },
        { label: 'Model', key: 'model', format: (val) => val },
        { label: 'Lens', key: 'lens', format: (val) => val },
        { label: 'Focal Length', key: 'focalLength', format: (val) => val },
        { label: 'Aperture', key: 'aperture', format: formatAperture },
        { label: 'ISO', key: 'iso', format: (val) => val },
        { label: 'Shutter Speed', key: 'shutterSpeed', format: (val) => val },
        { label: 'Date Taken', key: 'date', format: formatExifDate }
    ];

    const availableFields = exifFields.filter(field => exifData[field.key]);

    if (availableFields.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.98)',
                backdropFilter: 'blur(10px)',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '1.5rem',
                zIndex: 10000,
                maxHeight: '60vh',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease-out',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
                border: '1px solid #333',
                borderBottom: 'none'
            }}
            onClick={(e) => {
                // Close when tapping outside the content
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FaCamera size={20} style={{ color: '#4CAF50' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>EXIF Data</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* EXIF Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {availableFields.map(field => (
                    <div key={field.key} style={{ padding: '0.75rem', background: '#111', borderRadius: '8px', border: '1px solid #222' }}>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {field.label}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>
                            {field.format(exifData[field.key])}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExifModal;
