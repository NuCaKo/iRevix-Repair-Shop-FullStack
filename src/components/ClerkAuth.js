import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useClerk, useUser } from '@clerk/clerk-react';
import './ClerkAuth.css';

const ClerkAuth = ({ mode = 'signin' }) => {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();

    return (
        <div className="clerk-auth-container">
            {mode === 'signin' ? (
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