import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
            <div className="signup-form-container clerk-container">
                <div className="signup-header">
                    <h1>Create Customer Account</h1>
                    <p>Create a free account to use our services.</p>
                </div>

                <div className="signup-clerk-container">
                    <ClerkAuth mode="signup" />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    margin: '1.5rem 0'
                }}>
                    <button
                        type="button"
                        className="main-menu-button"
                        onClick={handleMainMenuClick}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        <FontAwesomeIcon icon={faHome} /> Back to Main Page
                    </button>
                </div>

                <div className="login-link">
                    <p>
                        Already have an account? <Link to="/login">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;