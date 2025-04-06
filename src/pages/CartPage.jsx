import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faPlus,
    faMinus,
    faArrowLeft,
    faCreditCard,
    faTools,
    faShoppingBag,
    faMobileAlt,
    faLaptop,
    faBatteryFull,
    faMicrochip,
    faVolumeUp,
    faKeyboard,
    faTabletScreenButton,
    faHeadphones,
    faSignInAlt,
    faUserLock
} from '@fortawesome/free-solid-svg-icons';
import '../css/CartPage.css';
import { useCart } from '../CartContext'; // Import useCart hook

function CartPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');

    // Use the cart context instead of local state
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

    // Kullanıcı giriş durumunu kontrol et
    useEffect(() => {
        const checkLoginStatus = () => {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setIsLoggedIn(true);
                setUserRole(user.role);
            } else {
                setIsLoggedIn(false);
                setUserRole('');
            }
        };

        checkLoginStatus();
    }, []);

    // Giriş yapılmamışsa veya müşteri değilse boş sepet göster
    const displayItems = isLoggedIn && userRole === 'customer' ? cartItems : [];

    // Separate items by type
    const partItems = displayItems.filter(item => item.type === 'part');
    const serviceItems = displayItems.filter(item => item.type === 'service');

    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // Calculate cart totals
    const subtotal = displayItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0725; // 7.25% tax rate
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping - discount;

    // Apply coupon code
    const applyCoupon = () => {
        // Mock coupon validation
        if (couponCode.toUpperCase() === 'SAVE20') {
            setDiscount(subtotal * 0.2); // 20% discount
        } else {
            alert('Invalid coupon code');
            setDiscount(0);
        }
    };

    // Handle empty cart button click - modified for better confirmation
    const handleEmptyCart = () => {
        if (window.confirm('Are you sure you want to empty your cart? This cannot be undone.')) {
            clearCart();
        }
    };

    // Format price to USD
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <div className="cart-page-container">
            <div className="cart-page-header">
                <h1>Your Cart</h1>
                {isLoggedIn && userRole === 'customer' && (
                    <p>{displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} in your cart</p>
                )}
            </div>

            {!isLoggedIn ? (
                <div className="empty-cart">
                    <h2>Please Log In to View Your Cart</h2>
                    <p>You need to be logged in to see your cart items.</p>
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
                    <Link to="/parts" className="continue-shopping-btn">
                        <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {/* Empty Cart Button */}
                        {displayItems.length > 0 && (
                            <div className="checkout-all-container">
                                <button className="empty-cart-btn" onClick={handleEmptyCart}>
                                    <FontAwesomeIcon icon={faTrash} /> Empty Cart
                                </button>
                            </div>
                        )}

                        {/* Replacement Parts Section */}
                        {partItems.length > 0 && (
                            <div className="cart-section">
                                <div className="section-header">
                                    <h2><FontAwesomeIcon icon={faTools} /> Replacement Parts</h2>
                                    <button
                                        className="buy-now-btn parts-btn"
                                        onClick={() => navigate('/checkout', { state: { type: 'parts' } })}
                                    >
                                        Buy Parts Now
                                    </button>
                                </div>

                                {partItems.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-image">
                                            <div className="placeholder-image">
                                                <FontAwesomeIcon icon={item.icon || faTabletScreenButton} className="placeholder-icon" />
                                            </div>
                                        </div>
                                        <div className="cart-item-details">
                                            <h3>{item.name}</h3>
                                            <p className="item-type">Part</p>
                                            {item.part_number && <p className="part-number">Part #: {item.part_number}</p>}
                                            <p className="item-price">{formatPrice(item.price)}</p>
                                        </div>
                                        <div className="cart-item-actions">
                                            <div className="quantity-control">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                            <button
                                                className="remove-item-btn"
                                                onClick={() => removeFromCart(item.id)}
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
                        )}

                        {/* Services Section */}
                        {serviceItems.length > 0 && (
                            <div className="cart-section">
                                <div className="section-header">
                                    <h2><FontAwesomeIcon icon={faTools} /> Repair Services</h2>
                                    <button
                                        className="buy-now-btn services-btn"
                                        onClick={() => navigate('/checkout', { state: { type: 'services' } })}
                                    >
                                        Book Services Now
                                    </button>
                                </div>

                                {serviceItems.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-image">
                                            <div className="placeholder-image">
                                                <FontAwesomeIcon icon={item.icon || faMicrochip} className="placeholder-icon" />
                                            </div>
                                        </div>
                                        <div className="cart-item-details">
                                            <h3>{item.name}</h3>
                                            <p className="item-type">Service</p>
                                            <p className="item-price">{formatPrice(item.price)}</p>
                                        </div>
                                        <div className="cart-item-actions">
                                            <div className="quantity-control">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                            <button
                                                className="remove-item-btn"
                                                onClick={() => removeFromCart(item.id)}
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
                        )}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="summary-row discount">
                                <span>Discount</span>
                                <span>-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="coupon-section">
                            <input
                                type="text"
                                placeholder="Coupon Code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button onClick={applyCoupon}>Apply</button>
                        </div>
                        <div className="total-row">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        {displayItems.length > 0 && (
                            <button
                                className="checkout-btn"
                                onClick={() => navigate('/checkout', { state: { type: 'all' } })}
                            >
                                Checkout All
                            </button>
                        )}

                        <Link to="/" className="continue-shopping-link">
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;