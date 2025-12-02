import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            background: type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            animation: 'slideInDown 0.3s ease-out',
            minWidth: '300px'
        }}>
            <FaCheckCircle size={24} />
            <span style={{ flex: 1, fontWeight: '500' }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <FaTimes size={16} />
            </button>
            <style>{`
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Toast;
