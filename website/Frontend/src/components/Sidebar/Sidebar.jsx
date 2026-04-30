import './Sidebar.css';
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClose,
    faBars,
    faChevronDown,
    faCircleUser,
    faRightFromBracket,
    faGauge,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import logoImg from '../../assets/logo.avif';
import { userAPI } from '../../services/api';
import { logout } from '../../services/auth';

const ROLE_DASHBOARD = {
    ADMIN: '/admin-dashboard',
    TUTOR: '/tutor-dashboard',
    STUDENT: '/dashboard',
};

const Sidebar = () => {
    const [showNav, setShowNav] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);
    const accountRef = useRef(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    const isLoggedIn = !!token;
    const dashboardPath = ROLE_DASHBOARD[(role || '').toUpperCase()] || '/dashboard';

    const closeNav = () => {
        setShowNav(false);
    };

    const handleSignOut = () => {
        // Voluntary sign-out from the marketing nav: clear auth state and drop
        // the user back on the home page (instead of /login).
        setAccountOpen(false);
        closeNav();
        logout({ redirectTo: '/' });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
            }
        };
        if (accountOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [accountOpen]);

    // Pull the user's profile picture so the dropdown trigger shows their actual
    // avatar instead of the generic icon. Falls back to faCircleUser if missing.
    useEffect(() => {
        if (!isLoggedIn) {
            setProfilePictureUrl(null);
            return;
        }
        let cancelled = false;
        userAPI.getCurrentUser()
            .then((res) => {
                if (!cancelled) setProfilePictureUrl(res.data?.profilePictureUrl || null);
            })
            .catch(() => {
                if (!cancelled) setProfilePictureUrl(null);
            });
        return () => { cancelled = true; };
    }, [isLoggedIn]);

    return (
        <div className='nav-bar'>
            <Link className="logo" to="/">
                <img src={logoImg} alt="Academathon" className="logo-img" />
                <span className="coming-soon-tag">Coming Soon</span>
            </Link>
            <nav className={showNav ? 'mobile-show' : ""}>
                <NavLink exact="true" activeClassName="active" to="/" onClick={closeNav}>
                    <span>Home</span>
                </NavLink>
                <NavLink exact="true" activeClassName="active" className="about-link" to="/about" onClick={closeNav}>
                    <span>About Us</span>
                </NavLink>
                <NavLink exact="true" activeClassName="active" className="contact-link" to="/team" onClick={closeNav}>
                    <span>Our Team</span>
                </NavLink>
                <NavLink exact="true" activeClassName="active" className="dashboard-link" to="/pricing" onClick={closeNav}>
                    <span>Prices</span>
                </NavLink>

                {isLoggedIn ? (
                    <>
                        <NavLink to={dashboardPath} onClick={closeNav} className="mobile-login-link">
                            <span>Dashboard</span>
                        </NavLink>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="mobile-cta-link"
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink exact="true" activeClassName="active" to="/login" onClick={closeNav} className="mobile-login-link">
                            <span>Login</span>
                        </NavLink>
                        <Link to="/signup" onClick={closeNav} className="mobile-cta-link">Get Started</Link>
                    </>
                )}
                <FontAwesomeIcon icon={faClose} size="3x" className="close-icon" onClick={closeNav} />
            </nav>

            <div className="nav-actions">
                {isLoggedIn ? (
                    <div className="nav-account" ref={accountRef}>
                        <button
                            type="button"
                            className="nav-account-button"
                            onClick={() => setAccountOpen((prev) => !prev)}
                            aria-haspopup="true"
                            aria-expanded={accountOpen}
                        >
                            {profilePictureUrl ? (
                                <img
                                    src={profilePictureUrl}
                                    alt=""
                                    className="nav-account-avatar"
                                    onError={() => setProfilePictureUrl(null)}
                                />
                            ) : (
                                <FontAwesomeIcon icon={faCircleUser} className="nav-account-icon" />
                            )}
                            <span className="nav-account-name">{username || 'Account'}</span>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className={`nav-account-chevron ${accountOpen ? 'open' : ''}`}
                            />
                        </button>
                        {accountOpen && (
                            <div className="nav-account-menu" role="menu">
                                <Link
                                    to={dashboardPath}
                                    className="nav-account-menu-item"
                                    onClick={() => setAccountOpen(false)}
                                >
                                    <FontAwesomeIcon icon={faGauge} />
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    type="button"
                                    className="nav-account-menu-item"
                                    onClick={handleSignOut}
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-login-btn">Login</Link>
                        <Link to="/signup" className="nav-cta-btn">Get Started</Link>
                    </>
                )}
            </div>

            <FontAwesomeIcon onClick={() => setShowNav(!showNav)} icon={faBars} size="3x" className="hamburger-icon" />
        </div>
    );
};

export default Sidebar;
