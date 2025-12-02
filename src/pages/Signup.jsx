import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(email, password);

            // Auto-set display name from email
            const username = email.split('@')[0];
            try {
                // We need to import updateProfile from firebase/auth
                // But since we are in a component, we can access the user object from userCredential
                // However, signup returns the credential.
                // We also need to update the Firestore user document if it exists, or create it.
                // The AuthContext signup just returns the promise from createUserWithEmailAndPassword.

                // Let's import updateProfile and db/doc/setDoc to be sure
                const { updateProfile } = await import('firebase/auth');
                const { doc, setDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase');

                await updateProfile(userCredential.user, {
                    displayName: username
                });

                // Create user document in Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    displayName: username,
                    email: email,
                    photoURL: userCredential.user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    bio: 'New Panospace Artist'
                });

            } catch (profileErr) {
                console.error("Error setting up profile:", profileErr);
                // Continue anyway
            }

            navigate('/');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
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

    return (
        <div style={containerStyle}>
            <div style={cardStyle} className="fade-in">
                <h2 style={{ fontSize: '2rem', textAlign: 'center', fontWeight: '300' }}>Join Panospace</h2>
                <h3 style={{ fontSize: '1.2rem', textAlign: 'center', color: '#aaa', marginTop: '-1rem' }}>Create Your Portfolio</h3>

                {error && <div style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email"
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        placeholder="Confirm Password"
                        style={inputStyle}
                    />

                    <label style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', color: '#aaa', cursor: 'pointer' }}>
                        <input type="checkbox" required style={{ marginTop: '0.2rem' }} />
                        <span>
                            I am at least 14 years old and agree to the <Link to="/legal" target="_blank" style={{ color: '#fff', textDecoration: 'underline' }}>Terms & Guidelines</Link>.
                        </span>
                    </label>

                    <button disabled={loading} type="submit" style={buttonStyle}>
                        Sign Up
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
