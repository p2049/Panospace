import React, { useState, useEffect } from 'react';
import { FaCamera, FaTimes } from 'react-icons/fa';

/**
 * Manual EXIF Input Form
 * Allows users to manually enter camera metadata when EXIF extraction fails
 */
const ManualExifForm = ({ existingExif, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        lensModel: '',
        focalLength: '',
        fNumber: '',
        exposureTime: '',
        iso: '',
        dateTime: '',
    });

    // Pre-fill with existing EXIF if available
    useEffect(() => {
        if (existingExif) {
            setFormData({
                make: existingExif.make || '',
                model: existingExif.model || '',
                lensModel: existingExif.lensModel || '',
                focalLength: existingExif.focalLength || '',
                fNumber: existingExif.fNumber || '',
                exposureTime: existingExif.exposureTime || '',
                iso: existingExif.iso || '',
                dateTime: existingExif.dateTime || '',
            });
        }
    }, [existingExif]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Build EXIF object matching the extracted EXIF structure
        const exifData = {};

        if (formData.make) exifData.make = formData.make;
        if (formData.model) exifData.model = formData.model;
        if (formData.lensModel) exifData.lensModel = formData.lensModel;
        if (formData.focalLength) exifData.focalLength = Number(formData.focalLength);
        if (formData.fNumber) exifData.fNumber = Number(formData.fNumber);
        if (formData.exposureTime) exifData.exposureTime = formData.exposureTime;
        if (formData.iso) exifData.iso = Number(formData.iso);
        if (formData.dateTime) exifData.dateTime = formData.dateTime;

        onSave(exifData);
    };

    const isValid = () => {
        // At least one field should be filled
        return Object.values(formData).some(val => val && val.toString().trim() !== '');
    };

    return (
        <div className="manual-exif-form">
            <div className="exif-form-header">
                <div className="exif-form-title">
                    <FaCamera style={{ marginRight: '0.5rem' }} />
                    <span>Manual Camera Data</span>
                </div>
                <button
                    onClick={onCancel}
                    className="exif-close-btn"
                    aria-label="Close"
                >
                    <FaTimes />
                </button>
            </div>

            <div className="exif-form-grid">
                {/* Camera Make */}
                <div className="exif-form-field">
                    <label>Camera Make</label>
                    <input
                        type="text"
                        value={formData.make}
                        onChange={(e) => handleChange('make', e.target.value)}
                        placeholder="e.g., Canon, Nikon, Sony"
                        className="exif-input"
                    />
                </div>

                {/* Camera Model */}
                <div className="exif-form-field">
                    <label>Camera Model</label>
                    <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        placeholder="e.g., EOS R5, Z9, A7R IV"
                        className="exif-input"
                    />
                </div>

                {/* Lens Model */}
                <div className="exif-form-field full-width">
                    <label>Lens Model</label>
                    <input
                        type="text"
                        value={formData.lensModel}
                        onChange={(e) => handleChange('lensModel', e.target.value)}
                        placeholder="e.g., RF 24-70mm f/2.8L"
                        className="exif-input"
                    />
                </div>

                {/* Focal Length */}
                <div className="exif-form-field">
                    <label>Focal Length (mm)</label>
                    <input
                        type="number"
                        value={formData.focalLength}
                        onChange={(e) => handleChange('focalLength', e.target.value)}
                        placeholder="e.g., 50"
                        className="exif-input"
                        min="1"
                        max="2000"
                    />
                </div>

                {/* Aperture */}
                <div className="exif-form-field">
                    <label>Aperture (f-stop)</label>
                    <input
                        type="number"
                        value={formData.fNumber}
                        onChange={(e) => handleChange('fNumber', e.target.value)}
                        placeholder="e.g., 2.8"
                        className="exif-input"
                        step="0.1"
                        min="0.7"
                        max="64"
                    />
                </div>

                {/* Shutter Speed */}
                <div className="exif-form-field">
                    <label>Shutter Speed</label>
                    <input
                        type="text"
                        value={formData.exposureTime}
                        onChange={(e) => handleChange('exposureTime', e.target.value)}
                        placeholder="e.g., 1/250 or 2s"
                        className="exif-input"
                    />
                </div>

                {/* ISO */}
                <div className="exif-form-field">
                    <label>ISO</label>
                    <input
                        type="number"
                        value={formData.iso}
                        onChange={(e) => handleChange('iso', e.target.value)}
                        placeholder="e.g., 100, 400, 3200"
                        className="exif-input"
                        min="50"
                        max="409600"
                    />
                </div>

                {/* Shot Date */}
                <div className="exif-form-field full-width">
                    <label>Shot Date</label>
                    <input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => handleChange('dateTime', e.target.value)}
                        className="exif-input"
                    />
                </div>
            </div>

            <div className="exif-form-actions">
                <button
                    onClick={onCancel}
                    className="exif-btn-secondary"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="exif-btn-primary"
                    disabled={!isValid()}
                >
                    Save Camera Data
                </button>
            </div>

            <style jsx>{`
        .manual-exif-form {
          background: var(--graphite);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .exif-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .exif-form-title {
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ice-mint);
        }

        .exif-close-btn {
          background: transparent;
          border: none;
          color: var(--slate);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .exif-close-btn:hover {
          color: #fff;
        }

        .exif-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .exif-form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .exif-form-field.full-width {
          grid-column: 1 / -1;
        }

        .exif-form-field label {
          font-size: 0.85rem;
          color: var(--slate);
          font-weight: 500;
        }

        .exif-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem;
          color: #fff;
          font-size: 0.9rem;
          transition: border-color 0.2s, background 0.2s;
        }

        .exif-input:focus {
          outline: none;
          border-color: var(--ice-mint);
          background: rgba(0, 0, 0, 0.5);
        }

        .exif-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .exif-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .exif-btn-secondary,
        .exif-btn-primary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .exif-btn-secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--slate);
        }

        .exif-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .exif-btn-primary {
          background: var(--ice-mint);
          color: var(--black);
        }

        .exif-btn-primary:hover:not(:disabled) {
          background: #7fffd4;
          box-shadow: 0 0 20px rgba(127, 255, 212, 0.3);
        }

        .exif-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .exif-form-grid {
            grid-template-columns: 1fr;
          }

          .exif-form-field.full-width {
            grid-column: 1;
          }
        }
      `}</style>
        </div>
    );
};

export default ManualExifForm;
