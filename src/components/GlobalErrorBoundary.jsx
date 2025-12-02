import React from 'react';

/**
 * GlobalErrorBoundary Component
 * Catches runtime errors and displays a themed fallback UI
 * Prevents white-screen errors and provides recovery options
 */
class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('GlobalErrorBoundary caught an error:', error, errorInfo);

        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // Optional: Send error to logging service
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        // Reload the page to reset the app state
        window.location.href = '/';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Animated Stars Background */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 0
                    }}>
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: Math.random() * 2 + 1 + 'px',
                                    height: Math.random() * 2 + 1 + 'px',
                                    background: '#7FFFD4',
                                    borderRadius: '50%',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.5 + 0.3,
                                    animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    boxShadow: `0 0 ${Math.random() * 3 + 2}px #7FFFD4`
                                }}
                            />
                        ))}
                    </div>
                    <style>{`
                        @keyframes twinkle {
                            0%, 100% { opacity: 0.3; transform: scale(1); }
                            50% { opacity: 1; transform: scale(1.2); }
                        }
                    `}</style>

                    {/* Error Content */}
                    <div style={{
                        maxWidth: '600px',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Error Icon */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 2rem',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '2px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}>
                            ⚠️
                        </div>
                        <style>{`
                            @keyframes pulse {
                                0%, 100% { transform: scale(1); }
                                50% { transform: scale(1.05); }
                            }
                        `}</style>

                        {/* Error Title */}
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Oops! Something Went Wrong
                        </h1>

                        {/* Error Message */}
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#ccc',
                            marginBottom: '2rem',
                            lineHeight: '1.6'
                        }}>
                            We encountered an unexpected error. Don't worry, your data is safe.
                            Try refreshing the page or returning to the home screen.
                        </p>

                        {/* Error Details (Development Mode) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '2rem',
                                textAlign: 'left',
                                background: 'rgba(255, 68, 68, 0.05)',
                                border: '1px solid rgba(255, 68, 68, 0.2)',
                                borderRadius: '8px',
                                padding: '1rem',
                                fontSize: '0.9rem',
                                color: '#ff6b6b'
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem'
                                }}>
                                    Error Details (Development Only)
                                </summary>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontSize: '0.85rem',
                                    margin: '0.5rem 0 0 0',
                                    color: '#ff8888'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(127, 255, 212, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(127, 255, 212, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(127, 255, 212, 0.3)';
                                }}
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: 'transparent',
                                    color: '#7FFFD4',
                                    border: '2px solid #7FFFD4',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(127, 255, 212, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Go to Home
                            </button>
                        </div>

                        {/* Error Count (Development Mode) */}
                        {process.env.NODE_ENV === 'development' && this.state.errorCount > 1 && (
                            <p style={{
                                marginTop: '1.5rem',
                                fontSize: '0.9rem',
                                color: '#888'
                            }}>
                                Error occurred {this.state.errorCount} times
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
