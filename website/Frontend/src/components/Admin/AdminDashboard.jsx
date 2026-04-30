import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartColumn,
  faUsers,
  faUserPlus,
  faCalendarDays,
  faRightFromBracket,
  faCircleUser,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import StatisticsTab from './StatisticsTab';
import UsersTab from './UsersTab';
import TutorsTab from './TutorsTab';
import BookingsTab from './BookingsTab';
import logoImg from '../../assets/logo.avif';
import { logout } from '../../services/auth';
import './AdminDashboard.css';

const TABS = [
  { id: 'statistics', label: 'Statistics', icon: faChartColumn },
  { id: 'users', label: 'Users', icon: faUsers },
  { id: 'tutors', label: 'Tutors', icon: faUserPlus },
  { id: 'bookings', label: 'Bookings', icon: faCalendarDays },
];

const VALID_TAB_IDS = TABS.map((t) => t.id);

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const tabFromUrl = searchParams.get('tab');
  const activeTab = VALID_TAB_IDS.includes(tabFromUrl) ? tabFromUrl : 'statistics';

  useEffect(() => {
    if (!VALID_TAB_IDS.includes(tabFromUrl)) {
      setSearchParams({ tab: 'statistics' }, { replace: true });
    }
  }, [tabFromUrl, setSearchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Voluntary sign-out — no `reason` so the login page won't show a
  // "session expired" notice the user didn't trigger.
  const handleSignOut = () => {
    logout();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab />;
      case 'tutors':
        return <TutorsTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'statistics':
      default:
        return <StatisticsTab onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link to="/" className="admin-logo" aria-label="Academathon home">
            <img src={logoImg} alt="Academathon" className="admin-logo-img" />
          </Link>

          <div className="admin-topbar-title">
            <h1>Admin Dashboard</h1>
            <p className="admin-topbar-subtitle">Manage your platform</p>
          </div>

          <div className="admin-topbar-account" ref={menuRef}>
            <button
              className="admin-account-button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <FontAwesomeIcon icon={faCircleUser} className="admin-account-icon" />
              <span className="admin-account-label">Administrator</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`admin-account-chevron ${menuOpen ? 'open' : ''}`}
              />
            </button>

            {menuOpen && (
              <div className="admin-account-menu" role="menu">
                <button className="admin-account-menu-item" onClick={handleSignOut}>
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="admin-tabs" role="tablist">
        <div className="admin-tabs-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} className="admin-tab-icon" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="admin-tab-panel">{renderActiveTab()}</main>
    </div>
  );
};

export default AdminDashboard;
