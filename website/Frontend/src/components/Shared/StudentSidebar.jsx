import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faCalendarAlt, 
  faBookOpen,
  faClock,
  faEnvelope,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './StudentSidebar.css';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Sign out handler - clears all auth data
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    setIsMobileMenuOpen(false);
    navigate('/login');
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
        <div className="mobile-overlay visible" onClick={closeMobileMenu}></div>
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
          <div 
            className={`sidebar-nav-item ${isActive('/messages') ? 'active' : ''}`}
            onClick={() => handleNavigation('/messages')}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Messages</span>
          </div>
          <div className="sidebar-nav-separator"></div>
          <div 
            className={`sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => handleNavigation('/profile')}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div 
            className="sidebar-nav-item signout-btn"
            onClick={handleSignOut}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;


