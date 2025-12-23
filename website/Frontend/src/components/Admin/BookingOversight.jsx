import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import adminAPI from '../../services/adminApi';
import './BookingOversight.css';

const BookingOversight = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    studentId: '',
    tutorId: '',
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBookings(filters);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const response = await adminAPI.getBookingDetails(bookingId);
      setSelectedBooking(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      alert('Failed to load booking details. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: 'pending',
      SCHEDULED: 'scheduled',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      REJECTED: 'rejected',
    };
    return statusMap[status] || 'default';
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="page-header">
          <h1>Booking Oversight</h1>
          <p className="page-subtitle">Monitor and manage all bookings</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <button className="clear-filters-btn" onClick={() => setFilters({ status: '', studentId: '', tutorId: '' })}>
            Clear Filters
          </button>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="loading-spinner">Loading bookings...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No bookings found</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.studentName}</td>
                      <td>{booking.tutorName}</td>
                      <td>{booking.subject}</td>
                      <td>{formatDate(booking.startTime)}</td>
                      <td>{formatDate(booking.endTime)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.hasRescheduleRequest && (
                          <span className="reschedule-indicator" title="Has reschedule request">
                            🔄
                          </span>
                        )}
                      </td>
                      <td>{formatCurrency(booking.hourlyRate)}</td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(booking.id)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Booking Details</h2>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="booking-detail-grid">
                  <div className="detail-section">
                    <h3>Booking Information</h3>
                    <div className="detail-item">
                      <label>Booking ID</label>
                      <span>{selectedBooking.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Subject</label>
                      <span>{selectedBooking.subject}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      <span className={`status-badge ${getStatusBadgeClass(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Start Time</label>
                      <span>{formatDate(selectedBooking.startTime)}</span>
                    </div>
                    <div className="detail-item">
                      <label>End Time</label>
                      <span>{formatDate(selectedBooking.endTime)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Hourly Rate</label>
                      <span>{formatCurrency(selectedBooking.hourlyRate)}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Participants</h3>
                    <div className="detail-item">
                      <label>Student</label>
                      <span>{selectedBooking.studentName} (ID: {selectedBooking.studentUserId})</span>
                    </div>
                    <div className="detail-item">
                      <label>Tutor</label>
                      <span>{selectedBooking.tutorName} (ID: {selectedBooking.tutorUserId})</span>
                    </div>
                  </div>

                  {selectedBooking.hasRescheduleRequest && (
                    <div className="detail-section reschedule-section">
                      <h3>🔄 Reschedule Request</h3>
                      <div className="detail-item">
                        <label>Original Start</label>
                        <span>{formatDate(selectedBooking.originalStartTime)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Original End</label>
                        <span>{formatDate(selectedBooking.originalEndTime)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Requested Start</label>
                        <span className="highlight">{formatDate(selectedBooking.requestedStartTime)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Requested End</label>
                        <span className="highlight">{formatDate(selectedBooking.requestedEndTime)}</span>
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h3>Timestamps</h3>
                    <div className="detail-item">
                      <label>Created</label>
                      <span>{formatDate(selectedBooking.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated</label>
                      <span>{formatDate(selectedBooking.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOversight;

