import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useClerk, useUser } from '@clerk/clerk-react';
import { users } from '../data'; // Your existing users data
import './ClerkAuth.css';

const ClerkAuth = ({ mode = 'signin' }) => {
    const navigate = useNavigate();
    const { signOut } = useClerk();
    const { isLoaded, isSignedIn, user } = useUser();
    const [usingLegacyAuth, setUsingLegacyAuth] = useState(false);
    const [legacyCredentials, setLegacyCredentials] = useState({
        emailOrPhone: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Handle legacy auth for admins and technicians
    const handleLegacyAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Check credential against your existing users data
            const user = users.find(
                u => (u.email === legacyCredentials.emailOrPhone || u.phone === legacyCredentials.emailOrPhone) &&
                    u.password === legacyCredentials.password
            );

            if (user && (user.role === 'admin' || user.role === 'tamirci')) {
                // Store user info to localStorage
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
                    navigate('/admin');
                } else if (user.role === 'tamirci') {
                    navigate('/service');
                }
            } else {
                // If not admin or technician, show error
                setError("Invalid credentials or you don't have admin/technician access");
            }
        } catch (error) {
            setError('Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (usingLegacyAuth) {
        return (
            <div className="legacy-auth-container">
                <h2>Admin/Technician Login</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLegacyAuth}>
                    <div className="form-group">
                        <label>Email or Phone</label>
                        <input
                            type="text"
                            value={legacyCredentials.emailOrPhone}
                            onChange={(e) => setLegacyCredentials({
                                ...legacyCredentials,
                                emailOrPhone: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={legacyCredentials.password}
                            onChange={(e) => setLegacyCredentials({
                                ...legacyCredentials,
                                password: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="auth-actions">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setUsingLegacyAuth(false)}
                            className="switch-auth-btn"
                        >
                            Back to Customer Login
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="clerk-auth-container">
            {mode === 'signin' ? (
                <>
                    <SignIn
                        signUpUrl="/signup"
                        afterSignInUrl="/"
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "rounded-xl border border-gray-100 shadow-md",
                                headerTitle: "text-2xl font-semibold text-gray-800",
                                headerSubtitle: "text-gray-500",
                                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                                footerActionLink: "text-blue-600 hover:text-blue-800"
                            }
                        }}
                    />
                    <div className="auth-switch">
                        <button
                            onClick={() => setUsingLegacyAuth(true)}
                            className="admin-auth-btn"
                        >
                            Admin/Technician Login
                        </button>
                    </div>
                </>
            ) : (
                <SignUp
                    signInUrl="/login"
                    afterSignUpUrl="/"
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "rounded-xl border border-gray-100 shadow-md",
                            headerTitle: "text-2xl font-semibold text-gray-800",
                            headerSubtitle: "text-gray-500",
                            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                            footerActionLink: "text-blue-600 hover:text-blue-800"
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ClerkAuth;