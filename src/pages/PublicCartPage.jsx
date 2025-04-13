// Create a new file called PublicCartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../css/CartPage.css';

function PublicCartPage() {
    return (
        <div className="cart-page-container">
            <div className="cart-page-header">
                <h1>Your Cart</h1>
            </div>

            <div className="empty-cart">
                <h2>Please Log In to View Your Cart</h2>
                <p>You need to be logged in as a customer to see your cart items.</p>
                <div className="login-buttons">
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

export default PublicCartPage;