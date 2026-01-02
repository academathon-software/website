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
        if (data.role === 'ADMIN') {
          window.location.href = '/admin-dashboard';
        } else if (data.role === 'TUTOR') {
          window.location.href = '/tutor-dashboard';
        } else if (data.role === 'STUDENT') {
          window.location.href = '/dashboard';
        } else {
          // Default fallback for any other roles
          window.location.href = '/dashboard';
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Incorrect email or password';
        
        // Check if verification is required - redirect to verification page
        if (errorMessage.startsWith('VERIFICATION_REQUIRED:')) {
          // Store email for verification page
          localStorage.setItem('pendingVerificationEmail', email);
          setError('Account not verified. A new verification code has been sent to your email. Redirecting...');
          setTimeout(() => {
            window.location.href = '/verify';
          }, 2000);
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    }
  };

  // #region agent log - Debug mobile login visibility
  React.useEffect(() => {
    const logData = (msg, data, hypothesisId) => {
      fetch('http://127.0.0.1:7242/ingest/407b07ca-5ce6-4fbf-96c0-2e4d8929b53b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.jsx:useEffect',message:msg,data:data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:hypothesisId})}).catch(()=>{});
    };
    
    logData('Login component mounted', { windowWidth: window.innerWidth, windowHeight: window.innerHeight }, 'H5');
    
    const loginPage = document.querySelector('.login-page');
    const greenblock = document.querySelector('.greenblock');
    const loginContainer = document.querySelector('.login-container');
    
    if (loginPage) {
      const styles = window.getComputedStyle(loginPage);
      logData('login-page styles', { 
        display: styles.display, 
        position: styles.position,
        height: styles.height,
        overflow: styles.overflow,
        visibility: styles.visibility,
        opacity: styles.opacity,
        paddingTop: styles.paddingTop,
        zIndex: styles.zIndex
      }, 'H1,H2,H3');
    } else {
      logData('login-page NOT FOUND', {}, 'H4');
    }
    
    if (greenblock) {
      const styles = window.getComputedStyle(greenblock);
      const rect = greenblock.getBoundingClientRect();
      logData('greenblock styles', { 
        display: styles.display, 
        height: styles.height,
        overflow: styles.overflow,
        position: styles.position,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        rectHeight: rect.height
      }, 'H1,H2');
    } else {
      logData('greenblock NOT FOUND', {}, 'H4');
    }
    
    if (loginContainer) {
      const styles = window.getComputedStyle(loginContainer);
      const rect = loginContainer.getBoundingClientRect();
      logData('login-container styles', { 
        display: styles.display, 
        visibility: styles.visibility,
        height: styles.height,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        rectHeight: rect.height,
        zIndex: styles.zIndex
      }, 'H3,H4,H5');
    } else {
      logData('login-container NOT FOUND', {}, 'H4');
    }
  }, []);
  // #endregion

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
