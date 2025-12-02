import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#000',
                    color: '#fff',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong</h1>
                    <p style={{ color: '#aaa', marginBottom: '2rem', maxWidth: '500px' }}>
                        We're sorry for the inconvenience. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '1rem 2rem',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: '2rem', color: '#666', fontSize: '0.8rem', maxWidth: '600px', textAlign: 'left' }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>Error Details (Dev Only)</summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.error && this.state.error.toString()}
                                {'\n\n'}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
