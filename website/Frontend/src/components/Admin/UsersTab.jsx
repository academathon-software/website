import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faEllipsisVertical,
  faCheck,
  faXmark,
  faTrash,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import adminAPI from '../../services/adminApi';

const ROLE_LABELS = {
  STUDENT: 'Student',
  TUTOR: 'Tutor',
  ADMIN: 'Admin',
};

const getInitials = (username, email) => {
  const source = (username || email || '').trim();
  if (!source) return 'U';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

const formatJoinDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUsers({ search: debouncedSearch });
        if (!cancelled) {
          setUsers(response.data);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        // 401s are intercepted globally and redirect to /login.
        setError('Failed to load users. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const refreshUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ search: debouncedSearch });
      setUsers(response.data);
    } catch (err) {
      console.error('Error refreshing users:', err);
    }
  };

  const handleToggleStatus = async (user) => {
    setOpenMenuId(null);
    const confirmMsg = user.enabled
      ? `Deactivate ${user.username || user.email}?`
      : `Activate ${user.username || user.email}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await adminAPI.updateUserStatus(user.userId, !user.enabled);
      await refreshUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      window.alert('Failed to update user status. Please try again.');
    }
  };

  const handleDelete = async (user) => {
    setOpenMenuId(null);
    if (user.role === 'ADMIN') {
      window.alert('Admin users cannot be deleted.');
      return;
    }
    if (
      !window.confirm(
        `Permanently delete ${user.username || user.email}? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await adminAPI.deleteUser(user.userId);
      await refreshUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      window.alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const handleViewDetails = async (user) => {
    setOpenMenuId(null);
    try {
      const response = await adminAPI.getUserDetails(user.userId);
      setSelectedUser(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      window.alert('Failed to load user details. Please try again.');
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">User Management</h2>
          <p className="admin-card-subtitle">View and manage all platform users</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Total Bookings</th>
                <th>Completed</th>
                <th>Join Date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-table-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="admin-avatar">
                        <span className="admin-avatar-circle">
                          {getInitials(user.username, user.email)}
                        </span>
                        <span className="admin-avatar-name">
                          {user.username || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="admin-table-cell-muted">{user.email}</td>
                    <td>
                      <span className="admin-badge admin-badge-success">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          user.enabled
                            ? 'admin-badge-success'
                            : 'admin-badge-neutral'
                        }`}
                      >
                        {user.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.totalBookings ?? 0}</td>
                    <td>{user.completedBookings ?? 0}</td>
                    <td className="admin-table-cell-muted">
                      {formatJoinDate(user.createdAt)}
                    </td>
                    <td>
                      <div
                        style={{ position: 'relative' }}
                        ref={openMenuId === user.userId ? menuRef : null}
                      >
                        <button
                          className="admin-icon-btn"
                          aria-label="User actions"
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === user.userId ? null : user.userId,
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>
                        {openMenuId === user.userId && (
                          <div
                            className="admin-account-menu"
                            style={{ right: 0, top: 'calc(100% + 4px)' }}
                          >
                            <button
                              className="admin-account-menu-item"
                              onClick={() => handleViewDetails(user)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span>View details</span>
                            </button>
                            <button
                              className="admin-account-menu-item"
                              onClick={() => handleToggleStatus(user)}
                            >
                              <FontAwesomeIcon
                                icon={user.enabled ? faXmark : faCheck}
                              />
                              <span>
                                {user.enabled ? 'Deactivate' : 'Activate'}
                              </span>
                            </button>
                            {user.role !== 'ADMIN' && (
                              <button
                                className="admin-account-menu-item"
                                onClick={() => handleDelete(user)}
                                style={{ color: 'var(--admin-red)' }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>User Details</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-detail-section"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                {selectedUser.profilePictureUrl ? (
                  <img
                    src={selectedUser.profilePictureUrl}
                    alt={selectedUser.username || 'User'}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--admin-border, #e5e7eb)',
                    }}
                  />
                ) : (
                  <span
                    className="admin-avatar-circle"
                    style={{
                      width: 96,
                      height: 96,
                      fontSize: '1.75rem',
                    }}
                  >
                    {getInitials(selectedUser.username, selectedUser.email)}
                  </span>
                )}
              </div>

              <div className="admin-detail-section">
                <h3>Profile</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <label>User ID</label>
                    <span>{selectedUser.userId}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Username</label>
                    <span>{selectedUser.username || '—'}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Email</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Role</label>
                    <span>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Status</label>
                    <span>{selectedUser.enabled ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Joined</label>
                    <span>{formatJoinDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="admin-detail-section">
                  <h3>Bio</h3>
                  <p style={{ margin: 0, color: 'var(--admin-text-secondary)' }}>
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
