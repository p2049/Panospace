import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
        }
    }, [sessionId, navigate]);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#000',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <FaCheckCircle size={80} color="#4BB543" />
            <h1>Payment Successful!</h1>
            <p style={{ maxWidth: '600px', color: '#ccc' }}>
                Thank you for your purchase. Your order has been received and is being processed.
                You will receive an email confirmation shortly.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '1rem 2rem',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default CheckoutSuccess;
