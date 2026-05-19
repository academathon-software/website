import React, { useState, useEffect } from 'react';
import './TutorDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faCheck,
  faUser,
  faUsers,
  faBookOpen,
  faClock,
  faStar,
  faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import TutorSidebar from '../Shared/TutorSidebar';
import BookingStatusBadge from '../Shared/BookingStatusBadge';
import BookingActionModal from '../Shared/BookingActionModal';
import { useUser } from '../../context/UserContext';
import { bookingAPI, userAPI, tutorAPI, reviewAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TutorDashboard = () => {
  const { setUserType } = useUser();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tutorProfile, setTutorProfile] = useState(null);
  const [tutorData, setTutorData] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [completingLesson, setCompletingLesson] = useState(null);
  const [showStudentProfile, setShowStudentProfile] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    totalHours: 0,
    avgRating: 0
  });
  // Booking timing config (loaded from backend; defaults match application.properties)
  const [bookingTiming, setBookingTiming] = useState({
    minimumAdvanceHours: 5,
    tutorResponseBeforeLessonHours: 3,
    rescheduleRequestBeforeLessonHours: 2,
    rescheduleResponseBeforeLessonHours: 1,
    cancellationBeforeLessonHours: 1,
  });
  
  // Set user type and fetch data when component mounts
  useEffect(() => {
    setUserType('tutor');
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile, tutor profile, bookings, and timing config in parallel
      const [userResponse, upcomingResponse, pastResponse, allBookingsResponse, pendingResponse, timingResponse] = await Promise.all([
        userAPI.getCurrentUser(),
        bookingAPI.getUpcomingBookings(),
        bookingAPI.getPastBookings(),
        bookingAPI.getUserBookings(),
        bookingAPI.getPendingBookings(),
        bookingAPI.getTimingConfig().catch(() => null)
      ]);

      if (timingResponse?.data) {
        setBookingTiming(timingResponse.data);
      }

      // Try to fetch tutor profile (might not exist yet)
      let tutorProfileData = null;
      try {
        const tutorResponse = await tutorAPI.getMyProfile();
        tutorProfileData = tutorResponse.data;
      } catch (err) {
        console.log('No tutor profile found yet');
      }

      // Set profile data
      setTutorProfile({
        name: userResponse.data.displayUsername || 'Tutor',
        email: userResponse.data.email,
        profileImage: userResponse.data.profilePictureUrl || '👩‍🏫'
      });

      setTutorData(tutorProfileData);

      // Set bookings
      setUpcomingBookings(upcomingResponse.data);
      setPastBookings(pastResponse.data);
      setAllBookings(allBookingsResponse.data);
      setPendingBookings(pendingResponse.data);

      // Calculate stats
      const completedLessons = pastResponse.data.filter(
        b => b.status === 'COMPLETED'
      );

      // Calculate unique students
      const uniqueStudents = new Set(
        allBookingsResponse.data.map(b => b.studentId)
      );

      // Calculate total hours
      const totalHours = completedLessons.reduce((sum, booking) => {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        return sum + (end - start) / (1000 * 60 * 60);
      }, 0);

      let avgRating = 0;
      try {
        const ratingRes = await reviewAPI.getTutorRating(userResponse.data.id);
        avgRating = ratingRes.data.averageRating || 0;
      } catch {
        avgRating = 0;
      }

      setStats({
        totalStudents: uniqueStudents.size,
        totalLessons: completedLessons.length,
        totalHours: Math.round(totalHours * 10) / 10,
        avgRating: Math.round(avgRating * 10) / 10
      });


    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // 401s are intercepted globally and redirect to /login with a
      // session-expired notice; only surface other failures here.
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  const handleConfirmBooking = async (bookingId, reason) => {
    try {
      await bookingAPI.confirmBooking(bookingId);
      setShowActionModal(false);
      setSelectedBooking(null);
      await fetchDashboardData();
      alert('Booking confirmed! The student will be notified to complete payment.');
    } catch (err) {
      console.error('Error confirming booking:', err);
      alert('Failed to confirm booking: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRejectBooking = async (bookingId, reason) => {
    try {
      await bookingAPI.rejectBooking(bookingId, reason);
      setShowActionModal(false);
      setSelectedBooking(null);
      await fetchDashboardData();
      alert('Booking rejected. The student has been notified.');
    } catch (err) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAcceptReschedule = async (bookingId) => {
    try {
      await bookingAPI.acceptReschedule(bookingId);
      setShowActionModal(false);
      setSelectedBooking(null);
      await fetchDashboardData();
      alert('Reschedule request accepted! The student has been notified.');
    } catch (err) {
      console.error('Error accepting reschedule:', err);
      alert('Failed to accept reschedule: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRejectReschedule = async (bookingId, reason) => {
    try {
      await bookingAPI.rejectReschedule(bookingId, reason);
      setShowActionModal(false);
      setSelectedBooking(null);
      await fetchDashboardData();
      alert('Reschedule request rejected. The lesson remains at the original time.');
    } catch (err) {
      console.error('Error rejecting reschedule:', err);
      alert('Failed to reject reschedule: ' + (err.response?.data?.error || err.message));
    }
  };

  // Tutor can only accept/decline a PENDING booking up to the cutoff
  // (lesson - tutorResponseBeforeLessonHours). After that the cleanup job auto-declines it.
  const canRespondToPending = (booking) => {
    if (!booking || !booking.startTime) return false;
    const lessonStart = new Date(booking.startTime);
    const cutoff = new Date(
      lessonStart.getTime() - bookingTiming.tutorResponseBeforeLessonHours * 60 * 60 * 1000
    );
    return new Date() < cutoff;
  };

  // Reschedule responses are tighter - tutor must reply by lesson - rescheduleResponseBeforeLessonHours.
  const canRespondToReschedule = (booking) => {
    if (!booking) return false;
    // Reschedule decisions are tied to the earlier of the original / requested time so
    // we mirror the backend rule.
    const baseTime = booking.requestedStartTime && new Date(booking.requestedStartTime) < new Date(booking.startTime)
      ? new Date(booking.requestedStartTime)
      : new Date(booking.startTime);
    const cutoff = new Date(
      baseTime.getTime() - bookingTiming.rescheduleResponseBeforeLessonHours * 60 * 60 * 1000
    );
    return new Date() < cutoff;
  };

  const openActionModal = (booking, action) => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowActionModal(true);
  };

  const handleMarkComplete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to mark this lesson as completed?')) {
      return;
    }
    
    try {
      setCompletingLesson(bookingId);
      await bookingAPI.completeBooking(bookingId);
      await fetchDashboardData();
      alert('Lesson marked as completed!');
    } catch (err) {
      console.error('Error completing lesson:', err);
      alert('Failed to mark lesson as completed: ' + (err.response?.data?.error || err.message));
    } finally {
      setCompletingLesson(null);
    }
  };

  const handleViewStudentProfile = async (studentUserId, studentName, bookingId = null) => {
    try {
      setLoadingProfile(true);
      setShowStudentProfile(true);
      
      // Try to fetch detailed student profile
      const response = await userAPI.getUserProfile(studentUserId);
      setSelectedStudentProfile({
        ...response.data,
        name: studentName,
        bookingId
      });
    } catch (err) {
      console.error('Error fetching student profile:', err);
      // Set basic profile if fetch fails
      setSelectedStudentProfile({
        name: studentName,
        userId: studentUserId,
        bookingId
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Get upcoming sessions (only SCHEDULED ones)
  const upcomingSessions = upcomingBookings
    .filter(b => b.status === 'SCHEDULED')
    .slice(0, 4)
    .map(booking => {
      const startTime = new Date(booking.startTime);
      
      return {
        id: booking.id,
        time: startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        date: startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short'
        }),
        student: booking.studentName,
        subject: booking.subject || 'Tutoring Session'
      };
    });

  // Combine pending bookings with reschedule requests from upcoming bookings
  const allPendingRequests = [
    ...pendingBookings,
    ...upcomingBookings.filter(b => b.hasRescheduleRequest)
  ];

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    // Adjust to make Monday = 0, Tuesday = 1, ..., Sunday = 6
    const dayOffset = (firstDay.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - dayOffset);
    
    const days = [];
    const today = new Date();
    
    // Get lesson dates from bookings for current month
    const lessonDates = allBookings
      .filter(b => {
        const bookingDate = new Date(b.startTime);
        return bookingDate.getMonth() === month && 
               bookingDate.getFullYear() === year &&
               b.status !== 'CANCELLED' &&
               b.status !== 'REJECTED';
      })
      .map(b => new Date(b.startTime).getDate());
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        hasLesson: lessonDates.includes(date.getDate()) && date.getMonth() === month
      });
    }
    
    return days;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="tutor-dashboard">
        <TutorSidebar />
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Loading your dashboard...</h2>
            <p>Please wait while we fetch your data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-dashboard">
        <TutorSidebar />
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'red' }}>{error}</h2>
            <button
              onClick={fetchDashboardData}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#2D6A4F',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-dashboard">
      <TutorSidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="profile-pic">
            <div className="avatar">
              {typeof tutorProfile.profileImage === 'string' && tutorProfile.profileImage.startsWith('http') ? (
                <img src={tutorProfile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                tutorProfile.profileImage
              )}
            </div>
          </div>
          <div className="welcome-text">
            <h2>{tutorProfile.name}</h2>
            <p>Welcome back to Academathon!</p>
            <div className="stats-row">
              <span className="stat-item"><FontAwesomeIcon icon={faUsers} className="stat-icon" /> {stats.totalStudents} Students</span>
              <span className="stat-item"><FontAwesomeIcon icon={faBookOpen} className="stat-icon" /> {stats.totalLessons} Lessons</span>
              <span className="stat-item"><FontAwesomeIcon icon={faClock} className="stat-icon" /> {stats.totalHours}hrs</span>
              <span className="stat-item"><FontAwesomeIcon icon={faStar} className="stat-icon" /> {stats.avgRating > 0 ? `${stats.avgRating}/5.0` : 'No ratings yet'}</span>
            </div>
          </div>
        </div>

        {/* Pending Bookings Section */}
        {allPendingRequests.length > 0 && (
          <div className="pending-bookings-section">
            <h3>Pending Booking Requests</h3>
            <div className="pending-bookings-list">
              {allPendingRequests.map(booking => (
                <div key={booking.id} className="pending-booking-card">
                  <div className="pending-booking-info">
                    <div className="booking-header">
                      <h4>
                        {booking.studentName}
                        <button
                          className="view-profile-btn"
                          onClick={() => handleViewStudentProfile(booking.studentUserId, booking.studentName, booking.id)}
                          title="View student profile"
                          style={{ marginLeft: '8px' }}
                        >
                          <FontAwesomeIcon icon={faUser} />
                        </button>
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {booking.hasRescheduleRequest && (
                          <span style={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Reschedule Request
                          </span>
                        )}
                        {!booking.hasRescheduleRequest && (
                          <BookingStatusBadge 
                            status={booking.status}
                            paymentStatus={booking.paymentStatus}
                            isTutor={true}
                            hasRescheduleRequest={booking.hasRescheduleRequest}
                          />
                        )}
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-label">Subject:</span>
                        <span>{booking.subject || 'Not specified'}</span>
                      </div>
                      {booking.hasRescheduleRequest && booking.originalStartTime ? (
                        <>
                          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                            <strong style={{ color: '#666', fontSize: '13px' }}>Original Time:</strong>
                            <div className="detail-item">
                              <span className="detail-label">Date:</span>
                              <span>{formatDate(booking.originalStartTime)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Time:</span>
                              <span>{formatDateTime(booking.originalStartTime)}</span>
                            </div>
                          </div>
                          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                            <strong style={{ color: '#2D6A4F', fontSize: '13px' }}>Requested New Time:</strong>
                            <div className="detail-item">
                              <span className="detail-label">Date:</span>
                              <span>{formatDate(booking.requestedStartTime)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Time:</span>
                              <span>{formatDateTime(booking.requestedStartTime)}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span>{formatDate(booking.startTime)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Time:</span>
                            <span>{formatDateTime(booking.startTime)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="pending-booking-actions">
                    {(() => {
                      const isReschedule = booking.hasRescheduleRequest;
                      const allowed = isReschedule
                        ? canRespondToReschedule(booking)
                        : canRespondToPending(booking);
                      if (!allowed) {
                        const cutoffHours = isReschedule
                          ? bookingTiming.rescheduleResponseBeforeLessonHours
                          : bookingTiming.tutorResponseBeforeLessonHours;
                        return (
                          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                            Response window closed (must reply at least {cutoffHours} hour(s) before the lesson). This will be auto-declined.
                          </p>
                        );
                      }
                      return (
                        <>
                          <button
                            className="btn-accept"
                            onClick={() => openActionModal(booking, 'confirm')}
                            title={isReschedule
                              ? 'Accept the requested new time'
                              : 'Accepting will automatically charge the student\'s saved card'}
                          >
                            <FontAwesomeIcon icon={faCheck} /> Accept
                          </button>
                          <button
                            className="btn-decline"
                            onClick={() => openActionModal(booking, isReschedule ? 'reject-reschedule' : 'reject')}
                          >
                            &times; Decline
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Lessons Section */}
        <div className="upcoming-lessons-section">
          <div className="upcoming-lessons-header">
            <h3>Upcoming Lessons</h3>
            <button
              className="view-full-link"
              onClick={() => navigate('/lesson-history')}
              style={{ cursor: 'pointer', background: 'none', border: 'none' }}
            >
              View Full List <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.75rem' }} />
            </button>
          </div>

          <div className="lessons-table">
            {upcomingBookings.filter(b => b.status === 'SCHEDULED' || b.status === 'CONFIRMED').length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-wrap">
                  <FontAwesomeIcon icon={faCalendarDays} />
                </div>
                <p className="empty-state-title">No upcoming lessons scheduled.</p>
                <p className="empty-state-subtitle">Your confirmed lessons will appear here.</p>
              </div>
            ) : (
              <>
                {upcomingBookings
                  .filter(b => b.status === 'SCHEDULED' || b.status === 'CONFIRMED')
                  .map(booking => {
                    const startTime = new Date(booking.startTime);
                    const endTime = new Date(booking.endTime);
                    const now = new Date();
                    const isPast = endTime < now;
                    const isOngoing = startTime <= now && endTime >= now;
                    
                    return (
                      <div key={booking.id} className="lesson-row">
                        <div className="lesson-datetime">
                          {formatDateTime(booking.startTime)}
                        </div>
                        <div className="lesson-name">{booking.subject || 'Tutoring Session'}</div>
                        <div className="tutor-name">
                          {booking.studentName}
                          <button 
                            className="view-profile-btn"
                            onClick={() => handleViewStudentProfile(booking.studentUserId, booking.studentName, booking.id)}
                            title="View Profile"
                          >
                            <FontAwesomeIcon icon={faUser} />
                          </button>
                        </div>
                        <div className="status-indicator">
                          <BookingStatusBadge 
                            status={booking.status} 
                            paymentStatus={booking.paymentStatus}
                            isTutor={true}
                          />
                        </div>
                        <div className="lesson-actions">
                          {(isPast || isOngoing) && (
                            <button 
                              className="action-btn mark-complete-btn"
                              onClick={() => handleMarkComplete(booking.id)}
                              disabled={completingLesson === booking.id}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                              {completingLesson === booking.id ? '...' : ' Complete'}
                            </button>
                          )}
                          <button 
                            className="action-btn message-btn"
                            onClick={() => navigate('/messages', { state: { otherUserId: booking.studentUserId, bookingId: booking.id } })}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </>
            )}
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="calendar-header">
            <h3>{formatMonthYear(currentMonth)}</h3>
            <div className="calendar-nav">
              <button onClick={() => navigateMonth(-1)}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button onClick={() => navigateMonth(1)}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
          
          <div className="calendar">
            <div className="calendar-weekdays">
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
              <div>Su</div>
            </div>
            
            <div className="calendar-days">
              {getCalendarDays().map((day, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${
                    day.isToday ? 'today' : ''
                  } ${
                    day.isWeekend ? 'weekend' : ''
                  } ${
                    day.hasLesson ? 'has-lesson' : ''
                  }`}
                >
                  {day.date}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="upcoming-section">
          <div className="upcoming-header">
            <h3>Upcoming</h3>
            <span className="upcoming-header-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="upcoming-list">
            {upcomingSessions.length === 0 ? (
              <div className="empty-state-small">
                <FontAwesomeIcon icon={faCalendarDays} />
                <span>No upcoming sessions</span>
              </div>
            ) : (
              upcomingSessions.map(session => (
                <div key={session.id} className="upcoming-item">
                  <div className="upcoming-time-block">
                    <div className="upcoming-time">{session.time}</div>
                    <div className="upcoming-date">{session.date}</div>
                  </div>
                  <div className="upcoming-separator"></div>
                  <div className="upcoming-info-block">
                    <div className="upcoming-student">{session.student}</div>
                    <div className="upcoming-subject">{session.subject}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Action Modal */}
      {showActionModal && selectedBooking && (
        <BookingActionModal
          booking={selectedBooking}
          action={modalAction}
          onConfirm={(reason) => {
            if (modalAction === 'confirm') {
              // Check if this is a reschedule request
              if (selectedBooking.hasRescheduleRequest) {
                handleAcceptReschedule(selectedBooking.id);
              } else {
                handleConfirmBooking(selectedBooking.id, reason);
              }
            } else if (modalAction === 'reject-reschedule') {
              handleRejectReschedule(selectedBooking.id, reason);
            } else {
              handleRejectBooking(selectedBooking.id, reason);
            }
          }}
          onCancel={() => {
            setShowActionModal(false);
            setSelectedBooking(null);
            setModalAction(null);
          }}
        />
      )}

      {/* Student Profile Modal */}
      {showStudentProfile && (
        <div className="student-profile-modal-overlay" onClick={() => setShowStudentProfile(false)}>
          <div className="student-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowStudentProfile(false)}>
              &times;
            </button>
            
            {loadingProfile ? (
              <div className="modal-loading">Loading profile...</div>
            ) : selectedStudentProfile ? (
              <>
                <div className="profile-header">
                  {selectedStudentProfile.profilePictureUrl ? (
                    <img 
                      src={selectedStudentProfile.profilePictureUrl} 
                      alt={selectedStudentProfile.name}
                      className="profile-avatar-img"
                    />
                  ) : (
                    <div className="profile-avatar">
                      {selectedStudentProfile.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <h2>{selectedStudentProfile.name || 'Student'}</h2>
                  {selectedStudentProfile.pronouns && (
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
                      {selectedStudentProfile.pronouns}
                    </div>
                  )}
                </div>
                
                <div className="profile-details">
                  {selectedStudentProfile.studentGrade && (
                    <div className="profile-item">
                      <span className="profile-label">Grade</span>
                      <span className="profile-value">{selectedStudentProfile.studentGrade}</span>
                    </div>
                  )}

                  {selectedStudentProfile.email && (
                    <div className="profile-item">
                      <span className="profile-label">Email</span>
                      <span className="profile-value">{selectedStudentProfile.email}</span>
                    </div>
                  )}

                  {selectedStudentProfile.bio && (
                    <div className="profile-item bio">
                      <span className="profile-label">About</span>
                      <span className="profile-value">{selectedStudentProfile.bio}</span>
                    </div>
                  )}
                </div>

                <div className="profile-actions">
                  <button 
                    className="message-btn"
                    onClick={() => {
                      setShowStudentProfile(false);
                      navigate('/messages', {
                        state: {
                          otherUserId: selectedStudentProfile.userId || selectedStudentProfile.id,
                          bookingId: selectedStudentProfile.bookingId || null
                        }
                      });
                    }}
                  >
                    Send Message
                  </button>
                </div>
              </>
            ) : (
              <div className="modal-error">Unable to load profile</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
