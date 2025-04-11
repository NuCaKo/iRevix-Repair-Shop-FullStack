import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { users } from '../data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import ClerkAuth from '../components/ClerkAuth';

const LoginPage = ({ adminMode = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isRegistered = new URLSearchParams(location.search).get('registered') === 'true';
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Admin login state variables
    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
        rememberMe: false
    });

    const handleMainMenuClick = () => {
        navigate('/');
    };

    // If in normal login mode, show only Clerk's component
    if (!adminMode) {
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
    }

    // Admin login functionality
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
                    navigate('/login');
                }
            } else {
                // Failed login
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

    // Clean admin login form
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

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;