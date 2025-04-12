import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    SignIn,
    SignUp,
    useUser,
    useClerk,
    useOrganization,
} from '@clerk/clerk-react';
import './ClerkAuth.css';

const ClerkAuth = ({ mode = 'signin' }) => {
    const navigate = useNavigate();
    const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
    const clerkClient = useClerk();
    const { isLoaded: isOrgLoaded, organization } = useOrganization();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState(null);
    const [roleProcessed, setRoleProcessed] = useState(false);
    const [backoffTime, setBackoffTime] = useState(0);
    const mapRoleToClerk = (appRole) => {
        if (appRole === 'tamirci') return 'technician';
        return appRole; // admin and customer remain the same
    };
    const mapRoleToApp = (clerkRole) => {
        if (clerkRole === 'technician') return 'tamirci';
        return clerkRole; // admin and customer remain the same
    };
    const handleRateLimitError = () => {
        const newBackoff = backoffTime ? backoffTime * 2 : 2000;
        setBackoffTime(Math.min(newBackoff, 30000)); // Cap at 30 seconds
        setProcessingError(`Rate limit exceeded. Please wait a moment (${newBackoff/1000}s) before trying again.`);
        setTimeout(() => {
            setProcessingError(null);
            setRoleProcessed(false); // Allow retry
        }, newBackoff);
    };
    const navigateBasedOnRole = (appRole) => {

        switch (appRole) {
            case "admin":
                navigate("/admin");
                break;
            case "tamirci":
                navigate("/service");
                break;
            default:
                navigate("/");
        }
    };
    useEffect(() => {
        if (roleProcessed || processingError) {
            return;
        }

        const setUserRoleAndNavigate = async () => {
            if (!isUserLoaded || !isOrgLoaded) {
                return;
            }

            if (!isSignedIn || !user) {
                setIsProcessing(false);
                return;
            }
            setIsProcessing(true);
            setRoleProcessed(true); // Mark as processed to avoid duplicate processing

            try {
                const existingAppRole = user.publicMetadata?.appRole;
                const existingClerkRole = user.publicMetadata?.role;

                if (existingAppRole) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: user.id,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.primaryEmailAddress?.emailAddress || '',
                        role: existingAppRole
                    }));
                    setIsProcessing(false);
                    navigateBasedOnRole(existingAppRole);
                    return;
                }
                const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || "";
                let appRole = "customer";
                if (email === "admin@irevix.com") {
                    appRole = "admin";
                } else if (email === "technician@irevix.com") {
                    appRole = "tamirci"; // Set to app role
                }
                const clerkRole = mapRoleToClerk(appRole);
                if (existingClerkRole !== clerkRole) {
                    try {
                        await clerkClient.user?.update({
                            publicMetadata: {
                                ...user.publicMetadata,
                                role: clerkRole, // Store as Clerk role
                                appRole: appRole // Also store original app role
                            },
                        });
                        await clerkClient.user?.reload(); // Refresh local user data
                    } catch (err) {
                        if (err.status === 429) {
                            handleRateLimitError();
                            return;
                        }

                        setProcessingError("Error updating user role.");
                        setIsProcessing(false);
                        return;
                    }
                }
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                    role: appRole // Store the app role
                }));
                if (process.env.NODE_ENV !== 'production') {
                    setIsProcessing(false);
                    navigateBasedOnRole(appRole);
                    return;
                }
                try {
                    const existingMembership = organization?.memberships?.find(
                        (m) => m.publicUserData.userId === user.id
                    );

                    if (!existingMembership) {
                        await organization.addMember({ userId: user.id, role: clerkRole });
                    } else {
                    }
                } catch (err) {
                }
                setIsProcessing(false);
                navigateBasedOnRole(appRole);

            } catch (err) {
                if (err.status === 429) {
                    handleRateLimitError();
                    return;
                }

                setIsProcessing(false);
            }
        };

        setUserRoleAndNavigate();
    }, [isUserLoaded, isOrgLoaded, isSignedIn, user, roleProcessed, processingError]);
    const handleRetry = () => {
        setProcessingError(null);
        setRoleProcessed(false);
        setBackoffTime(0);
    };
    if (isSignedIn) {
        if (isProcessing) {
            return (
                <div className="clerk-auth-container">
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Processing your account...</p>
                    </div>
                </div>
            );
        }

        if (processingError) {
            return (
                <div className="clerk-auth-container">
                    <div className="error-message">
                        <p>{processingError}</p>
                        <button onClick={handleRetry}>Try Again</button>
                    </div>
                </div>
            );
        }
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (storedUser.role) {
            navigateBasedOnRole(storedUser.role);
        }
        return null;
    }
    return (
        <div className="clerk-auth-container">
            {mode === 'signin' ? (
                <SignIn
                    signUpUrl="/signup"
                    redirectUrl={undefined}
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto',
                            card: 'rounded-xl border border-gray-100 shadow-md',
                            headerTitle: 'text-2xl font-semibold text-gray-800',
                            headerSubtitle: 'text-gray-500',
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                            footerActionLink: 'text-blue-600 hover:text-blue-800',
                        },
                    }}
                />
            ) : (
                <SignUp
                    signInUrl="/login"
                    redirectUrl={undefined}
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto',
                            card: 'rounded-xl border border-gray-100 shadow-md',
                            headerTitle: 'text-2xl font-semibold text-gray-800',
                            headerSubtitle: 'text-gray-500',
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                            footerActionLink: 'text-blue-600 hover:text-blue-800',
                        },
                    }}
                />
            )}
        </div>
    );
};

export default ClerkAuth;