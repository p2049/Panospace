import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGem, FaRocket, FaCrown, FaCheck } from 'react-icons/fa';

const UltraPromoCard = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
            color: '#fff',
            position: 'relative',
            padding: '2rem'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                padding: '3rem',
                borderRadius: '24px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)',
                zIndex: 1
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
                }}>
                    <FaCrown size={40} color="#000" />
                </div>

                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #FFD700, #FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Go Ultra
                </h2>
                <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Unlock the full potential of Panospace.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FaCheck color="#FFD700" /> <span>Zero Commission on Sales</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FaRocket color="#FFD700" /> <span>5x Reach Boost</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FaGem color="#FFD700" /> <span>Exclusive Badge & Profile</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/ultra')}
                    style={{
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: '#000',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '30px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'transform 0.2s',
                        boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Upgrade Now
                </button>

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                    Starting at $9.99/month
                </p>
            </div>
        </div>
    );
};

export default UltraPromoCard;
