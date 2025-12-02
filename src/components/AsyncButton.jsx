import React from 'react';

/**
 * AsyncButton Component
 * A reusable button that handles loading states for async operations
 * 
 * @param {boolean} loading - Whether the button is in loading state
 * @param {function} onClick - Click handler function
 * @param {ReactNode} children - Button content (text/icons)
 * @param {string} loadingText - Optional custom loading text (defaults to children)
 * @param {boolean} disabled - Additional disabled state (combined with loading)
 * @param {string} variant - Button style variant: 'primary', 'secondary', 'danger', 'ghost', 'mint'
 * @param {string} size - Button size: 'sm', 'md', 'lg'
 * @param {object} style - Additional inline styles
 * @param {string} className - Additional CSS classes
 * @param {string} type - Button type attribute
 */
const AsyncButton = ({
    loading = false,
    onClick,
    children,
    loadingText,
    disabled = false,
    variant = 'primary',
    size = 'md',
    style = {},
    className = '',
    type = 'button',
    ...props
}) => {
    const isDisabled = loading || disabled;

    // Base styles
    const baseStyles = {
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.2s',
        fontWeight: '600',
        borderRadius: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        border: 'none',
        ...style
    };

    // Size styles
    const sizeStyles = {
        sm: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem'
        },
        md: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem'
        },
        lg: {
            padding: '1rem 2rem',
            fontSize: '1.125rem'
        }
    };

    // Variant styles
    const variantStyles = {
        primary: {
            background: '#7FFFD4',
            color: '#000'
        },
        mint: {
            background: '#7FFFD4',
            color: '#000'
        },
        secondary: {
            background: '#333',
            color: '#fff',
            border: '1px solid #555'
        },
        danger: {
            background: '#ff4444',
            color: '#fff'
        },
        ghost: {
            background: 'transparent',
            color: '#7FFFD4',
            border: '2px solid #7FFFD4'
        },
        outline: {
            background: 'transparent',
            color: '#fff',
            border: '1px solid #333'
        }
    };

    const combinedStyles = {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant]
    };

    // Display loading text or children
    const displayContent = loading && loadingText ? loadingText : children;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            style={combinedStyles}
            className={className}
            {...props}
        >
            {loading && (
                <span style={{
                    display: 'inline-block',
                    width: '1em',
                    height: '1em',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                }}>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </span>
            )}
            {displayContent}
        </button>
    );
};

export default AsyncButton;
