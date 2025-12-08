import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCompass, FaArrowLeft } from 'react-icons/fa';
import SEO from '@/components/SEO';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100dvh', // Use dvh for mobile
            width: '100vw',
            background: '#000',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <SEO title="Page Not Found" />

            <div style={{
                fontSize: 'clamp(4rem, 15vw, 8rem)', // Responsive font size
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #7FFFD4, #007A5D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem',
                opacity: 0.8
            }}>
                404
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '1rem' }}>Lost in Space?</h1>
            <p style={{ color: '#aaa', maxWidth: '400px', marginBottom: '2rem' }}>
                The page you are looking for doesn't exist or has been moved to another dimension.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'transparent',
                        border: '1px solid #333',
                        color: '#fff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem'
                    }}
                >
                    <FaArrowLeft /> Go Back
                </button>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'var(--ice-mint)',
                        border: 'none',
                        color: '#000',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    <FaCompass /> Go Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
