import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { users } from '../data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import ClerkAuth from '../components/ClerkAuth';

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isRegistered = new URLSearchParams(location.search).get('registered') === 'true';
    const [authMode, setAuthMode] = useState('clerk'); // 'clerk' or 'legacy'

    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({});
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
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
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show CAPTCHA after 5 failed attempts
        if (loginAttempts >= 4 && !showCaptcha) {
            setShowCaptcha(true);
            return;
        }

        setIsLoading(true);

        try {
            // Frontend validation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // User authentication - only for admin and technician
            const user = users.find(
                u => (u.email === formData.emailOrPhone || u.phone === formData.emailOrPhone) &&
                    u.password === formData.password
            );

            if (user) {
                if (user.role === 'admin' || user.role === 'tamirci') {
                    // Successful login for admin or technician
                    console.log('Login successful!', user);

                    // Save user info to localStorage
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        address: user.address
                    }));

                    // Redirect based on user role
                    if (user.role === 'admin') {
                        navigate('/admin'); // Redirect to admin page
                    } else if (user.role === 'tamirci') {
                        navigate('/service'); // Redirect technician to service page
                    }
                } else {
                    // Regular customers should use Clerk
                    setErrors({
                        general: 'Regular customers should login using the customer login form.'
                    });
                    setAuthMode('clerk');
                }
            } else {
                // Failed login
                setLoginAttempts(prevAttempts => prevAttempts + 1);
                setErrors({
                    general: 'Email/phone or password is incorrect.'
                });
            }
        } catch (error) {
            setErrors({
                general: 'An error occurred while logging in. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMainMenuClick = () => {
        navigate('/');
    };

    // If showing Clerk authentication
    if (authMode === 'clerk') {
        return (
            <div className="login-container">
                <div className="login-form-container clerk-container">
                    <div className="login-header">
                        <h1>Customer Login</h1>
                        <p>Log in to your customer account to use our services.</p>
                    </div>

                    {isRegistered && (
                        <div className="success-message">
                            Your registration has been successfully completed! You can now log in.
                        </div>
                    )}

                    <ClerkAuth mode="signin" />

                    <div className="auth-toggle">
                        <button onClick={() => setAuthMode('legacy')} className="toggle-auth-button">
                            Admin/Technician Login
                        </button>
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

                    <div className="register-link">
                        <p>
                            Don't have an account? <Link to="/signup">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Legacy authentication form for admin and technician
    return (
        <div className="login-container">
            <div className="login-form-container">
                <div className="login-header">
                    <h1>Admin/Technician Login</h1>
                    <p>Log in to access your dashboard.</p>
                </div>

                {errors.general && (
                    <div className="error-message general-error">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
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

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            placeholder="Enter your password"
                        />
                        {errors.password && <div className="input-error">{errors.password}</div>}
                    </div>

                    <div className="form-options">
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <label htmlFor="rememberMe">Remember me</label>
                        </div>

                        <Link to="/forgot-password" className="forgot-password">
                            Forgot Password
                        </Link>
                    </div>

                    {showCaptcha && (
                        <div className="captcha-container">
                            <p>Multiple failed login attempts detected. Please complete the verification below:</p>
                            <div className="captcha-placeholder">
                                CAPTCHA will be displayed here
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-toggle">
                    <button onClick={() => setAuthMode('clerk')} className="toggle-auth-button">
                        Switch to Customer Login
                    </button>
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
            </div>
        </div>
    );
};

export default LoginPage;