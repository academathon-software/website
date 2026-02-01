import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './ForgotPassword.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setMessage('Password reset link has been sent to your email. Please check your inbox.');
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <button className="back-button" onClick={() => navigate('/login')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        
        <div className="forgot-password-content">
          <h2 className="forgot-password-title">Reset your password</h2>
          
          <p className="forgot-password-description">
            Enter your email and we'll send a link with instructions on how to reset your password
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">EMAIL</label>
              <input
                type="email"
                className="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button 
              type="submit" 
              className="send-email-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send email'}
            </button>
          </form>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <p className="support-text">
            If you've forgotten your email or don't receive a link{' '}
            <a href="/contact" className="support-link">contact our Support Team</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

