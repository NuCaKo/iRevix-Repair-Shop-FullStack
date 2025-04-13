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
import PublicCartPage from './pages/PublicCartPage';
import PublicCheckoutPage from './pages/PublicCheckoutPage';
import PublicPaymentPage from './pages/PublicPaymentPage';

import './App.css';
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || 'pk_test_c3RpcnJpbmctY29icmEtNDAuY2xlcmsuYWNjb3VudHMuZGV2JA';
const mapClerkRoleToAppRole = (clerkRole) => {
    if (clerkRole === 'technician') return 'tamirci';
    return clerkRole; // admin and customer roles stay the same
};
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
    const { isLoaded: isOrgLoaded, organization } = useOrganization();
    const clerkClient = useClerk();

    useEffect(() => {
        const setUserRoleAndOrganization = async () => {
            if (!isUserLoaded || !isSignedIn || !user) {
                return;
            }
            const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || '';
            let appRole = 'customer';
            if (email === 'admin@irevix.com') {
                appRole = 'admin';
            } else if (email === 'technician@irevix.com') {
                appRole = 'tamirci'; // Use app role format
            }
            const clerkRole = mapAppRoleToClerkRole(appRole);
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
            }
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
                role: appRole // Store the app role format
            }));
            if (process.env.NODE_ENV === 'production' && isOrgLoaded && organization) {
                try {
                    const existingMembership = organization.memberships?.find(
                        (membership) => membership.publicUserData.userId === user.id
                    );

                    if (!existingMembership) {
                        await organization.addMember({ userId: user.id, role: clerkRole });
                    } else if (existingMembership.role !== clerkRole) {
                        await organization.updateMember({
                            userId: user.id,
                            role: clerkRole
                        });
                    }
                } catch (error) {
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
    if (!isUserLoaded) {
        return <div>Loading...</div>;
    }
    const clerkRole = user?.publicMetadata?.role;
    const appRole = user?.publicMetadata?.appRole || mapClerkRoleToAppRole(clerkRole);
    const allowedClerkRoles = allowedRoles.map(mapAppRoleToClerkRole);
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
                        <Route path="/cart" element={
                            <>
                                <SignedIn>
                                    <CartPage />
                                </SignedIn>
                                <SignedOut>
                                    <PublicCartPage />
                                </SignedOut>
                            </>
                        } />

                        <Route path="/checkout" element={
                            <>
                                <SignedIn>
                                    <CheckoutPage />
                                </SignedIn>
                                <SignedOut>
                                    <PublicCheckoutPage />
                                </SignedOut>
                            </>
                        } />

                        <Route path="/payment" element={
                            <>
                                <SignedIn>
                                    <PaymentPage />
                                </SignedIn>
                                <SignedOut>
                                    <PublicPaymentPage />
                                </SignedOut>
                            </>
                        } />

                        {/* These routes remain protected */}
                        <Route
                            path="/profile"
                            element={
                                <SignedIn>
                                    <ProfilePage />
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