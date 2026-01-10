import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import adminAPI from '../../services/adminApi';
import './UserManagement.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    enabled: '',
    search: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(filters);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem('token')) {
        setError('SESSION_EXPIRED');
      } else {
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await adminAPI.getUserDetails(userId);
      setSelectedUser(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      alert('Failed to load user details. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="page-header">
          <h1>User Management</h1>
          <p className="page-subtitle">Manage all platform users</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="role-filter">Role</label>
            <select
              id="role-filter"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TUTOR">Tutors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.enabled}
              onChange={(e) => handleFilterChange('enabled', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <label htmlFor="search-filter">Search</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by email or username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <button className="clear-filters-btn" onClick={() => setFilters({ role: '', enabled: '', search: '' })}>
            Clear Filters
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-spinner">Loading users...</div>
        ) : error === 'SESSION_EXPIRED' ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
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
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            <div className="table-scroll-hint">👆 Swipe left/right to see all columns</div>
            <div className="table-scroll-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Total Bookings</th>
                  <th>Completed</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                          {user.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{user.totalBookings || 0}</td>
                      <td>{user.completedBookings || 0}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() => handleViewDetails(user.userId)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className={`btn-toggle ${user.enabled ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleUserStatus(user.userId, user.enabled)}
                            title={user.enabled ? 'Deactivate' : 'Activate'}
                          >
                            {user.enabled ? '🔒' : '✅'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="user-detail-grid">
                  <div className="detail-item">
                    <label>User ID</label>
                    <span>{selectedUser.userId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Username</label>
                    <span>{selectedUser.username}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Role</label>
                    <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${selectedUser.enabled ? 'active' : 'inactive'}`}>
                      {selectedUser.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Total Bookings</label>
                    <span>{selectedUser.totalBookings || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Completed Bookings</label>
                    <span>{selectedUser.completedBookings || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Joined</label>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated</label>
                    <span>{formatDate(selectedUser.updatedAt)}</span>
                  </div>
                  {selectedUser.bio && (
                    <div className="detail-item full-width">
                      <label>Bio</label>
                      <span>{selectedUser.bio}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

