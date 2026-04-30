import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSessionExpired, logout, LOGOUT_REASON_SESSION_EXPIRED } from '../../services/auth';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({ title: '', text: '', type: '' });
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole')?.toUpperCase();

  // If we still have a token but it's already past its expiry timestamp, hand
  // off to the central logout flow so the user lands on /login with a notice
  // instead of seeing a generic "Authentication Required" panel.
  useEffect(() => {
    if (requireAuth && token && isSessionExpired()) {
      logout({ reason: LOGOUT_REASON_SESSION_EXPIRED });
    }
  }, [requireAuth, token]);

  useEffect(() => {
    // Check authentication
    if (requireAuth && !token) {
      setMessage({
        title: 'Authentication Required',
        text: 'Please log in to access this page.',
        type: 'auth'
      });
      setShowMessage(true);
      return;
    }
    
    // Check role authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      let roleMessage = '';
      if (userRole === 'STUDENT' && allowedRoles.includes('TUTOR')) {
        roleMessage = 'This page is for tutors only. Students cannot access tutor features.';
      } else if (userRole === 'TUTOR' && allowedRoles.includes('STUDENT')) {
        roleMessage = 'This page is for students only. Tutors cannot access student features.';
      } else if (allowedRoles.includes('ADMIN')) {
        roleMessage = 'This page is for administrators only.';
      } else {
        roleMessage = 'You do not have permission to access this page.';
      }
      
      setMessage({
        title: 'Access Denied',
        text: roleMessage,
        type: 'role'
      });
      setShowMessage(true);
    }
  }, [token, userRole, allowedRoles, requireAuth]);
  
  // Not authenticated - show message then redirect
  if (requireAuth && !token) {
    if (showMessage) {
      return (
        <div className="protected-route-overlay">
          <div className="protected-route-modal">
            <div className="modal-icon auth-icon">🔒</div>
            <h2>{message.title}</h2>
            <p>{message.text}</p>
            <button 
              className="redirect-button"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Wrong role - show message then redirect
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const redirectPath = userRole === 'TUTOR' ? '/tutor-dashboard' : 
                         userRole === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
    
    return (
      <div className="protected-route-overlay">
        <div className="protected-route-modal">
          <div className="modal-icon denied-icon">⛔</div>
          <h2>{message.title}</h2>
          <p>{message.text}</p>
          <p className="current-role">Your current role: <strong>{userRole || 'Unknown'}</strong></p>
          <button 
            className="redirect-button"
            onClick={() => window.location.href = redirectPath}
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Authorized - render children
  return children;
};

export default ProtectedRoute;

