import React from 'react';
import { FaCamera } from 'react-icons/fa';
import ManualExifForm from '@/components/ManualExifForm';
import { formatCameraModel } from '@/core/utils/exif';

/**
 * ManualExifEditor Component
 * 
 * Displays EXIF/camera data controls with:
 * - Header with edit/add button
 * - Display of existing EXIF data
 * - Manual EXIF form when editing
 * 
 * @param {Object} activeSlide - The currently active slide object
 * @param {number} activeSlideIndex - Index of active slide
 * @param {Object} showManualExif - Object mapping slide indices to show/hide state
 * @param {Function} setShowManualExif - Handler to toggle EXIF form visibility
 * @param {Function} handleManualExifSave - Handler to save EXIF data
 * @param {boolean} hasExif - Whether slide has EXIF data
 */
const ManualExifEditor = ({
    activeSlide,
    activeSlideIndex,
    showManualExif,
    setShowManualExif,
    handleManualExifSave,
    hasExif
}) => {
    return (
        <div className="exif-section">
            <div className="exif-header">
                <span><FaCamera /> Camera Data</span>
                <button
                    className="btn-edit-exif"
                    onClick={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: true }))}
                >
                    {hasExif ? 'Edit Data' : 'Add Data'}
                </button>
            </div>

            {hasExif && !showManualExif[activeSlideIndex] && (
                <div className="exif-display">
                    {formatCameraModel(
                        activeSlide.exif?.make || activeSlide.manualExif?.make,
                        activeSlide.exif?.model || activeSlide.manualExif?.model
                    )}
                </div>
            )}

            {showManualExif[activeSlideIndex] && (
                <ManualExifForm
                    existingExif={activeSlide.manualExif || activeSlide.exif}
                    onSave={handleManualExifSave}
                    onCancel={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: false }))}
                />
            )}
        </div>
    );
};

export default ManualExifEditor;
