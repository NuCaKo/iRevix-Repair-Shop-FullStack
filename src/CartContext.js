import React, { createContext, useState, useEffect, useContext } from 'react';
const CartContext = createContext();
export const useCart = () => {
    return useContext(CartContext);
};
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('iRevixCart');
        return savedCart ? JSON.parse(savedCart) : []; // Initialize with empty array
    });
    useEffect(() => {
        localStorage.setItem('iRevixCart', JSON.stringify(cartItems));
    }, [cartItems]);
    const addToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                return prevItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
    };
    const removeFromCart = (id) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== id);
            localStorage.setItem('iRevixCart', JSON.stringify(newItems));
            return newItems;
        });
    };
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;

        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, quantity: quantity } : item
            );
            localStorage.setItem('iRevixCart', JSON.stringify(updatedItems));
            return updatedItems;
        });
    };
    const clearCart = () => {
        setCartItems([]);
        localStorage.setItem('iRevixCart', JSON.stringify([]));
    };
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
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