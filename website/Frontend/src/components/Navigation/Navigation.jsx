import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h1>Academathon</h1>
        </Link>
        
        {/* Desktop Menu */}
        <ul className="nav-menu desktop-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/team">Our Team</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li className="nav-signup-dropdown">
            <span className="dropdown-trigger">Sign Up <span className="dropdown-arrow">▼</span></span>
            <ul className="dropdown-menu">
              <li><Link to="/signup">Student</Link></li>
              <li><Link to="/signup/tutor/apply">Tutor</Link></li>
            </ul>
          </li>
          <li><Link to="/login" className="nav-login-btn">Login</Link></li>
        </ul>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger-btn ${mobileMenuOpen ? 'hidden' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Open menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <button 
          className="close-btn"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          ✕
        </button>
        
        <ul className="mobile-menu">
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/about" onClick={closeMobileMenu}>About Us</Link></li>
          <li><Link to="/team" onClick={closeMobileMenu}>Our Team</Link></li>
          <li><Link to="/pricing" onClick={closeMobileMenu}>Pricing</Link></li>
          <li className="mobile-dropdown">
            <span className="mobile-dropdown-trigger">Sign Up <span className="dropdown-arrow">▼</span></span>
            <ul className="mobile-dropdown-menu">
              <li><Link to="/signup" onClick={closeMobileMenu}>Student</Link></li>
              <li><Link to="/signup/tutor/apply" onClick={closeMobileMenu}>Tutor</Link></li>
            </ul>
          </li>
          <li><Link to="/login" onClick={closeMobileMenu}>Login</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
