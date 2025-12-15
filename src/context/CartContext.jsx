import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

const initialState = {
    items: [],
    isOpen: false // For side drawer if used
};

const CART_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    TOGGLE_CART: 'TOGGLE_CART',
    LOAD_CART: 'LOAD_CART'
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case CART_ACTIONS.ADD_ITEM: {
            const newItem = action.payload;
            const existingItemIndex = state.items.findIndex(
                item => item.id === newItem.id && item.selectedSize === newItem.selectedSize
            );

            let newItems;
            if (existingItemIndex > -1) {
                // Determine new quantity (max 10 for safety)
                const currentQty = state.items[existingItemIndex].quantity;
                const newQty = Math.min(currentQty + newItem.quantity, 10);

                newItems = [...state.items];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newQty
                };
            } else {
                newItems = [...state.items, newItem];
            }

            return { ...state, items: newItems, isOpen: true };
        }

        case CART_ACTIONS.REMOVE_ITEM: {
            // Remove by unique combination of ID and Size
            const { id, selectedSize } = action.payload;
            return {
                ...state,
                items: state.items.filter(item => !(item.id === id && item.selectedSize === selectedSize))
            };
        }

        case CART_ACTIONS.UPDATE_QUANTITY: {
            const { id, selectedSize, quantity } = action.payload;
            if (quantity < 1) return state; // Prevent 0 or negative

            return {
                ...state,
                items: state.items.map(item =>
                    (item.id === id && item.selectedSize === selectedSize)
                        ? { ...item, quantity: Math.min(quantity, 10) }
                        : item
                )
            };
        }

        case CART_ACTIONS.CLEAR_CART:
            return { ...state, items: [] };

        case CART_ACTIONS.TOGGLE_CART:
            return { ...state, isOpen: action.payload ?? !state.isOpen };

        case CART_ACTIONS.LOAD_CART:
            return { ...state, items: action.payload };

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { showSuccess } = useToast();

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('panospace_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsed });
                }
            } catch (e) {
                console.error("Failed to load cart:", e);
            }
        }
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('panospace_cart', JSON.stringify(state.items));
    }, [state.items]);

    const addToCart = (product, quantity = 1, selectedSize) => {
        if (!selectedSize) {
            console.error("Size requirement not met");
            return;
        }

        dispatch({
            type: CART_ACTIONS.ADD_ITEM,
            payload: {
                id: product.id,
                title: product.title,
                price: product.price, // Should be unit price for size
                selectedSize: selectedSize,
                imageUrl: product.imageUrl,
                authorId: product.userId || product.authorId,
                quantity
            }
        });
        showSuccess("Added to Cart");
    };

    const removeFromCart = (id, selectedSize) => {
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id, selectedSize } });
    };

    const updateQuantity = (id, selectedSize, quantity) => {
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id, selectedSize, quantity } });
    };

    const clearCart = () => dispatch({ type: CART_ACTIONS.CLEAR_CART });
    const toggleCart = (isOpen) => dispatch({ type: CART_ACTIONS.TOGGLE_CART, payload: isOpen });

    const cartTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = state.items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart: state.items,
            isOpen: state.isOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
