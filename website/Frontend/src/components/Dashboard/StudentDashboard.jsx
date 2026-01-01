import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faChevronLeft,
  faChevronRight,
  faGraduationCap,
  faGlobe,
  faCog,
  faLightbulb,
  faDollarSign,
  faCircle,
  faCheck,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import StudentSidebar from '../Shared/StudentSidebar';
import BookingStatusBadge from '../Shared/BookingStatusBadge';
import PaymentModal from '../Payment/PaymentModal';
import { useUser } from '../../context/UserContext';
import { bookingAPI, userAPI, availabilityAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { setUserType } = useUser();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [studentProfile, setStudentProfile] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalHours: 0,
    upcomingCount: 0
  });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState(null);
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const [selectedTutorProfile, setSelectedTutorProfile] = useState(null);
  const [loadingTutorProfile, setLoadingTutorProfile] = useState(false);
  
  // Set user type and fetch data when component mounts
  useEffect(() => {
    setUserType('student');
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile and bookings in parallel
      const [profileResponse, upcomingResponse, allBookingsResponse] = await Promise.all([
        userAPI.getCurrentUser(),
        bookingAPI.getUpcomingBookings(),
        bookingAPI.getUserBookings()
      ]);

      // Set profile data
      setStudentProfile({
        name: profileResponse.data.displayUsername || 'Student',
        email: profileResponse.data.email,
        profileImage: profileResponse.data.profilePictureUrl || '👨‍🎓'
      });

      // Set bookings
      setUpcomingBookings(upcomingResponse.data);
      setAllBookings(allBookingsResponse.data);

      // Calculate stats
      const completedLessons = allBookingsResponse.data.filter(
        b => b.status === 'COMPLETED'
      );
      const totalHours = completedLessons.reduce((sum, booking) => {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        return sum + (end - start) / (1000 * 60 * 60); // Convert to hours
      }, 0);

      setStats({
        totalLessons: completedLessons.length,
        totalHours: Math.round(totalHours * 10) / 10,
        upcomingCount: upcomingResponse.data.filter(b => b.status !== 'CANCELLED').length
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem('token')) {
        setError('SESSION_EXPIRED');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(bookingId);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking: ' + (err.response?.data?.error || err.message));
    }
  };

  const canReschedule = (booking) => {
    const now = new Date();
    const lessonStart = new Date(booking.startTime);
    const minRescheduleTime = new Date(lessonStart.getTime() - 24 * 60 * 60 * 1000);
    
    return now < minRescheduleTime;
  };

  const handleOpenReschedule = (booking) => {
    setSelectedBooking(booking);
    
    // Set initial date and time from current booking
    const startTime = new Date(booking.startTime);
    const dateStr = startTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const hours = String(startTime.getHours()).padStart(2, '0');
    const minutes = String(startTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
    setShowRescheduleModal(true);
    
    // Check available slots for the current date
    checkAvailableSlots(dateStr, booking.tutorProfileId);
  };

  const handleCloseReschedule = () => {
    setShowRescheduleModal(false);
    setSelectedBooking(null);
    setRescheduleDate('');
    setRescheduleTime('');
    setAvailableSlots([]);
  };

  const checkAvailableSlots = async (date, tutorProfileId) => {
    if (!date) return;

    setCheckingAvailability(true);
    setAvailableSlots([]);

    try {
      // Use the availability API to get only the slots the tutor is actually available
      const response = await availabilityAPI.getAvailableSlots(
        tutorProfileId,
        date, // start date
        date, // end date (same day)
        60 // 60-minute duration
      );

      // Convert the API response to the format expected by the UI
      // Filter out slots that are less than 48 hours from now
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      
      const slots = response.data
        .filter(slot => {
          const startTime = new Date(slot.startTime);
          return startTime >= minBookingTime; // Only include slots 48+ hours in advance
        })
        .map(slot => {
          const startTime = new Date(slot.startTime);
          const timeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
          
          return {
            time: timeStr,
            available: true, // All slots from the API are available
            displayTime: startTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          };
        });

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error checking available slots:', error);
      alert('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      setRescheduleLoading(true);

      // Format datetime in local timezone
      const formatLocalDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hrs = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        const secs = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hrs}:${mins}:${secs}`;
      };

      // Parse date string to avoid timezone issues
      const [year, month, day] = rescheduleDate.split('-').map(Number);
      const [hours, minutes] = rescheduleTime.split(':').map(Number);
      
      // Create date using local time components to avoid timezone shifts
      const newStartTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const newEndTime = new Date(year, month - 1, day, hours + 1, minutes, 0, 0); // 1-hour lesson

      // Check if student already has another lesson at this time
      const hasConflict = upcomingBookings.some(booking => {
        // Exclude the current booking we're rescheduling
        if (booking.id === selectedBooking.id) return false;
        
        // Exclude cancelled bookings
        if (booking.status === 'CANCELLED') return false;
        
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        // Check for time overlap
        return (newStartTime < bookingEnd && newEndTime > bookingStart);
      });

      if (hasConflict) {
        alert('You already have another lesson scheduled at this time. Please choose a different time.');
        setRescheduleLoading(false);
        return;
      }

      // Validate 24-hour minimum reschedule window before original lesson
      const originalStartTime = new Date(selectedBooking.startTime);
      const now = new Date();
      const minimumRescheduleTime = new Date(originalStartTime.getTime() - 24 * 60 * 60 * 1000);
      
      if (now >= minimumRescheduleTime) {
        const hoursUntilLesson = Math.floor((originalStartTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        alert(`Cannot update or reschedule within 24 hours of lesson start. Your lesson is in ${hoursUntilLesson} hours. Please contact your tutor directly.`);
        setRescheduleLoading(false);
        return;
      }
      
      // Validate 48-hour minimum advance booking for the new time
      const minimumNewTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      if (newStartTime < minimumNewTime) {
        alert('The new lesson time must be at least 48 hours in advance from now.');
        setRescheduleLoading(false);
        return;
      }

      // Check tutor availability before rescheduling
      const availabilityResponse = await bookingAPI.checkAvailability(
        selectedBooking.tutorProfileId,
        formatLocalDateTime(newStartTime),
        formatLocalDateTime(newEndTime)
      );

      if (!availabilityResponse.data.available) {
        alert('This tutor is not available at the selected time. Please choose another time slot.');
        setRescheduleLoading(false);
        return;
      }

      // Request reschedule through the reschedule API
      await bookingAPI.requestReschedule(
        selectedBooking.id,
        formatLocalDateTime(newStartTime),
        formatLocalDateTime(newEndTime)
      );

      // Refresh dashboard data
      await fetchDashboardData();
      handleCloseReschedule();
      
      // Show appropriate success message based on booking status
      if (selectedBooking.status === 'PENDING') {
        alert('Booking request updated successfully! The tutor will review your updated request.');
      } else {
        alert('Reschedule request sent successfully! Waiting for tutor approval.');
      }
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      alert('Failed to reschedule: ' + (err.response?.data?.error || err.message));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setRescheduleDate(newDate);
    setRescheduleTime(''); // Reset time when date changes
    if (selectedBooking && newDate) {
      checkAvailableSlots(newDate, selectedBooking.tutorProfileId);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} ${timeStr}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': '#2ecc71',
      'PENDING': '#f39c12',
      'CANCELLED': '#e74c3c',
      'COMPLETED': '#3498db'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'CONFIRMED': faCheck,
      'PENDING': faCircle,
      'CANCELLED': faCircle,
      'COMPLETED': faCheck
    };
    return icons[status] || faCircle;
  };

  const getStatusText = (booking) => {
    const { status, paymentStatus } = booking;
    
    // Check if booking is confirmed but payment not succeeded
    if (status === 'CONFIRMED' && paymentStatus !== 'SUCCEEDED') {
      return 'Payment Required';
    }
    
    const statusText = {
      'PENDING': 'Pending Confirmation',
      'CONFIRMED': 'Confirmed',
      'SCHEDULED': 'Scheduled',
      'PAID': 'Payment Complete',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled',
      'COMPLETED': 'Completed'
    };
    return statusText[status] || status;
  };

  const handlePayNow = (bookingId) => {
    setPaymentBookingId(bookingId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setPaymentBookingId(null);
    // Refresh dashboard to show updated status
    await fetchDashboardData();
    alert('Payment successful! Your lesson is now confirmed.');
  };

  const handleViewTutorProfile = async (booking) => {
    setShowTutorProfile(true);
    setLoadingTutorProfile(true);
    
    // Set basic info from booking
    setSelectedTutorProfile({
      name: booking.tutorName,
      tutorUserId: booking.tutorUserId,
      profilePictureUrl: booking.tutorProfilePictureUrl,
      subjects: []
    });
    
    // Try to fetch more details if available
    try {
      const response = await userAPI.getUserProfile(booking.tutorUserId);
      setSelectedTutorProfile(prev => ({
        ...prev,
        ...response.data,
        name: booking.tutorName // Keep original name
      }));
    } catch (err) {
      console.log('Could not fetch additional tutor details');
    } finally {
      setLoadingTutorProfile(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPaymentBookingId(null);
  };

  // Get pending (PENDING status) bookings
  const pendingLessons = upcomingBookings
    .filter(b => b.status === 'PENDING')
    .slice(0, 3)
    .map((booking, index) => {
      const colors = ['#ff6b6b', '#9b59b6', '#3498db', '#2ecc71'];
      const icons = [faGraduationCap, faGlobe, faCog, faLightbulb];
      return {
        id: booking.id,
        subject: 'Lesson',
        grade: '',
        title: booking.tutorName,
        icon: icons[index % icons.length],
        color: colors[index % colors.length],
        status: 'Pending Confirmation',
        statusIcon: faCircle,
        dateTime: formatDateTime(booking.startTime)
      };
    });

  // Get upcoming confirmed bookings (all non-cancelled, non-completed)
  const upcomingLessons = upcomingBookings
    .filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.status !== 'REJECTED')
    .slice(0, 7);

  // Get today's and next few days' sessions (only SCHEDULED ones)
  const upcomingSessions = upcomingBookings
    .filter(b => b.status === 'SCHEDULED')
    .slice(0, 4)
    .map((booking, index) => {
      const colors = ['#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
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
          month: 'short',
          day: 'numeric'
        }),
        tutor: booking.tutorName,
        lesson: booking.subject || 'Tutoring Session',
        color: colors[index % colors.length]
      };
    });

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
    
    for (let i = 0; i < 35; i++) {
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
      <div className="student-dashboard">
        <StudentSidebar />
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
    const isSessionExpired = error === 'SESSION_EXPIRED';
    
    return (
      <div className="student-dashboard">
        <StudentSidebar />
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            {isSessionExpired ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
                <h2 style={{ color: '#333', marginBottom: '10px' }}>Session Expired</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Your session has expired. Please log back in to continue.</p>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '12px 30px',
                    backgroundColor: '#1A803D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Log Back In
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <StudentSidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="profile-pic">
            <div className="avatar">
              {typeof studentProfile.profileImage === 'string' && studentProfile.profileImage.startsWith('http') ? (
                <img src={studentProfile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                studentProfile.profileImage
              )}
            </div>
          </div>
          <div className="welcome-text">
            <h2>{studentProfile.name}</h2>
            <p>Welcome back to Academathon!</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '20px', fontSize: '14px' }}>
              <span>📚 {stats.totalLessons} Lessons Completed</span>
              <span>⏱️ {stats.totalHours} Hours</span>
              <span>📅 {stats.upcomingCount} Upcoming</span>
            </div>
          </div>
        </div>

        {/* Pending Lessons Section */}
        {pendingLessons.length > 0 && (
        <div className="pending-lessons-section">
          <h3>Pending Lessons</h3>
          
          <div className="pending-lessons-grid">
            {pendingLessons.map(lesson => (
              <div key={lesson.id} className="lesson-card" style={{ backgroundColor: lesson.color }}>
                <div className="lesson-header">
                  <div className="lesson-icon">
                    <FontAwesomeIcon icon={lesson.icon} />
                  </div>
                  <div className="lesson-datetime">{lesson.dateTime}</div>
                </div>
                <div className="lesson-info">
                  <div className="lesson-subject">{lesson.subject} {lesson.grade}</div>
                  <div className="lesson-title">{lesson.title}</div>
                  <div className="lesson-status">
                    <FontAwesomeIcon icon={lesson.statusIcon} />
                    <span>{lesson.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Upcoming Lessons Section */}
        <div className="upcoming-lessons-section">
          <h3>Upcoming Lessons</h3>
          <button 
            className="view-full-link" 
            onClick={() => navigate('/lesson-history')}
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#4CAF50' }}
          >
            View Full List
          </button>
          
          <div className="lessons-table">
            {upcomingLessons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>No upcoming lessons. <button onClick={() => navigate('/book-lesson')} style={{ color: '#4CAF50', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Book your first lesson!</button></p>
              </div>
            ) : (
              <>
                <div className="lesson-row lesson-header-row">
                  <div className="lesson-header-cell">Date/Time</div>
                  <div className="lesson-header-cell">Lesson Name</div>
                  <div className="lesson-header-cell">Tutor Name</div>
                  <div className="lesson-header-cell"></div>
                  <div className="lesson-header-cell"></div>
                </div>
                {upcomingLessons.map(booking => (
                  <div key={booking.id} className="lesson-row">
                    <div className="lesson-datetime">
                      {booking.hasRescheduleRequest ? (
                        <div style={{ fontSize: '13px' }}>
                          <div style={{ color: '#666', marginBottom: '4px' }}>
                            <strong>Original:</strong> {formatDateTime(booking.startTime)}
                          </div>
                          <div style={{ color: '#4CAF50' }}>
                            <strong>Requested:</strong> {formatDateTime(booking.requestedStartTime)}
                          </div>
                        </div>
                      ) : (
                        formatDateTime(booking.startTime)
                      )}
                    </div>
                    <div className="lesson-name">{booking.subject || 'Lesson Name'}</div>
                    <div className="tutor-name">
                      {booking.tutorName}
                      <button 
                        className="view-profile-btn"
                        onClick={() => handleViewTutorProfile(booking)}
                        title="View Tutor Profile"
                      >
                        <FontAwesomeIcon icon={faUser} />
                      </button>
                    </div>
                    <div className="status-indicator">
                      <BookingStatusBadge 
                        status={booking.status} 
                        paymentStatus={booking.paymentStatus}
                        isTutor={false}
                        hasRescheduleRequest={booking.hasRescheduleRequest}
                      />
                    </div>
                    <div className="lesson-actions">
                      {booking.status === 'CONFIRMED' && (
                        <button 
                          className="action-btn pay-btn" 
                          onClick={() => handlePayNow(booking.id)}
                          style={{ backgroundColor: '#4CAF50', color: 'white' }}
                        >
                          Pay Now
                        </button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'SCHEDULED') && (
                        canReschedule(booking) ? (
                          <button className="action-btn reschedule-btn" onClick={() => handleOpenReschedule(booking)}>
                            {booking.status === 'PENDING' ? 'Update Request' : 'Reschedule'}
                          </button>
                        ) : (
                          <p className="reschedule-blocked">Updates/reschedules must be requested at least 24 hours before the lesson</p>
                        )
                      )}
                      <button className="action-btn cancel-btn" onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                    </div>
                  </div>
                ))}
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
            <div className="upcoming-header-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="upcoming-list">
            {upcomingSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <p>No upcoming sessions</p>
              </div>
            ) : (
              upcomingSessions.map(session => (
                <div key={session.id} className="upcoming-item">
                  <div className="upcoming-time-block">
                    <div className="upcoming-time">{session.time}</div>
                    <div className="upcoming-date">{session.date}</div>
                  </div>
                  <div className="upcoming-separator" style={{ backgroundColor: session.color }}></div>
                  <div className="upcoming-info-block">
                    <div className="upcoming-tutor">{session.tutor}</div>
                    <div className="upcoming-lesson">{session.lesson}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentBookingId && (
        <PaymentModal
          bookingId={paymentBookingId}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseReschedule}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedBooking.status === 'PENDING' ? 'Update Booking Request' : 'Reschedule Lesson'}</h3>
              <button className="modal-close" onClick={handleCloseReschedule}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="booking-info">
                <p><strong>Lesson:</strong> {selectedBooking.subject || 'Lesson'}</p>
                <p><strong>Tutor:</strong> {selectedBooking.tutorName}</p>
                <p><strong>Current Time:</strong> {formatDateTime(selectedBooking.startTime)}</p>
                {selectedBooking.status === 'PENDING' && (
                  <p style={{ color: '#3498db', fontSize: '14px', marginTop: '10px' }}>
                    <em>Note: This will update your booking request to the new time. The tutor will review the updated request.</em>
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reschedule-date">New Date:</label>
                <input
                  type="date"
                  id="reschedule-date"
                  value={rescheduleDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control"
                />
              </div>

              {rescheduleDate && (
                <div className="form-group">
                  <label>Select Available Time:</label>
                  <p className="time-slots-hint">Select from the tutor's available time slots.</p>
                  {checkingAvailability ? (
                    <div className="availability-loading">
                      <p>Checking tutor availability...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="time-slots-grid">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={`time-slot-btn ${
                            slot.available ? 'available' : 'unavailable'
                          } ${rescheduleTime === slot.time ? 'selected' : ''}`}
                          onClick={() => slot.available && setRescheduleTime(slot.time)}
                          disabled={!slot.available}
                        >
                          {slot.displayTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="no-slots">No available slots for this date</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseReschedule}
                disabled={rescheduleLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleRescheduleSubmit}
                disabled={rescheduleLoading}
              >
                {rescheduleLoading 
                  ? (selectedBooking.status === 'PENDING' ? 'Updating...' : 'Rescheduling...') 
                  : (selectedBooking.status === 'PENDING' ? 'Update Request' : 'Confirm Reschedule')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutor Profile Modal */}
      {showTutorProfile && selectedTutorProfile && (
        <div className="tutor-profile-modal-overlay" onClick={() => setShowTutorProfile(false)}>
          <div className="tutor-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowTutorProfile(false)}>
              &times;
            </button>
            
            {loadingTutorProfile ? (
              <div className="modal-loading">Loading profile...</div>
            ) : (
              <>
                <div className="tutor-profile-header">
                  {selectedTutorProfile.profilePictureUrl ? (
                    <img 
                      src={selectedTutorProfile.profilePictureUrl} 
                      alt={selectedTutorProfile.name}
                      className="tutor-profile-avatar-img"
                    />
                  ) : (
                    <div className="tutor-profile-avatar">
                      {selectedTutorProfile.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <h2>{selectedTutorProfile.name || 'Tutor'}</h2>
                </div>
                
                <div className="tutor-profile-details">
                  {selectedTutorProfile.bio && (
                    <div className="tutor-profile-item bio">
                      <span className="tutor-profile-label">About</span>
                      <span className="tutor-profile-value">{selectedTutorProfile.bio}</span>
                    </div>
                  )}
                  
                  {selectedTutorProfile.contactEmail && (
                    <div className="tutor-profile-item">
                      <span className="tutor-profile-label">Email</span>
                      <span className="tutor-profile-value">{selectedTutorProfile.contactEmail}</span>
                    </div>
                  )}
                </div>

                <div className="tutor-profile-actions">
                  <button 
                    className="message-tutor-btn"
                    onClick={() => {
                      setShowTutorProfile(false);
                      navigate('/messages', { state: { otherUserId: selectedTutorProfile.tutorUserId || selectedTutorProfile.userId } });
                    }}
                  >
                    Send Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;