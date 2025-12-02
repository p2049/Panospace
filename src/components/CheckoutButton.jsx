import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { FaShoppingCart } from 'react-icons/fa';

// Initialize Stripe with the provided test key
const stripePromise = loadStripe('pk_test_51SVxZtF3FCQ1N5YCyooRPhAZiECp9ivHgrIcOcomZPy6fbcCy34C6I7mT4dgC27yh51VcwPebwCAuVdOkgtaJKBa00mB4c8yta');

const CheckoutButton = ({ post, selectedSize, buttonStyle }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        if (!selectedSize) {
            setError('Please select a size');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

            // Ensure we are passing all required data
            // post.id is the shopItemId in the new system
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

            // Graceful error handling
            if (err.code === 'functions/not-found') {
                setError("Checkout is temporarily unavailable. Please try again later.");
            } else if (err.code === 'functions/unauthenticated') {
                setError("Please log in to make a purchase.");
            } else if (err.code === 'functions/invalid-argument') {
                setError("Invalid product configuration. Please try another size.");
            } else {
                setError("Checkout failed. Please try again.");
            }

            setLoading(false);
        }
    };

    return (
        <div>
            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '8px',
                    color: '#f44336',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}

            <button
                onClick={handleCheckout}
                disabled={loading || !selectedSize}
                style={{
                    ...buttonStyle,
                    opacity: (loading || !selectedSize) ? 0.6 : 1,
                    cursor: (loading || !selectedSize) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    if (!loading && selectedSize) {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.2)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                {loading ? (
                    <>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #000',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        Processing...
                    </>
                ) : (
                    <>
                        <FaShoppingCart size={20} />
                        Buy Print
                    </>
                )}
            </button>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CheckoutButton;
