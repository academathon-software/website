import React, { useState, useEffect } from 'react';
import './TutorDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faClock,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faGraduationCap,
  faFlask,
  faFolderPlus,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import TutorSidebar from '../Shared/TutorSidebar';
import BookingStatusBadge from '../Shared/BookingStatusBadge';
import BookingActionModal from '../Shared/BookingActionModal';
import { useUser } from '../../context/UserContext';
import { bookingAPI, userAPI, tutorAPI } from '../../services/api';
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
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    totalHours: 0,
    avgRating: 0
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

      // Fetch user profile, tutor profile, and bookings in parallel
      const [userResponse, upcomingResponse, pastResponse, allBookingsResponse, pendingResponse] = await Promise.all([
        userAPI.getCurrentUser(),
        bookingAPI.getUpcomingBookings(),
        bookingAPI.getPastBookings(),
        bookingAPI.getUserBookings(),
        bookingAPI.getPendingBookings()
      ]);

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

      setStats({
        totalStudents: uniqueStudents.size,
        totalLessons: completedLessons.length,
        totalHours: Math.round(totalHours * 10) / 10,
        avgRating: 4.8 // TODO: Calculate from reviews when implemented
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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

  // Get courses from tutor profile
  const myCourses = tutorData?.subjects?.map((subject, index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#3498db', '#9b59b6'];
    const icons = [faGraduationCap, faFlask];
    return {
      id: subject.id,
      title: subject.name,
      subject: subject.name,
      grade: 'All Grades',
      icon: icons[index % icons.length],
      color: colors[index % colors.length]
    };
  }) || [];

  // Get lesson history from past bookings
  const history = pastBookings
    .filter(b => b.status === 'COMPLETED')
    .slice(0, 4)
    .map(booking => ({
      id: booking.id,
      grade: 'Tutoring',
      subject: booking.studentName,
      date: formatDate(booking.startTime),
      rating: 4 // TODO: Get from reviews when implemented
    }));

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

  const openActionModal = (booking, action) => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowActionModal(true);
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
                backgroundColor: '#4CAF50',
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
            <div style={{ marginTop: '10px', display: 'flex', gap: '20px', fontSize: '14px' }}>
              <span>👥 {stats.totalStudents} Students</span>
              <span>📚 {stats.totalLessons} Lessons</span>
              <span>⏱️ {stats.totalHours}hrs</span>
              <span>⭐ {stats.avgRating}/5.0</span>
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
                      <h4>{booking.studentName}</h4>
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
                            <strong style={{ color: '#4CAF50', fontSize: '13px' }}>Requested New Time:</strong>
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
                    <button 
                      className="btn-accept" 
                      onClick={() => openActionModal(booking, 'confirm')}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Accept
                    </button>
                    <button 
                      className="btn-decline" 
                      onClick={() => openActionModal(booking, booking.hasRescheduleRequest ? 'reject-reschedule' : 'reject')}
                    >
                      &times; Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses Section */}
        <div className="courses-section">
          <h3>My Courses</h3>
          <button 
            className="view-full-link" 
            onClick={() => navigate('/courses')}
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#4CAF50' }}
          >
            View Full List
          </button>
          
          <div className="courses-grid">
            {myCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', gridColumn: '1 / -1' }}>
                <p>No courses yet. Set up your tutor profile to add subjects you teach.</p>
              </div>
            ) : (
              myCourses.map(course => (
                <div key={course.id} className="course-card" style={{ backgroundColor: course.color }}>
                  <div className="course-icon">
                    <FontAwesomeIcon icon={course.icon} />
                  </div>
                  <div className="course-info">
                    <div className="course-subject">{course.subject}</div>
                    <div className="course-title">{course.title}</div>
                    <button 
                      className="view-course-btn"
                      onClick={() => navigate('/courses')}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))
            )}
            
            <div className="add-course-card">
              <div className="add-course-icon">
                <FontAwesomeIcon icon={faFolderPlus} />
              </div>
              <button 
                className="add-course-btn"
                onClick={() => navigate('/courses')}
              >
                Add Course
              </button>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="history-section">
          <h3>History</h3>
          <button 
            className="view-full-link"
            onClick={() => navigate('/lesson-history')}
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#4CAF50' }}
          >
            View Full History
          </button>
          
          <div className="history-list">
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>No completed lessons yet.</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-icon">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                  <div className="history-info">
                    <div className="history-grade">{item.grade}</div>
                    <div className="history-subject">{item.subject}</div>
                    <div className="history-date">{item.date}</div>
                  </div>
                  <div className="history-rating">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon 
                        key={i} 
                        icon={faStar} 
                        className={i < item.rating ? 'filled' : 'empty'} 
                      />
                    ))}
                  </div>
                </div>
              ))
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
          <h3>Upcoming</h3>
          <div className="upcoming-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
          
          <div className="upcoming-list">
            {upcomingSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <p>No upcoming sessions</p>
              </div>
            ) : (
              upcomingSessions.map(session => (
                <div key={session.id} className="upcoming-item">
                  <div className="upcoming-time">{session.time}</div>
                  <div className="upcoming-date">{session.date}</div>
                  <div className="upcoming-separator"></div>
                  <div className="upcoming-student">{session.student}</div>
                  <div className="upcoming-subject">{session.subject}</div>
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
    </div>
  );
};

export default TutorDashboard;
