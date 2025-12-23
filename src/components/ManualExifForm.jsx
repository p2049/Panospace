import React, { useState, useEffect } from 'react';
import { FaCamera, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import PanoDateInput from '@/components/common/PanoDateInput';

import { validateExifData } from '@/core/utils/exif';

/**
 * Manual EXIF Input Form
 * Allows users to manually enter camera metadata when EXIF extraction fails
 */
const ManualExifForm = ({ existingExif, onSave, onCancel, hideCameraLens = false }) => {
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

  // Helper to get local ISO string (YYYY-MM-DDTHH:mm) prevents timezone shifting
  const toLocalISOString = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Pre-fill with existing EXIF if available, or default to now for date
  useEffect(() => {
    // Default to current local time, not UTC
    const defaultDate = toLocalISOString(new Date());

    if (existingExif) {
      setFormData({
        make: existingExif.make || '',
        model: existingExif.model || '',
        lensModel: existingExif.lensModel || '',
        focalLength: existingExif.focalLength || '',
        fNumber: existingExif.fNumber || '',
        exposureTime: existingExif.exposureTime || '',
        iso: existingExif.iso || '',
        dateTime: existingExif.dateTime || defaultDate,
      });
    } else {
      // Initialize with default date if no existing data
      setFormData(prev => ({ ...prev, dateTime: defaultDate }));
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
        {/* Camera Make & Model - Hidden if Film Mode */}
        {!hideCameraLens && (
          <>
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
          </>
        )}

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
            step="1"
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
            step="50"
          />
        </div>

        {/* Shot Date */}
        <div className="exif-form-field full-width custom-datepicker-wrapper">
          <label>Shot Date</label>
          <PanoDateInput
            selected={formData.dateTime ? new Date(formData.dateTime) : new Date()}
            onChange={(date) => handleChange('dateTime', date ? toLocalISOString(date) : '')}
            showTimeSelect
            placeholder="Select date & time"
            popperPlacement="top-end"
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
          disabled={!validateExifData(formData)}
        >
          Save Camera Data
        </button>
      </div>

      {/* Scoped styles for layout */}
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
          width: 100%;
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

      {/* GLOBAL OVERRIDES FOR REACT-DATEPICKER POPAL */}
      <style>{`
         /* Force Input Text Color to Green */
         .custom-datepicker-wrapper input.exif-input {
             color: #7FFFD4 !important;
             font-family: 'Rajdhani', sans-serif !important;
             font-weight: 600 !important;
             letter-spacing: 0.5px !important; /* Tighter letter spacing */
             text-transform: uppercase !important;
             font-size: 0.85rem !important; /* Smaller font to fit date string */
             padding-right: 30px !important; /* Make room for icon */
             white-space: nowrap !important;
             overflow: hidden !important;
             text-overflow: ellipsis !important;
         }

         /* Main Container */
         .react-datepicker {
            font-family: 'Rajdhani', sans-serif !important;
            background-color: #0f0f0f !important;
            border: 1px solid rgba(127, 255, 212, 0.3) !important;
            border-radius: 12px !important;
            color: #fff !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.95) !important;
            font-size: 0.9rem !important;
            display: flex !important;
            overflow: hidden !important; /* Clip corners */
         }
         
         /* Remove default triangle/arrow pointer */
         .react-datepicker__triangle {
             display: none !important;
         }

         /* Header Section (Month/Year) */
         .react-datepicker__header {
            background-color: #161616 !important;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important;
            padding: 12px 0 8px 0 !important;
            position: relative !important;
            width: 280px !important;
         }
         
         /* Time Header Section */
         .react-datepicker__header--time {
             padding-top: 11px !important; /* Text down 1px more */
             padding-bottom: 4px !important; /* Box border UP (reduced padding) */
             padding-left: 0 !important;
             padding-right: 15px !important;
             width: 80px !important;
         }

         /* Navigation Arrows */
         .react-datepicker__navigation {
             position: absolute !important;
             top: 13px !important; 
             height: 24px !important;
             width: 24px !important;
             overflow: visible !important;
             z-index: 20 !important;
         }
         .react-datepicker__navigation--previous { 
             left: 10px !important; 
         }
         .react-datepicker__navigation--next { 
             left: 246px !important; /* Explicitly set left to avoid flex-start overlap */
             right: auto !important;
         }
         
         .react-datepicker__navigation-icon::before {
             border-color: #7FFFD4 !important;
             border-width: 2px 2px 0 0 !important;
             height: 8px !important;
             width: 8px !important;
             top: 6px !important; /* Center inside button */
             left: 6px !important;
         }

         /* Header Text */
         .react-datepicker__current-month, 
         .react-datepicker-time__header {
            color: #7FFFD4 !important;
            font-family: 'Orbitron', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 2px !important;
            font-size: 0.95rem !important;
            margin: 0 !important;
            line-height: 24px !important; /* Match arrow height */
            display: inline-block !important; /* Ensure line-height works */
         }

         /* Day Grid Container */
         .react-datepicker__month-container {
            width: 280px !important;
            background: #0f0f0f !important;
         }
         
         .react-datepicker__month {
             margin: 5px 10px 10px 10px !important; /* Tighter margins */
         }

         /* Day Names Row */
         .react-datepicker__day-names {
             margin-top: 5px !important;
         }
         .react-datepicker__day-name {
            color: rgba(255,255,255,0.4) !important;
            width: 2rem !important;
            line-height: 2rem !important;
            margin: 0.15rem !important;
            font-size: 0.8rem !important;
         }
         
         /* Individual Days */
         .react-datepicker__day {
            color: #fff !important; /* FORCE WHITE TEXT */
            border-radius: 50% !important;
            transition: all 0.2s !important;
            width: 2rem !important;
            line-height: 2rem !important;
            margin: 0.15rem !important;
            font-size: 0.9rem !important;
            background-color: transparent !important;
         }
         
         /* Selected Day & Today */
         .react-datepicker__day:hover {
            background-color: rgba(127, 255, 212, 0.15) !important;
            color: #7FFFD4 !important;
         }
         
         .react-datepicker__day--selected, 
         .react-datepicker__day--keyboard-selected {
            background-color: #7FFFD4 !important;
            color: #000 !important; /* Black text on selected */
            font-weight: 700 !important;
            box-shadow: 0 0 15px rgba(127,255,212,0.4) !important; 
         }
         
         /* Fix for blue default selection or today */
         .react-datepicker__day--today {
             border: 1px solid rgba(127, 255, 212, 0.5) !important;
             color: #7FFFD4 !important;
         }
         .react-datepicker__day--selected.react-datepicker__day--today {
             background-color: #7FFFD4 !important;
             color: #000 !important;
         }

         .react-datepicker__day--outside-month {
             color: rgba(255,255,255,0.1) !important;
         }

         /* Time Container */
         .react-datepicker__time-container {
            border-left: 1px solid rgba(255,255,255,0.08) !important;
            background-color: #0f0f0f !important;
            width: 80px !important;
         }
         
         .react-datepicker__time-box {
             border-radius: 0 !important;
             width: 100% !important;
             margin: 0 !important;
         }
         
         /* Scrollbar Styling for Time List */
         .react-datepicker__time-list {
             background-color: #0f0f0f !important;
             height: 230px !important; /* Reduce height to remove bottom space */
             padding: 0 !important;
         }
         .react-datepicker__time-list::-webkit-scrollbar {
             width: 4px;
             background: #0f0f0f;
         }
         .react-datepicker__time-list::-webkit-scrollbar-thumb {
             background: #333;
             border-radius: 2px;
         }

         .react-datepicker__time-list-item {
            color: #ccc !important;
            height: 36px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 0.85rem !important;
            transition: all 0.1s ease;
         }
         
         .react-datepicker__time-list-item:hover {
            background-color: rgba(127, 255, 212, 0.1) !important;
            color: #fff !important;
         }
         
         .react-datepicker__time-list-item--selected {
            background-color: rgba(127, 255, 212, 0.2) !important;
            color: #7FFFD4 !important;
            font-weight: 700 !important;
            border-left: 2px solid #7FFFD4 !important;
         }
      `}</style>
    </div>
  );
};

export default ManualExifForm;
