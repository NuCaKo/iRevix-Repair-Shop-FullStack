import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../css/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faLock, faTools, faWrench } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../CartContext';
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
    const { getCartCount } = useCart();
    const [cartCount, setCartCount] = useState(0);
    const { isSignedIn, user: clerkUser } = useUser();
    const { signOut: clerkSignOut } = useClerk();
    const [userData, setUserData] = useState({
        name: "Test User",
        role: "",
        avatar: null
    });

    // Normalize user role
    const normalizeRole = useCallback((role) => {
        if (!role) return 'customer';
        if (role === 'technician') return 'tamirci';
        if (role === 'tamirci') return 'tamirci';
        if (role === 'admin') return 'admin';
        return 'customer';
    }, []);

    // Handle navigation for technician
    useEffect(() => {
        if (isLoggedIn && userData.role === 'tamirci' &&
            location.pathname !== '/service' &&
            location.pathname !== '/service/') {
            navigate('/service');
        }
    }, [isLoggedIn, userData.role, location.pathname, navigate]);

    // Cart count synchronization
    useEffect(() => {
        // Initial count
        const initialCount = getCartCount();
        setCartCount(initialCount);

        // Cart update event handler
        const handleCartUpdate = (event) => {
            const count = event.detail?.count ?? 0;
            console.log("Cart updated, new count:", count);
            setCartCount(count);
        };

        // Storage change handler for cross-tab sync
        const handleStorageChange = (e) => {
            if (e.key === 'iRevixCart') {
                try {
                    const cartData = JSON.parse(e.newValue);
                    if (cartData && cartData.count !== undefined) {
                        setCartCount(cartData.count);
                    }
                } catch (error) {
                    console.error("Error parsing cart data:", error);
                }
            }
        };

        // Add event listeners
        document.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            document.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [getCartCount]);

    // User authentication and role management
    useEffect(() => {
        const checkLoggedInStatus = () => {
            if (isSignedIn && clerkUser) {
                const clerkRole = clerkUser?.publicMetadata?.role || 'customer';
                const appRole = clerkUser?.publicMetadata?.appRole;
                const normalizedRole = appRole || normalizeRole(clerkRole);

                setIsLoggedIn(true);
                setUserData({
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`,
                    role: normalizedRole,
                    avatar: clerkUser.imageUrl || null
                });

                // Store user information in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: clerkUser.id,
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    email: clerkUser.primaryEmailAddress?.emailAddress || '',
                    role: normalizedRole
                }));

                // Broadcast user state change
                const userStateChanged = new CustomEvent('userStateChanged');
                document.dispatchEvent(userStateChanged);
            } else {
                setIsLoggedIn(false);
                setUserData({
                    name: "Test User",
                    role: "",
                    avatar: null
                });
                setDropdownOpen(false);
                localStorage.removeItem('currentUser');

                // Broadcast logout
                const userStateChanged = new CustomEvent('userStateChanged');
                document.dispatchEvent(userStateChanged);
            }
        };

        checkLoggedInStatus();
    }, [isSignedIn, clerkUser, location.pathname, normalizeRole]);

    // Dropdown click outside handler
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

    // Logout handler
    const handleLogout = async () => {
        setDropdownOpen(false);

        try {
            localStorage.removeItem('currentUser');
            setIsLoggedIn(false);
            setUserData({
                name: "Test User",
                role: "",
                avatar: null
            });

            if (isSignedIn) {
                try {
                    if (process.env.NODE_ENV === 'development') {
                        await clerkSignOut();
                        navigate('/');
                    } else {
                        await clerkSignOut({ redirectUrl: '/' });
                    }
                } catch (clerkError) {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (error) {
            localStorage.removeItem('currentUser');
            navigate('/');
        }
    };

    // Home click handler
    const handleHomeClick = (e) => {
        if (isLoggedIn && userData.role === 'tamirci') {
            e.preventDefault();
            navigate('/service');
            return;
        }
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        setClick(false);
    };

    // Toggle mobile menu
    const handleClick = () => setClick(!click);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    // Determine user type
    const isTechnician = isLoggedIn && userData.role === 'tamirci';
    const isAdmin = isLoggedIn && userData.role === 'admin';
    const isCustomer = isLoggedIn && userData.role === 'customer';

    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Logo */}
                <Link
                    to={isTechnician ? "/ServicePage" : "/"}
                    className="navbar-logo"
                    onClick={handleHomeClick}
                >
                    <span className="brand-text">iRevix</span>
                </Link>

                {/* Mobile Menu Toggle */}
                {!isTechnician && (
                    <div className="menu-icon" onClick={handleClick}>
                        <FontAwesomeIcon icon={click ? faTimes : faBars} />
                    </div>
                )}

                {/* Navigation Menu */}
                {!isTechnician && (
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                        <li><Link to="/services"><FontAwesomeIcon icon={faWrench} /> Repair</Link></li>
                        <li><Link to="/parts"><FontAwesomeIcon icon={faTools} /> Parts</Link></li>
                        <li><Link to="/contact"><FontAwesomeIcon icon={faEnvelope} /> Contact</Link></li>
                        {isAdmin && (
                            <li><Link to="/admin"><FontAwesomeIcon icon={faLock} /> Admin</Link></li>
                        )}
                    </ul>
                )}

                {/* Right Side - Cart and User */}
                <div className="navbar-right">
                    {/* Shopping Cart */}
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

                    {/* User Section */}
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

                                        {isCustomer && (
                                            <>
                                                <Link
                                                    to="/orders"
                                                    className="dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <FontAwesomeIcon icon={faClipboardList} />
                                                    <span>My Orders</span>
                                                </Link>
                                                <Link
                                                    to="/support"
                                                    className="dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <FontAwesomeIcon icon={faHeadset} />
                                                    <span>Support Requests</span>
                                                </Link>
                                            </>
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
    );
}

export default Navbar;