import React from 'react';
import './BookingStatusBadge.css';

const BookingStatusBadge = ({ status, paymentStatus, isTutor = false, hasRescheduleRequest = false }) => {
  const getStatusConfig = (status, paymentStatus, isTutor, hasRescheduleRequest) => {
    // Check if there's a pending reschedule request
    if (hasRescheduleRequest) {
      return {
        label: isTutor ? 'Reschedule Request' : 'Reschedule Pending',
        className: 'status-reschedule',
        color: '#ff9800'
      };
    }
    
    // Check if booking is confirmed but payment not succeeded
    if (status === 'CONFIRMED' && paymentStatus !== 'SUCCEEDED') {
      return {
        label: isTutor ? 'Awaiting Payment' : 'Payment Required',
        className: 'status-confirmed',
        color: '#ff9800'
      };
    }
    
    switch (status) {
      case 'PENDING':
        return {
          label: 'Awaiting Approval',
          className: 'status-pending',
          color: '#ff9800'
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          className: 'status-confirmed',
          color: '#2196f3'
        };
      case 'PAID':
        return {
          label: 'Payment Complete',
          className: 'status-paid',
          color: '#8bc34a'
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          className: 'status-scheduled',
          color: '#4caf50'
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          className: 'status-rejected',
          color: '#f44336'
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'status-cancelled',
          color: '#9e9e9e'
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'status-completed',
          color: '#607d8b'
        };
      default:
        return {
          label: status,
          className: 'status-default',
          color: '#757575'
        };
    }
  };

  const config = getStatusConfig(status, paymentStatus, isTutor, hasRescheduleRequest);

  return (
    <span className={`booking-status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;


