import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faCalendar,
  faClock,
  faEye,
  faXmark,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';
import adminAPI from '../../services/adminApi';

const STATUS_BADGE = {
  PENDING: { label: 'Pending', className: 'admin-badge-warning' },
  SCHEDULED: { label: 'Confirmed', className: 'admin-badge-success' },
  COMPLETED: { label: 'Completed', className: 'admin-badge-info' },
  CANCELLED: { label: 'Cancelled', className: 'admin-badge-error' },
  REJECTED: { label: 'Rejected', className: 'admin-badge-error' },
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

const formatTime = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
};

const formatDateTime = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const formatDuration = (start, end) => {
  if (!start || !end) return '—';
  try {
    const ms = new Date(end) - new Date(start);
    if (Number.isNaN(ms) || ms <= 0) return '—';
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes - hours * 60;
    if (remainder === 0) return `${hours * 60} min`;
    return `${hours * 60 + remainder} min`;
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const computeBookingAmount = (booking) => {
  if (!booking?.hourlyRate || !booking?.startTime || !booking?.endTime) {
    return booking?.hourlyRate ?? null;
  }
  const ms = new Date(booking.endTime) - new Date(booking.startTime);
  if (!Number.isFinite(ms) || ms <= 0) return booking.hourlyRate;
  const hours = ms / (1000 * 60 * 60);
  return Math.round(booking.hourlyRate * hours);
};

const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getBookings({ status: statusFilter });
        if (!cancelled) {
          setBookings(response.data);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        // 401s are intercepted globally and redirect to /login.
        setError('Failed to load bookings. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const handleViewDetails = async (id) => {
    try {
      const response = await adminAPI.getBookingDetails(id);
      setSelectedBooking(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      window.alert('Failed to load booking details. Please try again.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      booking.studentName?.toLowerCase().includes(q) ||
      booking.tutorName?.toLowerCase().includes(q) ||
      booking.subject?.toLowerCase().includes(q) ||
      String(booking.id).includes(q)
    );
  });

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Booking Oversight</h2>
          <p className="admin-card-subtitle">Monitor and manage all tutoring sessions</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SCHEDULED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading bookings...</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Tutor</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="10" className="admin-table-empty">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const badge =
                    STATUS_BADGE[booking.status] || {
                      label: booking.status,
                      className: 'admin-badge-neutral',
                    };
                  return (
                    <tr key={booking.id}>
                      <td className="admin-table-cell-muted">#{booking.id}</td>
                      <td>{booking.studentName}</td>
                      <td>{booking.tutorName}</td>
                      <td>{booking.subject || '—'}</td>
                      <td>
                        <span className="admin-table-cell-with-icon">
                          <FontAwesomeIcon icon={faCalendar} />
                          {formatDate(booking.startTime)}
                        </span>
                      </td>
                      <td>
                        <span className="admin-table-cell-with-icon">
                          <FontAwesomeIcon icon={faClock} />
                          {formatTime(booking.startTime)}
                        </span>
                      </td>
                      <td className="admin-table-cell-muted">
                        {formatDuration(booking.startTime, booking.endTime)}
                      </td>
                      <td>
                        <span className={`admin-badge ${badge.className}`}>
                          {badge.label}
                        </span>
                        {booking.hasRescheduleRequest && (
                          <span
                            title="Has reschedule request"
                            style={{ marginLeft: 6 }}
                          >
                            <FontAwesomeIcon
                              icon={faRotate}
                              style={{
                                color: 'var(--admin-amber)',
                                fontSize: '0.8rem',
                              }}
                            />
                          </span>
                        )}
                      </td>
                      <td>{formatCurrency(computeBookingAmount(booking))}</td>
                      <td>
                        <button
                          className="admin-icon-btn"
                          onClick={() => handleViewDetails(booking.id)}
                          title="View details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedBooking && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Booking Details</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-detail-section">
                <h3>Booking</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <label>Booking ID</label>
                    <span>#{selectedBooking.id}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Subject</label>
                    <span>{selectedBooking.subject || '—'}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Status</label>
                    <span>
                      <span
                        className={`admin-badge ${
                          (STATUS_BADGE[selectedBooking.status] || {}).className ||
                          'admin-badge-neutral'
                        }`}
                      >
                        {(STATUS_BADGE[selectedBooking.status] || {}).label ||
                          selectedBooking.status}
                      </span>
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Start</label>
                    <span>{formatDateTime(selectedBooking.startTime)}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>End</label>
                    <span>{formatDateTime(selectedBooking.endTime)}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Duration</label>
                    <span>
                      {formatDuration(
                        selectedBooking.startTime,
                        selectedBooking.endTime,
                      )}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Hourly Rate</label>
                    <span>{formatCurrency(selectedBooking.hourlyRate)}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Total</label>
                    <span>{formatCurrency(computeBookingAmount(selectedBooking))}</span>
                  </div>
                </div>
              </div>

              <div className="admin-detail-section">
                <h3>Participants</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <label>Student</label>
                    <span>
                      {selectedBooking.studentName}
                      {selectedBooking.studentUserId
                        ? ` (#${selectedBooking.studentUserId})`
                        : ''}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Tutor</label>
                    <span>
                      {selectedBooking.tutorName}
                      {selectedBooking.tutorUserId
                        ? ` (#${selectedBooking.tutorUserId})`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.hasRescheduleRequest && (
                <div className="admin-detail-section">
                  <h3>Reschedule Request</h3>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <label>Original start</label>
                      <span>{formatDateTime(selectedBooking.originalStartTime)}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Original end</label>
                      <span>{formatDateTime(selectedBooking.originalEndTime)}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Requested start</label>
                      <span className="highlight">
                        {formatDateTime(selectedBooking.requestedStartTime)}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Requested end</label>
                      <span className="highlight">
                        {formatDateTime(selectedBooking.requestedEndTime)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="admin-detail-section">
                <h3>Timestamps</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <label>Created</label>
                    <span>{formatDateTime(selectedBooking.createdAt)}</span>
                  </div>
                  <div className="admin-detail-item">
                    <label>Last updated</label>
                    <span>{formatDateTime(selectedBooking.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
