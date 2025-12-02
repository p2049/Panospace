import React from 'react';

const SkeletonPost = () => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            scrollSnapAlign: 'start',
            position: 'relative',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Image skeleton */}
            <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite'
            }} />

            {/* Author overlay skeleton */}
            <div style={{
                position: 'absolute',
                bottom: '100px',
                left: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#2a2a2a'
                }} />
                <div style={{
                    width: '120px',
                    height: '20px',
                    borderRadius: '4px',
                    background: '#2a2a2a'
                }} />
            </div>

            <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </div>
    );
};

export default SkeletonPost;
