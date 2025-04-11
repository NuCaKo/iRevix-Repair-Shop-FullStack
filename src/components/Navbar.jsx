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

    // Kullanıcı bilgileri
    const [userData, setUserData] = useState({
        name: "Test User",
        role: "",
        avatar: null // You can add user avatar image here
    });

    // Force component to re-render when location changes to update cart count
    const [forceUpdate, setForceUpdate] = useState(0);

    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
    useEffect(() => {
        const checkLoggedInStatus = () => {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setIsLoggedIn(true);
                setUserData({
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    avatar: null
                });
            } else if (isSignedIn && clerkUser) {
                // Handle Clerk user
                setIsLoggedIn(true);
                setUserData({
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`,
                    role: 'customer', // Clerk users are always customers
                    avatar: clerkUser.imageUrl || null
                });

                // Store basic user info in localStorage for consistent behavior
                if (!localStorage.getItem('currentUser')) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: clerkUser.id,
                        firstName: clerkUser.firstName || '',
                        lastName: clerkUser.lastName || '',
                        email: clerkUser.primaryEmailAddress?.emailAddress || '',
                        role: 'customer'
                    }));
                }
            } else {
                setIsLoggedIn(false);
                setUserData({
                    name: "Test User",
                    role: "",
                    avatar: null
                });
            }
        };

        checkLoggedInStatus();

        // Force update to refresh cart count
        setForceUpdate(prev => prev + 1);
    }, [location.pathname, isSignedIn, clerkUser]); // Check on page change and Clerk auth state change

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

    // Çıkış yapma işlemi
    const handleLogout = async () => {
        // Check if user is signed in with Clerk
        if (isSignedIn) {
            try {
                await clerkSignOut();
            } catch (error) {
                console.error("Error signing out with Clerk:", error);
            }
        }

        // Clear localStorage regardless of auth method
        localStorage.removeItem('currentUser');

        // Diğer kullanıcı bilgilerini sıfırla
        setIsLoggedIn(false);
        setUserData({
            name: "Test User",
            role: "",
            avatar: null
        });

        navigate('/'); // Ana sayfaya yönlendir
    };

    // Function to handle Home link or iRevix logo click - scroll to top
    const handleHomeClick = (e) => {
        // Eğer tamirci rolü ise ve logo/home linkine tıklarsa, service sayfasına yönlendir
        if (isLoggedIn && userData.role === 'tamirci') {
            e.preventDefault();
            navigate('/service');
            return;
        }

        // Diğer roller için normal davranış
        if (location.pathname === '/') {
            e.preventDefault(); // Prevent default link behavior
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        setClick(false); // Close mobile menu
    };

    // Tamirci ve admin rolü için özel navbar
    const isTechnician = isLoggedIn && userData.role === 'tamirci';
    const isAdmin = isLoggedIn && userData.role === 'admin';
    const isCustomer = isLoggedIn && userData.role === 'customer';

    // Get the current cart count - calculate it directly to ensure it's up to date
    const cartCount = getCartCount();

    // Check if the user is a Clerk user
    const isClerkUser = isSignedIn && clerkUser;

    return (
        <>
            <nav className="navbar">
                <div className="navbar-content">
                    {/* Logo - her zaman göster */}
                    <Link
                        to={isTechnician ? "/service" : "/"}
                        className="navbar-logo"
                        onClick={handleHomeClick}
                    >
                        <span className="brand-text">iRevix</span>
                    </Link>

                    {/* Hamburger menü ikonu - sadece tamirci değilse veya mobil görünümde göster */}
                    {!isTechnician && (
                        <div className="menu-icon" onClick={handleClick}>
                            <FontAwesomeIcon icon={click ? faTimes : faBars} />
                        </div>
                    )}

                    {/* Menü öğeleri - sadece tamirci değilse göster */}
                    {!isTechnician && (
                        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                            {/* Home linkini kaldırdık */}
                            <li><Link to="/repair-services"><FontAwesomeIcon icon={faWrench} /> Repair</Link></li>
                            <li><Link to="/parts"><FontAwesomeIcon icon={faTools} /> Parts</Link></li>
                            <li><Link to="/contact"><FontAwesomeIcon icon={faEnvelope} /> Contact</Link></li>
                            {/* Admin panelini sadece admin rolüne sahipse gösterelim */}
                            {isAdmin && (
                                <li><Link to="/admin"><FontAwesomeIcon icon={faLock} /> Admin</Link></li>
                            )}
                        </ul>
                    )}

                    <div className="navbar-right">
                        {/* Shopping Cart - tamirci veya admin için gösterilmeyecek */}
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

                        {/* User Section - her zaman göster */}
                        <div className="user-container" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <>
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
                                            <Link to="/profile" className="dropdown-item">
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>Profile</span>
                                            </Link>

                                            {/* My Orders only for non-clerk customers, admins and technicians */}
                                            {userData.role === 'customer' && (
                                                <Link to="/orders" className="dropdown-item">
                                                    <FontAwesomeIcon icon={faClipboardList} />
                                                    <span>My Orders</span>
                                                </Link>
                                            )}

                                            {/* Support Requests only for customers */}
                                            {userData.role === 'customer' && (
                                                <Link to="/support" className="dropdown-item">
                                                    <FontAwesomeIcon icon={faHeadset} />
                                                    <span>Support Requests</span>
                                                </Link>
                                            )}

                                            <div className="dropdown-divider"></div>

                                            <button className="dropdown-item logout-button" onClick={handleLogout}>
                                                <FontAwesomeIcon icon={faSignOutAlt} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </>
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