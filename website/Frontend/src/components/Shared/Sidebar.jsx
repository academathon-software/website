import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faCalendarAlt, 
  faBookOpen,
  faClock,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}
      
      {/* Mobile Hamburger Button */}
      <button 
        className="mobile-hamburger"
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-circle">at</div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </div>
          <div 
            className={`sidebar-nav-item ${isActive('/calendar') ? 'active' : ''}`}
            onClick={() => handleNavigation('/calendar')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Calendar</span>
          </div>
          <div 
            className={`sidebar-nav-item ${isActive('/book-lesson') ? 'active' : ''}`}
            onClick={() => handleNavigation('/book-lesson')}
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Book Lesson</span>
          </div>
          <div 
            className={`sidebar-nav-item ${isActive('/lesson-history') ? 'active' : ''}`}
            onClick={() => handleNavigation('/lesson-history')}
          >
            <FontAwesomeIcon icon={faClock} />
            <span>Lesson History</span>
          </div>
          <div className="sidebar-nav-separator"></div>
          <div 
            className={`sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => handleNavigation('/profile')}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </div>
          <div 
            className="sidebar-nav-item"
            onClick={() => handleNavigation('/login')}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Sign Out</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;













