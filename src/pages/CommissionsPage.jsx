import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import CommissionList from '../components/monetization/CommissionList';

const CommissionsPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            paddingBottom: '80px' // Space for bottom nav
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '1px solid #222',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Commissions</h1>
            </div>

            <div style={{ padding: '1rem' }}>
                <CommissionList />
            </div>
        </div>
    );
};

export default CommissionsPage;
