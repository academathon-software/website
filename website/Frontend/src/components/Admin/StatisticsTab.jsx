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
  faChevronRight,
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

/* ── Sparkline SVG component ── */
const Sparkline = ({ path, color }) => (
  <svg
    viewBox="0 0 200 55"
    className="admin-sparkline"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0"    />
      </linearGradient>
    </defs>
    <path
      d={`${path} L200,55 L0,55 Z`}
      fill={`url(#sg-${color})`}
    />
    <path
      d={path}
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CARD_META = [
  {
    iconBg:    '#DBEAFE',
    iconColor: '#2563EB',
    chartColor:'93C5FD',
    chartPath: 'M0,38 C25,40 45,42 70,32 C95,22 120,36 150,24 C170,16 188,12 200,8',
  },
  {
    iconBg:    '#ECFDF5',
    iconColor: '#2D6A4F',
    chartColor:'52B788',
    chartPath: 'M0,42 C40,40 80,34 120,28 C160,22 180,18 200,14',
  },
  {
    iconBg:    '#EDE9FE',
    iconColor: '#7C3AED',
    chartColor:'C4B5FD',
    chartPath: 'M0,32 C40,34 80,32 120,33 C160,32 180,30 200,31',
  },
  {
    iconBg:    '#FEF3C7',
    iconColor: '#D97706',
    chartColor:'FCD34D',
    chartPath: 'M0,30 C25,34 55,26 85,30 C115,34 145,26 170,28 C185,29 195,26 200,24',
  },
];

const StatisticsTab = ({ onNavigate }) => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getStatistics();
        if (!cancelled) { setStats(response.data); setError(null); }
      } catch {
        if (!cancelled) setError('Failed to load statistics. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="admin-loading">Loading statistics...</div>;
  if (error)   return <div className="admin-error">{error}</div>;

  const cards = [
    { label: 'Total Users',    value: formatNumber(stats?.totalUsers || 0),        icon: faUserGroup,      trend: stats?.userGrowthRate,    trendLabel: 'from last month' },
    { label: 'Active Tutors',  value: formatNumber(stats?.activeTutors || 0),       icon: faChalkboardUser, trend: stats?.tutorGrowthRate,   trendLabel: 'from last month' },
    { label: 'Total Bookings', value: formatNumber(stats?.totalBookings || 0),      icon: faCalendarCheck,  trend: stats?.bookingGrowthRate, trendLabel: 'from last month' },
    { label: 'Revenue',        value: formatCurrency(stats?.totalRevenue || 0),     icon: faDollarSign,     trend: stats?.revenueGrowthRate, trendLabel: 'from last month' },
  ];

  const quickActions = [
    {
      icon: faUsers,
      iconBg: '#DBEAFE', iconColor: '#2563EB',
      title: 'Manage Users',
      desc: 'View, edit and manage user accounts and permissions',
      tab: 'users',
    },
    {
      icon: faUserPlus,
      iconBg: '#ECFDF5', iconColor: '#2D6A4F',
      title: 'Invite Tutors',
      desc: 'Send invitations and onboard new tutors',
      tab: 'tutors',
    },
    {
      icon: faCalendarDays,
      iconBg: '#EDE9FE', iconColor: '#7C3AED',
      title: 'View Bookings',
      desc: 'Browse and manage all bookings and appointments',
      tab: 'bookings',
    },
  ];

  return (
    <div className="admin-section">
      {/* ── Stat cards ── */}
      <div className="admin-stats-row">
        {cards.map((card, i) => {
          const meta      = CARD_META[i];
          const hasTrend  = card.trend !== null && card.trend !== undefined && !Number.isNaN(card.trend);
          const isNeg     = hasTrend && card.trend < 0;

          return (
            <div key={card.label} className="admin-stat-card">
              <div className="admin-stat-card-top">
                <div
                  className="admin-stat-icon-box"
                  style={{ background: meta.iconBg, color: meta.iconColor }}
                >
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <FontAwesomeIcon icon={card.icon} className="admin-stat-icon-ghost" />
              </div>

              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-value">{card.value}</div>

              {hasTrend && (
                <div className={`admin-stat-trend ${isNeg ? 'negative' : ''}`}>
                  <FontAwesomeIcon icon={isNeg ? faArrowTrendDown : faArrowTrendUp} />
                  <span>{isNeg ? '' : '+'}{card.trend.toFixed(1)}%</span>
                  <span className="admin-stat-trend-label">{card.trendLabel}</span>
                </div>
              )}

              <Sparkline path={meta.chartPath} color={`#${meta.chartColor}`} />
            </div>
          );
        })}
      </div>

      {/* ── Quick actions ── */}
      <div className="admin-quick-actions">
        <h2 className="admin-quick-actions-title">Quick Actions</h2>
        <p className="admin-quick-actions-subtitle">Access the most common administrative tasks</p>

        <div className="admin-quick-actions-grid">
          {quickActions.map((a) => (
            <button
              key={a.tab}
              type="button"
              className="admin-quick-action"
              onClick={() => onNavigate?.(a.tab)}
            >
              <div
                className="admin-quick-action-icon"
                style={{ background: a.iconBg, color: a.iconColor }}
              >
                <FontAwesomeIcon icon={a.icon} />
              </div>
              <div className="admin-quick-action-text">
                <span className="admin-quick-action-title">{a.title}</span>
                <span className="admin-quick-action-desc">{a.desc}</span>
              </div>
              <FontAwesomeIcon icon={faChevronRight} className="admin-quick-action-arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
