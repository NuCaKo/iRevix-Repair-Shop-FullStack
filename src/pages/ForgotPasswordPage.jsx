import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/ForgotPasswordPage.css'; // CSS path updated

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        emailOrPhone: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear errors as user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.emailOrPhone) {
            newErrors.emailOrPhone = 'Email address or phone number is required';
        } else if (!formData.emailOrPhone.includes('@') && !formData.emailOrPhone.match(/^\d+$/)) {
            newErrors.emailOrPhone = 'Enter a valid email address or phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Simulate password reset process
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Password reset email sent successfully
            setEmailSent(true);
        } catch (error) {
            setErrors({
                general: 'Could not send password reset request. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="login-container">
                <div className="login-form-container">
                    <div className="login-header">
                        <h1>Email Sent</h1>
                        <p>Password reset instructions have been sent.</p>
                    </div>

                    <div className="login-form">
                        <div className="success-message">
                            Password reset instructions have been sent to your email address. Please check your inbox.
                        </div>

                        <p className="reset-instructions">
                            You can reset your password by clicking the link in the email. If you haven't received an email, please check your spam folder or try again.
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="login-button"
                            style={{ marginTop: '1.5rem' }}
                        >
                            Return to Login Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-form-container">
                <div className="login-header">
                    <h1>Forgot Password</h1>
                    <p>Enter your information to reset your password.</p>
                </div>

                {errors.general && (
                    <div className="error-message">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <p className="forgot-password-instruction">
                        Enter your registered email address or phone number. We will send you the information needed to reset your password.
                    </p>

                    <div className="form-group">
                        <label htmlFor="emailOrPhone">Email or Phone Number</label>
                        <input
                            type="text"
                            id="emailOrPhone"
                            name="emailOrPhone"
                            value={formData.emailOrPhone}
                            onChange={handleChange}
                            className={errors.emailOrPhone ? 'error' : ''}
                            placeholder="example@email.com or 5XX XXX XX XX"
                        />
                        {errors.emailOrPhone && <div className="input-error">{errors.emailOrPhone}</div>}
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Send Password Reset Instructions'}
                    </button>

                    <div className="register-link" style={{ marginTop: '1.5rem' }}>
                        <Link to="/login" className="back-to-login">
                            Return to login page
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;