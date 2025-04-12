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

    // Track if we've attempted role setting to avoid multiple attempts
    const [roleProcessed, setRoleProcessed] = useState(false);

    // Rate limiting backoff time (ms)
    const [backoffTime, setBackoffTime] = useState(0);

    // Helper function to map between app roles and Clerk roles
    const mapRoleToClerk = (appRole) => {
        if (appRole === 'tamirci') return 'technician';
        return appRole; // admin and customer remain the same
    };

    // Helper function to map from Clerk roles to app roles
    const mapRoleToApp = (clerkRole) => {
        if (clerkRole === 'technician') return 'tamirci';
        return clerkRole; // admin and customer remain the same
    };

    // Simple exponential backoff for rate limiting
    const handleRateLimitError = () => {
        // Start with 2 seconds, then 4, 8, etc.
        const newBackoff = backoffTime ? backoffTime * 2 : 2000;
        setBackoffTime(Math.min(newBackoff, 30000)); // Cap at 30 seconds

        // Set a user-friendly error message
        setProcessingError(`Rate limit exceeded. Please wait a moment (${newBackoff/1000}s) before trying again.`);

        // Auto-retry after backoff period
        setTimeout(() => {
            setProcessingError(null);
            setRoleProcessed(false); // Allow retry
        }, newBackoff);
    };

    // Handle navigation based on user role
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

    // Core authentication effect
    useEffect(() => {
        // Skip if we've already processed the role or there's an error waiting to be cleared
        if (roleProcessed || processingError) {
            return;
        }

        const setUserRoleAndNavigate = async () => {
            if (!isUserLoaded || !isOrgLoaded) {
                // Still loading, wait
                return;
            }

            if (!isSignedIn || !user) {
                // Not signed in, no need to do role processing
                setIsProcessing(false);
                return;
            }

            // User is signed in, start processing
            setIsProcessing(true);
            setRoleProcessed(true); // Mark as processed to avoid duplicate processing

            try {

                // Try to get role from user metadata first (avoid API calls if possible)
                const existingAppRole = user.publicMetadata?.appRole;
                const existingClerkRole = user.publicMetadata?.role;

                if (existingAppRole) {

                    // Store role in localStorage too for consistency
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: user.id,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.primaryEmailAddress?.emailAddress || '',
                        role: existingAppRole
                    }));

                    // We have the role already, just navigate
                    setIsProcessing(false);
                    navigateBasedOnRole(existingAppRole);
                    return;
                }

                // We need to determine and set the role
                // 1) Determine desired role based on email
                const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || "";
                let appRole = "customer";
                if (email === "admin@irevix.com") {
                    appRole = "admin";
                } else if (email === "technician@irevix.com") {
                    appRole = "tamirci"; // Set to app role
                }

                // Map the app role to Clerk role for storage in Clerk
                const clerkRole = mapRoleToClerk(appRole);

                // 2) Update publicMetadata if needed
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

                        // Check for rate limiting
                        if (err.status === 429) {
                            handleRateLimitError();
                            return;
                        }

                        setProcessingError("Error updating user role.");
                        setIsProcessing(false);
                        return;
                    }
                }

                // Store the role in localStorage for easier access even if we don't update metadata
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.primaryEmailAddress?.emailAddress || '',
                    role: appRole // Store the app role
                }));

                // Skip org membership check in development to reduce API calls
                if (process.env.NODE_ENV !== 'production') {
                    setIsProcessing(false);
                    navigateBasedOnRole(appRole);
                    return;
                }

                // 3) Check org membership, only add if not already a member
                // Only do this in production to avoid rate limits in development
                try {
                    const existingMembership = organization?.memberships?.find(
                        (m) => m.publicUserData.userId === user.id
                    );

                    if (!existingMembership) {
                        // Use Clerk role for organization (make sure these roles exist in Clerk Dashboard)
                        await organization.addMember({ userId: user.id, role: clerkRole });
                    } else {
                        // User is already in the organization
                    }
                } catch (err) {
                    // Don't block navigation for org errors
                }

                // 4) Navigate based on app role
                setIsProcessing(false);
                navigateBasedOnRole(appRole);

            } catch (err) {

                // Check for rate limiting
                if (err.status === 429) {
                    handleRateLimitError();
                    return;
                }

                setIsProcessing(false);
            }
        };

        setUserRoleAndNavigate();
    }, [isUserLoaded, isOrgLoaded, isSignedIn, user, roleProcessed, processingError]);

    // For sign out button click
    const handleRetry = () => {
        setProcessingError(null);
        setRoleProcessed(false);
        setBackoffTime(0);
    };

    // If user is signed in, show a loading indicator until we process roles and navigate
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

        // Check if we need to navigate based on stored role
        // This helps in case the effect hasn't run yet
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (storedUser.role) {
            navigateBasedOnRole(storedUser.role);
        }

        // Navigation is in progress or completed
        return null;
    }

    // If user is NOT signed in, show SignIn or SignUp UI based on `mode`
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