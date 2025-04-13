import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(0); // Track last fetch time to prevent loops

    // Check if user is logged in and update userId state
    useEffect(() => {
        const checkUserLogin = () => {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.id && user.role === 'customer') {
                    setLoggedInUserId(user.id);
                    return;
                }
            }
            setLoggedInUserId(null);
            setCartItems([]);
        };

        checkUserLogin();

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

        // Prevent rapid re-fetching (add a debounce)
        const now = Date.now();
        if (now - lastFetchTime < 500) { // 500ms debounce
            return;
        }
        setLastFetchTime(now);

        try {
            setIsLoading(true);
            console.log("Fetching cart for user:", userId);
            const response = await fetch(`http://localhost:8080/api/cart?userId=${encodeURIComponent(userId)}`);

            if (response.ok) {
                const cartData = await response.json();
                console.log("Cart data received:", cartData);
                setCartItems(cartData.items || []);
                notifyCartChange();
            } else {
                console.error("Failed to fetch cart:", response.status);
                setCartItems([]);
            }
        } catch (error) {
            console.error("Error fetching cart from backend:", error);
            setCartItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const notifyCartChange = () => {
        console.log("🔔 Notifying cart change event, current items:", cartItems.length);
        // Create new event with the cart count as detail
        const event = new CustomEvent('cartUpdated', {
            detail: { count: getCartCount() }
        });
        document.dispatchEvent(event);
    };

    // Add item to cart
    const addToCart = async (item) => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            alert("Please log in as a customer to add items to your cart.");
            return false;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'customer') {
            alert("Only customers can add items to cart.");
            return false;
        }

        try {
            console.log("Adding to cart:", item);
            let apiUrl = 'http://localhost:8080/api/cart/add';
            const formData = new URLSearchParams();
            formData.append('userId', user.id);
            formData.append('quantity', item.quantity || 1);

            if (item.id.toString().startsWith('repair-')) {
                // Custom service item
                formData.append('partId', -1); // Placeholder ID for services
                formData.append('type', 'service');
                formData.append('name', item.name);
                formData.append('price', item.price);
                formData.append('description', item.description || '');
            } else {
                // Regular part
                formData.append('partId', item.id);
                formData.append('type', item.type || 'part');
            }

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            if (response.ok) {
                // Avoid infinite loop by not immediately calling fetchCartFromBackend
                setTimeout(() => fetchCartFromBackend(user.id), 300);
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

    const removeFromCart = async (id) => {
        if (!id) return false;

        try {
            console.log("📦 Removing item:", id);

            // 1. Update local state FIRST
            setCartItems(prevItems => {
                const newItems = prevItems.filter(item => item.id !== id);
                console.log("New cart items after removal:", newItems.length);
                return newItems;
            });

            // 2. Notify immediately
            setTimeout(() => notifyCartChange(), 10);

            // 3. Then call the API
            const response = await fetch(`http://localhost:8080/api/cart/item/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                // 4. Get updated data from backend
                setTimeout(() => fetchCartFromBackend(loggedInUserId), 300);
                return true;
            } else {
                console.error("Failed to remove from cart:", response.status);
                // Revert local state if API call failed
                fetchCartFromBackend(loggedInUserId);
                return false;
            }
        } catch (error) {
            console.error("Error removing from cart:", error);
            // Revert local state if API call failed
            fetchCartFromBackend(loggedInUserId);
            return false;
        }
    };

    // Update quantity in cart
    const updateQuantity = async (id, quantity) => {
        if (quantity < 1) return false;

        try {
            console.log("Updating quantity for item:", id, "to", quantity);
            const response = await fetch(`http://localhost:8080/api/cart/quantity/${id}?quantity=${quantity}`, {
                method: "PUT"
            });

            if (response.ok) {
                // Avoid infinite loop by not immediately calling fetchCartFromBackend
                setTimeout(() => fetchCartFromBackend(loggedInUserId), 300);
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
            console.log("Clearing cart for user:", loggedInUserId);
            const response = await fetch(`http://localhost:8080/api/cart/clear/${loggedInUserId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setCartItems([]);
                notifyCartChange();
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
        const count = cartItems.reduce((total, item) => total + item.quantity, 0);
        return count;
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
                // Use debounce to prevent multiple calls
                const now = Date.now();
                if (now - lastFetchTime > 1000) { // 1 second debounce for manual refresh
                    fetchCartFromBackend(loggedInUserId);
                }
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