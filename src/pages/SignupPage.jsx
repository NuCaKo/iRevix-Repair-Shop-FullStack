import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignupPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import ClerkAuth from '../components/ClerkAuth';

const SignupPage = () => {
    const navigate = useNavigate();

    const handleMainMenuClick = () => {
        navigate('/');
    };

    return (
        <div className="signup-container">
            <div className="top-nav-button">
                <button
                    type="button"
                    className="main-menu-button"
                    onClick={handleMainMenuClick}
                >
                    <FontAwesomeIcon icon={faHome} /> Back to Main Page
                </button>
            </div>

            <div className="signup-form-container minimal clerk-container">
                <ClerkAuth mode="signup" />
            </div>
        </div>
    );
};

export default SignupPage;