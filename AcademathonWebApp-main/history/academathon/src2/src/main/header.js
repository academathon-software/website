import React, { useState } from 'react';
import "./header.css";
import academathonLogo from "../assets/academathon_logo.jpeg"; // Import the image

const Header = () => {
  const [signupType, setSignupType] = useState(""); // State to manage the selected signup type

  const handleSignupChange = (e) => {
    setSignupType(e.target.value);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={academathonLogo} alt="Tutor Website Logo" />
      </div>
      <nav className="nav">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="search">Search</a></li>
          <li><a href="about">About</a></li>
          <li><a href="contact">Contact</a></li>
          <li><a href="login">Login</a></li>
          <li><a href="signup">Signup</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
