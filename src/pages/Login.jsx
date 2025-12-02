import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login, googleSignIn } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }

        setLoading(false);
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            navigate('/');
        } catch (err) {
            setError('Failed to log in with Google: ' + err.message);
        }
        setLoading(false);
    }

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)',
        color: '#fff'
    };

    const cardStyle = {
        padding: '2rem',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        width: '350px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    };

    const inputStyle = {
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #333',
        backgroundColor: '#111',
        color: '#fff',
        fontSize: '1rem',
        width: '100%'
    };

    const buttonStyle = {
        padding: '1rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#fff',
        color: '#000',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        transition: 'transform 0.2s'
    };

    const googleButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#4285F4',
        color: '#fff',
        marginTop: '0.5rem'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle} className="fade-in">
                <h2 style={{ fontSize: '2rem', textAlign: 'center', fontWeight: '300' }}>Panospace</h2>
                <h3 style={{ fontSize: '1.2rem', textAlign: 'center', color: '#aaa', marginTop: '-1rem' }}>Welcome Back</h3>

                {error && <div style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="email" ref={emailRef} required placeholder="Email" style={inputStyle} />
                    <input type="password" ref={passwordRef} required placeholder="Password" style={inputStyle} />
                    <button disabled={loading} type="submit" style={buttonStyle}>
                        Log In
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#666' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
                    <span>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
                </div>

                <button disabled={loading} onClick={handleGoogleSignIn} style={googleButtonStyle}>
                    Continue with Google
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                    Need an account? <Link to="/signup" style={{ color: '#fff', textDecoration: 'underline' }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
