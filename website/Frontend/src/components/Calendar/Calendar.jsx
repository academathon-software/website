import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { bookingAPI } from '../../services/api';

const Calendar = () => {
  const { isTutor } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month'); // 'Week' or 'Month'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get first and last day of current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
      
      const response = await bookingAPI.getBookingsByDateRange(
        firstDay.toISOString(),
        lastDay.toISOString()
      );
      
      // Filter out cancelled bookings - they shouldn't appear on calendar
      const activeBookings = response.data.filter(
        booking => booking.status !== 'CANCELLED'
      );
      
      // Transform bookings to lesson format
      const lessons = activeBookings.map((booking, index) => {
        const startTime = new Date(booking.startTime);
        const colors = ['#9b59b6', '#3498db', '#8B4513', '#e74c3c', '#2ecc71'];
        
        return {
          id: booking.id,
          date: startTime,
          time: startTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          title: isTutor 
            ? `Lesson with ${booking.studentName}`
            : `Lesson with ${booking.tutorName}`,
          color: colors[index % colors.length],
          tutor: booking.tutorName,
          student: booking.studentName,
          status: booking.status,
          booking: booking
        };
      });
      
      setBookings(lessons);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const lessons = bookings;

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(currentMonth.getDate() + (direction * 7));
    setCurrentMonth(newDate);
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Get lessons for this date
      const dayLessons = lessons.filter(lesson => 
        lesson.date.toDateString() === date.toDateString()
      );
      
      days.push({
        date: date.getDate(),
        fullDate: date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        lessons: dayLessons
      });
    }
    
    return days;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentMonth);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      const timeString = hour <= 12 ? `${hour} am` : `${hour - 12} pm`;
      slots.push({ hour, timeString });
    }
    return slots;
  };

  const getLessonsForTimeSlot = (date, hour) => {
    return lessons.filter(lesson => {
      const lessonDate = lesson.date;
      const lessonHour = parseInt(lesson.time.split(':')[0]);
      const isPM = lesson.time.includes('PM');
      const lessonHour24 = isPM && lessonHour !== 12 ? lessonHour + 12 : (isPM === false && lessonHour === 12 ? 0 : lessonHour);
      
      return lessonDate.toDateString() === date.toDateString() && lessonHour24 === hour;
    });
  };


  return (
    <div className="calendar-page">
      {isTutor ? <TutorSidebar /> : <StudentSidebar />}

      {/* Main Content */}
      <div className="calendar-main-content">
        <div className="calendar-page-header">
          <h1>Calendar</h1>
          <p>View all your past and upcoming lessons!</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
            <p>Loading bookings...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
            <button 
              onClick={fetchBookings}
              style={{
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
        )}

        {!loading && !error && (
        <div className="calendar-widget-container">
          <div className="calendar-widget">
            <div className="calendar-widget-header">
              <div className="calendar-month-year">{formatMonthYear(currentMonth)}</div>
              <div className="calendar-nav-controls">
                <button 
                  className="calendar-nav-arrow"
                  onClick={() => viewMode === 'Week' ? navigateWeek(-1) : navigateMonth(-1)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button 
                  className="calendar-nav-arrow"
                  onClick={() => viewMode === 'Week' ? navigateWeek(1) : navigateMonth(1)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              <div className="calendar-view-toggle">
                <button 
                  className={`calendar-view-btn ${viewMode === 'Week' ? 'active' : ''}`}
                  onClick={() => setViewMode('Week')}
                >
                  Week
                </button>
                <button 
                  className={`calendar-view-btn ${viewMode === 'Month' ? 'active' : ''}`}
                  onClick={() => setViewMode('Month')}
                >
                  Month
                </button>
              </div>
            </div>

            {viewMode === 'Month' ? (
              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="calendar-weekday">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="calendar-days-grid">
                  {getCalendarDays().map((day, index) => (
                    <div 
                      key={index} 
                      className={`calendar-day-cell ${
                        !day.isCurrentMonth ? 'other-month' : ''
                      } ${
                        day.isToday ? 'today' : ''
                      }`}
                    >
                      <div className="calendar-day-number">{day.date}</div>
                      {day.lessons.map(lesson => (
                        <div key={lesson.id} className="calendar-lesson">
                          <div 
                            className="calendar-lesson-dot" 
                            style={{ backgroundColor: lesson.color }}
                          ></div>
                          <span className="calendar-lesson-text">{lesson.time} {lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="calendar-week-grid">
                <div className="week-time-column">
                  <div className="week-header-spacer"></div>
                  {getTimeSlots().map(slot => (
                    <div key={slot.hour} className="week-time-slot">
                      {slot.timeString}
                    </div>
                  ))}
                </div>
                
                <div className="week-days-column">
                  <div className="week-days-header">
                    {getWeekDays().map((date, index) => (
                      <div key={index} className="week-day-header">
                        <div className="week-day-name">{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]}</div>
                        <div className="week-day-number">{date.getDate()}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="week-grid">
                    {getWeekDays().map((date, dayIndex) => (
                      <div key={dayIndex} className="week-day-column">
                        {getTimeSlots().map((slot, timeIndex) => {
                          const timeLessons = getLessonsForTimeSlot(date, slot.hour);
                          return (
                            <div key={timeIndex} className="week-time-cell">
                              {timeLessons.map(lesson => (
                                <div key={lesson.id} className="week-lesson">
                                  <div 
                                    className="week-lesson-dot" 
                                    style={{ backgroundColor: lesson.color }}
                                  ></div>
                                  <span className="week-lesson-text">{lesson.time} {lesson.title}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;