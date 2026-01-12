import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faTrash, 
  faPaperPlane, 
  faCheck, 
  faClock, 
  faTimes,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import TutorSidebar from '../Shared/TutorSidebar';
import AdminSidebar from '../Admin/AdminSidebar';
import { useUser } from '../../context/UserContext';
import './TutorInvitations.css';

const TutorInvitations = () => {
  const { setUserType } = useUser();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // Check if user is admin
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

  useEffect(() => {
    // Only set userType if not admin
    if (!isAdmin) {
      setUserType('tutor');
    }
    fetchInvitations();
  }, [setUserType, isAdmin]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/tutor-invitations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        showMessage('Failed to load invitations', 'error');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      showMessage('Failed to load invitations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/tutor-invitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        showMessage('Invitation sent successfully!', 'success');
        setEmail('');
        setShowAddModal(false);
        fetchInvitations();
      } else {
        const error = await response.json();
        showMessage(error.error || 'Failed to send invitation', 'error');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      showMessage('Failed to send invitation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvitation = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/tutor-invitations/${id}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showMessage('Invitation resent successfully!', 'success');
        fetchInvitations();
      } else {
        const error = await response.json();
        showMessage(error.error || 'Failed to resend invitation', 'error');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      showMessage('Failed to resend invitation', 'error');
    }
  };

  const handleDeleteInvitation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/tutor-invitations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showMessage('Invitation deleted successfully!', 'success');
        fetchInvitations();
      } else {
        showMessage('Failed to delete invitation', 'error');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      showMessage('Failed to delete invitation', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { icon: faClock, className: 'pending', text: 'Pending' },
      USED: { icon: faCheck, className: 'used', text: 'Accepted' },
      EXPIRED: { icon: faTimes, className: 'expired', text: 'Expired' }
    };
    const badge = badges[status] || badges.PENDING;
    
    return (
      <span className={`status-badge ${badge.className}`}>
        <FontAwesomeIcon icon={badge.icon} /> {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="tutor-invitations-page">
      {isAdmin ? <AdminSidebar /> : <TutorSidebar />}
      
      <div className="invitations-main-content">
        <div className="invitations-header">
          <h1>Tutor Invitations</h1>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FontAwesomeIcon icon={faPlus} /> Send Invitation
          </button>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Invitations Stats */}
        <div className="invitations-stats">
          <div className="stat-card">
            <div className="stat-number">{invitations.filter(i => i.status === 'PENDING').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{invitations.filter(i => i.status === 'USED').length}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{invitations.filter(i => i.status === 'EXPIRED').length}</div>
            <div className="stat-label">Expired</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{invitations.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {/* Invitations Table */}
        {loading ? (
          <div className="loading-state">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faEnvelope} className="empty-icon" />
            <h3>No Invitations Yet</h3>
            <p>Send your first tutor invitation to get started!</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <FontAwesomeIcon icon={faPlus} /> Send Invitation
            </button>
          </div>
        ) : (
          <div className="invitations-table-container">
            <div className="table-scroll-wrapper">
            <table className="invitations-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Used At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="email-cell">
                      <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
                      {invitation.email}
                    </td>
                    <td>{getStatusBadge(invitation.status)}</td>
                    <td>{formatDate(invitation.createdAt)}</td>
                    <td>
                      {new Date(invitation.expiresAt) < new Date() ? (
                        <span className="expired-text">Expired</span>
                      ) : (
                        formatDate(invitation.expiresAt)
                      )}
                    </td>
                    <td>{invitation.usedAt ? formatDate(invitation.usedAt) : '-'}</td>
                    <td className="actions-cell">
                      {invitation.status === 'PENDING' && (
                        <button
                          className="action-btn resend-btn"
                          onClick={() => handleResendInvitation(invitation.id)}
                          title="Resend invitation"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        title="Delete invitation"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Add Invitation Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Send Tutor Invitation</h2>
              <p className="modal-description">
                Enter the email address of the person you'd like to invite as a tutor.
              </p>
              <form onSubmit={handleSendInvitation}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tutor@example.com"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setEmail('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorInvitations;

