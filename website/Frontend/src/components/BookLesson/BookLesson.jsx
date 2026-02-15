import React, { useState, useEffect } from 'react';
import './BookLesson.css';
import { useNavigate } from 'react-router-dom';
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
  faCheck,
  faUser,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import StudentSidebar from '../Shared/StudentSidebar';
import { useUser } from '../../context/UserContext';
import { tutorAPI, bookingAPI, availabilityAPI } from '../../services/api';

const BookLesson = () => {
  const navigate = useNavigate();
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
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const [selectedTutorProfile, setSelectedTutorProfile] = useState(null);

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

  // Grade-specific subject and course structure
  const getSubjectsForGrade = (gradeId) => {
    const allSubjects = [
      { id: 'math', name: 'Math', icon: faCalculator, color: '#e74c3c' },
      { id: 'english', name: 'English / Language Arts', icon: faGlobe, color: '#f1c40f' },
      { id: 'science', name: 'Science', icon: faFlask, color: '#2ecc71' },
      { id: 'social', name: 'Social Studies', icon: faGlobeAmericas, color: '#9b59b6' },
      { id: 'french', name: 'French', icon: faGlobe, color: '#e67e22' },
      { id: 'technology', name: 'Technology / CS', icon: faCog, color: '#3498db' },
      { id: 'business', name: 'Business', icon: faBriefcase, color: '#8B4513' }
    ];

    // Grades 1-3 (Primary)
    if (gradeId >= 1 && gradeId <= 3) {
      return allSubjects.filter(s => ['math', 'english', 'science', 'french'].includes(s.id));
    }
    // Grades 4-6 (Junior)
    if (gradeId >= 4 && gradeId <= 6) {
      return allSubjects.filter(s => ['math', 'english', 'science', 'social', 'french'].includes(s.id));
    }
    // Grades 7-8 (Intermediate)
    if (gradeId >= 7 && gradeId <= 8) {
      return allSubjects.filter(s => ['math', 'english', 'science', 'social', 'french', 'technology'].includes(s.id));
    }
    // Grade 9
    if (gradeId === 9) {
      return allSubjects.filter(s => !['business'].includes(s.id) || s.id === 'business'); // All except explicitly disallowed
    }
    // Grades 10-12
    return allSubjects; // All subjects available
  };

  const getCoursesForGradeAndSubject = (gradeId, subjectId) => {
    // Grades 1-3 (Primary)
    if (gradeId >= 1 && gradeId <= 3) {
      const courses = {
        math: ['Addition & Subtraction', 'Place Value', 'Patterns', 'Basic Geometry', 'Time & Money'],
        english: ['Reading', 'Phonics', 'Writing', 'Spelling', 'Basic Grammar'],
        science: ['Life Systems', 'Materials', 'Weather & Seasons', 'Simple Machines'],
        french: ['French Basics', 'French Reading', 'French Writing']
      };
      return courses[subjectId] || [];
    }

    // Grades 4-6 (Junior)
    if (gradeId >= 4 && gradeId <= 6) {
      const courses = {
        math: ['Multiplication & Division', 'Fractions', 'Decimals', 'Intro Algebra (Patterns)', 'Geometry', 'Measurement'],
        english: ['Reading Comprehension', 'Paragraph Writing', 'Grammar', 'Vocabulary'],
        science: ['Life Systems', 'Electricity', 'Space', 'Biodiversity'],
        social: ['Heritage & Identity', 'People & Environments', 'History Basics', 'Geography Basics'],
        french: ['French Intermediate', 'French Conversation', 'French Grammar']
      };
      return courses[subjectId] || [];
    }

    // Grades 7-8 (Intermediate)
    if (gradeId >= 7 && gradeId <= 8) {
      const courses = {
        math: ['Integers', 'Ratios & Rates', 'Equations (Intro)', 'Pythagorean Theorem', 'Graphing Basics', 'Probability'],
        english: ['English Language Arts', 'Reading & Analysis', 'Essay Writing', 'Grammar & Composition'],
        science: ['Cells & Systems', 'Fluids', 'Heat & Energy', 'Ecology'],
        social: ['History', 'Geography', 'World Cultures', 'Canadian Studies'],
        french: ['French Advanced', 'French Literature', 'French Communication'],
        technology: ['Coding Fundamentals', 'Robotics Basics', 'Digital Literacy']
      };
      return courses[subjectId] || [];
    }

    // Grade 9
    if (gradeId === 9) {
      const courses = {
        math: ['Foundations of Algebra', 'Linear Relations', 'Analytic Geometry (Intro)'],
        science: ['General Science', 'Biology Intro', 'Chemistry Intro', 'Physics Intro'],
        english: ['English 9', 'Reading & Writing', 'Literature Analysis'],
        social: ['Geography 9', 'World Geography'],
        french: ['French 9', 'Core French', 'French Immersion'],
        technology: ['Intro to Coding (Python)', 'Intro to Coding (Java)', 'Digital Literacy', 'Web Basics'],
        business: ['Intro to Business (optional)', 'Entrepreneurship Basics']
      };
      return courses[subjectId] || [];
    }

    // Grade 10
    if (gradeId === 10) {
      const courses = {
        math: ['Quadratics', 'Trigonometry Basics', 'Systems of Equations', 'Linear Relations'],
        science: ['Biology', 'Chemistry', 'Physics', 'General Science'],
        english: ['English 10', 'Literature & Composition', 'Media Studies'],
        social: ['History 10', 'Canadian History', 'Civics & Career Studies'],
        french: ['French 10', 'Core French', 'French Immersion'],
        technology: ['Programming Fundamentals', 'Web Development Basics', 'Computer Science'],
        business: ['Intro to Business', 'Entrepreneurship', 'Marketing Basics']
      };
      return courses[subjectId] || [];
    }

    // Grade 11
    if (gradeId === 11) {
      const courses = {
        math: ['Functions', 'College Math', 'Workplace Math'],
        science: ['Biology', 'Chemistry', 'Physics'],
        english: ['English 11', 'Literature', 'Writing & Rhetoric'],
        social: ['Social Sciences', 'World History', 'Law & Politics'],
        french: ['French 11', 'Core French', 'French Immersion'],
        technology: ['Programming (Intermediate)', 'Data Structures', 'Web Development', 'App Development'],
        business: ['Marketing', 'Accounting (Intro)', 'Entrepreneurship', 'Business Management']
      };
      return courses[subjectId] || [];
    }

    // Grade 12
    if (gradeId === 12) {
      const courses = {
        math: ['Advanced Functions', 'Calculus & Vectors', 'Data Management', 'Statistics'],
        science: ['Biology', 'Chemistry', 'Physics'],
        english: ['English 12', 'Literature', 'University Preparation'],
        social: ['Social Sciences', 'World Issues', 'Philosophy'],
        french: ['French 12', 'Core French', 'French Immersion'],
        technology: ['Software Engineering', 'OOP', 'Algorithms', 'Databases', 'Web Applications'],
        business: ['Financial Accounting', 'Finance & Investing', 'Marketing & Management', 'Business Leadership']
      };
      return courses[subjectId] || [];
    }

    return [];
  };

  const subjects = selectedGrade ? getSubjectsForGrade(selectedGrade.id) : [];
  const courses = (selectedGrade && selectedSubject) 
    ? getCoursesForGradeAndSubject(selectedGrade.id, selectedSubject.id) 
    : [];

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
      // Filter out slots that are less than 48 hours from now
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      
      const slotsMap = {};
      tutorsList.forEach((tutor, index) => {
        const allSlots = slotsResponses[index].data || [];
        
        // Only include slots that are 48+ hours in the future
        const filteredSlots = allSlots.filter(slot => {
          const slotDateTime = new Date(slot.startTime);
          return slotDateTime >= minBookingTime;
        });
        
        slotsMap[tutor.id] = filteredSlots;
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
    // Reset subject and course when grade changes
    setSelectedSubject(null);
    setSelectedCourse(null);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    // Reset course when subject changes
    setSelectedCourse(null);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleTimeSlotSelect = async (tutorId, timeSlot, day, date, slotData) => {
    // Clear any previous errors
    setError(null);
    
    // Validate slot data exists
    if (!slotData || !slotData.startTime) {
      setError('This tutor is not available at this time');
      return;
    }
    
    // Validate 48-hour minimum at selection time
    const slotDateTime = new Date(slotData.startTime);
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    if (slotDateTime < minBookingTime) {
      const hoursAway = (slotDateTime - now) / (1000 * 60 * 60);
      alert(`This slot is only ${hoursAway.toFixed(1)} hours away. Lessons must be booked at least 48 hours in advance.`);
      return;
    }
    
    // Real-time availability check before showing booking popup
    try {
      const availabilityResponse = await bookingAPI.checkAvailability(
        tutorId,
        slotData.startTime,
        slotData.endTime
      );
      
      if (!availabilityResponse.data.available) {
        setError('This tutor is not available at this time. They may have another booking.');
        return;
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Unable to verify availability. Please try again.');
      return;
    }
    
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
      if (!slotData || !slotData.startTime) {
        throw new Error('Invalid slot data - please select a different time slot');
      }

      // Validate 48-hour minimum booking window
      const selectedDateTime = new Date(slotData.startTime);
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const hoursAway = (selectedDateTime - now) / (1000 * 60 * 60);
      
      console.log('Booking validation:');
      console.log('  Current time:', now);
      console.log('  Selected slot time:', selectedDateTime);
      console.log('  Hours away:', hoursAway);
      console.log('  Min booking time (48h):', minBookingTime);
      console.log('  Is valid?', selectedDateTime >= minBookingTime);
      
      if (selectedDateTime < minBookingTime) {
        const errorMsg = `Lessons must be booked at least 48 hours in advance. This slot is only ${hoursAway.toFixed(1)} hours away.`;
        setError(errorMsg);
        alert(errorMsg);
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
      
      // Close the booking confirmation popup and show success modal
      setSelectedTimeSlot(null);
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

  const handleViewTutorProfile = (tutor, e) => {
    e.stopPropagation(); // Prevent selecting the tutor when clicking profile button
    setSelectedTutorProfile(tutor);
    setShowTutorProfile(true);
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '1.5rem',
              width: '100%'
            }}>
              <button 
                onClick={handleNext}
                disabled={!selectedGrade}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: selectedGrade ? '#1A803D' : '#ccc', 
                  color: 'white',
                  cursor: selectedGrade ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Continue
              </button>
            </div>
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
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end', 
              marginTop: '1.5rem',
              width: '100%'
            }}>
              <button 
                onClick={handleBack}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  backgroundColor: 'white', 
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                disabled={!selectedSubject}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: selectedSubject ? '#1A803D' : '#ccc', 
                  color: 'white',
                  cursor: selectedSubject ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
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
            {courses.length === 0 && selectedSubject && (
              <p className="no-courses-message">No courses available for this grade and subject combination.</p>
            )}
            <div className="course-grid">
              {courses.map((course, index) => (
                <button
                  key={index}
                  className={`course-button ${selectedCourse === course ? 'selected' : ''}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  {course}
                </button>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end', 
              marginTop: '1.5rem',
              width: '100%'
            }}>
              <button 
                onClick={handleBack}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  backgroundColor: 'white', 
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                disabled={!selectedCourse}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '6px', 
                  backgroundColor: selectedCourse ? '#1A803D' : '#ccc', 
                  color: 'white',
                  cursor: selectedCourse ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
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
          const now = new Date();
          const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
          
          currentTutorSlots.forEach(slot => {
            const slotDate = new Date(slot.startTime);
            
            // Only include slots that are at least 48 hours in advance
            if (slotDate >= minBookingTime) {
              const dateKey = slotDate.toISOString().split('T')[0];
              const timeKey = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
              
              if (!grouped[dateKey]) {
                grouped[dateKey] = {};
              }
              grouped[dateKey][timeKey] = slot;
            }
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
                      <button 
                        className="view-tutor-profile-btn"
                        onClick={(e) => handleViewTutorProfile(tutor, e)}
                        title="View Profile"
                      >
                        <FontAwesomeIcon icon={faUser} />
                      </button>
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
                                    const slotData = daySlots[timeSlot];
                                    
                                    // Check if slot exists and tutor has set availability
                                    let isAvailable = false;
                                    let unavailableReason = 'Tutor has not set availability for this time';
                                    
                                    if (slotData && slotData.startTime) {
                                      // Check if slot is at least 48 hours in advance
                                      const slotDateTime = new Date(slotData.startTime);
                                      const now = new Date();
                                      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
                                      
                                      if (slotDateTime >= minBookingTime) {
                                        isAvailable = true;
                                      } else {
                                        unavailableReason = 'Must book at least 48 hours in advance';
                                      }
                                    }
                                    
                                    const isSelected = selectedTutor === currentTutor.id && 
                                                     selectedTimeSlot?.timeSlot === timeSlot && 
                                                     selectedTimeSlot?.day === dayIndex;
                                    return (
                                      <div
                                        key={`${dayIndex}-${timeSlot}`}
                                        className={`time-slot-cell ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected-slot' : ''}`}
                                        onClick={() => {
                                          if (!isAvailable) {
                                            alert(unavailableReason);
                                            return;
                                          }
                                          handleTimeSlotSelect(currentTutor.id, timeSlot, dayIndex, date, slotData);
                                        }}
                                        style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                                        title={isAvailable ? 'Available - Click to book' : unavailableReason}
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
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end', 
              marginTop: '1.5rem',
              width: '100%'
            }}>
              <button 
                onClick={handleBack}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px', 
                  backgroundColor: 'white', 
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Back
              </button>
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
                  <p>Book {selectedGrade?.name} {selectedCourse} with {currentTutor?.displayName || currentTutor?.name} on {weekDays[weekDates[selectedTimeSlot.day]?.getDay()]}, {weekDates[selectedTimeSlot.day]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTimeSlot.timeSlot} - {new Date(selectedTimeSlot.slotData.endTime).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
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

      {/* Tutor Profile Modal */}
      {showTutorProfile && selectedTutorProfile && (
        <div className="tutor-profile-modal-overlay" onClick={() => setShowTutorProfile(false)}>
          <div className="tutor-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowTutorProfile(false)}>
              &times;
            </button>
            
            <div className="tutor-profile-header">
              {(selectedTutorProfile.user?.profilePictureUrl || selectedTutorProfile.profilePictureUrl) ? (
                <img 
                  src={selectedTutorProfile.user?.profilePictureUrl || selectedTutorProfile.profilePictureUrl} 
                  alt={selectedTutorProfile.displayName || selectedTutorProfile.name}
                  className="tutor-profile-avatar-img"
                />
              ) : (
                <div className="tutor-profile-avatar">
                  {(selectedTutorProfile.displayName || selectedTutorProfile.name)?.charAt(0)?.toUpperCase() || 'T'}
                </div>
              )}
              <h2>{selectedTutorProfile.displayName || selectedTutorProfile.name || 'Tutor'}</h2>
              {selectedTutorProfile.rating && (
                <div className="tutor-rating">
                  <FontAwesomeIcon icon={faStar} className="star-icon" />
                  <span>{selectedTutorProfile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <div className="tutor-profile-details">
              {selectedTutorProfile.bio && (
                <div className="tutor-profile-item bio">
                  <span className="tutor-profile-label">About</span>
                  <span className="tutor-profile-value">{selectedTutorProfile.bio}</span>
                </div>
              )}
              
              {selectedTutorProfile.subjects && selectedTutorProfile.subjects.length > 0 && (
                <div className="tutor-profile-item">
                  <span className="tutor-profile-label">Subjects</span>
                  <div className="tutor-subjects-list">
                    {selectedTutorProfile.subjects.map((subject, index) => (
                      <span key={index} className="subject-tag">
                        {subject.name || subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTutorProfile.experience && (
                <div className="tutor-profile-item">
                  <span className="tutor-profile-label">Experience</span>
                  <span className="tutor-profile-value">{selectedTutorProfile.experience}</span>
                </div>
              )}

              {selectedTutorProfile.education && (
                <div className="tutor-profile-item">
                  <span className="tutor-profile-label">Education</span>
                  <span className="tutor-profile-value">{selectedTutorProfile.education}</span>
                </div>
              )}
            </div>

            <div className="tutor-profile-actions">
              <button 
                className="select-tutor-btn"
                onClick={() => {
                  setSelectedTutor(selectedTutorProfile.id);
                  setShowTutorProfile(false);
                }}
              >
                Select This Tutor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLesson;