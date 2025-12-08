import React, { useState, useEffect } from 'react';
import { FaWallet, FaPlus } from 'react-icons/fa';
import { WalletService } from '@/services/WalletService';
import { useAuth } from '@/context/AuthContext';
import AddFundsModal from './monetization/AddFundsModal';

const WalletDisplay = ({ userId }) => {
    const { currentUser } = useAuth();
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddFunds, setShowAddFunds] = useState(false);

    // Only show for the logged-in user
    if (!currentUser || currentUser.uid !== userId) return null;

    const fetchBalance = async () => {
        try {
            const wallet = await WalletService.getWallet(userId);
            setBalance(wallet ? wallet.balance : 0);
        } catch (err) {
            console.error("Error fetching wallet:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [userId]);

    const handleFundsAdded = (amount) => {
        fetchBalance(); // Refresh balance immediately
        // Optional: Show a toast notification here
    };

    if (loading) return null;

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid rgba(127, 255, 212, 0.2)',
                fontSize: '0.9rem',
                color: '#7FFFD4',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
                onClick={() => setShowAddFunds(true)}
                title="Add Funds to Wallet"
            >
                <FaWallet size={14} />
                <span style={{ fontWeight: 'bold' }}>${balance?.toFixed(2) || '0.00'}</span>
                <div style={{
                    width: '18px',
                    height: '18px',
                    background: 'rgba(127, 255, 212, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '0.2rem'
                }}>
                    <FaPlus size={8} color="#7FFFD4" />
                </div>
            </div>

            {showAddFunds && (
                <AddFundsModal
                    currentBalance={balance}
                    onClose={() => setShowAddFunds(false)}
                    onSuccess={handleFundsAdded}
                />
            )}
        </>
    );
};

export default WalletDisplay;
