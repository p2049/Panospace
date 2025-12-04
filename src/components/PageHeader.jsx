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
    contentStyle = {},
    bottomSlot = null,
    bottomSlotStyle = {}
}) => {
    return (
        <>
            <style>{`
                .page-header-container {
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #333;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    background: #000;
                    z-index: 100;
                    padding-top: max(1rem, env(safe-area-inset-top));
                    padding-left: max(2rem, env(safe-area-inset-left));
                    padding-right: max(2rem, env(safe-area-inset-right));
                }
                .page-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .page-header-title {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin: 0;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                @media (max-width: 768px) {
                    .page-header-container {
                        padding: 0.75rem 1rem;
                        padding-top: max(0.75rem, env(safe-area-inset-top));
                        padding-left: max(1rem, env(safe-area-inset-left));
                        padding-right: max(1rem, env(safe-area-inset-right));
                        width: 100%;
                        max-width: 100vw;
                        box-sizing: border-box;
                        overflow-x: hidden;
                    }
                    .page-header-content {
                        width: 100%;
                        max-width: 100%;
                        box-sizing: border-box;
                        gap: 0.5rem;
                    }
                    .page-header-title {
                        font-size: 1rem;
                        min-width: 0;
                    }
                }
                @media (max-width: 480px) {
                    .page-header-container {
                        padding: 0.5rem 0.75rem;
                        padding-top: max(0.5rem, env(safe-area-inset-top));
                    }
                    .page-header-title {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
            <div
                className="page-header-container"
                style={{
                    borderBottom: borderBottom ? '1px solid #333' : 'none',
                    position: sticky ? 'sticky' : 'relative',
                    top: sticky ? 0 : 'auto',
                    ...style
                }}
            >
                <div
                    className="page-header-content"
                    style={contentStyle}
                >
                    {/* Left Action (e.g., Cancel button) */}
                    {leftAction && <div>{leftAction}</div>}

                    {/* Title */}
                    <h1
                        className="page-header-title"
                        style={{
                            flex: leftAction && rightAction ? 1 : 'none',
                            textAlign: leftAction && rightAction ? 'center' : 'left'
                        }}
                    >
                        {title}
                    </h1>

                    {/* Right Action (e.g., Submit button) */}
                    {rightAction && <div>{rightAction}</div>}

                    {/* Custom children (for complex headers) */}
                    {children}
                </div>

                {/* Bottom Slot (for tabs/filters inside sticky header) */}
                {bottomSlot && (
                    <div style={{
                        width: '100%',
                        marginTop: '1rem',
                        ...bottomSlotStyle
                    }}>
                        {bottomSlot}
                    </div>
                )}
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
    title: PropTypes.string.isRequired,
    leftAction: PropTypes.node,
    rightAction: PropTypes.node,
    showProgress: PropTypes.bool,
    progress: PropTypes.number,
    sticky: PropTypes.bool,
    borderBottom: PropTypes.bool,
    children: PropTypes.node,
    style: PropTypes.object,
    contentStyle: PropTypes.object,
    bottomSlot: PropTypes.node,
    bottomSlotStyle: PropTypes.object
};

export default PageHeader;
