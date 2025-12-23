import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import adminAPI from '../../services/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStatistics();
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">Monitor and manage your platform</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <p className="stat-value">{statistics?.totalUsers || 0}</p>
              <div className="stat-breakdown">
                <span>{statistics?.totalStudents || 0} Students</span>
                <span>{statistics?.totalTutors || 0} Tutors</span>
              </div>
            </div>
            <div className={`stat-growth ${getGrowthColor(statistics?.userGrowthRate)}`}>
              {formatPercentage(statistics?.userGrowthRate)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <h3>Active Users</h3>
              <p className="stat-value">
                {(statistics?.activeStudents || 0) + (statistics?.activeTutors || 0)}
              </p>
              <div className="stat-breakdown">
                <span>{statistics?.activeStudents || 0} Students</span>
                <span>{statistics?.activeTutors || 0} Tutors</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-details">
              <h3>Total Bookings</h3>
              <p className="stat-value">{statistics?.totalBookings || 0}</p>
              <div className="stat-breakdown">
                <span>{statistics?.completedBookings || 0} Completed</span>
                <span>{statistics?.pendingBookings || 0} Pending</span>
              </div>
            </div>
            <div className={`stat-growth ${getGrowthColor(statistics?.bookingGrowthRate)}`}>
              {formatPercentage(statistics?.bookingGrowthRate)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(statistics?.totalRevenue)}</p>
              <div className="stat-breakdown">
                <span>Avg: {formatCurrency(statistics?.averageBookingValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button
              className="action-card"
              onClick={() => navigate('/admin/users')}
            >
              <span className="action-icon">👥</span>
              <span className="action-title">Manage Users</span>
              <span className="action-description">View and manage all users</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/admin/invitations')}
            >
              <span className="action-icon">✉️</span>
              <span className="action-title">Invite Tutors</span>
              <span className="action-description">Send tutor invitations</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/admin/bookings')}
            >
              <span className="action-icon">📅</span>
              <span className="action-title">View Bookings</span>
              <span className="action-description">Oversee all bookings</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/admin/statistics')}
            >
              <span className="action-icon">📈</span>
              <span className="action-title">View Reports</span>
              <span className="action-description">Detailed analytics</span>
            </button>
          </div>
        </div>

        {/* Booking Status Overview */}
        <div className="booking-overview-section">
          <h2>Booking Overview</h2>
          <div className="booking-status-grid">
            <div className="booking-status-card completed">
              <h3>{statistics?.completedBookings || 0}</h3>
              <p>Completed</p>
            </div>
            <div className="booking-status-card pending">
              <h3>{statistics?.pendingBookings || 0}</h3>
              <p>Pending</p>
            </div>
            <div className="booking-status-card cancelled">
              <h3>{statistics?.cancelledBookings || 0}</h3>
              <p>Cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

