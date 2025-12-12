import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import StarBackground from '@/components/StarBackground';

import { getRenderedUsernameLength, renderCosmicUsername } from '@/utils/usernameRenderer';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
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



        // Validate Username
        // Allow alpha-numeric + cosmic symbols: @ . * / " _ % # ^ \ ? [ ] ( ) { } < -
        const usernameRegex = /^[a-zA-Z0-9_@.*/"%#^\\?[\](){}< \-]+$/;

        const renderedLen = getRenderedUsernameLength(username);
        if (renderedLen < 3 || renderedLen > 20) {
            return setError(`Username length must be 3-20 characters (currently ${renderedLen}).`);
        }

        if (!usernameRegex.test(username)) {
            return setError('Username contains invalid characters.');
        }

        try {
            setError('');
            setLoading(true);

            // Import Firestore early for check
            const { doc, setDoc, getDocs, collection, query, where } = await import('firebase/firestore');
            const { db } = await import('../firebase');

            // Unique Check
            const q = query(collection(db, 'users'), where('username', '==', username));
            const existing = await getDocs(q);
            if (!existing.empty) {
                setLoading(false);
                return setError('Username is already taken.');
            }

            const userCredential = await signup(email, password);

            try {
                // We keep displayName as username for Firebase Auth consistency, but app uses 'username' field
                const { updateProfile } = await import('firebase/auth');
                await updateProfile(userCredential.user, { displayName: username });

                const userData = {
                    username: username, // Primary field
                    displayName: username, // Legacy consistency
                    email: email,
                    photoURL: userCredential.user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    bio: 'New Panospace Artist',
                    accountType: 'art',
                };

                // Generate search keywords
                const { generateUserSearchKeywords } = await import('@/core/utils/searchKeywords');
                userData.searchKeywords = generateUserSearchKeywords(userData);

                await setDoc(doc(db, 'users', userCredential.user.uid), userData);
            } catch (profileErr) {
                console.error('Error setting up profile:', profileErr);
            }
            navigate('/');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        }
        setLoading(false);
    }

    // Full-screen container that scrolls when content overflows
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(ellipse at center, rgba(20, 20, 40, 0.4) 0%, #000 70%)',
        color: '#fff',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '2rem',
    };

    // Card that holds the form
    const cardStyle = {
        padding: '2.5rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.85) 0%, rgba(10, 10, 15, 0.75) 100%)',
        backdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(127, 255, 212, 0.15)',
        boxShadow: `
      0 0 60px rgba(127, 255, 212, 0.15),
      0 0 120px rgba(76, 201, 240, 0.08),
      0 20px 60px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(127, 255, 212, 0.05)
    `,
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        position: 'relative',
        zIndex: 1,
        animation: 'cardFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        opacity: 0,
        transform: 'translateY(20px)',
    };

    return (
        <div style={containerStyle}>
            {/* Animated Stars Background */}
            <StarBackground />

            {/* Galaxy Mist Layer */}
            <div className="galaxy-mist"></div>

            <style>{`
        @keyframes cardFadeIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%,100%{ box-shadow: 0 0 60px rgba(127,255,212,0.15),0 0 120px rgba(76,201,240,0.08),0 20px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1),inset 0 -1px 0 rgba(127,255,212,0.05); } 50%{ box-shadow: 0 0 80px rgba(127,255,212,0.2),0 0 140px rgba(76,201,240,0.12),0 20px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.15),inset 0 -1px 0 rgba(127,255,212,0.08); } }
        @keyframes buttonPulse { 0%,100%{ box-shadow: 0 0 20px rgba(127,255,212,0.3),0 0 40px rgba(127,255,212,0.15),inset 0 1px 0 rgba(255,255,255,0.3); } 50%{ box-shadow: 0 0 30px rgba(127,255,212,0.5),0 0 60px rgba(127,255,212,0.25),inset 0 1px 0 rgba(255,255,255,0.4); } }
        .y2k-input { padding:1.1rem 1.2rem; border-radius:14px; border:1px solid rgba(127,255,212,0.12); background:linear-gradient(135deg,rgba(0,0,0,0.6)0%,rgba(10,10,15,0.5)100%); color:#fff; font-size:1rem; width:100%; transition:all .3s cubic-bezier(.4,0,.2,1); outline:none; position:relative; box-shadow: inset 0 1px 3px rgba(0,0,0,.4),0 0 0 rgba(127,255,212,0); }
        .y2k-input::placeholder { color:rgba(255,255,255,.35); font-weight:300; letter-spacing:.5px; }
        .y2k-input:focus { border-color:rgba(127,255,212,.5); background:linear-gradient(135deg,rgba(5,5,10,.8)0%,rgba(15,15,20,.7)100%); box-shadow: inset 0 1px 3px rgba(0,0,0,.4),0 0 20px rgba(127,255,212,.15),0 0 40px rgba(127,255,212,.08), inset 0 0 30px rgba(127,255,212,.03); transform:translateY(-1px); }
        .y2k-button { padding:1.1rem 1.5rem; border-radius:14px; border:none; background:linear-gradient(135deg,#7FFFD4 0%,#4CC9F0 50%,#7FFFD4 100%); background-size:200% 100%; color:#000; font-size:1rem; font-weight:800; cursor:pointer; width:100%; transition:all .3s cubic-bezier(.4,0,.2,1); box-shadow:0 0 20px rgba(127,255,212,.3),0 0 40px rgba(127,255,212,.15),inset 0 1px 0 rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:1.5px; position:relative; overflow:hidden; animation:buttonPulse 3s ease-in-out infinite; }
        .y2k-button::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); transition:left .5s; }
        .y2k-button:hover:not(:disabled)::before { left:100%; }
        .y2k-button:hover:not(:disabled) { transform:translateY(-2px); background-position:100% 0; box-shadow:0 0 30px rgba(127,255,212,.5),0 0 60px rgba(127,255,212,.25),0 4px 20px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.4); }
        .y2k-button:active:not(:disabled) { transform:translateY(0); }
        .y2k-button:disabled { opacity:.5; cursor:not-allowed; filter:grayscale(.8); animation:none; }
        .galaxy-mist { position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none; opacity:.3; }
        .galaxy-mist::before { content:''; position:absolute; width:600px; height:600px; top:50%; left:50%; transform:translate(-50%,-50%); background:radial-gradient(circle,rgba(127,255,212,.08)0%,transparent 70%); filter:blur(80px); animation:galaxyPulse 8s ease-in-out infinite; }
        .galaxy-mist::after { content:''; position:absolute; width:800px; height:800px; top:50%; left:50%; transform:translate(-50%,-50%); background:radial-gradient(circle,rgba(76,201,240,.05)0%,transparent 70%); filter:blur(100px); animation:galaxyPulse 10s ease-in-out infinite reverse; }
        @keyframes galaxyPulse { 0%,100%{ opacity:.3; transform:translate(-50%,-50%) scale(1); } 50%{ opacity:.5; transform:translate(-50%,-50%) scale(1.1); } }
        
        /* Landscape Mobile Optimization */
        @media (max-height: 500px) and (orientation: landscape) {
            .signup-card {
                padding: 1.5rem !important;
                gap: 1rem !important;
                max-width: 90vw !important;
            }
            .signup-title {
                font-size: 1.5rem !important;
                margin-bottom: 0.5rem !important;
            }
            .signup-subtitle {
                font-size: 0.7rem !important;
                margin-top: 0.25rem !important;
            }
            .y2k-input {
                padding: 0.8rem 1rem !important;
                font-size: 0.9rem !important;
            }
            .y2k-button {
                padding: 0.8rem 1.2rem !important;
                font-size: 0.9rem !important;
            }
            .signup-form {
                gap: 0.8rem !important;
            }
        }
      `}</style>
            <div style={cardStyle} className="signup-card">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h2 className="signup-title" style={{
                        fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                        fontWeight: '800',
                        margin: 0,
                        background: 'linear-gradient(135deg,#fff 0%,#aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: 'clamp(-1px, -0.3vw, 0px)',
                        wordBreak: 'keep-all',
                        whiteSpace: 'nowrap'
                    }}>
                        JOIN PANOSPACE
                    </h2>
                    <h3 className="signup-subtitle" style={{
                        fontSize: 'clamp(0.75rem, 3vw, 1rem)',
                        color: '#7FFFD4',
                        margin: '0.5rem 0 0 0',
                        fontWeight: '400',
                        letterSpacing: 'clamp(1px, 0.5vw, 2px)',
                        textTransform: 'uppercase',
                        opacity: 0.8
                    }}>
                        Enter the Visual Universe
                    </h3>
                </div>
                {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: '#ff6b6b', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>
                )}
                <form onSubmit={handleSubmit} className="signup-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" className="y2k-input" />
                    {/* NEW USERNAME INPUT */}
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase())} // Allow symbols, just lowercase
                        required
                        placeholder="Username (letters, numbers, cosmic symbols)"
                        className="y2k-input"
                    // Validation handled in handleSubmit with getRenderedUsernameLength
                    />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="y2k-input" />
                    <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required placeholder="Confirm Password" className="y2k-input" />

                    <label style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', color: '#aaa', cursor: 'pointer' }}>
                        <input type="checkbox" required style={{ marginTop: '0.2rem' }} />
                        <span>
                            I am at least 14 years old and agree to the <Link to="/legal" target="_blank" style={{ color: '#7FFFD4', textDecoration: 'none' }}>Terms &amp; Guidelines</Link>.
                        </span>
                    </label>
                    <button disabled={loading} type="submit" className="y2k-button">Sign Up</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                    Already have an account? <Link to="/login" style={{ color: '#7FFFD4', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
