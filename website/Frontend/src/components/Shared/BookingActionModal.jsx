import React, { useState } from 'react';
import './BookingActionModal.css';

const BookingActionModal = ({ booking, action, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if ((action === 'reject' || action === 'reject-reschedule') && !reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isReschedule = booking.hasRescheduleRequest || action === 'reject-reschedule';
  const isConfirm = action === 'confirm';
  const isReject = action === 'reject' || action === 'reject-reschedule';

  const getModalTitle = () => {
    if (action === 'reject-reschedule') return 'Reject Reschedule Request';
    if (action === 'reject') return 'Reject Booking';
    return 'Confirm Booking';
  };

  const getButtonText = () => {
    if (action === 'reject-reschedule') return 'Reject Reschedule';
    if (action === 'reject') return 'Reject Booking';
    return 'Confirm Booking';
  };

  return (
    <div className="booking-action-modal-overlay" onClick={onCancel}>
      <div className="booking-action-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-action-modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>

        <div className="booking-action-modal-body">
          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="detail-row">
              <span className="detail-label">Student:</span>
              <span className="detail-value">{booking.studentName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subject:</span>
              <span className="detail-value">{booking.subject || 'Not specified'}</span>
            </div>
            
            {isReschedule && booking.originalStartTime ? (
              <>
                <div className="detail-row" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                  <span className="detail-label" style={{ color: '#666' }}>Original Date & Time:</span>
                  <span className="detail-value">{formatDateTime(booking.originalStartTime)}</span>
                </div>
                <div className="detail-row" style={{ marginTop: '10px', paddingTop: '10px', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px' }}>
                  <span className="detail-label" style={{ color: '#2D6A4F', fontWeight: 'bold' }}>Requested New Time:</span>
                  <span className="detail-value" style={{ fontWeight: 'bold' }}>{formatDateTime(booking.requestedStartTime)}</span>
                </div>
              </>
            ) : (
              <div className="detail-row">
                <span className="detail-label">Date & Time:</span>
                <span className="detail-value">{formatDateTime(booking.startTime)}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">
                {Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60))} minutes
              </span>
            </div>
          </div>

          {isConfirm && (
            <div className="confirm-message">
              <p>
                By confirming this booking, you're committing to teach this lesson at the scheduled time.
                {isReschedule
                  ? ' The student will be notified that you accepted their new time.'
                  : ' The student\'s saved card will be charged immediately and they\'ll receive a confirmation email.'}
              </p>
            </div>
          )}

          {isReject && (
            <div className="reject-form">
              <label htmlFor="rejection-reason">Reason for Rejection:</label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Please provide a reason for rejecting this ${isReschedule ? 'reschedule request' : 'booking'}...`}
                rows="3"
                className="rejection-textarea"
              />
              <p className="helper-text">This reason will be shared with the student.</p>
            </div>
          )}
        </div>

        <div className="booking-action-modal-footer">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={isConfirm ? 'btn-confirm' : 'btn-reject'}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingActionModal;


