import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import adminAPI from '../../services/adminApi';
import './Statistics.css';

const Statistics = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [userResponse, bookingResponse] = await Promise.all([
        adminAPI.getUserStatistics(),
        adminAPI.getBookingStatistics(),
      ]);
      setUserStats(userResponse.data);
      setBookingStats(bookingResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem('token')) {
        setError('SESSION_EXPIRED');
      } else {
        setError('Failed to load statistics. Please try again.');
      }
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
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-spinner">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    const isSessionExpired = error === 'SESSION_EXPIRED';
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          {isSessionExpired ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
              <h2 style={{ color: '#333', marginBottom: '10px' }}>Session Expired</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>Your session has expired. Please log back in to continue.</p>
              <button 
                onClick={() => { localStorage.clear(); navigate('/login'); }}
                style={{ padding: '12px 30px', backgroundColor: '#1A803D', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
              >
                Log Back In
              </button>
            </div>
          ) : (
            <div className="error-message">{error}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="page-header">
          <h1>Platform Statistics</h1>
          <p className="page-subtitle">Detailed analytics and insights</p>
        </div>

        {/* User Statistics */}
        <div className="stats-section">
          <h2 className="section-title">📊 User Statistics</h2>
          <div className="stats-cards">
            <div className="stat-card-detailed">
              <div className="stat-card-header">
                <span className="stat-icon">👥</span>
                <h3>Total Users</h3>
              </div>
              <p className="stat-big-number">{userStats?.totalUsers || 0}</p>
              <div className="stat-breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Students:</span>
                  <span className="value">{userStats?.totalStudents || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Tutors:</span>
                  <span className="value">{userStats?.totalTutors || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Admins:</span>
                  <span className="value">{userStats?.totalAdmins || 0}</span>
                </div>
              </div>
            </div>

            <div className="stat-card-detailed">
              <div className="stat-card-header">
                <span className="stat-icon">✅</span>
                <h3>Active Users</h3>
              </div>
              <p className="stat-big-number">{userStats?.activeUsers || 0}</p>
              <div className="stat-breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Inactive:</span>
                  <span className="value">{userStats?.inactiveUsers || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Activity Rate:</span>
                  <span className="value">
                    {userStats?.totalUsers > 0
                      ? `${((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card-detailed">
              <div className="stat-card-header">
                <span className="stat-icon">📈</span>
                <h3>Monthly Growth</h3>
              </div>
              <p className="stat-big-number growth">
                {userStats?.monthlyGrowthRate !== undefined
                  ? `${userStats.monthlyGrowthRate >= 0 ? '+' : ''}${userStats.monthlyGrowthRate.toFixed(1)}%`
                  : '0%'}
              </p>
              <div className="stat-breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Oldest User:</span>
                  <span className="value">
                    {userStats?.oldestUserDate
                      ? new Date(userStats.oldestUserDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Newest User:</span>
                  <span className="value">
                    {userStats?.newestUserDate
                      ? new Date(userStats.newestUserDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="stats-section">
          <h2 className="section-title">📚 Booking Statistics</h2>
          <div className="stats-cards">
            <div className="stat-card-detailed">
              <div className="stat-card-header">
                <span className="stat-icon">📅</span>
                <h3>Total Bookings</h3>
              </div>
              <p className="stat-big-number">{bookingStats?.totalBookings || 0}</p>
              <div className="stat-breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Completed:</span>
                  <span className="value">{bookingStats?.completedBookings || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Scheduled:</span>
                  <span className="value">{bookingStats?.scheduledBookings || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Pending:</span>
                  <span className="value">{bookingStats?.pendingBookings || 0}</span>
                </div>
              </div>
            </div>

            <div className="stat-card-detailed">
              <div className="stat-card-header">
                <span className="stat-icon">✔️</span>
                <h3>Completion Rate</h3>
              </div>
              <p className="stat-big-number success">
                {formatPercentage(bookingStats?.completionRate)}
              </p>
              <div className="stat-breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Cancelled:</span>
                  <span className="value">{bookingStats?.cancelledBookings || 0}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Cancellation Rate:</span>
                  <span className="value">{formatPercentage(bookingStats?.cancellationRate)}</span>
                </div>
              </div>
            </div>

            <div className="stat-card-detailed">
              <div className="stat-card-header">
                <span className="stat-icon">💰</span>
                <h3>Revenue</h3>
              </div>
              <p className="stat-big-number">
                {formatCurrency(bookingStats?.totalRevenue)}
              </p>
              <div className="stat-breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Avg Booking:</span>
                  <span className="value">{formatCurrency(bookingStats?.averageBookingValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Subjects */}
        {bookingStats?.bookingsBySubject && Object.keys(bookingStats.bookingsBySubject).length > 0 && (
          <div className="stats-section">
            <h2 className="section-title">🎓 Popular Subjects</h2>
            <div className="subjects-grid">
              {Object.entries(bookingStats.bookingsBySubject)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([subject, count]) => (
                  <div key={subject} className="subject-card">
                    <div className="subject-name">{subject}</div>
                    <div className="subject-count">{count} bookings</div>
                    <div className="subject-bar">
                      <div
                        className="subject-bar-fill"
                        style={{
                          width: `${(count / Math.max(...Object.values(bookingStats.bookingsBySubject))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* User Registration by Month */}
        {userStats?.usersByMonth && Object.keys(userStats.usersByMonth).length > 0 && (
          <div className="stats-section">
            <h2 className="section-title">📅 User Registration Timeline</h2>
            <div className="timeline-chart">
              {Object.entries(userStats.usersByMonth)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, count]) => (
                  <div key={month} className="timeline-item">
                    <div className="timeline-label">{month}</div>
                    <div className="timeline-bar-container">
                      <div
                        className="timeline-bar"
                        style={{
                          width: `${(count / Math.max(...Object.values(userStats.usersByMonth))) * 100}%`,
                        }}
                      >
                        <span className="timeline-count">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;

