import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
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

const clerkPubKey = 'pk_test_c3RpcnJpbmctY29icmEtNDAuY2xlcmsuYWNjb3VudHMuZGV2JA';

// Custom role-based route protection
const ProtectedRoute = ({ element, allowedRoles }) => {
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isAuthenticated = !!currentUser;
    const userRole = currentUser?.role;

    if (!isAuthenticated || !allowedRoles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

// This route requires authentication (either clerk or legacy)
const AnyAuthProtectedRoute = ({ element }) => {
    const storedUser = localStorage.getItem('currentUser');
    const isAuthenticated = !!storedUser;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

function AppContent() {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, [location.pathname]);

    const hideNavbarRoutes = ['/login', '/loginadm', '/signup', '/forgot-password'];
    const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

    const isTechnician = currentUser?.role === 'tamirci';
    const allowedTechnicianRoutes = ['/service', '/profile'];

    if (isTechnician &&
        !allowedTechnicianRoutes.some(route => location.pathname.startsWith(route)) &&
        !hideNavbarRoutes.includes(location.pathname)) {
        return <Navigate to="/service" replace />;
    }

    return (
        <>
            {shouldShowNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                {/* New route for direct admin login */}
                <Route path="/loginadm" element={<LoginPage adminMode={true} />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/returns" element={<ReturnsRefundsPage />} />

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            element={<AdminPanel />}
                            allowedRoles={['admin']}
                        />
                    }
                />

                {/* Technician routes */}
                <Route
                    path="/service/*"
                    element={
                        <ProtectedRoute
                            element={<ServicePage />}
                            allowedRoles={['tamirci', 'admin']}
                        />
                    }
                />

                {/* Customer auth routes */}
                <Route
                    path="/profile"
                    element={
                        <AnyAuthProtectedRoute element={<ProfilePage />} />
                    }
                />

                <Route
                    path="/support"
                    element={
                        <AnyAuthProtectedRoute element={<SupportRequestsPage />} />
                    }
                />

                {/* Public routes with optional auth */}
                <Route path="/services" element={<RepairServicesPage />} />
                <Route path="/parts" element={<ReplacementParts />} />
                <Route path="/repair-services" element={<RepairServicesPage />} />

                {/* Customer-only routes that need auth */}
                <Route
                    path="/cart"
                    element={<AnyAuthProtectedRoute element={<CartPage />} />}
                />
                <Route
                    path="/checkout"
                    element={<AnyAuthProtectedRoute element={<CheckoutPage />} />}
                />
                <Route
                    path="/payment"
                    element={<AnyAuthProtectedRoute element={<PaymentPage />} />}
                />
                <Route
                    path="/orders"
                    element={<AnyAuthProtectedRoute element={<OrdersPage />} />}
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            <CartProvider>
                <Router>
                    <AppContent />
                </Router>
            </CartProvider>
        </ClerkProvider>
    );
}

export default App;