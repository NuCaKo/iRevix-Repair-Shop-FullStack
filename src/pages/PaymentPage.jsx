import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
};

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit');
    const [paymentData, setPaymentData] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
    const [paypalEmail, setPaypalEmail] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        if (location.state && location.state.orderData) {
            setOrderData(location.state.orderData);
            setPaymentMethod(location.state.paymentMethod || 'credit');
        } else {
            alert("Payment information missing. Redirecting to checkout...");
            setTimeout(() => navigate('/checkout'), 1000);
        }
    }, [location, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

        try {
            // Backend'e siparişi gönderirken ad ve soyadı da ekle
            const response = await fetch(`http://localhost:8080/api/checkout?clerkUserId=${user.id}&firstName=${encodeURIComponent(user.firstName || '')}&lastName=${encodeURIComponent(user.lastName || '')}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error("Order failed to be placed");
            }

            setPaymentSuccess(true); // ödeme başarılı ekranını göster

            // 2 saniye sonra orders sayfasına yönlendir
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (err) {
            console.error(err);
            alert("An error occurred while processing your payment.");
        }
    };


    if (!orderData) {
        return <p>Loading...</p>;
    }

    if (paymentSuccess) {
        return (
            <div className="payment-page-container">
                <Navbar />
                <div className="payment-header">
                    <h1 style={{ color: '#2ecc71' }}>✅ Payment Successful</h1>
                    <p>Your order has been placed. Redirecting to your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page-container">
            <Navbar />
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