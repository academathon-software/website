import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faCheck, 
  faTimes, 
  faSpinner,
  faArrowLeft,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import './Verification.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function VerificationPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state, localStorage (from failed login), or use a default
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail') || '';

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verificationCode: verificationCode
        })
      });

      if (response.ok) {
        setSuccess(true);
        // Clear the pending verification email from localStorage
        localStorage.removeItem('pendingVerificationEmail');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Account verified successfully! You can now log in.' }
          });
        }, 2000);
      } else {
        const errorData = await response.text();
        setError(errorData || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setError('');
        alert('Verification code sent! Please check your email.');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setVerificationCode(value);
    if (error) setError('');
  };

  if (success) {
    return (
      <div className="verification-page">
        <div className="verification-container">
          <div className="success-message">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h2>Account Verified!</h2>
            <p>Your account has been successfully verified. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <div className="logo">
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>academathon</span>
          </div>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit verification code to:</p>
          <div className="email-display">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>{email || 'your email address'}</span>
          </div>
        </div>

        <form onSubmit={handleVerification} className="verification-form">
          <div className="input-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              className={`verification-input ${error ? 'error' : ''}`}
              maxLength="6"
              required
            />
            {error && (
              <div className="error-message">
                <FontAwesomeIcon icon={faTimes} />
                {error}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="verify-btn"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinning" />
                Verifying...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                Verify Account
              </>
            )}
          </button>
        </form>

        <div className="verification-footer">
          <p>Didn't receive the code?</p>
          <button 
            type="button" 
            className="resend-btn"
            onClick={handleResendCode}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinning" />
                Sending...
              </>
            ) : (
              'Resend Code'
            )}
          </button>
          
          <button 
            type="button" 
            className="back-btn"
            onClick={() => navigate('/signup')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
