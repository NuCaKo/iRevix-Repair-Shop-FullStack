import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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

function AppContent() {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, [location.pathname]);

    const hideNavbarRoutes = ['/login', '/signup', '/forgot-password'];
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
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/returns" element={<ReturnsRefundsPage />} />
                <Route
                    path="/service/*"
                    element={
                        <ProtectedRoute
                            element={<ServicePage />}
                            allowedRoles={['tamirci', 'admin']}
                        />
                    }
                />
                <Route
                    path="/support"
                    element={
                        <ProtectedRoute
                            element={<SupportRequestsPage />}
                            allowedRoles={['customer']}
                        />
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            element={<AdminPanel />}
                            allowedRoles={['admin']}
                        />
                    }
                />
                <Route path="/services" element={<ServicePage />} />
                <Route path="/parts" element={<ReplacementParts />} />
                <Route path="/repair-services" element={<RepairServicesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/orders" element={<OrdersPage />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <CartProvider>
            <Router>
                <AppContent />
            </Router>
        </CartProvider>
    );
}

export default App;