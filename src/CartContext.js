import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const CartContext = createContext();

// Custom hook for using the cart context
export const useCart = () => {
    return useContext(CartContext);
};

// Provider component
export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('iRevixCart');
        return savedCart ? JSON.parse(savedCart) : []; // Initialize with empty array
    });

    // Update localStorage when cart changes
    useEffect(() => {
        localStorage.setItem('iRevixCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to cart
    const addToCart = (item) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                // If item exists, increase quantity
                return prevItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                // If item doesn't exist, add new item with quantity 1
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (id) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== id);
            // Ensure immediate update in localStorage
            localStorage.setItem('iRevixCart', JSON.stringify(newItems));
            return newItems;
        });
    };

    // Update item quantity
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;

        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, quantity: quantity } : item
            );
            // Ensure immediate update in localStorage
            localStorage.setItem('iRevixCart', JSON.stringify(updatedItems));
            return updatedItems;
        });
    };

    // Clear cart - Fix: adding immediate localStorage update
    const clearCart = () => {
        setCartItems([]);
        // Ensure immediate update in localStorage
        localStorage.setItem('iRevixCart', JSON.stringify([]));
    };

    // Get cart count
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Get cart total
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Context value
    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;