// Create a new file called PublicPaymentPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../css/PaymentPage.css';

function PublicPaymentPage() {
    return (
        <div className="payment-page-container">
            <div className="payment-header">
                <h1>Complete Your Payment</h1>
            </div>

            <div className="loading-payment">
                <h2>Please Log In to Continue</h2>
                <p>You need to be logged in as a customer to access the payment page.</p>
                <div className="payment-buttons">
                    <Link to="/login" className="back-btn">
                        <FontAwesomeIcon icon={faSignInAlt} /> Log In
                    </Link>
                    <Link to="/" className="back-btn">
                        <FontAwesomeIcon icon={faArrowLeft} /> Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PublicPaymentPage;