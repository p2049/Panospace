import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
import SEO from '@/components/SEO';


const stripePromise = loadStripe('pk_test_51SVxZtF3FCQ1N5YCyooRPhAZiECp9ivHgrIcOcomZPy6fbcCy34C6I7mT4dgC27yh51VcwPebwCAuVdOkgtaJKBa00mB4c8yta');

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (!currentUser) {
            alert("Please log in to checkout.");
            return;
        }

        setIsCheckingOut(true);

        try {
            const createCartCheckoutSession = httpsCallable(functions, 'createCartCheckoutSession');

            // Prepare cart data
            const cartItems = cart.map(item => ({
                id: item.id,
                selectedSize: item.selectedSize,
                quantity: item.quantity,
                title: item.title // Only for logging if needed
            }));

            const { data } = await createCartCheckoutSession({ cartItems });

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (error) {
            console.error("Checkout Failed:", error);
            alert(`Checkout failed: ${error.message}`);
            setIsCheckingOut(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <SEO title="Your Cart | Panospace" />
                <FaShoppingBag size={48} color="#333" />
                <h1 style={{ marginTop: '1rem' }}>Your Cart is Empty</h1>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Looks like you haven't added any art yet.</p>
                <button
                    onClick={() => navigate('/shop')}
                    style={{
                        padding: '1rem 2rem',
                        background: '#7FFFD4',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Browse Shop
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', paddingBottom: '100px', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
            <SEO title="Your Cart | Panospace" />

            <button
                onClick={() => navigate(-1)}
                style={{ background: 'transparent', border: 'none', color: '#888', marginBottom: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <FaArrowLeft /> Keep Shopping
            </button>

            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>Shopping Cart ({cart.length})</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {cart.map((item, index) => (
                    <div key={`${item.id}-${item.selectedSize}`} style={{
                        display: 'flex',
                        background: '#111',
                        borderRadius: '12px',
                        padding: '1rem',
                        gap: '1rem',
                        border: '1px solid #222'
                    }}>
                        {/* Image */}
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h3>
                                <button
                                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                                >
                                    <FaTrash />
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#888', fontSize: '0.9rem' }}>
                                <span style={{ background: '#222', padding: '2px 8px', borderRadius: '4px' }}>{item.selectedSize}</span>
                                <span>${item.price.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#000', borderRadius: '20px', padding: '4px 12px' }}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <FaMinus size={10} />
                                    </button>
                                    <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <FaPlus size={10} />
                                    </button>
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem' }}>
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#888', fontSize: '0.9rem' }}>
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    style={{
                        width: '100%',
                        padding: '1.2rem',
                        background: '#7FFFD4',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isCheckingOut ? 0.7 : 1
                    }}
                >
                    {isCheckingOut ? 'Processing...' : `Checkout ($${cartTotal.toFixed(2)})`}
                </button>
            </div>
        </div>
    );
};

export default CartPage;
