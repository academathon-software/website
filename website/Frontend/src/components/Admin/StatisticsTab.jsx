import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGroup,
  faChalkboardUser,
  faCalendarCheck,
  faDollarSign,
  faArrowTrendUp,
  faArrowTrendDown,
  faUsers,
  faUserPlus,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import adminAPI from '../../services/adminApi';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat('en-CA').format(value || 0);

const StatisticsTab = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getStatistics();
        if (!cancelled) {
          setStats(response.data);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        // 401s are intercepted globally and redirect to /login.
        setError('Failed to load statistics. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  const totalUsers = stats?.totalUsers || 0;
  const activeTutors = stats?.activeTutors || 0;
  const totalBookings = stats?.totalBookings || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  const cards = [
    {
      label: 'Total Users',
      value: formatNumber(totalUsers),
      icon: faUserGroup,
      trend: stats?.userGrowthRate,
      trendLabel: 'from last month',
    },
    {
      label: 'Active Tutors',
      value: formatNumber(activeTutors),
      icon: faChalkboardUser,
      trend: stats?.tutorGrowthRate ?? null,
      trendLabel: 'from last month',
    },
    {
      label: 'Total Bookings',
      value: formatNumber(totalBookings),
      icon: faCalendarCheck,
      trend: stats?.bookingGrowthRate,
      trendLabel: 'from last month',
    },
    {
      label: 'Revenue',
      value: formatCurrency(totalRevenue),
      icon: faDollarSign,
      trend: stats?.revenueGrowthRate ?? null,
      trendLabel: 'from last month',
    },
  ];

  return (
    <div className="admin-section">
      <div className="admin-stats-row">
        {cards.map((card) => {
          const trendValue = card.trend;
          const hasTrend =
            trendValue !== null && trendValue !== undefined && !Number.isNaN(trendValue);
          const isNegative = hasTrend && trendValue < 0;
          return (
            <div key={card.label} className="admin-stat-card">
              <div className="admin-stat-card-top">
                <span className="admin-stat-label">{card.label}</span>
                <FontAwesomeIcon icon={card.icon} className="admin-stat-icon" />
              </div>
              <div className="admin-stat-value">{card.value}</div>
              {hasTrend && (
                <div className={`admin-stat-trend ${isNegative ? 'negative' : ''}`}>
                  <FontAwesomeIcon
                    icon={isNegative ? faArrowTrendDown : faArrowTrendUp}
                  />
                  <span>
                    {isNegative ? '' : '+'}
                    {trendValue.toFixed(1)}%
                  </span>
                  <span className="admin-stat-trend-label">{card.trendLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="admin-quick-actions">
        <h2 className="admin-quick-actions-title">Quick Actions</h2>
        <div className="admin-quick-actions-grid">
          <button
            type="button"
            className="admin-quick-action"
            onClick={() => onNavigate?.('users')}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Manage Users</span>
          </button>
          <button
            type="button"
            className="admin-quick-action"
            onClick={() => onNavigate?.('tutors')}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Invite Tutors</span>
          </button>
          <button
            type="button"
            className="admin-quick-action"
            onClick={() => onNavigate?.('bookings')}
          >
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>View Bookings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
