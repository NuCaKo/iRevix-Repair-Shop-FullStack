// Create a new file called PublicCheckoutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../css/CheckoutPage.css';

function PublicCheckoutPage() {
    return (
        <div className="checkout-page-container">
            <div className="checkout-header">
                <h1>Checkout</h1>
            </div>

            <div className="empty-checkout">
                <h2>Please Log In to Continue</h2>
                <p>You need to be logged in as a customer to access the checkout page.</p>
                <div className="checkout-buttons">
                    <Link to="/login" className="continue-shopping-btn">
                        <FontAwesomeIcon icon={faSignInAlt} /> Log In
                    </Link>
                    <Link to="/" className="back-to-shopping">
                        <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PublicCheckoutPage;