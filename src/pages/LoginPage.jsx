import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import ClerkAuth from '../components/ClerkAuth';

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isRegistered = new URLSearchParams(location.search).get('registered') === 'true';

    const handleMainMenuClick = () => {
        navigate('/');
    };

    return (
        <div className="login-container">
            {/* Back to Main Page button at the top */}
            <div className="top-nav-button">
                <button
                    type="button"
                    className="main-menu-button"
                    onClick={handleMainMenuClick}
                >
                    <FontAwesomeIcon icon={faHome} /> Back to Main Page
                </button>
            </div>

            <div className="login-form-container clerk-container minimal">
                {isRegistered && (
                    <div className="success-message">
                        Your registration has been successfully completed! You can now log in.
                    </div>
                )}

                <ClerkAuth mode="signin" />
            </div>
        </div>
    );
};

export default LoginPage;