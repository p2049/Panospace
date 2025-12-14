/**
 * Image Size Warning Modal
 * Shown when an image exceeds the allowed size limit
 * Offers options to scale down, upgrade, or cancel
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaCompress, FaCrown, FaTimes } from 'react-icons/fa';

const ImageSizeWarningModal = ({
    isOpen,
    imageName,
    actualSize,      // e.g. "24.6MB"
    limitSize,       // e.g. 20
    isPremium,
    onScaleDown,
    onUpgrade,
    onCancel,
    isScaling = false,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '1rem',
                }}
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-card, #0a0f0f)',
                        border: '1px solid rgba(255, 170, 0, 0.3)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '420px',
                        width: '100%',
                        boxShadow: '0 0 40px rgba(255, 170, 0, 0.2)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(255, 170, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FaExclamationTriangle size={24} color="#ffaa00" />
                        </div>
                        <div>
                            <h2 style={{
                                color: '#ffaa00',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                margin: 0,
                            }}>
                                Image Too Large
                            </h2>
                            <p style={{
                                color: 'var(--text-secondary, #6b7f78)',
                                fontSize: '0.85rem',
                                margin: 0,
                            }}>
                                {imageName}
                            </p>
                        </div>
                    </div>

                    {/* Size Info */}
                    <div style={{
                        background: 'rgba(255, 170, 0, 0.08)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                        }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Image size:</span>
                            <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{actualSize}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {isPremium ? 'Premium' : 'Free'} limit:
                            </span>
                            <span style={{ color: 'var(--accent, #6effd8)', fontWeight: 'bold' }}>
                                {limitSize}MB
                            </span>
                        </div>
                    </div>

                    {/* Options */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        {/* Scale Down Option */}
                        <button
                            onClick={onScaleDown}
                            disabled={isScaling}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--accent, #6effd8)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: isScaling ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                opacity: isScaling ? 0.7 : 1,
                                transition: 'all 0.2s',
                            }}
                        >
                            <FaCompress size={18} />
                            {isScaling ? 'Scaling image...' : 'Scale down to fit (recommended)'}
                        </button>

                        {/* Upgrade Option - Only for free users */}
                        {!isPremium && (
                            <button
                                onClick={onUpgrade}
                                disabled={isScaling}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(255, 215, 0, 0.15)',
                                    color: '#ffd700',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <FaCrown size={16} />
                                Upgrade to Space Creator (30MB limit)
                            </button>
                        )}

                        {/* Cancel Option */}
                        <button
                            onClick={onCancel}
                            disabled={isScaling}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'transparent',
                                color: 'var(--text-secondary, #6b7f78)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <FaTimes size={14} />
                            Cancel and remove this image
                        </button>
                    </div>

                    {/* Help Text */}
                    <p style={{
                        color: 'var(--text-secondary, #6b7f78)',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        marginTop: '1rem',
                        marginBottom: 0,
                        opacity: 0.8,
                    }}>
                        Scaling preserves aspect ratio and visual quality.
                        {!isPremium && ' Premium users can upload files up to 30MB.'}
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageSizeWarningModal;
