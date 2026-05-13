import { useEffect, useState } from 'react';
import "./Login.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  consumeLogoutReason,
  LOGOUT_REASON_SESSION_EXPIRED,
} from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const reason = consumeLogoutReason();
    if (reason === LOGOUT_REASON_SESSION_EXPIRED) {
      setNotice('Your session expired. Please log in again.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        // Store JWT token, user role, userId, and username in localStorage.
        // tokenExpiry is stored as an absolute ms-since-epoch (server sends a
        // duration in `expiresIn`) so the SessionExpiryWatcher can check it
        // directly without re-doing the math.
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', Date.now() + Number(data.expiresIn));
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
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

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <FontAwesomeIcon icon={faGraduationCap} />
          <span>Academathon</span>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="login-title">Login</h2>
          <h3 className="login-subtitle">Welcome back! Login into your account</h3>

          {notice && (
            <div className="login-notice" role="status">
              <p>{notice}</p>
            </div>
          )}

          <div className="login-input-group">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-password-wrapper">
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn">Sign In</button>

          <div className="login-forgot-link">
            <a href="/forgot-password">Forgot your password?</a>
          </div>
        </form>
        
        {error && (
          <div className="login-error">
            <p>{error}</p>
          </div>
        )}
        
        <p className="login-signup-link">
          Don't have an account? 
          <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
