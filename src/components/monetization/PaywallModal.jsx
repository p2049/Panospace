import React from 'react';
import { FaGem, FaLock, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PaywallModal = ({ onClose, featureName }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
                borderRadius: '16px',
                maxWidth: '450px',
                width: '100%',
                border: '1px solid #FFD700',
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                padding: '2.5rem'
            }}>
                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                    <FaTimes />
                </button>

                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)'
                }}>
                    <FaLock size={32} color="#000" />
                </div>

                <h2 style={{
                    color: '#fff',
                    marginBottom: '1rem',
                    fontSize: '1.8rem',
                    background: 'linear-gradient(45deg, #FFD700, #FFF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Space Creator Exclusive
                </h2>

                <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                    The <strong>{featureName}</strong> feature is available only to Space Creator members.
                </p>

                <div style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        $5.00 / month
                    </div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>
                        Cancel anytime. No commitment.
                    </div>
                </div>

                <button
                    onClick={() => {
                        onClose();
                        // Trigger wallet modal via event or direct navigation if we had a route
                        // For now, we instruct them to open wallet
                        alert("Please open your Wallet to upgrade!");
                    }}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaGem /> Upgrade Now
                </button>
            </div>
        </div>
    );
};

export default PaywallModal;
