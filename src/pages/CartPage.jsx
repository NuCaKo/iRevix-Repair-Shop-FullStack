import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCart } from '../CartContext';
import Navbar from '../components/Navbar';
import {
    faTrash, faPlus, faMinus, faArrowLeft, faTools, faMicrochip,
    faTabletScreenButton, faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import '../css/CartPage.css';

function CartPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState(null);

    const [cart, setCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const { refreshCart, isLoading } = useCart();

    // Initial setup - check if user is logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setIsLoggedIn(true);
            setUserRole(user.role);
            setUserId(user.id);
        } else {
            setIsLoggedIn(false);
            setUserRole('');
            setUserId(null);
        }
    }, []);

    // Fetch cart data
    const fetchCart = async () => {
        if (isLoggedIn && userRole === 'customer' && userId) {
            try {
                const res = await fetch(`http://localhost:8080/api/cart?userId=${encodeURIComponent(userId)}`);
                if (res.ok) {
                    const data = await res.json();
                    setCart(data);
                    setCartItems(data.items || []);
                } else {
                    console.error("Error response fetching cart:", res.status);
                    setCartItems([]);
                }
            } catch (err) {
                console.error("Error fetching cart:", err);
                setCartItems([]);
            }
        }
    };

    // Call fetchCart when component mounts and user is logged in
    useEffect(() => {
        let isMounted = true;

        if (isLoggedIn && userRole === 'customer' && userId && isMounted) {
            fetchCart();
        }

        return () => {
            isMounted = false; // Cleanup to prevent state updates on unmounted component
        };
    }, [isLoggedIn, userRole, userId]);

    // Update item quantity
    const updateQuantity = async (itemId, newQty) => {
        if (!itemId || newQty < 1) return;
        try {
            const res = await fetch(`http://localhost:8080/api/cart/quantity/${itemId}?quantity=${newQty}`, {
                method: "PUT"
            });
            if (!res.ok) throw new Error("Quantity update failed");

            // After successful update, reload the page to ensure accurate cart count
            window.location.reload();
        } catch (err) {
            console.error("Error updating quantity:", err);
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        if (!itemId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/cart/item/${itemId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Remove failed");

            // After successful removal, reload the page to ensure accurate cart count
            window.location.reload();
        } catch (err) {
            console.error("Error removing item:", err);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        if (!userId) return;

        if (window.confirm('Are you sure you want to empty your cart? This cannot be undone.')) {
            try {
                const res = await fetch(`http://localhost:8080/api/cart/clear/${userId}`, { method: "DELETE" });
                if (res.ok) {
                    // Reload the page after clearing cart
                    window.location.reload();
                }
            } catch (err) {
                console.error("Error clearing cart:", err);
            }
        }
    };

    const displayItems = cartItems || [];
    const partItems = displayItems.filter(item => item.type === 'part');
    const serviceItems = displayItems.filter(item => item.type === 'service');

    const subtotal = displayItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0725;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping - discount;

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'SAVE20') {
            setDiscount(subtotal * 0.2);
        } else {
            alert('Invalid coupon code');
            setDiscount(0);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Loading state
    if (isLoggedIn && userRole === 'customer' && isLoading) {
        return (
            <div className="cart-page-container">
                <div className="cart-page-header">
                    <h1>Your Cart</h1>
                    <p>Loading your cart items...</p>
                </div>
                <div className="empty-cart">
                    <h2>Loading Cart</h2>
                    <p>Please wait while we retrieve your cart items.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <Navbar />
            <div className="cart-page-header">
                <h1>Your Cart</h1>
                {isLoggedIn && userRole === 'customer' && (
                    <p>{displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} in your cart</p>
                )}
            </div>

            {!isLoggedIn ? (
                <div className="empty-cart">
                    <h2>Please Log In to View Your Cart</h2>
                    <p>You need to be logged in as a customer to see your cart items.</p>
                    <Link to="/login" className="continue-shopping-btn">
                        <FontAwesomeIcon icon={faSignInAlt} /> Log In
                    </Link>
                    <Link to="/" className="back-to-shopping">
                        <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                    </Link>
                </div>
            ) : userRole !== 'customer' ? (
                <div className="empty-cart">
                    <h2>Access Restricted</h2>
                    <p>Only customer accounts can access the shopping cart.</p>
                    <Link to="/" className="continue-shopping-btn">
                        <FontAwesomeIcon icon={faArrowLeft} /> Return to Home
                    </Link>
                </div>
            ) : displayItems.length === 0 ? (
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <Link to="/" className="continue-shopping-btn">
                        <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        <div className="checkout-all-container">
                            <button className="empty-cart-btn" onClick={clearCart}>
                                <FontAwesomeIcon icon={faTrash} /> Empty Cart
                            </button>
                        </div>

                        {[{ title: 'Replacement Parts', items: partItems, icon: faTools, type: 'parts' },
                            { title: 'Repair Services', items: serviceItems, icon: faMicrochip, type: 'services' }]
                            .filter(section => section.items.length > 0).map((section, idx) => (
                                <div key={`section-${section.type}`} className="cart-section">
                                    <div className="section-header">
                                        <h2><FontAwesomeIcon icon={section.icon} /> {section.title}</h2>
                                        <button
                                            className="buy-now-btn"
                                            onClick={() => navigate('/checkout', { state: { type: section.type } })}
                                        >
                                            Checkout {section.type === 'parts' ? 'Parts' : 'Services'}
                                        </button>
                                    </div>

                                    {section.items.map((item) => (
                                        <div key={`item-${item.id}`} className="cart-item">
                                            <div className="cart-item-image">
                                                <div className="placeholder-image">
                                                    <FontAwesomeIcon icon={item.icon || faTabletScreenButton} className="placeholder-icon" />
                                                </div>
                                            </div>
                                            <div className="cart-item-details">
                                                <h3>{item.name}</h3>
                                                <p className="item-type">{item.type === 'part' ? 'Part' : 'Service'}</p>
                                                {item.partNumber && <p className="part-number">Part #: {item.partNumber}</p>}
                                                <p className="item-price">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="cart-item-actions">
                                                <div className="quantity-control">
                                                    <button onClick={() => {
                                                        updateQuantity(item.id, item.quantity - 1);
                                                    }} disabled={item.quantity <= 1}>
                                                        <FontAwesomeIcon icon={faMinus} />
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => {
                                                        updateQuantity(item.id, item.quantity + 1);
                                                    }}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                </div>
                                                <button
                                                    className="remove-item-btn"
                                                    onClick={() => {
                                                        removeFromCart(item.id);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                            <div className="cart-item-subtotal">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                        <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                        <div className="summary-row"><span>Tax</span><span>{formatPrice(tax)}</span></div>
                        {discount > 0 && (
                            <div className="summary-row discount">
                                <span>Discount</span>
                                <span>-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="coupon-section">
                            <input type="text" placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                            <button onClick={applyCoupon}>Apply</button>
                        </div>
                        <div className="total-row"><span>Total</span><span>{formatPrice(total)}</span></div>

                        <button className="checkout-btn" onClick={() => navigate('/checkout', { state: { type: 'all' } })}>
                            Checkout All
                        </button>

                        <Link to="/" className="continue-shopping-link">← Continue Shopping</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;