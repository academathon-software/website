import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/admin-dashboard',
    },
    {
      name: 'User Management',
      icon: '👥',
      path: '/admin/users',
    },
    {
      name: 'Tutor Invitations',
      icon: '✉️',
      path: '/admin/invitations',
    },
    {
      name: 'Booking Oversight',
      icon: '📅',
      path: '/admin/bookings',
    },
    {
      name: 'Platform Statistics',
      icon: '📈',
      path: '/admin/statistics',
    },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <div className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            {isExpanded ? (
              <>
                <span className="admin-logo-icon">🛡️</span>
                <span className="admin-logo-text">Admin Panel</span>
              </>
            ) : (
              <span className="admin-logo-icon">🛡️</span>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle sidebar"
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

      <nav className="admin-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {isExpanded && <span className="nav-text">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="sign-out-btn" onClick={handleSignOut}>
          <span className="nav-icon">🚪</span>
          {isExpanded && <span className="nav-text">Sign Out</span>}
        </button>
      </div>
    </div>
    </>
  );
};

export default AdminSidebar;

