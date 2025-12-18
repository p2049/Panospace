import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { functions, db } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { FaShoppingCart, FaWallet } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { WalletService } from '@/services/WalletService';

// Initialize Stripe with the provided test key
// Initialize Stripe with the provided test key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutButton = ({ post, selectedSize, buttonStyle }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [showWalletOption, setShowWalletOption] = useState(false);

    // Get price for selected size
    const selectedSizeConfig = post.printSizes?.find(s => s.id === selectedSize);
    const price = selectedSizeConfig ? Number(selectedSizeConfig.price) : 0;

    useEffect(() => {
        const fetchWallet = async () => {
            if (currentUser) {
                const wallet = await WalletService.getWallet(currentUser.uid);
                if (wallet) {
                    setWalletBalance(wallet.balance);
                }
            }
        };
        fetchWallet();
    }, [currentUser]);

    // Check if user can afford with wallet
    useEffect(() => {
        // if (price > 0 && walletBalance >= price) {
        //     setShowWalletOption(true);
        // } else {
        // PHASE 7: STRIPE CONNECT REQUIRED
        // Wallet payments are disabled to prevent money transmission risk.
        // Users cannot spend internal balance until we release Stripe Connect (Standard/Express Accounts).
        setShowWalletOption(false);
    }, [price, walletBalance]);

    const handleWalletPurchase = async () => {
        if (!currentUser) {
            setError("Please log in to purchase.");
            return;
        }
        if (!selectedSize) {
            setError('Please select a size');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Check Stock (Double Check)
            if (post.isLimitedEdition) {
                const freshDoc = await getDoc(doc(db, 'shopItems', post.id));
                if (freshDoc.exists()) {
                    const data = freshDoc.data();
                    if (data.soldCount >= data.editionSize) {
                        throw new Error("Sorry, this item just sold out!");
                    }
                }
            }

            // 2. Process Transaction
            await WalletService.processPrimaryPurchase(
                currentUser.uid,
                post.userId, // Seller ID
                post.id, // Item ID
                'print', // Item Type
                price,
                post.title
            );

            // 3. Update Stock & Sold Count
            if (post.isLimitedEdition) {
                await updateDoc(doc(db, 'shopItems', post.id), {
                    soldCount: increment(1),
                    // Check if sold out after this (client-side prediction, backend rule would be better)
                });
            }

            alert("Purchase successful! Item added to your collection.");
            window.location.reload(); // Refresh to show updated stock/wallet

        } catch (err) {
            console.error("Wallet purchase failed:", err);
            setError(err.message || "Purchase failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleStripeCheckout = async () => {
        if (!selectedSize) {
            setError('Please select a size');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

            const payload = {
                postId: post.id,
                size: selectedSize,
                imageUrl: post?.images?.[0]?.url || post.imageUrl,
                title: post.title,
                authorId: post.authorId,
                origin: window.location.origin
            };

            const { data } = await createCheckoutSession(payload);

            if (!data || !data.sessionId) {
                throw new Error('Failed to create checkout session');
            }

            const stripe = await stripePromise;
            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (stripeError) {
                setError(stripeError.message);
                setLoading(false);
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            if (err.code === 'functions/not-found') {
                setError("Checkout is temporarily unavailable. Please try again later.");
            } else if (err.code === 'functions/unauthenticated') {
                setError("Please log in to make a purchase.");
            } else {
                setError("Checkout failed. Please try again.");
            }
            setLoading(false);
        }
    };

    // Disable if sold out
    const isSoldOut = post.isLimitedEdition && post.soldCount >= post.editionSize;

    if (isSoldOut) {
        return (
            <button
                disabled
                style={{
                    ...buttonStyle,
                    background: '#333',
                    color: '#888',
                    cursor: 'not-allowed',
                    opacity: 0.7
                }}
            >
                Sold Out
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '8px',
                    color: '#f44336',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}

            {/* Wallet Option */}
            {showWalletOption && (
                <button
                    onClick={handleWalletPurchase}
                    disabled={loading || !selectedSize}
                    style={{
                        ...buttonStyle,
                        background: 'rgba(127, 255, 212, 0.15)',
                        color: '#7FFFD4',
                        border: '1px solid #7FFFD4',
                        opacity: (loading || !selectedSize) ? 0.6 : 1,
                        cursor: (loading || !selectedSize) ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Processing...' : (
                        <>
                            <FaWallet /> Pay with Wallet (${walletBalance.toFixed(2)})
                        </>
                    )}
                </button>
            )}

            {/* Stripe Option */}
            <button
                onClick={handleStripeCheckout}
                disabled={loading || !selectedSize}
                style={{
                    ...buttonStyle,
                    opacity: (loading || !selectedSize) ? 0.6 : 1,
                    cursor: (loading || !selectedSize) ? 'not-allowed' : 'pointer',
                }}
            >
                {loading ? 'Processing...' : (
                    <>
                        <FaShoppingCart /> Pay with Card
                    </>
                )}
            </button>
        </div>
    );
};

export default CheckoutButton;
