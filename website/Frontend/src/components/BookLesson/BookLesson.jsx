import React, { useState, useEffect } from 'react';
import './BookLesson.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft,
  faChevronRight,
  faCalculator,
  faFlask,
  faGlobe,
  faGlobeAmericas,
  faCog,
  faBriefcase,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import StudentSidebar from '../Shared/StudentSidebar';
import { useUser } from '../../context/UserContext';
import { tutorAPI, bookingAPI, availabilityAPI } from '../../services/api';

const BookLesson = () => {
  const { setUserType } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  // Set user type when component mounts
  useEffect(() => {
    setUserType('student');
  }, [setUserType]);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState({});

  const grades = [
    { id: 1, name: "Grade 1" },
    { id: 2, name: "Grade 2" },
    { id: 3, name: "Grade 3" },
    { id: 4, name: "Grade 4" },
    { id: 5, name: "Grade 5" },
    { id: 6, name: "Grade 6" },
    { id: 7, name: "Grade 7" },
    { id: 8, name: "Grade 8" },
    { id: 9, name: "Grade 9" },
    { id: 10, name: "Grade 10" },
    { id: 11, name: "Grade 11" },
    { id: 12, name: "Grade 12" }
  ];

  const subjects = [
    { id: 'math', name: 'Math', icon: faCalculator, color: '#e74c3c' },
    { id: 'science', name: 'Science', icon: faFlask, color: '#2ecc71' },
    { id: 'languages', name: 'Languages', icon: faGlobe, color: '#f1c40f' },
    { id: 'social', name: 'Social Studies', icon: faGlobeAmericas, color: '#9b59b6' },
    { id: 'technology', name: 'Technology', icon: faCog, color: '#3498db' },
    { id: 'business', name: 'Business', icon: faBriefcase, color: '#8B4513' }
  ];

  const courses = {
    math: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    science: ['Physics', 'Chemistry', 'Biology', 'Earth Science'],
    languages: ['English', 'Spanish', 'French', 'Literature'],
    social: ['Social Studies', 'History', 'Geography', 'Law'],
    technology: ['Computer Science', 'Programming', 'Web Development', 'Data Science'],
    business: ['Economics', 'Accounting', 'Marketing', 'Finance']
  };

  const fetchTutors = async () => {
    if (!selectedSubject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the specific course if selected, otherwise use the subject category
      const searchSubject = selectedCourse || selectedSubject.name;
      console.log('Searching for tutors with subject:', searchSubject);
      const response = await tutorAPI.searchTutors({ 
        subject: searchSubject,
        size: 500
      });
      
      console.log('Found tutors:', response.data.tutors.map(t => ({
        id: t.id,
        name: t.displayName,
        subjects: t.subjects?.map(s => s.name)
      })));
      
      setTutors(response.data.tutors);
      
      // Fetch availability for each tutor
      if (response.data.tutors.length > 0) {
        await fetchAvailabilityForTutors(response.data.tutors);
      }
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError('Failed to load tutors. Please try again.');
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityForTutors = async (tutorsList) => {
    // Get date range for next 2 weeks
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    try {
      // Fetch available slots for all tutors in parallel
      const slotsPromises = tutorsList.map(tutor => 
        availabilityAPI.getAvailableSlots(
          tutor.id,
          formatDate(startDate),
          formatDate(endDate),
          60 // 60 minute sessions
        ).catch(() => ({ data: [] })) // Return empty array if tutor has no availability set
      );
      
      const slotsResponses = await Promise.all(slotsPromises);
      
      // Map tutor IDs to their available slots
      const slotsMap = {};
      tutorsList.forEach((tutor, index) => {
        slotsMap[tutor.id] = slotsResponses[index].data || [];
      });
      
      setAvailableSlots(slotsMap);
    } catch (err) {
      console.error('Error fetching availability:', err);
      // Don't show error to user, just use empty availability
    }
  };

  // Fetch tutors when course is selected
  useEffect(() => {
    if (selectedCourse && selectedSubject) {
      fetchTutors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedSubject]);

  // Auto-select first tutor when tutors are loaded
  useEffect(() => {
    if (tutors.length > 0 && !selectedTutor) {
      setSelectedTutor(tutors[0].id);
    }
  }, [tutors, selectedTutor]);

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get dates for the current week
  const getWeekDates = () => {
    const startOfWeek = new Date(currentCalendarDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const navigateCalendarMonth = (direction) => {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(currentCalendarDate.getMonth() + direction);
    setCurrentCalendarDate(newDate);
    // Clear the selected time slot when navigating to a different month
    setSelectedTimeSlot(null);
  };

  const navigateCalendarWeek = (direction) => {
    const newDate = new Date(currentCalendarDate);
    newDate.setDate(currentCalendarDate.getDate() + (direction * 7));
    setCurrentCalendarDate(newDate);
    // Clear the selected time slot when navigating to a different week
    setSelectedTimeSlot(null);
  };

  const formatCalendarMonth = () => {
    return currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleTimeSlotSelect = (tutorId, timeSlot, day, date, slotData) => {
    setSelectedTutor(tutorId);
    setSelectedTimeSlot({ timeSlot, day, date, slotData });
  };

  const handleBookLesson = async () => {
    try {
      setBookingLoading(true);
      setError(null);

      // Find the selected tutor
      const tutor = tutors.find(t => t.id === selectedTutor);
      if (!tutor) {
        throw new Error('Selected tutor not found');
      }

      // Use the slot data from the availability API
      const slotData = selectedTimeSlot.slotData;
      if (!slotData) {
        throw new Error('Slot data not found');
      }

      // Validate 48-hour minimum booking window
      const selectedDateTime = new Date(slotData.startTime);
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      
      if (selectedDateTime < minBookingTime) {
        setError('Lessons must be booked at least 48 hours in advance');
        setBookingLoading(false);
        return;
      }

      // Format for backend - use the exact times from the availability slot
      const bookingData = {
        tutorProfileId: tutor.id,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        notes: `${selectedGrade.name} ${selectedCourse}`
      };

      await bookingAPI.createBooking(bookingData);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.error || 'Failed to book lesson. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookNewLesson = () => {
    setCurrentStep(1);
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSelectedCourse(null);
    setSelectedTutor(null);
    setSelectedTimeSlot(null);
    setShowSuccessModal(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="booking-card">
            <h3>Choose your grade level:</h3>
            <div className="grade-grid">
              {grades.map(grade => (
                <button
                  key={grade.id}
                  className={`grade-button ${selectedGrade?.id === grade.id ? 'selected' : ''}`}
                  onClick={() => handleGradeSelect(grade)}
                >
                  {grade.name}
                </button>
              ))}
            </div>
            <button 
              className="continue-button"
              onClick={handleNext}
              disabled={!selectedGrade}
            >
              Continue
            </button>
          </div>
        );

      case 2:
        return (
          <div className="booking-card">
            <h3>Choose your subject:</h3>
            <div className="subject-grid">
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  className={`subject-button ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                  onClick={() => handleSubjectSelect(subject)}
                  style={{ backgroundColor: subject.color }}
                >
                  <FontAwesomeIcon icon={subject.icon} />
                  <span>{subject.name}</span>
                </button>
              ))}
            </div>
            <div className="button-group">
              <button className="back-button" onClick={handleBack}>Back</button>
              <button 
                className="continue-button"
                onClick={handleNext}
                disabled={!selectedSubject}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="booking-card">
            <h3>Choose a course:</h3>
            <div className="course-grid">
              {courses[selectedSubject?.id]?.map((course, index) => (
                <button
                  key={index}
                  className={`course-button ${selectedCourse === course ? 'selected' : ''}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  {course}
                </button>
              ))}
            </div>
            <div className="button-group">
              <button className="back-button" onClick={handleBack}>Back</button>
              <button 
                className="continue-button"
                onClick={handleNext}
                disabled={!selectedCourse}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 4:
        const weekDates = getWeekDates();
        const currentTutor = tutors.find(t => t.id === selectedTutor) || tutors[0];
        const currentTutorSlots = availableSlots[selectedTutor] || [];
        
        // Group slots by date and time
        const groupSlotsByDateTime = () => {
          const grouped = {};
          currentTutorSlots.forEach(slot => {
            const slotDate = new Date(slot.startTime);
            const dateKey = slotDate.toISOString().split('T')[0];
            const timeKey = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            
            if (!grouped[dateKey]) {
              grouped[dateKey] = {};
            }
            grouped[dateKey][timeKey] = slot;
          });
          return grouped;
        };
        
        const slotsGrouped = groupSlotsByDateTime();
        
        // Get unique time slots across all days
        const allTimeSlots = new Set();
        Object.values(slotsGrouped).forEach(daySlots => {
          Object.keys(daySlots).forEach(time => allTimeSlots.add(time));
        });
        const uniqueTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
          const parseTime = (str) => {
            const [time, period] = str.split(' ');
            let hour = parseInt(time);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            return hour;
          };
          return parseTime(a) - parseTime(b);
        });
        
        return (
          <div className="booking-card-wide">
            <h3>Click on a tutor to check their availability:</h3>
            {loading && <p>Loading tutors...</p>}
            {error && !loading && <p className="error-message">{error}</p>}
            {!loading && tutors.length === 0 && (
              <p>No tutors available for this subject. Please try a different course.</p>
            )}
            {!loading && tutors.length > 0 && (
            <div className="tutor-availability-container">
              {/* Left Side - Tutor List */}
              <div className="tutor-list">
                {tutors.map(tutor => (
                  <div 
                    key={tutor.id}
                    className={`tutor-card ${selectedTutor === tutor.id ? 'active' : ''}`}
                    onClick={() => setSelectedTutor(tutor.id)}
                  >
                    <div className="tutor-card-name">
                      {tutor.displayName || tutor.name || 'Tutor Name'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side - Selected Tutor's Availability Calendar */}
              {selectedTutor && currentTutor && (
                <div className="tutor-calendar">
                  <div className="calendar-header">
                    <FontAwesomeIcon 
                      icon={faChevronLeft} 
                      onClick={() => navigateCalendarWeek(-1)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{formatCalendarMonth()}</span>
                    <FontAwesomeIcon 
                      icon={faChevronRight} 
                      onClick={() => navigateCalendarWeek(1)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  
                  <div className="calendar-grid-container">
                    {uniqueTimeSlots.length > 0 ? (
                      <>
                        {/* Time column on the left */}
                        <div className="time-column">
                          <div className="time-header">{currentTutor.displayName || currentTutor.name || 'Tutor Name'}</div>
                          {uniqueTimeSlots.map(timeSlot => (
                            <div key={timeSlot} className="time-label">
                              {timeSlot}
                            </div>
                          ))}
                        </div>
                        
                        {/* Days grid */}
                        <div className="days-grid">
                          <div className="day-headers">
                            {weekDates.map((date, index) => (
                              <div key={index} className="day-header">
                                <div className="day-name">{weekDays[date.getDay()]}</div>
                                <div className="day-number">{date.getDate()}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="availability-grid-new">
                            {weekDates.map((date, dayIndex) => {
                              const dateKey = date.toISOString().split('T')[0];
                              const daySlots = slotsGrouped[dateKey] || {};
                              
                              return (
                                <div key={dayIndex} className="day-slots">
                                  {uniqueTimeSlots.map((timeSlot) => {
                                    const isAvailable = daySlots[timeSlot] !== undefined;
                                    const slotData = daySlots[timeSlot];
                                    const isSelected = selectedTutor === currentTutor.id && 
                                                     selectedTimeSlot?.timeSlot === timeSlot && 
                                                     selectedTimeSlot?.day === dayIndex;
                                    return (
                                      <div
                                        key={`${dayIndex}-${timeSlot}`}
                                        className={`time-slot-cell ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected-slot' : ''}`}
                                        onClick={() => isAvailable && handleTimeSlotSelect(currentTutor.id, timeSlot, dayIndex, date, slotData)}
                                        title={isAvailable ? 'Available' : 'Not available'}
                                      />
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-availability-message">
                        <p>This tutor hasn't set their availability yet. Please try another tutor or check back later.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
            <div className="button-group">
              <button className="back-button" onClick={handleBack}>Back</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="book-lesson-page">
      <StudentSidebar />
      
      <div className="main-content">
        <div className="page-header">
          <h1>Book Lesson</h1>
          <div className="progress-indicator">
            {[1, 2, 3, 4].map(step => (
              <React.Fragment key={step}>
                <div className={`progress-circle ${step <= currentStep ? 'active' : ''}`}></div>
                {step < 4 && <div className="progress-line"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {renderStepContent()}
      </div>

      {/* Booking confirmation popup - at root level for proper fixed positioning */}
      {selectedTimeSlot && selectedTutor && (
        <div 
          className="booking-confirmation-overlay" 
          onClick={() => setSelectedTimeSlot(null)}
        >
          <div 
            className="booking-confirmation-popup"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentTutor = tutors.find(t => t.id === selectedTutor);
              const weekDates = getWeekDates();
              return (
                <>
                  <p>Book {selectedGrade?.name} {selectedCourse} with {currentTutor?.displayName || currentTutor?.name} on {weekDays[weekDates[selectedTimeSlot.day]?.getDay()]}, {weekDates[selectedTimeSlot.day]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTimeSlot.timeSlot} - {selectedTimeSlot.timeSlot.split(' ')[0] === '12' ? '1' : parseInt(selectedTimeSlot.timeSlot.split(' ')[0]) + 1} {selectedTimeSlot.timeSlot.split(' ')[1]}</p>
                  <div className="booking-confirmation-buttons">
                    <button 
                      className="confirm-book-button" 
                      onClick={handleBookLesson}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Booking...' : 'Book'}
                    </button>
                    <button 
                      className="cancel-book-button" 
                      onClick={() => setSelectedTimeSlot(null)}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                  </div>
                  {error && <p className="error-text">{error}</p>}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <h2>Success!</h2>
            <p>Your lesson has been booked and is now pending confirmation from the tutor! Check back on the Home page for status updates of your lesson.</p>
            <button className="book-new-button" onClick={handleBookNewLesson}>
              Book New Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLesson;