import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * HeaderBar Component
 * 
 * Reusable header bar with back button and title
 * 
 * @param {string} title - Header title text
 * @param {function} onBack - Optional custom back handler (defaults to navigate(-1))
 * @param {ReactNode} rightSlot - Optional content for right side of header
 * @param {object} style - Optional additional styles for the header container
 * @param {string} variant - Style variant: 'default', 'sticky', 'gradient' (default: 'sticky')
 */
const HeaderBar = ({
    title,
    onBack,
    rightSlot,
    style = {},
    variant = 'sticky'
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    // Base styles
    const baseStyles = {
        padding: '2rem',
        borderBottom: '1px solid #333',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    };

    // Variant styles
    const variantStyles = {
        default: {},
        sticky: {
            position: 'sticky',
            top: 0,
            zIndex: 100
        },
        gradient: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderBottom: '2px solid #7FFFD4',
            position: 'sticky',
            top: 0,
            zIndex: 100
        },
        blur: {
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #222',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }
    };

    const containerStyles = {
        ...baseStyles,
        ...variantStyles[variant],
        ...style
    };

    return (
        <div style={containerStyles}>
            <button
                onClick={handleBack}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    padding: 0
                }}
            >
                <FaArrowLeft />
            </button>
            <h1 style={{
                fontSize: '1.2rem',
                margin: 0,
                flex: 1
            }}>
                {title}
            </h1>
            {rightSlot && (
                <div style={{ marginLeft: 'auto' }}>
                    {rightSlot}
                </div>
            )}
        </div>
    );
};

export default HeaderBar;
