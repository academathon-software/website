import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2 className="footer-logo">academathon</h2>
          <p className="footer-tagline">Stay Connected With Us!</p>
          <p className="footer-established">Est. February 2021</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-column">
            <h3>Registration</h3>
            <ul>
              <li><p>For Tutors</p></li>
              <li><p>For Students</p></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Socials</h3>
            <ul>
              <li><a href="https://www.linkedin.com/company/academathon?originalSubdomain=ca" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=100064883838456" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://www.instagram.com/academathon/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Information</h3>
            <ul>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

