import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faUser,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faCalendarAlt,
    faClock,
    faTabletScreenButton,
    faBatteryFull,
    faMicrochip,
    faVolumeUp,
    faTools,
    faWrench,
    faLaptop,
    faHeadphones,
    faMobileAlt
} from '@fortawesome/free-solid-svg-icons';
import '../css/CheckoutPage.css';
import { useCart } from '../CartContext'; // Import useCart hook

function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart(); // Get cart items from context
    const orderType = location.state?.type || 'all';
    const itemsToCheckout = orderType === 'all'
        ? cartItems
        : orderType === 'parts'
            ? cartItems.filter(item => item.type === 'part')
            : cartItems.filter(item => item.type === 'service');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'credit',
        appointmentDate: '',
        appointmentTime: ''
    });
    const subtotal = itemsToCheckout.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0725; // 7.25% tax rate
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const subtotal = itemsToCheckout.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.0725; // 7.25% tax rate
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const total = subtotal + tax + shipping;
        const orderData = {
            items: itemsToCheckout,
            subtotal,
            tax,
            shipping,
            total,
            formData
        };
        if (formData.paymentMethod === 'inStore') {
            alert('Your order has been placed! Please visit our store to complete the payment.');
            navigate('/', { replace: true });
        } else {
            navigate('/payment', {
                state: {
                    orderData,
                    paymentMethod: formData.paymentMethod
                }
            });
        }
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };
    const getItemIcon = (item) => {
        if (item.icon) return item.icon;
        if (item.type === 'service') {
            if (item.name.includes('iPhone')) return faMobileAlt;
            if (item.name.includes('MacBook') || item.name.includes('Mac')) return faLaptop;
            if (item.name.includes('iPad')) return faTabletScreenButton;
            if (item.name.includes('AirPods')) return faHeadphones;
            if (item.name.includes('Watch')) return faClock;
            return faWrench;
        } else {
            if (item.name.includes('Battery')) return faBatteryFull;
            if (item.name.includes('Screen')) return faTabletScreenButton;
            if (item.name.includes('Logic Board') || item.name.includes('Motherboard')) return faMicrochip;
            if (item.name.includes('Speaker')) return faVolumeUp;
            return faTools;
        }
    };
    if (itemsToCheckout.length === 0) {
        return (
            <div className="checkout-page-container">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                </div>
                <div className="empty-checkout">
                    <h2>Empty Checkout</h2>
                    <p>Your {orderType} cart is empty.</p>
                    <button
                        className="back-to-cart-btn"
                        onClick={() => navigate('/cart')}
                    >
                        ← Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page-container">
            <div className="checkout-header">
                <h1>{orderType === 'parts' ? 'Parts Order' : orderType === 'services' ? 'Service Booking' : 'Checkout'}</h1>
                <p>{itemsToCheckout.length} {itemsToCheckout.length === 1 ? 'item' : 'items'}</p>
            </div>

            <div className="checkout-content">
                <div className="checkout-form-container">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-section">
                            <h2 className="section-title">Contact Information</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">
                                        <FontAwesomeIcon icon={faUser} /> First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FontAwesomeIcon icon={faEnvelope} /> Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">
                                        <FontAwesomeIcon icon={faPhone} /> Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {(orderType === 'parts' || orderType === 'all') && itemsToCheckout.some(item => item.type === 'part') ? (
                            <div className="form-section">
                                <h2 className="section-title">Shipping Address</h2>
                                <div className="form-group">
                                    <label htmlFor="address">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Address
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="zipCode">ZIP Code</label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {(orderType === 'services' || orderType === 'all') && itemsToCheckout.some(item => item.type === 'service') ? (
                            <div className="form-section">
                                <h2 className="section-title">Appointment Details</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="appointmentDate">
                                            <FontAwesomeIcon icon={faCalendarAlt} /> Date
                                        </label>
                                        <input
                                            type="date"
                                            id="appointmentDate"
                                            name="appointmentDate"
                                            value={formData.appointmentDate}
                                            onChange={handleInputChange}
                                            required={itemsToCheckout.some(item => item.type === 'service')}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="appointmentTime">
                                            <FontAwesomeIcon icon={faClock} /> Time
                                        </label>
                                        <input
                                            type="time"
                                            id="appointmentTime"
                                            name="appointmentTime"
                                            value={formData.appointmentTime}
                                            onChange={handleInputChange}
                                            required={itemsToCheckout.some(item => item.type === 'service')}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="form-section">
                            <h2 className="section-title">Payment Method</h2>
                            <div className="payment-options">
                                <div className="payment-option">
                                    <input
                                        type="radio"
                                        id="credit"
                                        name="paymentMethod"
                                        value="credit"
                                        checked={formData.paymentMethod === 'credit'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="credit">Credit Card</label>
                                </div>
                                <div className="payment-option">
                                    <input
                                        type="radio"
                                        id="paypal"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={formData.paymentMethod === 'paypal'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="paypal">PayPal</label>
                                </div>
                                {itemsToCheckout.some(item => item.type === 'service') && (
                                    <div className="payment-option">
                                        <input
                                            type="radio"
                                            id="inStore"
                                            name="paymentMethod"
                                            value="inStore"
                                            checked={formData.paymentMethod === 'inStore'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="inStore">Pay at Store</label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="back-btn"
                                onClick={() => navigate('/cart')}
                            >
                                ← Back to Cart
                            </button>
                            <button type="submit" className="place-order-btn">
                                {itemsToCheckout.every(item => item.type === 'service') ? 'Book Service' : (
                                    itemsToCheckout.some(item => item.type === 'service') ? 'Place Order & Book Service' : 'Place Order'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="order-items">
                        {itemsToCheckout.map(item => (
                            <div key={item.id} className="order-item">
                                <div className="item-info">
                                    <div className="item-image">
                                        <div className="placeholder-image">
                                            <FontAwesomeIcon icon={getItemIcon(item)} className="placeholder-icon" />
                                        </div>
                                        <span className="item-quantity">{item.quantity}</span>
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-type">{item.type === 'service' ? 'Service' : 'Part'}</p>
                                        {item.part_number && <p className="part-number">Part #: {item.part_number}</p>}
                                    </div>
                                </div>
                                <div className="item-price">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="price-details">
                        <div className="price-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {itemsToCheckout.some(item => item.type === 'part') && (
                            <div className="price-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                            </div>
                        )}
                        <div className="price-row">
                            <span>Tax</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="price-total">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;