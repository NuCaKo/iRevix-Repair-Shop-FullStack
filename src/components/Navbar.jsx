import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../css/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faLock, faTools, faWrench } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../CartContext'; // Import the cart context
import { useUser, useClerk } from '@clerk/clerk-react';
import {
    faUser,
    faShoppingCart,
    faSignInAlt,
    faClipboardList,
    faHeadset,
    faSignOutAlt,
    faEnvelope
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const [click, setClick] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartCount } = useCart(); // Get cart count from context

    // Clerk integration
    const { isSignedIn, user: clerkUser } = useUser();
    const { signOut: clerkSignOut } = useClerk();

    // User data state
    const [userData, setUserData] = useState({
        name: "Test User",
        role: "",
        avatar: null
    });

    // Force component to re-render when location changes to update cart count
    const [forceUpdate, setForceUpdate] = useState(0);

    // Helper function to normalize roles
    const normalizeRole = (role) => {
        // Map Clerk roles to app roles
        if (!role) return 'customer';
        if (role === 'technician') return 'tamirci';
        if (role === 'tamirci') return 'tamirci';
        if (role === 'admin') return 'admin';
        return 'customer';
    };

    // Redirect tamirci users to service page if not already there
    useEffect(() => {
        if (isLoggedIn && userData.role === 'tamirci' && location.pathname !== '/service' && location.pathname !== '/service/') {

            navigate('/service');
        }
    }, [isLoggedIn, userData.role, location.pathname, navigate]);

    // Check user login status and set role correctly
    useEffect(() => {
        const checkLoggedInStatus = () => {
            // If user is signed in with Clerk, use that data
            if (isSignedIn && clerkUser) {
                // Get role from publicMetadata (this is critical)
                const clerkRole = clerkUser?.publicMetadata?.role || 'customer';
                const appRole = clerkUser?.publicMetadata?.appRole;

                // Use appRole if available, otherwise normalize the clerkRole
                const normalizedRole = appRole || normalizeRole(clerkRole);


                setIsLoggedIn(true);
                setUserData({
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`,
                    role: normalizedRole,
                    avatar: clerkUser.imageUrl || null
                });

                // Update localStorage for consistent behavior
                localStorage.setItem('currentUser', JSON.stringify({
                    id: clerkUser.id,
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    email: clerkUser.primaryEmailAddress?.emailAddress || '',
                    role: normalizedRole
                }));
            }
            // User is not signed in with Clerk
            else {
                // Clear user state
                setIsLoggedIn(false);
                setUserData({
                    name: "Test User",
                    role: "",
                    avatar: null
                });

                // Ensure dropdown is closed
                setDropdownOpen(false);

                // Clear user data from localStorage
                localStorage.removeItem('currentUser');
            }
        };

        checkLoggedInStatus();

        // Force update to refresh cart count
        setForceUpdate(prev => prev + 1);
    }, [isSignedIn, clerkUser, location.pathname]); // Check when auth state or location changes

    // Add a listener for storage events to update cart count when localStorage changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'iRevixCart') {
                // Force re-render to update cart count
                setForceUpdate(prev => prev + 1);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleClick = () => setClick(!click);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // COMPLETELY REVISED LOGOUT FUNCTION for Navbar.jsx
    const handleLogout = async () => {

        // 1. First, close the dropdown immediately
        setDropdownOpen(false);

        try {
            // 2. Always clear localStorage first to ensure local state is reset
            localStorage.removeItem('currentUser');

            // 3. Reset React state immediately
            setIsLoggedIn(false);
            setUserData({
                name: "Test User",
                role: "",
                avatar: null
            });

            // 4. Force update component to reflect changes
            setForceUpdate(prev => prev + 1);

            // 5. If signed in with Clerk, try to sign out
            // Use a more robust approach to handle rate limiting
            if (isSignedIn) {

                try {
                    // For development environment, use a simpler logout method
                    // that doesn't rely on redirects (which could be affected by rate limiting)
                    if (process.env.NODE_ENV === 'development') {
                        await clerkSignOut();
                        navigate('/');
                    } else {
                        // In production, use redirect-based signout
                        await clerkSignOut({ redirectUrl: '/' });
                    }
                } catch (clerkError) {

                    // Still navigate even if Clerk signout fails
                    navigate('/');
                }
            } else {
                // If not signed in with Clerk, just navigate
                navigate('/');
            }
        } catch (error) {

            // Even if there's an error, ensure state is reset
            localStorage.removeItem('currentUser');
            navigate('/');
        }
    };

    // Function to handle Home link or iRevix logo click - scroll to top
    const handleHomeClick = (e) => {
        // If tamirci role, always redirect to service page
        if (isLoggedIn && userData.role === 'tamirci') {
            e.preventDefault();
            navigate('/service');
            return;
        }

        // For other roles, normal behavior
        if (location.pathname === '/') {
            e.preventDefault(); // Prevent default link behavior
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        setClick(false); // Close mobile menu
    };

    // Role-based flags for conditional rendering
    const isTechnician = isLoggedIn && userData.role === 'tamirci';
    const isAdmin = isLoggedIn && userData.role === 'admin';
    const isCustomer = isLoggedIn && userData.role === 'customer';

    // Get the current cart count - calculate it directly to ensure it's up to date
    const cartCount = getCartCount();

    return (
        <>
            <nav className="navbar">
                <div className="navbar-content">
                    {/* Logo - always show */}
                    <Link
                        to={isTechnician ? "/ServicePage" : "/"}
                        className="navbar-logo"
                        onClick={handleHomeClick}
                    >
                        <span className="brand-text">iRevix</span>
                    </Link>

                    {/* Hamburger menu icon - only show if not technician or on mobile view */}
                    {!isTechnician && (
                        <div className="menu-icon" onClick={handleClick}>
                            <FontAwesomeIcon icon={click ? faTimes : faBars} />
                        </div>
                    )}

                    {/* Menu items - only show if not a technician */}
                    {!isTechnician && (
                        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                            <li><Link to="/services"><FontAwesomeIcon icon={faWrench} /> Repair</Link></li>
                            <li><Link to="/parts"><FontAwesomeIcon icon={faTools} /> Parts</Link></li>
                            <li><Link to="/contact"><FontAwesomeIcon icon={faEnvelope} /> Contact</Link></li>
                            {/* Admin panel only shown to admin role */}
                            {isAdmin && (
                                <li><Link to="/admin"><FontAwesomeIcon icon={faLock} /> Admin</Link></li>
                            )}
                        </ul>
                    )}

                    <div className="navbar-right">
                        {/* Shopping Cart - not shown to technicians or admins */}
                        {!isTechnician && !isAdmin && (
                            <div className="cart-container">
                                <Link to="/cart" className="cart-icon">
                                    <FontAwesomeIcon icon={faShoppingCart} />
                                    {isCustomer && cartCount > 0 && (
                                        <span className="cart-badge">{cartCount}</span>
                                    )}
                                </Link>
                            </div>
                        )}

                        {/* User Section - completely separated login/logout states */}
                        <div className="user-container" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <div className="logged-in-container">
                                    <div className="user-profile" onClick={toggleDropdown}>
                                        {userData.avatar && userData.avatar !== 'null' && userData.avatar !== '' ? (
                                            <img src={userData.avatar} alt="User" className="user-avatar" />
                                        ) : (
                                            <FontAwesomeIcon icon={faUser} className="user-icon" />
                                        )}
                                        <span className="user-name">{userData.name}</span>
                                    </div>

                                    {dropdownOpen && (
                                        <div className="user-dropdown">
                                            <Link
                                                to="/profile"
                                                className="dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>Profile</span>
                                            </Link>

                                            {/* My Orders only for customers */}
                                            {isCustomer && (
                                                <Link
                                                    to="/orders"
                                                    className="dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <FontAwesomeIcon icon={faClipboardList} />
                                                    <span>My Orders</span>
                                                </Link>
                                            )}

                                            {/* Support Requests only for customers */}
                                            {isCustomer && (
                                                <Link
                                                    to="/support"
                                                    className="dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <FontAwesomeIcon icon={faHeadset} />
                                                    <span>Support Requests</span>
                                                </Link>
                                            )}

                                            <div className="dropdown-divider"></div>

                                            <button
                                                className="dropdown-item logout-button"
                                                onClick={handleLogout}
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="login-button">
                                    <FontAwesomeIcon icon={faSignInAlt} />
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;