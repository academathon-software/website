import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonHistory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { bookingAPI, reviewAPI } from '../../services/api';

const LessonHistory = () => {
  const { isTutor } = useUser();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [timeFilter, setTimeFilter] = useState('30days');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hoveredRating, setHoveredRating] = useState(null);
  const [ratings, setRatings] = useState({});
  const [reviewedBookings, setReviewedBookings] = useState({});

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHoveredStar, setFeedbackHoveredStar] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // View received feedback state
  const [receivedFeedback, setReceivedFeedback] = useState({});
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data);

      const completedBookings = response.data.filter(b => b.status === 'COMPLETED');
      const statuses = {};
      const feedback = {};
      await Promise.all(
        completedBookings.map(async (b) => {
          try {
            const [statusRes, feedbackRes] = await Promise.all([
              reviewAPI.getReviewStatus(b.id),
              reviewAPI.getReceivedFeedback(b.id)
            ]);
            statuses[b.id] = statusRes.data.hasReviewed;
            if (feedbackRes.data.hasFeedback) {
              feedback[b.id] = feedbackRes.data;
            }
          } catch {
            statuses[b.id] = false;
          }
        })
      );
      setReviewedBookings(statuses);
      setReceivedFeedback(feedback);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // 401s redirect globally; only surface other failures here.
      setError('Failed to load lesson history');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (bookings) => {
    const now = new Date();
    const timeRanges = {
      '7days': 7, '2weeks': 14, '30days': 30,
      '3months': 90, 'year+': 365, 'all': Infinity
    };

    const daysToFilter = timeRanges[timeFilter];
    const filterDate = new Date(now);
    if (daysToFilter !== Infinity) {
      filterDate.setDate(filterDate.getDate() - daysToFilter);
    }

    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.startTime);
        const passesTimeFilter = daysToFilter === Infinity || bookingDate >= filterDate;
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
    setRatings(prev => ({ ...prev, [lessonId]: rating }));
  };

  const handleLeaveFeedback = (booking) => {
    setFeedbackBooking(booking);
    setFeedbackComment('');
    setFeedbackRating(isTutor ? 0 : (ratings[booking.id] || 0));
    setFeedbackHoveredStar(null);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackBooking) return;

    if (!isTutor && feedbackRating === 0) {
      alert('Please select a star rating');
      return;
    }

    if (!feedbackComment.trim()) {
      alert('Please write some feedback');
      return;
    }

    try {
      setSubmittingFeedback(true);
      await reviewAPI.leaveReview(
        feedbackBooking.id,
        isTutor ? null : feedbackRating,
        feedbackComment.trim()
      );
      setReviewedBookings(prev => ({ ...prev, [feedbackBooking.id]: true }));
      setShowFeedbackModal(false);
      setFeedbackBooking(null);
      alert('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleViewFeedback = (booking) => {
    setViewingFeedback({
      ...receivedFeedback[booking.id],
      booking
    });
    setShowViewFeedbackModal(true);
  };

  const handleMessageTutor = (booking) => {
    const otherUserId = isTutor ? booking.studentUserId : booking.tutorUserId;
    navigate('/messages', { state: { otherUserId, bookingId: booking.id } });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancellingBooking(bookingId);
      await bookingAPI.cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking: ' + (err.response?.data?.error || err.message));
    } finally {
      setCancellingBooking(null);
    }
  };

  const handlePageChange = (page) => { setCurrentPage(page); };

  const formatBookingDateTime = (booking) => {
    const date = new Date(booking.startTime);
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const getStatusBadge = (booking) => {
    const { status, paymentStatus } = booking;
    const isAwaitingPayment = status === 'CONFIRMED' && paymentStatus !== 'SUCCEEDED';
    
    let displayStatus = status;
    let color = 'gray';
    
    if (isAwaitingPayment) {
      displayStatus = isTutor ? 'AWAITING PAYMENT' : 'PAYMENT REQUIRED';
      color = '#2196f3';
    } else {
      const statusColors = {
        CONFIRMED: 'green', PENDING: 'orange', CANCELLED: 'red',
        COMPLETED: 'blue', SCHEDULED: '#4caf50'
      };
      color = statusColors[status] || 'gray';
    }
    
    return (
      <span 
        className="booking-status" 
        style={{ 
          background: status === 'SCHEDULED' 
            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : color,
          color: 'white',
          padding: status === 'SCHEDULED' ? '6px 16px' : '4px 8px',
          borderRadius: '12px', fontSize: '12px',
          fontWeight: status === 'SCHEDULED' ? '700' : '600',
          marginLeft: '10px',
          boxShadow: status === 'SCHEDULED' ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none',
          textTransform: 'uppercase', letterSpacing: '0.5px'
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

        <div className="filter-section">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="time-filter" className="filter-label">Time:</label>
              <select id="time-filter" className="filter-dropdown" value={timeFilter}
                onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}>
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
              <select id="status-filter" className="filter-dropdown" value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
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
          <div className="no-bookings"><p>No bookings yet. Book your first lesson!</p></div>
        )}

        {!loading && !error && bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="no-bookings"><p>No lessons found in the selected time period. Try a different time range!</p></div>
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
                {/* Only students see star ratings */}
                {!isTutor && booking.status === 'COMPLETED' && !reviewedBookings[booking.id] && (
                  <div className="rating-section">
                    {renderStars(booking.id)}
                  </div>
                )}

                {booking.status === 'COMPLETED' && reviewedBookings[booking.id] && (
                  <span className="feedback-submitted-badge">Feedback Sent</span>
                )}

                {booking.status === 'COMPLETED' && receivedFeedback[booking.id] && (
                  <button className="view-feedback-button" onClick={() => handleViewFeedback(booking)}>
                    View Feedback
                  </button>
                )}
                
                <div className="action-buttons">
                  {booking.status === 'COMPLETED' && !reviewedBookings[booking.id] && (
                    <button 
                      className={`feedback-button ${isTutor || ratings[booking.id] > 0 ? 'enabled' : 'disabled'}`}
                      onClick={() => handleLeaveFeedback(booking)}
                      disabled={!isTutor && ratings[booking.id] === 0}
                    >
                      {isTutor ? 'Leave Student Feedback' : 'Leave Tutor Feedback'}
                    </button>
                  )}
                  
                  <button className="message-button" onClick={() => handleMessageTutor(booking)}>
                    {isTutor ? 'Message Student' : 'Message Tutor'}
                  </button>

                  {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingBooking === booking.id}>
                      {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button className="pagination-button" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button key={index + 1} className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </button>
            ))}
          </div>
          <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button className="pagination-button" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
        </>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackBooking && (
        <div className="feedback-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="feedback-modal-close" onClick={() => setShowFeedbackModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h2>{isTutor ? 'Leave Student Feedback' : 'Leave Tutor Feedback'}</h2>
            <p className="feedback-modal-subtitle">
              Feedback for <strong>{isTutor ? feedbackBooking.studentName : feedbackBooking.tutorName}</strong>
              {' '}— {feedbackBooking.subject || 'Tutoring Session'}
            </p>

            {!isTutor && (
              <div className="feedback-modal-rating">
                <label>Rating</label>
                <div className="feedback-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`feedback-star ${i <= (feedbackHoveredStar || feedbackRating) ? 'filled' : 'empty'}`}
                      onClick={() => setFeedbackRating(i)}
                      onMouseEnter={() => setFeedbackHoveredStar(i)}
                      onMouseLeave={() => setFeedbackHoveredStar(null)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="feedback-modal-comment">
              <label>{isTutor ? 'Feedback for the student' : 'Your review'}</label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder={isTutor 
                  ? "Share how the student did — effort, understanding, areas to improve..." 
                  : "Share your experience with this tutor..."}
                rows={4}
              />
            </div>

            <div className="feedback-modal-actions">
              <button className="feedback-cancel-btn" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </button>
              <button 
                className="feedback-submit-btn" 
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || (!isTutor && feedbackRating === 0) || !feedbackComment.trim()}>
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Received Feedback Modal */}
      {showViewFeedbackModal && viewingFeedback && (
        <div className="feedback-modal-overlay" onClick={() => setShowViewFeedbackModal(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="feedback-modal-close" onClick={() => setShowViewFeedbackModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h2>Feedback Received</h2>
            <p className="feedback-modal-subtitle">
              From <strong>{viewingFeedback.reviewerName}</strong>
              {' '}— {viewingFeedback.booking?.subject || 'Tutoring Session'}
            </p>

            {viewingFeedback.rating && (
              <div className="feedback-modal-rating">
                <label>Rating</label>
                <div className="feedback-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`feedback-star ${i <= viewingFeedback.rating ? 'filled' : 'empty'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {viewingFeedback.comment && (
              <div className="view-feedback-comment">
                <label>Comment</label>
                <p>{viewingFeedback.comment}</p>
              </div>
            )}

            <div className="view-feedback-date">
              {new Date(viewingFeedback.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </div>

            <div className="feedback-modal-actions">
              <button className="feedback-cancel-btn" onClick={() => setShowViewFeedbackModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonHistory;
