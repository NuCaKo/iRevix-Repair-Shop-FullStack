import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/SignupPage.css';
import { users } from '../data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const SignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
        role: 'customer', // Customer role by default
        address: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear errors when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (users.some(user => user.email === formData.email)) {
            newErrors.email = 'This email address is already in use';
        }

        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s+/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number (10 digits)';
        } else if (formData.phone && users.some(user => user.phone === formData.phone)) {
            newErrors.phone = 'This phone number is already in use';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Password confirmation is required';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.termsAccepted) {
            newErrors.termsAccepted = 'You must accept the terms of service and privacy policy to continue';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address information is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateVerificationCode = () => {
        const newErrors = {};

        if (!verificationCode.trim()) {
            newErrors.verificationCode = 'Verification code is required';
        } else if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
            newErrors.verificationCode = 'Please enter a valid verification code (6 digits)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = async () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            await sendVerificationCode();
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const sendVerificationCode = async () => {
        setIsLoading(true);

        try {
            // Front-end simulation - verification code sending process
            // In a real application, this would communicate with the backend
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Assume verification code is sent
            setStep(3);
        } catch (error) {
            setErrors({
                general: 'An error occurred while sending the verification code. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateVerificationCode()) {
            return;
        }

        setIsLoading(true);

        try {
            // Front-end simulation - new user registration
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create new user
            const newUser = {
                id: Date.now(), // Create unique ID
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone || '',
                password: formData.password,
                role: formData.role,
                address: formData.address || '',
                serviceHistory: [],
                userPreferences: {
                    notifications: true,
                    marketing: false
                }
            };

            // In a real application, the new user would be saved to the backend
            console.log('New user created:', newUser);

            // Add user data to localStorage (temporary solution)
            const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
            currentUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(currentUsers));

            // Successful registration - redirect to login page
            navigate('/login?registered=true');
        } catch (error) {
            setErrors({
                general: 'An error occurred during registration. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMainMenuClick = () => {
        navigate('/');
    };

    const renderStep1 = () => {
        return (
            <>
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? 'error' : ''}
                        placeholder="Your first name"
                    />
                    {errors.firstName && <div className="input-error">{errors.firstName}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? 'error' : ''}
                        placeholder="Your last name"
                    />
                    {errors.lastName && <div className="input-error">{errors.lastName}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="example@email.com"
                    />
                    {errors.email && <div className="input-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder="5XX XXX XX XX"
                    />
                    {errors.phone && <div className="input-error">{errors.phone}</div>}
                </div>
            </>
        );
    };

    const renderStep2 = () => {
        return (
            <>
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={errors.address ? 'error' : ''}
                        placeholder="Enter your address"
                        rows="3"
                    ></textarea>
                    {errors.address && <div className="input-error">{errors.address}</div>}
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
                    <div className="password-requirements">
                        <p>Your password must include:</p>
                        <ul>
                            <li className={formData.password.length >= 8 ? 'fulfilled' : ''}>At least 8 characters</li>
                            <li className={/[A-Z]/.test(formData.password) ? 'fulfilled' : ''}>At least one uppercase letter</li>
                            <li className={/[a-z]/.test(formData.password) ? 'fulfilled' : ''}>At least one lowercase letter</li>
                            <li className={/\d/.test(formData.password) ? 'fulfilled' : ''}>At least one number</li>
                            <li className={/[@$!%*?&#]/.test(formData.password) ? 'fulfilled' : ''}>At least one special character (@$!%*?&#)</li>
                        </ul>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        placeholder="Enter your password again"
                    />
                    {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
                </div>

                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                    />
                    <label htmlFor="termsAccepted">
                        I accept the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and
                        <Link to="/privacy" target="_blank" rel="noopener noreferrer"> Privacy Policy</Link>
                    </label>
                    {errors.termsAccepted && <div className="input-error">{errors.termsAccepted}</div>}
                </div>
            </>
        );
    };

    const renderStep3 = () => {
        return (
            <>
                <div className="verification-message">
                    <p>We've sent a verification code to your email address. Please check your inbox.</p>
                    <p className="resend-code">
                        Didn't receive a code?
                        <button
                            type="button"
                            className="resend-button"
                            onClick={sendVerificationCode}
                            disabled={isLoading}
                        >
                            Resend
                        </button>
                    </p>
                </div>

                <div className="form-group">
                    <label htmlFor="verificationCode">Verification Code</label>
                    <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className={errors.verificationCode ? 'error' : ''}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                    />
                    {errors.verificationCode && <div className="input-error">{errors.verificationCode}</div>}
                </div>
            </>
        );
    };

    return (
        <div className="signup-container">
            <div className="signup-form-container">
                <div className="signup-header">
                    <h1>Create Account</h1>
                    <p>Create a free account to use our services.</p>
                </div>

                <div className="signup-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number-signup">1</div>
                        <span>Personal Info</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number-signup">2</div>
                        <span>Security</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number-signup">3</div>
                        <span>Verification</span>
                    </div>
                </div>

                {errors.general && (
                    <div className="error-message general-error">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signup-form">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="form-buttons">
                        {step > 1 && (
                            <button
                                type="button"
                                className="back-button"
                                onClick={handlePrevStep}
                                disabled={isLoading}
                            >
                                Back
                            </button>
                        )}

                        <button
                            type="button"
                            className="main-menu-button"
                            onClick={handleMainMenuClick}
                            disabled={isLoading}
                            style={{ marginRight: 'auto' }}
                        >
                            <FontAwesomeIcon icon={faHome} /> Main Page
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                className="next-button"
                                onClick={handleNextStep}
                                disabled={isLoading}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Complete Registration'}
                            </button>
                        )}
                    </div>
                </form>

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