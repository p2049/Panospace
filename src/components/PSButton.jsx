import React from 'react';
import PropTypes from 'prop-types';

/**
 * PanoSpace Button Component
 * Standardized button with consistent styling across the app
 * 
 * @param {string} variant - Button style variant: 'mint' | 'dark' | 'glass' | 'ghost' | 'danger'
 * @param {boolean} active - Whether button is in active/selected state
 * @param {string} size - Button size: 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} disabled - Whether button is disabled
 * @param {React.ReactNode} icon - Optional icon to display
 * @param {React.ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {object} style - Additional inline styles to merge
 * @param {string} className - Additional CSS classes
 */
const PSButton = ({
    variant = 'mint',
    active = false,
    size = 'md',
    fullWidth = false,
    disabled = false,
    icon = null,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    style = {},
    className = '',
    type = 'button',
    ...rest
}) => {
    // Size configurations
    const sizeStyles = {
        sm: {
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            gap: '0.3rem'
        },
        md: {
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            gap: '0.5rem'
        },
        lg: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            gap: '0.5rem'
        }
    };

    // Variant configurations
    const variantStyles = {
        mint: {
            background: active ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: active ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.6)',
            border: active ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: active ? '0 0 15px rgba(127, 255, 212, 0.2), inset 0 0 10px rgba(127, 255, 212, 0.05)' : 'none',
            hover: {
                background: active ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: active ? 'var(--ice-mint)' : '#fff'
            }
        },
        dark: {
            background: active ? 'rgba(127, 255, 212, 0.1)' : '#111',
            color: active ? '#7FFFD4' : '#888',
            border: active ? '1px solid #7FFFD4' : '1px solid #333',
            boxShadow: 'none',
            hover: {
                background: active ? 'rgba(127, 255, 212, 0.15)' : '#1a1a1a',
                color: active ? '#7FFFD4' : '#fff'
            }
        },
        glass: {
            background: active ? 'rgba(127, 255, 212, 0.15)' : 'rgba(0, 0, 0, 0.6)',
            color: active ? 'var(--ice-mint)' : '#fff',
            border: active ? '1px solid var(--ice-mint)' : '1px solid rgba(127, 255, 212, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: active ? '0 0 25px rgba(127, 255, 212, 0.15)' : '0 0 20px rgba(0, 0, 0, 0.5)',
            hover: {
                background: active ? 'rgba(127, 255, 212, 0.2)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: 'var(--ice-mint)',
                boxShadow: '0 0 25px rgba(127, 255, 212, 0.15)'
            }
        },
        ghost: {
            background: 'transparent',
            color: active ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.7)',
            border: active ? '1px solid var(--ice-mint)' : '1px solid transparent',
            boxShadow: 'none',
            hover: {
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--ice-mint)',
                border: '1px solid rgba(127, 255, 212, 0.3)'
            }
        },
        danger: {
            background: active ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.1)',
            color: active ? '#ff4444' : 'rgba(255, 68, 68, 0.8)',
            border: active ? '1px solid #ff4444' : '1px solid rgba(255, 68, 68, 0.3)',
            boxShadow: active ? '0 0 15px rgba(255, 68, 68, 0.2)' : 'none',
            hover: {
                background: 'rgba(255, 68, 68, 0.25)',
                color: '#ff4444',
                borderColor: '#ff4444'
            }
        }
    };

    const currentSize = sizeStyles[size];
    const currentVariant = variantStyles[variant];

    const baseStyles = {
        ...currentSize,
        ...currentVariant,
        width: fullWidth ? '100%' : 'auto',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: active ? '700' : '500',
        fontFamily: 'var(--font-family-heading)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        ...style
    };

    const handleMouseEnter = (e) => {
        if (!disabled && !active && currentVariant.hover) {
            Object.assign(e.currentTarget.style, currentVariant.hover);
        }
        if (onMouseEnter) onMouseEnter(e);
    };

    const handleMouseLeave = (e) => {
        if (!disabled && !active) {
            e.currentTarget.style.background = currentVariant.background;
            e.currentTarget.style.color = currentVariant.color;
            e.currentTarget.style.borderColor = currentVariant.border?.split(' ')[2] || '';
            if (currentVariant.boxShadow) {
                e.currentTarget.style.boxShadow = currentVariant.boxShadow;
            }
        }
        if (onMouseLeave) onMouseLeave(e);
    };

    return (
        <button
            type={type}
            onClick={disabled ? undefined : onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={baseStyles}
            className={className}
            disabled={disabled}
            {...rest}
        >
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {children && <span>{children}</span>}
        </button>
    );
};

PSButton.propTypes = {
    variant: PropTypes.oneOf(['mint', 'dark', 'glass', 'ghost', 'danger']),
    active: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    fullWidth: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.node,
    children: PropTypes.node,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    type: PropTypes.string
};

export default PSButton;
