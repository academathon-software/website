import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonHistory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { bookingAPI } from '../../services/api';

const LessonHistory = () => {
  const { isTutor } = useUser();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [timeFilter, setTimeFilter] = useState('30days'); // Default to 30 days
  const [statusFilter, setStatusFilter] = useState('all'); // Default to all statuses
  
  // Fetch bookings when component mounts
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [hoveredRating, setHoveredRating] = useState(null);
  const [ratings, setRatings] = useState({});

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load lesson history');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (bookings) => {
    const now = new Date();
    const timeRanges = {
      '7days': 7,
      '2weeks': 14,
      '30days': 30,
      '3months': 90,
      'year+': 365,
      'all': Infinity
    };

    const daysToFilter = timeRanges[timeFilter];
    const filterDate = new Date(now);
    if (daysToFilter !== Infinity) {
      filterDate.setDate(filterDate.getDate() - daysToFilter);
    }

    // Filter bookings by time range, status, and sort by date (newest first)
    return bookings
      .filter(booking => {
        // Time filter
        const bookingDate = new Date(booking.startTime);
        const passesTimeFilter = daysToFilter === Infinity || bookingDate >= filterDate;
        
        // Status filter
        const passesStatusFilter = statusFilter === 'all' || booking.status === statusFilter;
        
        return passesTimeFilter && passesStatusFilter;
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };

  const filteredBookings = filterBookings(bookings);
  const totalPages = Math.ceil(filteredBookings.length / 9);
  const lessonsPerPage = 9;
  const startIndex = (currentPage - 1) * lessonsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + lessonsPerPage);

  const handleRatingClick = (lessonId, rating) => {
    setRatings(prev => ({
      ...prev,
      [lessonId]: rating
    }));
  };

  const handleLeaveFeedback = (lessonId) => {
    // Handle feedback functionality
    console.log(`Leave feedback for lesson ${lessonId}`);
  };

  const handleMessageTutor = (booking) => {
    // Navigate to messages page with the other user's info
    const otherUserId = isTutor ? booking.studentUserId : booking.tutorUserId;
    navigate('/messages', {
      state: {
        otherUserId: otherUserId,
        bookingId: booking.id
      }
    });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingBooking(bookingId);
      await bookingAPI.cancelBooking(bookingId);
      // Refresh bookings after cancellation
      await fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking: ' + (err.response?.data?.error || err.message));
    } finally {
      setCancellingBooking(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatBookingDateTime = (booking) => {
    const date = new Date(booking.startTime);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (booking) => {
    const { status, paymentStatus } = booking;
    
    // Check if booking is confirmed but payment not succeeded
    const isAwaitingPayment = status === 'CONFIRMED' && paymentStatus !== 'SUCCEEDED';
    
    let displayStatus = status;
    let color = 'gray';
    
    if (isAwaitingPayment) {
      // Show different text for tutor vs student
      displayStatus = isTutor ? 'AWAITING PAYMENT' : 'PAYMENT REQUIRED';
      color = '#2196f3'; // Blue color
    } else {
      // Use default status colors
      const statusColors = {
        CONFIRMED: 'green',
        PENDING: 'orange',
        CANCELLED: 'red',
        COMPLETED: 'blue',
        SCHEDULED: '#4caf50'
      };
      color = statusColors[status] || 'gray';
    }
    
    return (
      <span 
        className="booking-status" 
        style={{ 
          background: status === 'SCHEDULED' 
            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' 
            : color,
          color: 'white',
          padding: status === 'SCHEDULED' ? '6px 16px' : '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: status === 'SCHEDULED' ? '700' : '600',
          marginLeft: '10px',
          boxShadow: status === 'SCHEDULED' 
            ? '0 2px 8px rgba(76, 175, 80, 0.3)' 
            : 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {displayStatus}
      </span>
    );
  };

  const renderStars = (lessonId) => {
    const currentRating = ratings[lessonId] || 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`star ${i <= currentRating ? 'filled' : 'empty'}`}
          onClick={() => handleRatingClick(lessonId, i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(null)}
        />
      );
    }

    return stars;
  };

  return (
    <div className="lesson-history-page">
      {isTutor ? <TutorSidebar /> : <StudentSidebar />}
      
      <div className="main-content">
        <div className="page-header">
          <h1>Lesson History</h1>
          <p>{isTutor ? "View all the lessons you've taught so far!" : "View all the lessons you've taken so far!"}</p>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="time-filter" className="filter-label">Time:</label>
              <select
                id="time-filter"
                className="filter-dropdown"
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="7days">Past 7 Days</option>
                <option value="2weeks">Past 2 Weeks</option>
                <option value="30days">Past 30 Days</option>
                <option value="3months">Past 3 Months</option>
                <option value="year+">Past Year+</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">Status:</label>
              <select
                id="status-filter"
                className="filter-dropdown"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <div className="filter-info">
            Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'lesson' : 'lessons'}
            {statusFilter !== 'all' && ` (${statusFilter.toLowerCase()})`}
          </div>
        </div>

        {loading && <div className="loading">Loading bookings...</div>}
        {error && !loading && <div className="error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="no-bookings">
            <p>No bookings yet. Book your first lesson!</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="no-bookings">
            <p>No lessons found in the selected time period. Try a different time range!</p>
          </div>
        )}

        {!loading && !error && filteredBookings.length > 0 && (
        <>
        <div className="lesson-list">
          {currentBookings.map(booking => (
            <div key={booking.id} className="lesson-item">
              <div className="lesson-info">
                <div className="lesson-datetime">
                  {formatBookingDateTime(booking)}
                  {getStatusBadge(booking)}
                </div>
                <div className="lesson-name">
                  Lesson with {isTutor ? booking.studentName : booking.tutorName}
                </div>
                <div className="tutor-name">
                  {isTutor ? booking.studentName : booking.tutorName}
                </div>
              </div>
              
              <div className="lesson-actions">
                <div className="rating-section">
                  {booking.status === 'COMPLETED' && renderStars(booking.id)}
                </div>
                
                <div className="action-buttons">
                  {booking.status === 'COMPLETED' && (
                    <button 
                      className={`feedback-button ${ratings[booking.id] > 0 ? 'enabled' : 'disabled'}`}
                      onClick={() => handleLeaveFeedback(booking.id)}
                      disabled={ratings[booking.id] === 0}
                    >
                      {isTutor ? 'Leave Student Feedback' : 'Leave Tutor Feedback'}
                    </button>
                  )}
                  
                  <button 
                    className="message-button"
                    onClick={() => handleMessageTutor(booking)}
                  >
                    {isTutor ? 'Message Student' : 'Message Tutor'}
                  </button>

                  {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingBooking === booking.id}
                    >
                      {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default LessonHistory;