import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faCopy,
  faRotateRight,
  faTrash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import adminAPI from '../../services/adminApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || window.location.origin;

const STATUS_BADGE = {
  PENDING: { label: 'Pending', className: 'admin-badge-warning' },
  USED: { label: 'Accepted', className: 'admin-badge-success' },
  EXPIRED: { label: 'Expired', className: 'admin-badge-neutral' },
};

const formatDate = (date) => {
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

const TutorsTab = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInvitations();
      setInvitations(response.data);
      setError(null);
    } catch (err) {
      // 401s are intercepted globally and redirect to /login.
      setError('Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text, type = 'success') => {
    setBanner({ text, type });
    setTimeout(() => setBanner(null), 3500);
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tutor-invitations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        showBanner('Invitation sent successfully!');
        setEmail('');
        await loadInvitations();
      } else {
        const data = await response.json().catch(() => ({}));
        showBanner(data.error || 'Failed to send invitation', 'error');
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      showBanner('Failed to send invitation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!email.trim()) {
      showBanner('Enter an email first to generate an invite link', 'error');
      return;
    }
    setCopying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tutor-invitations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showBanner(data.error || 'Failed to create invitation', 'error');
        return;
      }

      const data = await response.json();
      const link = `${FRONTEND_URL}/signup/tutor/${data.token}`;
      try {
        await navigator.clipboard.writeText(link);
        showBanner('Invite link copied to clipboard!');
      } catch {
        showBanner(link, 'success');
      }
      setEmail('');
      await loadInvitations();
    } catch (err) {
      console.error('Error creating invite link:', err);
      showBanner('Failed to create invite link', 'error');
    } finally {
      setCopying(false);
    }
  };

  const handleResend = async (id) => {
    try {
      await adminAPI.resendInvitation(id);
      showBanner('Invitation resent successfully!');
      await loadInvitations();
    } catch (err) {
      console.error('Error resending invitation:', err);
      showBanner('Failed to resend invitation', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invitation? This cannot be undone.')) return;
    try {
      await adminAPI.deleteInvitation(id);
      showBanner('Invitation deleted');
      await loadInvitations();
    } catch (err) {
      console.error('Error deleting invitation:', err);
      showBanner('Failed to delete invitation', 'error');
    }
  };

  return (
    <div className="admin-section">
      {banner && (
        <div className={banner.type === 'error' ? 'admin-error' : 'admin-success'}>
          {banner.text}
        </div>
      )}

      {/* Send Invitation card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Send Tutor Invitation</h2>
            <p className="admin-card-subtitle">
              Invite experienced educators to join your platform
            </p>
          </div>
        </div>

        <form onSubmit={handleSendInvitation}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="admin-form-input"
              placeholder="tutor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting || !email.trim()}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>{submitting ? 'Sending...' : 'Send Invitation'}</span>
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleCopyInviteLink}
              disabled={copying || !email.trim()}
            >
              <FontAwesomeIcon icon={faCopy} />
              <span>{copying ? 'Generating...' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Pending Invitations card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Pending Invitations</h2>
            <p className="admin-card-subtitle">Track and manage tutor invitations</p>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading invitations...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Sent Date</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-table-empty">
                      No invitations yet. Send your first one above.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const badge = STATUS_BADGE[inv.status] || STATUS_BADGE.PENDING;
                    const isExpired =
                      inv.status === 'EXPIRED' ||
                      (inv.expiresAt && new Date(inv.expiresAt) < new Date());
                    const showResend = inv.status === 'PENDING' || isExpired;

                    return (
                      <tr key={inv.id}>
                        <td>{inv.email}</td>
                        <td className="admin-table-cell-muted">
                          {formatDate(inv.createdAt)}
                        </td>
                        <td className="admin-table-cell-muted">
                          {formatDate(inv.expiresAt)}
                        </td>
                        <td>
                          <span className={`admin-badge ${badge.className}`}>
                            {inv.status === 'USED' && (
                              <FontAwesomeIcon icon={faCheck} />
                            )}
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions-cell">
                            {showResend && (
                              <button
                                className="admin-icon-btn success"
                                onClick={() => handleResend(inv.id)}
                                title="Resend invitation"
                              >
                                <FontAwesomeIcon icon={faRotateRight} />
                              </button>
                            )}
                            <button
                              className="admin-icon-btn danger"
                              onClick={() => handleDelete(inv.id)}
                              title="Delete invitation"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorsTab;
