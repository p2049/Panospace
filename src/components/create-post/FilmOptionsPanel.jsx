import React from 'react';
import { FaMagic } from 'react-icons/fa';
import { FILM_STOCKS, FILM_FORMATS, COMMON_FILM_ISOS } from '@/core/constants/filmStocks';
import { generateQuartzDateString, QUARTZ_DATE_FORMATS } from '@/core/utils/exif';

/**
 * FilmOptionsPanel Component
 * 
 * Displays film photography settings with:
 * - Master toggle for film mode
 * - Film stock, format, and ISO selectors
 * - Camera and lens overrides
 * - Quartz date stamp options
 * - Film strip border toggle
 * 
 * @param {Object} filmMetadata - Film metadata state object
 * @param {Function} setFilmMetadata - Handler to update film metadata
 * @param {boolean} enableQuartzDate - Whether quartz date is enabled
 * @param {Function} setEnableQuartzDate - Handler to toggle quartz date
 * @param {string} quartzDateString - Date string for quartz stamp
 * @param {Function} setQuartzDateString - Handler to update date string
 * @param {string} quartzColor - Color for quartz date
 * @param {Function} setQuartzColor - Handler to update quartz color
 * @param {string} quartzDateFormat - Format for quartz date
 * @param {Function} setQuartzDateFormat - Handler to update date format
 * @param {boolean} enableSprocketOverlay - Whether film border is enabled
 * @param {Function} setEnableSprocketOverlay - Handler to toggle film border
 * @param {boolean} enableInstantPhotoOverlay - Whether instant photo border is enabled
 * @param {Function} setEnableInstantPhotoOverlay - Handler to toggle instant photo border
 * @param {number} instantPhotoCount - Number of instant photos per slide (1-3)
 * @param {Function} setInstantPhotoCount - Handler to set count
 */
const FilmOptionsPanel = ({
    filmMetadata,
    setFilmMetadata,
    enableQuartzDate,
    setEnableQuartzDate,
    quartzDateString,
    setQuartzDateString,
    quartzColor,
    setQuartzColor,
    quartzDateFormat,
    setQuartzDateFormat,
    enableSprocketOverlay,
    setEnableSprocketOverlay,
    enableInstantPhotoOverlay,
    setEnableInstantPhotoOverlay
}) => {
    return (
        <div className="form-section">
            {/* Master Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: filmMetadata.isFilm ? '0.75rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaMagic style={{ color: '#7FFFD4' }} />
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>Film Photography</span>
                </div>
                <div style={{ position: 'relative', width: '40px', height: '20px' }}>
                    <input
                        type="checkbox"
                        checked={filmMetadata.isFilm}
                        onChange={(e) => setFilmMetadata({ ...filmMetadata, isFilm: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: filmMetadata.isFilm ? '#7FFFD4' : '#333',
                        borderRadius: '20px', transition: '0.3s'
                    }}></div>
                    <div style={{
                        position: 'absolute', top: '2px', left: filmMetadata.isFilm ? '22px' : '2px',
                        width: '16px', height: '16px', background: '#fff',
                        borderRadius: '50%', transition: '0.3s'
                    }}></div>
                </div>
            </label>

            {filmMetadata.isFilm && (
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    {/* Metadata Row - Compact */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <select
                            value={filmMetadata.stock}
                            onChange={(e) => setFilmMetadata({ ...filmMetadata, stock: e.target.value })}
                            className="form-input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                        >
                            <option value="" style={{ background: '#000' }}>Stock...</option>
                            {FILM_STOCKS.map(stock => <option key={stock} value={stock} style={{ background: '#000' }}>{stock}</option>)}
                        </select>
                        <select
                            value={filmMetadata.format}
                            onChange={(e) => setFilmMetadata({ ...filmMetadata, format: e.target.value })}
                            className="form-input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                        >
                            <option value="" style={{ background: '#000' }}>Format...</option>
                            {FILM_FORMATS.map(fmt => <option key={fmt} value={fmt} style={{ background: '#000' }}>{fmt}</option>)}
                        </select>
                        <select
                            value={filmMetadata.iso}
                            onChange={(e) => setFilmMetadata({ ...filmMetadata, iso: e.target.value })}
                            className="form-input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                        >
                            <option value="" style={{ background: '#000' }}>ISO...</option>
                            {COMMON_FILM_ISOS.map(iso => <option key={iso} value={iso} style={{ background: '#000' }}>{iso}</option>)}
                        </select>
                    </div>

                    {/* Secondary Metadata Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Camera (e.g. Canon AE-1)"
                            value={filmMetadata.cameraOverride}
                            onChange={(e) => setFilmMetadata({ ...filmMetadata, cameraOverride: e.target.value })}
                            className="form-input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                        />
                        <input
                            type="text"
                            placeholder="Lens (e.g. 50mm f/1.8)"
                            value={filmMetadata.lensOverride}
                            onChange={(e) => setFilmMetadata({ ...filmMetadata, lensOverride: e.target.value })}
                            className="form-input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                        />
                    </div>

                    {/* Visuals Subsection (Quartz Only) */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(127, 255, 212, 0.2)' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ice-mint)', marginBottom: '0.5rem', opacity: 0.8 }}>
                            Visuals
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* Date Stamp Toggle */}
                            <div style={{ flex: 1.5, minWidth: '160px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', lineHeight: '1' }}>
                                    <input
                                        type="checkbox"
                                        checked={enableQuartzDate}
                                        onChange={(e) => setEnableQuartzDate(e.target.checked)}
                                        style={{ width: '18px', height: '18px', margin: 0, flexShrink: 0 }}
                                    />
                                    <span style={{ marginTop: '1px' }}>Quartz Date Stamp</span>
                                </label>

                                {enableQuartzDate && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={quartzDateString}
                                            onChange={(e) => setQuartzDateString(e.target.value)}
                                            className="form-input"
                                            placeholder="D M 'Y"
                                            style={{ padding: '0.3rem', fontSize: '0.8rem', width: '100%', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Color:</span>
                                            <button
                                                type="button"
                                                onClick={() => setQuartzColor('#7FFFD4')}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    background: '#7FFFD4',
                                                    border: quartzColor === '#7FFFD4' ? '2px solid #fff' : '1px solid #333',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    boxShadow: quartzColor === '#7FFFD4' ? '0 0 8px #7FFFD4' : 'none'
                                                }}
                                                title="PanoSpace Green"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setQuartzColor('#FF4500')}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    background: '#FF4500',
                                                    border: quartzColor === '#FF4500' ? '2px solid #fff' : '1px solid #333',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    boxShadow: quartzColor === '#FF4500' ? '0 0 8px #FF4500' : 'none'
                                                }}
                                                title="Film Orange"
                                            />
                                            <input
                                                type="color"
                                                value={quartzColor}
                                                onChange={(e) => setQuartzColor(e.target.value)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    border: '1px solid #333',
                                                    borderRadius: '4px',
                                                    background: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                title="Custom Color"
                                            />
                                        </div>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Date Format:</label>


                                            <select
                                                value={quartzDateFormat}
                                                onChange={(e) => {
                                                    const newFormat = e.target.value;
                                                    setQuartzDateFormat(newFormat);
                                                    // Auto-update the text string based on format
                                                    const newText = generateQuartzDateString(newFormat);
                                                    setQuartzDateString(newText);
                                                }}
                                                className="form-input"
                                                style={{ padding: '0.3rem', fontSize: '0.8rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(127, 255, 212, 0.3)', color: '#fff' }}
                                            >
                                                {QUARTZ_DATE_FORMATS.map(fmt => (
                                                    <option key={fmt.value} value={fmt.value} style={{ background: '#000' }}>{fmt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Borders Column */}
                            <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {/* Film Border Toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', lineHeight: '1' }}>
                                    <input
                                        type="checkbox"
                                        checked={enableSprocketOverlay}
                                        onChange={(e) => setEnableSprocketOverlay(e.target.checked)}
                                        style={{ width: '18px', height: '18px', margin: 0, flexShrink: 0 }}
                                    />
                                    <span style={{ marginTop: '1px' }}>Film Strip Border</span>
                                </label>

                                {/* Instant Photo Toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', lineHeight: '1' }}>
                                    <input
                                        type="checkbox"
                                        checked={enableInstantPhotoOverlay}
                                        onChange={(e) => setEnableInstantPhotoOverlay(e.target.checked)}
                                        style={{ width: '18px', height: '18px', margin: 0, flexShrink: 0 }}
                                    />
                                    <span style={{ marginTop: '1px' }}>Instant Photo UI</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilmOptionsPanel;
