import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
    ClerkProvider,
    SignedIn,
    SignedOut,
    RedirectToSignIn,
    useOrganization,
    useUser,
    useClerk,
} from '@clerk/clerk-react';

// Import all your pages
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ServicePage from './pages/ServicePage';
import AdminPanel from './pages/AdminPanel';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import ReplacementParts from './pages/ReplacementParts';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import { CartProvider } from './CartContext';
import RepairServicesPage from './pages/RepairServicesPage';
import OrdersPage from './pages/OrdersPage';
import SupportRequestsPage from './pages/SupportRequestsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsRefundsPage from './pages/ReturnsRefundsPage';

import './App.css';

// Get Clerk publishable key from environment variables
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || 'pk_test_c3RpcnJpbmctY29icmEtNDAuY2xlcmsuYWNjb3VudHMuZGV2JA';

// Helper function to map Clerk roles to application roles
const mapClerkRoleToAppRole = (clerkRole) => {
    if (clerkRole === 'technician') return 'tamirci';
    return clerkRole; // admin and customer roles stay the same
};

// Helper function to map application roles to Clerk roles
const mapAppRoleToClerkRole = (appRole) => {
    if (appRole === 'tamirci') return 'technician';
    return appRole; // admin and customer roles stay the same
};

/**
 * ClerkAuth component:
 * - Runs in the background (renders nothing)
 * - Updates the user's publicMetadata.role based on email
 * - Adds user to the organization if needed
 * - Logs debug info
 */
function ClerkAuth() {
    const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
    // Always call the hook, but we'll conditionally use its values
    const { isLoaded: isOrgLoaded, organization } = useOrganization();
    const clerkClient = useClerk();

    useEffect(() => {
        const setUserRoleAndOrganization = async () => {
            // If user data isn't loaded or user not signed in, skip
            if (!isUserLoaded || !isSignedIn || !user) {
                return;
            }

            // Determine role based on email
            const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || '';
            let appRole = 'customer';
            if (email === 'admin@irevix.com') {
                appRole = 'admin';
            } else if (email === 'technician@irevix.com') {
                appRole = 'tamirci'; // Use app role format
            }

            // Convert to Clerk role for storage
            const clerkRole = mapAppRoleToClerkRole(appRole);

            // Update publicMetadata if needed
            try {
                if (user.publicMetadata?.role !== clerkRole) {
                    await clerkClient.user?.update({
                        publicMetadata: {
                            ...user.publicMetadata,
                            role: clerkRole,     // Store Clerk role format
                            appRole: appRole     // Also store app role format
                        },
                    });
                    await clerkClient.user?.reload(); // refresh local user data
                }
            } catch (error) {
                // Silent error handling
            }

            // Store the app role in localStorage for easy access
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
                role: appRole // Store the app role format
            }));

            // Only perform organization operations in production
            if (process.env.NODE_ENV === 'production' && isOrgLoaded && organization) {
                try {
                    // Check if user is already a member of the organization
                    const existingMembership = organization.memberships?.find(
                        (membership) => membership.publicUserData.userId === user.id
                    );

                    if (!existingMembership) {
                        // Use Clerk role format for organization (make sure these roles exist in Clerk Dashboard)
                        await organization.addMember({ userId: user.id, role: clerkRole });
                    } else if (existingMembership.role !== clerkRole) {
                        // Optionally update organization role if different
                        await organization.updateMember({
                            userId: user.id,
                            role: clerkRole
                        });
                    }
                } catch (error) {
                    // Silent catch - organization operations should not block authentication
                }
            }
        };

        setUserRoleAndOrganization();
    }, [isUserLoaded, isOrgLoaded, isSignedIn, user, organization, clerkClient]);

    return null; // Renders nothing; just runs the effect
}

/**
 * Modified ProtectedRoute component that checks both Clerk roles and app roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoaded: isUserLoaded, user } = useUser();

    // Wait until data is loaded
    if (!isUserLoaded) {
        return <div>Loading...</div>;
    }

    // Get role from publicMetadata and map to app role
    const clerkRole = user?.publicMetadata?.role;
    const appRole = user?.publicMetadata?.appRole || mapClerkRoleToAppRole(clerkRole);

    // Map allowedRoles to Clerk roles for comparison
    const allowedClerkRoles = allowedRoles.map(mapAppRoleToClerkRole);

    // Check if user has access (check both formats)
    const hasAccess = allowedRoles.includes(appRole) || allowedClerkRoles.includes(clerkRole);

    return hasAccess ? children : <Navigate to="/" replace />;
};

function App() {
    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            <CartProvider>
                {/* 1) Run ClerkAuth in the background so user's role & membership get updated */}
                <ClerkAuth />

                {/* 2) Your normal router and routes */}
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<MainPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms" element={<TermsConditionsPage />} />
                        <Route path="/shipping" element={<ShippingPolicyPage />} />
                        <Route path="/returns" element={<ReturnsRefundsPage />} />
                        <Route path="/services" element={<RepairServicesPage />} />
                        <Route path="/parts" element={<ReplacementParts />} />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/*"
                            element={
                                <SignedIn>
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminPanel />
                                    </ProtectedRoute>
                                </SignedIn>
                            }
                        />

                        {/* Technician Routes - note we use 'tamirci' here (app role) */}
                        <Route
                            path="/service/*"
                            element={
                                <SignedIn>
                                    <ProtectedRoute allowedRoles={['tamirci', 'admin']}>
                                        <ServicePage />
                                    </ProtectedRoute>
                                </SignedIn>
                            }
                        />

                        {/* Customer Protected Routes */}
                        <Route
                            path="/profile"
                            element={
                                <SignedIn>
                                    <ProfilePage />
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <SignedIn>
                                    <CartPage />
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <SignedIn>
                                    <CheckoutPage />
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <SignedIn>
                                    <OrdersPage />
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/support"
                            element={
                                <SignedIn>
                                    <SupportRequestsPage />
                                </SignedIn>
                            }
                        />

                        {/* Fallback for signed out users */}
                        <Route
                            path="*"
                            element={
                                <SignedOut>
                                    <RedirectToSignIn />
                                </SignedOut>
                            }
                        />
                    </Routes>
                </Router>
            </CartProvider>
        </ClerkProvider>
    );
}

export default App;