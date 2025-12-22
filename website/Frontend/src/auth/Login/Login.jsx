import React from 'react';
import "./Login.css";
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';

function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store JWT token, user role, userId, and username in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', data.expiresIn);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        console.log("SUCCESSFULLY LOGGED IN!");
        
        // Redirect based on user role
        if (data.role === 'TUTOR') {
          window.location.href = '/tutor-dashboard';
        } else if (data.role === 'STUDENT') {
          window.location.href = '/dashboard';
        } else {
          // Default fallback for any other roles
          window.location.href = '/dashboard';
        }
      } else {
        setError('Incorrect email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className='greenblock'>
        <div className="title">
        <FontAwesomeIcon icon={faGraduationCap} />
          Academathon
        </div>
        
        <div className="login-container">
          <form onSubmit={handleLogin}>
            <h2 className='logintext'>Login</h2>
            <h3 className='undertext'>Welcome back! Login into your account</h3>
            
            <div className="input-group">
              <label className='text'>Email</label>
              <input
                className='custom-input'
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="input-group">
              <label className='text'>Password</label>
              <input
                className='custom-input'
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="login-button">
              <button type="submit" className="sign-in-btn">Sign In</button>
            </div>

            <div className="forgot-password-link">
              <a href="/forgot-password">Forgot your password?</a>
            </div>
          </form>
          
          <div className="error">
            {error && <p>{error}</p>}
          </div>
          
          <h4 className='underbutton'>
            Don't have an account? 
            <strong> <a href="/signup">Sign up</a></strong>
          </h4>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
