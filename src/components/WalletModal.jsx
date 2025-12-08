import React, { useState, useEffect } from 'react';
import { FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaTimes, FaPlus } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { WalletService } from '@/services/WalletService';
import { formatPrice } from '@/core/utils/helpers';
import useModalEscape from '@/hooks/useModalEscape';
import StarBackground from './StarBackground';

const WalletModal = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('balance'); // 'balance' or 'history'

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    const [walletData, txData] = await Promise.all([
                        WalletService.getWallet(currentUser.uid),
                        WalletService.getTransactions(currentUser.uid)
                    ]);
                    setWallet(walletData);
                    setTransactions(txData);
                } catch (error) {
                    console.error("Error loading wallet data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [currentUser]);

    // Modal escape handling
    const { handleBackdropClick } = useModalEscape(true, onClose);

    const handleAddFunds = async () => {
        // Mock Deposit
        const amount = 100; // $100
        if (window.confirm(`Add $${amount} to your wallet (Test Mode)?`)) {
            try {
                await WalletService.addFunds(currentUser.uid, amount, 'deposit', 'Test Deposit');
                alert("Funds added!");
                // Refresh data
                const [walletData, txData] = await Promise.all([
                    WalletService.getWallet(currentUser.uid),
                    WalletService.getTransactions(currentUser.uid)
                ]);
                setWallet(walletData);
                setTransactions(txData);
            } catch (error) {
                alert("Failed to add funds");
            }
        }
    };

    if (!currentUser) return null;

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '500px',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                    position: 'relative'
                }}>

                {/* Star Background */}
                <StarBackground starColor="#7FFFD4" />

                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                        <FaWallet style={{ color: '#7FFFD4' }} /> My Wallet
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px'
                        }}
                        aria-label="Close wallet"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #333', position: 'relative', zIndex: 1 }}>
                    <button
                        onClick={() => setActiveTab('balance')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: activeTab === 'balance' ? 'rgba(127, 255, 212, 0.05)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'balance' ? '2px solid #7FFFD4' : '2px solid transparent',
                            color: activeTab === 'balance' ? '#7FFFD4' : '#888',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        Balance
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: activeTab === 'history' ? 'rgba(127, 255, 212, 0.05)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'history' ? '2px solid #7FFFD4' : '2px solid transparent',
                            color: activeTab === 'history' ? '#7FFFD4' : '#888',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        History
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, position: 'relative', zIndex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading wallet data...</div>
                    ) : activeTab === 'balance' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                                padding: '2rem',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '1px solid #333'
                            }}>
                                <div style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Available Balance</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                                    ${wallet?.balance?.toFixed(2) || '0.00'}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Lifetime Earnings</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#7FFFD4' }}>
                                        +${wallet?.lifetimeEarnings?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                                <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Lifetime Spent</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                                        -${wallet?.lifetimeSpent?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={handleAddFunds}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: '#7FFFD4',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaPlus /> Add Funds
                                </button>
                                <button
                                    disabled={!wallet?.balance || wallet.balance < 25}
                                    title={(!wallet?.balance || wallet.balance < 25) ? "Minimum withdrawal is $25" : "Withdraw funds"}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: '#333',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: (!wallet?.balance || wallet.balance < 25) ? 'not-allowed' : 'pointer',
                                        opacity: (!wallet?.balance || wallet.balance < 25) ? 0.5 : 1
                                    }}
                                >
                                    Withdraw
                                </button>
                            </div>
                            {(!wallet?.balance || wallet.balance < 25) && (
                                <div style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
                                    Minimum withdrawal amount is $25.00
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No transactions yet</div>
                            ) : (
                                transactions.map(tx => (
                                    <div key={tx.id} style={{
                                        background: '#222',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid #333'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: tx.amount > 0 ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: tx.amount > 0 ? '#7FFFD4' : '#ff6b6b'
                                            }}>
                                                {tx.amount > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{tx.description}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    {tx.createdAt?.toLocaleDateString()} • {tx.type.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 'bold',
                                            color: tx.amount > 0 ? '#7FFFD4' : '#ff6b6b',
                                            fontSize: '1.1rem'
                                        }}>
                                            {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletModal;
