import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const alertTimeoutRef = useRef(null);
    const lastAlertMessageRef = useRef('');

    // Debounced alert to prevent multiple notifications
    const showDebouncedAlert = useCallback((message) => {
        // Clear any existing timeout
        if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
        }

        // Prevent duplicate alerts in quick succession
        if (message === lastAlertMessageRef.current) {
            return;
        }

        // Set a new timeout
        alertTimeoutRef.current = setTimeout(() => {
            alert(message);
            lastAlertMessageRef.current = message;
        }, 300);
    }, []);

    // Check if user is logged in and update userId state
    useEffect(() => {
        const checkUserLogin = () => {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.id && user.role === 'customer') {
                    setLoggedInUserId(user.id);
                    return user.id;
                }
            }
            setLoggedInUserId(null);
            setCartItems([]);
            return null;
        };

        const userId = checkUserLogin();

        // Listen for changes in localStorage (user login/logout)
        const handleStorageChange = (e) => {
            if (e.key === 'currentUser') {
                checkUserLogin();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        document.addEventListener('userStateChanged', checkUserLogin);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('userStateChanged', checkUserLogin);
        };
    }, []);

    // Fetch cart whenever logged in user changes
    useEffect(() => {
        if (loggedInUserId) {
            fetchCartFromBackend(loggedInUserId);
        } else {
            setCartItems([]);
            setIsLoading(false);
        }
    }, [loggedInUserId]);

    // Fetch cart from backend
    const fetchCartFromBackend = async (userId) => {
        if (!userId) return;

        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/cart?userId=${encodeURIComponent(userId)}`);

            if (response.ok) {
                const cartData = await response.json();
                const newItems = cartData.items || [];

                // Update state and notify only if items actually changed
                setCartItems(prevItems => {
                    const hasChanged = JSON.stringify(prevItems) !== JSON.stringify(newItems);
                    if (hasChanged) {
                        notifyCartChange(newItems.length);
                        return newItems;
                    }
                    return prevItems;
                });
            } else {
                console.error("Failed to fetch cart:", response.status);
                setCartItems([]);
                notifyCartChange(0);
            }
        } catch (error) {
            console.error("Error fetching cart from backend:", error);
            setCartItems([]);
            notifyCartChange(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Improved cart change notification
    const notifyCartChange = useCallback((count) => {
        const finalCount = count !== undefined ? count : getCartCount();

        // Dispatch custom event
        const event = new CustomEvent('cartUpdated', {
            detail: { count: finalCount }
        });
        document.dispatchEvent(event);

        // Update localStorage for cross-tab sync
        localStorage.setItem('iRevixCart', JSON.stringify({
            count: finalCount,
            timestamp: Date.now()
        }));
    }, []);

    // Add item to cart
    const addToCart = async (item) => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            showDebouncedAlert("Please log in as a customer to add items to your cart.");
            return false;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'customer') {
            showDebouncedAlert("Only customers can add items to cart.");
            return false;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('userId', user.id);
            formData.append('quantity', item.quantity || 1);

            if (item.id.toString().startsWith('repair-')) {
                // Custom service item
                formData.append('partId', -1);
                formData.append('type', 'service');
                formData.append('name', item.name);
                formData.append('price', item.price);
                formData.append('description', item.description || '');
            } else {
                // Regular part
                formData.append('partId', item.id);
                formData.append('type', item.type || 'part');
            }

            const response = await fetch('http://localhost:8080/api/cart/add', {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            if (response.ok) {
                // Fetch updated cart data
                await fetchCartFromBackend(user.id);

                // Show alert after fetch to ensure single notification
                showDebouncedAlert(`Added ${item.name} to cart!`);

                return true;
            } else {
                console.error("Failed to add to cart:", response.status);
                return false;
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            return false;
        }
    };

    // Remove item from cart
    const removeFromCart = async (id) => {
        if (!id) return false;

        try {
            const response = await fetch(`http://localhost:8080/api/cart/item/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                // Fetch updated cart data to ensure consistency
                await fetchCartFromBackend(loggedInUserId);
                return true;
            } else {
                console.error("Failed to remove from cart:", response.status);
                await fetchCartFromBackend(loggedInUserId);
                return false;
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
            await fetchCartFromBackend(loggedInUserId);
            return false;
        }
    };

    // Update quantity in cart
    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return false;

        try {
            const response = await fetch(`http://localhost:8080/api/cart/quantity/${id}?quantity=${quantity}`, {
                method: "PUT"
            });

            if (response.ok) {
                // Fetch updated cart data
                await fetchCartFromBackend(loggedInUserId);
                return true;
            } else {
                console.error("Failed to update quantity:", response.status);
                return false;
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            return false;
        }
    };

    // Clear the cart
    const clearCart = async () => {
        if (!loggedInUserId) return false;

        try {
            const response = await fetch(`http://localhost:8080/api/cart/clear/${loggedInUserId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                // Fetch updated cart data to ensure consistency
                await fetchCartFromBackend(loggedInUserId);
                return true;
            } else {
                console.error("Failed to clear cart:", response.status);
                return false;
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            return false;
        }
    };

    // Get total number of items in cart
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Get total price of items in cart
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
        getCartTotal,
        isLoading,
        refreshCart: () => {
            if (loggedInUserId) {
                fetchCartFromBackend(loggedInUserId);
            }
        }
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;