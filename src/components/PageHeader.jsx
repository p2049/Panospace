import React from 'react';
import PropTypes from 'prop-types';

/**
 * PageHeader Component
 * Standardized sticky header for pages with title, optional actions, and progress bar
 * 
 * Common pattern across CreatePost, CreateCollection, Calendar, etc.
 */
const PageHeader = ({
    title,
    leftAction = null,
    rightAction = null,
    showProgress = false,
    progress = 0,
    sticky = true,
    borderBottom = true,
    children = null,
    style = {},
    contentStyle = {}
}) => {
    return (
        <>
            <div style={{
                padding: '1rem 2rem',
                borderBottom: borderBottom ? '1px solid #333' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: sticky ? 'sticky' : 'relative',
                top: sticky ? 0 : 'auto',
                background: '#000',
                zIndex: 100,
                ...style
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    ...contentStyle
                }}>
                    {/* Left Action (e.g., Cancel button) */}
                    {leftAction && <div>{leftAction}</div>}

                    {/* Title */}
                    <h1 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        margin: 0,
                        flex: leftAction && rightAction ? 1 : 'none',
                        textAlign: leftAction && rightAction ? 'center' : 'left'
                    }}>
                        {title}
                    </h1>

                    {/* Right Action (e.g., Submit button) */}
                    {rightAction && <div>{rightAction}</div>}

                    {/* Custom children (for complex headers) */}
                    {children}
                </div>
            </div>

            {/* Progress Bar */}
            {showProgress && (
                <div style={{ width: '100%', height: '4px', background: '#333' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--ice-mint)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            )}
        </>
    );
};

PageHeader.propTypes = {
    title: PropTypes.node.isRequired,
    leftAction: PropTypes.node,
    rightAction: PropTypes.node,
    showProgress: PropTypes.bool,
    progress: PropTypes.number,
    sticky: PropTypes.bool,
    borderBottom: PropTypes.bool,
    children: PropTypes.node,
    style: PropTypes.object,
    contentStyle: PropTypes.object
};

export default PageHeader;
