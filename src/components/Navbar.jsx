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
    const { isSignedIn, user: clerkUser } = useUser();
    const { signOut: clerkSignOut } = useClerk();
    const [userData, setUserData] = useState({
        name: "Test User",
        role: "",
        avatar: null
    });
    const [forceUpdate, setForceUpdate] = useState(0);
    const normalizeRole = (role) => {
        if (!role) return 'customer';
        if (role === 'technician') return 'tamirci';
        if (role === 'tamirci') return 'tamirci';
        if (role === 'admin') return 'admin';
        return 'customer';
    };
    useEffect(() => {
        if (isLoggedIn && userData.role === 'tamirci' && location.pathname !== '/service' && location.pathname !== '/service/') {

            navigate('/service');
        }
    }, [isLoggedIn, userData.role, location.pathname, navigate]);
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
                localStorage.setItem('currentUser', JSON.stringify({
                    id: clerkUser.id,
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    email: clerkUser.primaryEmailAddress?.emailAddress || '',
                    role: normalizedRole
                }));
            }
            else {
                setIsLoggedIn(false);
                setUserData({
                    name: "Test User",
                    role: "",
                    avatar: null
                });
                setDropdownOpen(false);
                localStorage.removeItem('currentUser');
            }
        };

        checkLoggedInStatus();
        setForceUpdate(prev => prev + 1);
    }, [isSignedIn, clerkUser, location.pathname]); // Check when auth state or location changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'iRevixCart') {
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
            setForceUpdate(prev => prev + 1);
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
    const handleHomeClick = (e) => {
        if (isLoggedIn && userData.role === 'tamirci') {
            e.preventDefault();
            navigate('/service');
            return;
        }
        if (location.pathname === '/') {
            e.preventDefault(); // Prevent default link behavior
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        setClick(false); // Close mobile menu
    };
    const isTechnician = isLoggedIn && userData.role === 'tamirci';
    const isAdmin = isLoggedIn && userData.role === 'admin';
    const isCustomer = isLoggedIn && userData.role === 'customer';
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