import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGem, FaBook, FaTrophy } from 'react-icons/fa';

const PanoVerse = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('binder');

    if (!currentUser) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Please sign in to view your PanoVerse collection</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #333',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #7FFFD4 0%, #FFD700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        PanoVerse
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Limited Edition Prints & Collectible Cards</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #333', background: '#0a0a0a' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('binder')}
                        style={{
                            padding: '1rem 0',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'binder' ? '2px solid #7FFFD4' : '2px solid transparent',
                            color: activeTab === 'binder' ? '#7FFFD4' : '#888',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaGem /> Card Binder
                    </button>
                    <button
                        onClick={() => setActiveTab('dex')}
                        style={{
                            padding: '1rem 0',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'dex' ? '2px solid #7FFFD4' : '2px solid transparent',
                            color: activeTab === 'dex' ? '#7FFFD4' : '#888',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaBook /> Collections
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        style={{
                            padding: '1rem 0',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'market' ? '2px solid #7FFFD4' : '2px solid transparent',
                            color: activeTab === 'market' ? '#7FFFD4' : '#888',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaTrophy /> Market
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                {activeTab === 'binder' && <CardBinder />}
                {activeTab === 'dex' && <CollectionsDEX />}
                {activeTab === 'market' && <MarketValue />}
            </div>
        </div>
    );
};

const CardBinder = () => {
    return (
        <div>
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
                <FaGem size={60} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#888' }}>Your Card Binder</h2>
                <p>Limited edition print cards will appear here when you purchase them</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    Look for the "Limited Edition" option when creating posts in the Shop
                </p>
            </div>
        </div>
    );
};

const CollectionsDEX = () => {
    return (
        <div>
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
                <FaBook size={60} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#888' }}>Collections DEX</h2>
                <p>Track your discoveries: Parks, Cities, Film Types, and more</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem', maxWidth: '800px', margin: '2rem auto 0' }}>
                    {['Parks', 'Cities', 'Film Types', 'Animals', 'Aesthetics'].map(category => (
                        <div key={category} style={{
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                                0
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>{category}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MarketValue = () => {
    return (
        <div>
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
                <FaTrophy size={60} style={{
                    marginBottom: '1rem', opacity: 0.3
                }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#888' }}>Market & Value</h2>
                <p>Track rising cards, top artists, and recently sold out editions</p>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Note: This is not real financial trading, just art prestige and collectability
                </p>
            </div>
        </div >
    );
};

export default PanoVerse;
