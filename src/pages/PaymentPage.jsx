import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard,
    faLock,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import {
    faCcVisa,
    faCcMastercard,
    faCcAmex,
    faCcPaypal
} from '@fortawesome/free-brands-svg-icons';
import '../css/PaymentPage.css';

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.orderData;
    const paymentMethod = location.state?.paymentMethod;
    useEffect(() => {
        if (!orderData) {
            navigate('/checkout');
        }
    }, [orderData, navigate]);

    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    });

    const [paypalEmail, setPaypalEmail] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Payment processed successfully!');
        navigate('/', { replace: true });
    };

    if (!orderData) {
        return <div className="loading">Loading...</div>;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <div className="payment-page-container">
            <div className="payment-header">
                <h1>Complete Your Payment</h1>
                <p>Please enter your payment details to complete your order</p>
            </div>

            <div className="payment-content">
                <div className="payment-form-container">
                    {paymentMethod === 'credit' ? (
                        <form onSubmit={handleSubmit} className="payment-form">
                            <div className="form-section">
                                <div className="payment-icons">
                                    <FontAwesomeIcon icon={faCcVisa} className="card-icon visa" />
                                    <FontAwesomeIcon icon={faCcMastercard} className="card-icon mastercard" />
                                    <FontAwesomeIcon icon={faCcAmex} className="card-icon amex" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cardNumber">
                                        <FontAwesomeIcon icon={faCreditCard} /> Card Number
                                    </label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        value={paymentData.cardNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cardHolder">Card Holder Name</label>
                                    <input
                                        type="text"
                                        id="cardHolder"
                                        name="cardHolder"
                                        placeholder="John Doe"
                                        value={paymentData.cardHolder}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="expiryDate">Expiry Date</label>
                                        <input
                                            type="text"
                                            id="expiryDate"
                                            name="expiryDate"
                                            placeholder="MM/YY"
                                            value={paymentData.expiryDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cvv">
                                            <FontAwesomeIcon icon={faLock} /> CVV
                                        </label>
                                        <input
                                            type="text"
                                            id="cvv"
                                            name="cvv"
                                            placeholder="123"
                                            value={paymentData.cvv}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="save-card-option">
                                    <input
                                        type="checkbox"
                                        id="saveCard"
                                        name="saveCard"
                                        checked={paymentData.saveCard}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="saveCard">Save this card for future purchases</label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => navigate('/checkout')}
                                >
                                    ← Back to Checkout
                                </button>
                                <button type="submit" className="complete-payment-btn">
                                    Complete Payment
                                </button>
                            </div>
                        </form>
                    ) : paymentMethod === 'paypal' ? (
                        <form onSubmit={handleSubmit} className="payment-form">
                            <div className="form-section">
                                <div className="payment-icons paypal-icon-container">
                                    <FontAwesomeIcon icon={faCcPaypal} className="card-icon paypal" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="paypalEmail">PayPal Email</label>
                                    <input
                                        type="email"
                                        id="paypalEmail"
                                        name="paypalEmail"
                                        placeholder="youremail@example.com"
                                        value={paypalEmail}
                                        onChange={(e) => setPaypalEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <p className="paypal-info">
                                    You will be redirected to PayPal to complete your payment securely.
                                </p>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => navigate('/checkout')}
                                >
                                    ← Back to Checkout
                                </button>
                                <button type="submit" className="complete-payment-btn paypal-btn">
                                    Continue to PayPal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="payment-error">
                            <p>Invalid payment method selected. Please go back and try again.</p>
                            <button
                                className="back-btn"
                                onClick={() => navigate('/checkout')}
                            >
                                ← Back to Checkout
                            </button>
                        </div>
                    )}
                </div>

                <div className="payment-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-items">
                        {orderData.items && orderData.items.map(item => (
                            <div key={item.id} className="summary-item">
                                <div className="item-name-qty">
                                    <span className="item-qty">{item.quantity}x</span>
                                    <span className="item-name">{item.name}</span>
                                </div>
                                <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="price-details">
                        <div className="price-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(orderData.subtotal || 0)}</span>
                        </div>
                        <div className="price-row">
                            <span>Shipping</span>
                            <span>{orderData.shipping === 0 ? 'Free' : formatPrice(orderData.shipping || 0)}</span>
                        </div>
                        <div className="price-row">
                            <span>Tax</span>
                            <span>{formatPrice(orderData.tax || 0)}</span>
                        </div>
                        {orderData.discount > 0 && (
                            <div className="price-row discount">
                                <span>Discount</span>
                                <span>-{formatPrice(orderData.discount || 0)}</span>
                            </div>
                        )}
                        <div className="total-row">
                            <span>Total</span>
                            <span>{formatPrice(orderData.total || 0)}</span>
                        </div>
                    </div>

                    <div className="secure-payment-info">
                        <FontAwesomeIcon icon={faLock} className="lock-icon" />
                        <p>Your payment information is secure. We use industry-standard encryption to protect your data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;