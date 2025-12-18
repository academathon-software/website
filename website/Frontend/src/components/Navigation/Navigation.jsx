import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h1>Academathon</h1>
        </Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login" className="nav-login">Login</Link></li>
          <li><Link to="/signup" className="nav-signup">Sign Up</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

