import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import StudentSidebar from '../Shared/StudentSidebar';
import { useUser } from '../../context/UserContext';
import { tutorAPI, bookingAPI, availabilityAPI, userAPI, paymentAPI, walletAPI } from '../../services/api';
import { stripePromise } from '../../services/stripe';

/**
 * Build a YYYY-MM-DD key based on the date's LOCAL components, not its UTC ones.
 * We can't use `date.toISOString().split('T')[0]` because that returns the UTC date,
 * which silently shifts forward by a day in negative-offset timezones once it's late
 * enough in the evening (e.g. 10 PM EDT on the 18th is already the 19th in UTC).
 * Using local components keeps slot timestamps and week-grid dates in the same frame
 * of reference so the calendar lines up regardless of the user's timezone.
 */
const toLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a numeric amount + ISO currency code as a localized string, e.g. "$35.00 CAD".
 * Falls back to a plain "$X.XX" if the currency code is missing or unusable.
 */
const formatPrice = (amount, currency) => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency || 'CAD',
      currencyDisplay: 'code',
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}${currency ? ` ${currency}` : ''}`;
  }
};

/**
 * Renders the Stripe PaymentElement inside an Elements provider so the student can
 * save a card. Confirms the SetupIntent and surfaces the resulting payment method id
 * to the parent via onPaymentMethod(paymentMethodId).
 */
const SaveCardForm = ({ onPaymentMethod, onCancel, summary, submitting, pricing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setConfirming(true);

    try {
      const { error: submitError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/book-lesson',
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message);
        setConfirming(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        await onPaymentMethod(setupIntent.payment_method);
      } else {
        setError('Could not save your card. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Could not save your card. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const busy = confirming || submitting;

  const priceLabel = formatPrice(pricing?.amount, pricing?.currency);

  return (
    <form onSubmit={handleSubmit} className="save-card-form">
      {priceLabel && (
        <p className="save-card-total">
          Total: {priceLabel}
        </p>
      )}
      <p className="save-card-subtitle">
        Your card will be saved now and only charged {priceLabel ? `(${priceLabel}) ` : ''}
        if {summary?.tutorName || 'your tutor'} confirms the booking.
      </p>
      <PaymentElement
        id="setup-payment-element"
        onReady={() => setIsReady(true)}
      />
      {error && <p className="error-text">{error}</p>}
      <div className="booking-confirmation-buttons">
        <button
          type="submit"
          className="confirm-book-button"
          disabled={!stripe || !elements || !isReady || busy}
        >
          {busy ? 'Saving…' : 'Save card & book'}
        </button>
        <button
          type="button"
          className="cancel-book-button"
          onClick={onCancel}
          disabled={busy}
        >
          Back
        </button>
      </div>
    </form>
  );
};

const BookLesson = () => {
  const navigate = useNavigate();
  const { setUserType } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  // Set user type when component mounts
  useEffect(() => {
    setUserType('student');
  }, [setUserType]);

  // Load the student's grade from their profile — they can no longer choose
  // a grade per booking; it's locked to whatever they have set on their profile.
  useEffect(() => {
    let cancelled = false;
    const loadProfileGrade = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        if (cancelled) return;
        const grade = response.data?.studentGrade || '';
        setStudentGradeLabel(grade);
        setSelectedGrade(resolveGradeFromLabel(grade));
      } catch (err) {
        console.error('Failed to load profile grade:', err);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    loadProfileGrade();
    return () => { cancelled = true; };
  }, []);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [studentGradeLabel, setStudentGradeLabel] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
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
  // Booking timing config (loaded from backend; defaults match application.properties)
  const [bookingTiming, setBookingTiming] = useState({
    minimumAdvanceHours: 5,
    tutorResponseBeforeLessonHours: 3,
    rescheduleRequestBeforeLessonHours: 2,
    rescheduleResponseBeforeLessonHours: 1,
    cancellationBeforeLessonHours: 1,
  });

  // SetupIntent state for the "save card" sub-step that runs after the user clicks Book.
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Wallet vs card payment choice. Defaults to card so nothing changes for users
  // who don't use the wallet; the wallet balance is shown when available.
  const [paymentChoice, setPaymentChoice] = useState('card');
  const [wallet, setWallet] = useState(null);

  // Backend-driven price quote so the SetupIntent step can disclose the amount
  // before the student saves their card. Refetched any time the grade changes
  // (today it's locked to the profile but keeping the dep is cheap insurance).
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    bookingAPI.getTimingConfig()
      .then(response => {
        if (!cancelled && response?.data) {
          setBookingTiming(response.data);
        }
      })
      .catch(() => { /* fall back to defaults */ });
    return () => { cancelled = true; };
  }, []);

  // Load the student's wallet so the booking popup can offer "pay with balance".
  useEffect(() => {
    let cancelled = false;
    walletAPI.getWallet()
      .then(response => {
        if (!cancelled && response?.data) setWallet(response.data);
      })
      .catch(() => { /* wallet optional; fall back to card */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!studentGradeLabel) return;
    let cancelled = false;
    paymentAPI.getQuote(studentGradeLabel)
      .then(response => {
        if (!cancelled && response?.data) {
          setPricing(response.data);
        }
      })
      .catch((err) => {
        // Non-fatal: the popup just won't show a price.
        console.error('Failed to load price quote:', err);
      });
    return () => { cancelled = true; };
  }, [studentGradeLabel]);

  // Map a stored profile grade label (e.g. "8th Grade", "College/University")
  // back onto our internal grade object so getSubjectsForGrade keeps working.
  // Non-K12 labels fall back to the broadest subject list (treated like grade 12).
  const resolveGradeFromLabel = (label) => {
    if (!label) return null;
    const match = label.match(/^(\d{1,2})(?:st|nd|rd|th) Grade$/);
    if (match) {
      const id = parseInt(match[1], 10);
      return { id, name: `Grade ${id}` };
    }
    return { id: 12, name: label };
  };

  // All available subjects — same for every student regardless of grade
  const ALL_SUBJECTS = [
    'Math',
    'English',
    'Science',
    'French',
    'History',
    'Computer Science',
    'Business',
    'Advanced Functions',
    'Functions',
    'Calculus & Vectors',
    'Chemistry',
    'Social Studies',
    'Physics',
    'Biology',
    'Accounting',
    'Data Management',
    'Stats & Probability',
    'Economics'
  ];

  const fetchTutors = async () => {
    if (!selectedSubject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const searchSubject = selectedSubject;
      const response = await tutorAPI.searchTutors({
        subject: searchSubject,
        gradeLevel: studentGradeLabel || undefined,
        size: 500
      });
      
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
      // Filter out slots that are less than the configured advance booking window from now
      const now = new Date();
      const advanceHours = bookingTiming.minimumAdvanceHours;
      const minBookingTime = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);
      
      const slotsMap = {};
      tutorsList.forEach((tutor, index) => {
        const allSlots = slotsResponses[index].data || [];
        
        // Only include slots far enough in the future
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

  // Fetch tutors when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchTutors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

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
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleTimeSlotSelect = async (tutorId, timeSlot, day, date, slotData) => {
    // Clear any previous errors
    setError(null);
    
    // Validate slot data exists
    if (!slotData || !slotData.startTime) {
      setError('This tutor is not available at this time');
      return;
    }
    
    // Validate minimum advance booking window at selection time
    const slotDateTime = new Date(slotData.startTime);
    const now = new Date();
    const advanceHours = bookingTiming.minimumAdvanceHours;
    const minBookingTime = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);
    
    if (slotDateTime < minBookingTime) {
      const hoursAway = (slotDateTime - now) / (1000 * 60 * 60);
      alert(`This slot is only ${hoursAway.toFixed(1)} hours away. Lessons must be booked at least ${advanceHours} hours in advance.`);
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

  // Step 1: validate the slot, then either submit a wallet booking directly or request
  // a Stripe SetupIntent so the student can save a card (the "save card" sub-step).
  const handleBookLesson = async () => {
    try {
      setBookingLoading(true);
      setError(null);

      const tutor = tutors.find(t => t.id === selectedTutor);
      if (!tutor) {
        throw new Error('Selected tutor not found');
      }

      const slotData = selectedTimeSlot.slotData;
      if (!slotData || !slotData.startTime) {
        throw new Error('Invalid slot data - please select a different time slot');
      }

      const selectedDateTime = new Date(slotData.startTime);
      const now = new Date();
      const advanceHours = bookingTiming.minimumAdvanceHours;
      const minBookingTime = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);
      const hoursAway = (selectedDateTime - now) / (1000 * 60 * 60);

      if (selectedDateTime < minBookingTime) {
        const errorMsg = `Lessons must be booked at least ${advanceHours} hours in advance. This slot is only ${hoursAway.toFixed(1)} hours away.`;
        setError(errorMsg);
        alert(errorMsg);
        setBookingLoading(false);
        return;
      }

      // Wallet path: no card to save - book directly. No money moves until the tutor confirms.
      if (paymentChoice === 'wallet') {
        await submitBooking({ paymentSource: 'WALLET' });
        return;
      }

      // Card path: collect a card via SetupIntent first.
      setSetupLoading(true);
      const setupResponse = await paymentAPI.createSetupIntent();
      const clientSecret = setupResponse?.data?.clientSecret;
      if (!clientSecret) {
        throw new Error('Could not start payment setup. Please try again.');
      }
      setSetupClientSecret(clientSecret);
    } catch (err) {
      console.error('Error preparing booking:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start booking. Please try again.');
    } finally {
      setBookingLoading(false);
      setSetupLoading(false);
    }
  };

  // Submit the actual booking. For card bookings the backend auto-charges the saved
  // method when the tutor confirms; for wallet bookings it deducts from the balance.
  const submitBooking = async ({ paymentMethodId = null, paymentSource = 'CARD' }) => {
    try {
      setBookingLoading(true);
      setError(null);

      const tutor = tutors.find(t => t.id === selectedTutor);
      const slotData = selectedTimeSlot?.slotData;
      if (!tutor || !slotData?.startTime) {
        throw new Error('Booking details are incomplete. Please pick a slot again.');
      }

      const bookingData = {
        tutorProfileId: tutor.id,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        notes: `${studentGradeLabel || selectedGrade?.name || ''} ${selectedSubject}`.trim(),
        gradeLevel: studentGradeLabel || selectedGrade?.name || '',
        paymentMethodId,
        paymentSource,
      };

      await bookingAPI.createBooking(bookingData);

      setSetupClientSecret(null);
      setSelectedTimeSlot(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.error || err.message || 'Failed to book lesson. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Step 2 (card only): after Stripe confirms the SetupIntent and gives us a payment
  // method id, submit the actual booking.
  const submitBookingWithPaymentMethod = (paymentMethodId) =>
    submitBooking({ paymentMethodId, paymentSource: 'CARD' });

  const cancelBookingFlow = () => {
    setSetupClientSecret(null);
    setSelectedTimeSlot(null);
    setError(null);
  };

  const stripeElementsOptions = useMemo(() => ({
    clientSecret: setupClientSecret,
    appearance: {
      theme: 'stripe',
      variables: { colorPrimary: '#1A803D' },
    },
  }), [setupClientSecret]);

  const handleBookNewLesson = () => {
    setCurrentStep(1);
    // Keep selectedGrade in place — it's locked to the student's profile and
    // resolveGradeFromLabel(studentGradeLabel) is the source of truth.
    setSelectedSubject(null);
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
            <h3>Your grade level</h3>

            {profileLoading ? (
              <p>Loading your profile…</p>
            ) : studentGradeLabel ? (
              <>
                <div className="bl-grade-box">
                  <p className="bl-grade-meta">Booking as</p>
                  <p className="bl-grade-name">{studentGradeLabel}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="bl-change-grade-btn"
                  >
                    Change in profile
                  </button>
                </div>
                <p className="bl-grade-hint">
                  We'll only show tutors who teach this grade.
                </p>
                <div className="bl-continue-row">
                  <button onClick={handleNext} className="bl-continue-btn">
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <div className="bl-no-grade-box">
                <p className="bl-no-grade-title">Set your grade level to continue</p>
                <p className="bl-no-grade-body">
                  We use your grade to show only tutors who teach at your level. You can update it any time on your profile.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="bl-go-profile-btn"
                >
                  Go to profile
                </button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="booking-card">
            <h3>Choose your subject:</h3>
            <div className="course-grid">
              {ALL_SUBJECTS.map((subject, index) => (
                <button
                  key={index}
                  className={`course-button ${selectedSubject === subject ? 'selected' : ''}`}
                  onClick={() => handleSubjectSelect(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="bl-nav-row">
              <button onClick={handleBack} className="bl-back-btn">Back</button>
              <button onClick={handleNext} disabled={!selectedSubject} className="bl-next-btn">
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        const weekDates = getWeekDates();
        const currentTutor = tutors.find(t => t.id === selectedTutor) || tutors[0];
        const currentTutorSlots = availableSlots[selectedTutor] || [];
        
        // Group slots by date and time
        const groupSlotsByDateTime = () => {
          const grouped = {};
          const now = new Date();
          const advanceHours = bookingTiming.minimumAdvanceHours;
          const minBookingTime = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);
          
          currentTutorSlots.forEach(slot => {
            const slotDate = new Date(slot.startTime);
            
            // Only include slots far enough in advance
            if (slotDate >= minBookingTime) {
              // Local date key so the week-grid columns line up with the slot day in the
              // user's timezone (see comment on toLocalDateKey for why we don't use
              // .toISOString().split('T')[0] here).
              const dateKey = toLocalDateKey(slotDate);
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
                    <div className="tutor-card-rating">
                      <FontAwesomeIcon icon={faStar} className="tutor-card-star" />
                      {tutor.averageRating && tutor.averageRating > 0 ? (
                        <>
                          <span className="tutor-card-rating-value">{tutor.averageRating.toFixed(1)}</span>
                          {tutor.reviewCount > 0 && (
                            <span className="tutor-card-review-count">
                              ({tutor.reviewCount})
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="tutor-card-no-rating">No ratings yet</span>
                      )}
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
                    />
                    <span>{formatCalendarMonth()}</span>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      onClick={() => navigateCalendarWeek(1)}
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
                              // Local date key (matches the one in groupSlotsByDateTime).
                              // Using toISOString here was the source of an off-by-one-day
                              // bug: late-evening weekDates rolled over to the next day in
                              // UTC and ended up showing the *next* day's availability.
                              const dateKey = toLocalDateKey(date);
                              const daySlots = slotsGrouped[dateKey] || {};
                              
                              return (
                                <div key={dayIndex} className="day-slots">
                                  {uniqueTimeSlots.map((timeSlot) => {
                                    const slotData = daySlots[timeSlot];
                                    
                                    // Check if slot exists and tutor has set availability
                                    let isAvailable = false;
                                    let unavailableReason = 'Tutor has not set availability for this time';
                                    
                                    if (slotData && slotData.startTime) {
                                      // Check if slot is far enough in advance
                                      const slotDateTime = new Date(slotData.startTime);
                                      const now = new Date();
                                      const advanceHours = bookingTiming.minimumAdvanceHours;
                                      const minBookingTime = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);
                                      
                                      if (slotDateTime >= minBookingTime) {
                                        isAvailable = true;
                                      } else {
                                        unavailableReason = `Must book at least ${advanceHours} hours in advance`;
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
            <div className="bl-nav-row">
              <button onClick={handleBack} className="bl-back-btn">Back</button>
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
            {[1, 2, 3].map(step => (
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
          onClick={cancelBookingFlow}
        >
          <div 
            className="booking-confirmation-popup"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentTutor = tutors.find(t => t.id === selectedTutor);
              const weekDates = getWeekDates();
              const priceLabel = formatPrice(pricing?.amount, pricing?.currency);
              const summaryLine = (
                <p>
                  Book {studentGradeLabel || selectedGrade?.name} {selectedSubject} with {currentTutor?.displayName || currentTutor?.name} on {weekDays[weekDates[selectedTimeSlot.day]?.getDay()]}, {weekDates[selectedTimeSlot.day]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTimeSlot.timeSlot} - {new Date(selectedTimeSlot.slotData.endTime).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                </p>
              );

              if (setupClientSecret) {
                return (
                  <>
                    {summaryLine}
                    <Elements key={setupClientSecret} stripe={stripePromise} options={stripeElementsOptions}>
                      <SaveCardForm
                        summary={{ tutorName: currentTutor?.displayName || currentTutor?.name }}
                        pricing={pricing}
                        onPaymentMethod={submitBookingWithPaymentMethod}
                        onCancel={cancelBookingFlow}
                        submitting={bookingLoading}
                      />
                    </Elements>
                    {error && <p className="error-text">{error}</p>}
                  </>
                );
              }

              const price = pricing?.amount;
              const balance = wallet ? Number(wallet.balance) : 0;
              const reloadCovers = wallet?.autoReloadEnabled
                && wallet?.autoReloadAmount != null
                && (balance + Number(wallet.autoReloadAmount)) >= (price || 0);
              const walletCovers = price == null || balance >= price || reloadCovers;
              const balanceLabel = wallet ? formatPrice(wallet.balance, wallet.currency) : null;

              return (
                <>
                  {summaryLine}
                  {priceLabel && (
                    <p className="bl-popup-price">Total: {priceLabel}</p>
                  )}

                  <div className="bl-pay-choice">
                    <label className={`bl-pay-option ${paymentChoice === 'wallet' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payChoice"
                        checked={paymentChoice === 'wallet'}
                        onChange={() => setPaymentChoice('wallet')}
                      />
                      <span className="bl-pay-option-main">Pay with wallet</span>
                      {balanceLabel && (
                        <span className="bl-pay-option-meta">Balance: {balanceLabel}</span>
                      )}
                    </label>
                    <label className={`bl-pay-option ${paymentChoice === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payChoice"
                        checked={paymentChoice === 'card'}
                        onChange={() => setPaymentChoice('card')}
                      />
                      <span className="bl-pay-option-main">Pay with card</span>
                      <span className="bl-pay-option-meta">Save a card next</span>
                    </label>
                  </div>

                  {paymentChoice === 'wallet' ? (
                    <p className="bl-popup-hint">
                      We'll deduct {priceLabel ? `${priceLabel} ` : ''}from your wallet only once your tutor confirms the booking.
                    </p>
                  ) : (
                    <p className="bl-popup-hint">
                      You'll save a card next. We only charge {priceLabel ? `${priceLabel} ` : 'it '}once your tutor confirms the booking.
                    </p>
                  )}

                  {paymentChoice === 'wallet' && !walletCovers && (
                    <p className="bl-popup-warning">
                      Your wallet balance may not cover this lesson. Top up in your Wallet to avoid a failed confirmation.
                    </p>
                  )}

                  <div className="booking-confirmation-buttons">
                    <button
                      className="confirm-book-button"
                      onClick={handleBookLesson}
                      disabled={bookingLoading || setupLoading}
                    >
                      {bookingLoading || setupLoading
                        ? 'Preparing…'
                        : paymentChoice === 'wallet' ? 'Book lesson' : 'Continue to payment'}
                    </button>
                    <button
                      className="cancel-book-button"
                      onClick={cancelBookingFlow}
                      disabled={bookingLoading || setupLoading}
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
              {selectedTutorProfile.user?.pronouns && (
                <div className="bl-pronouns">{selectedTutorProfile.user.pronouns}</div>
              )}
              <div className="tutor-rating">
                <FontAwesomeIcon icon={faStar} className="star-icon" />
                {selectedTutorProfile.averageRating && selectedTutorProfile.averageRating > 0 ? (
                  <>
                    <span>{selectedTutorProfile.averageRating.toFixed(1)}</span>
                    {selectedTutorProfile.reviewCount > 0 && (
                      <span className="tutor-rating-count">
                        ({selectedTutorProfile.reviewCount} {selectedTutorProfile.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="tutor-rating-empty">No ratings yet</span>
                )}
              </div>
            </div>
            
            <div className="tutor-profile-details">
              {selectedTutorProfile.bio && (
                <div className="tutor-profile-item bio">
                  <span className="tutor-profile-label">About</span>
                  <span className="tutor-profile-value">{selectedTutorProfile.bio}</span>
                </div>
              )}

              {(selectedTutorProfile.university || selectedTutorProfile.program || selectedTutorProfile.academicYear) && (
                <div className="tutor-profile-item">
                  <span className="tutor-profile-label">Education</span>
                  <span className="tutor-profile-value">
                    {[
                      selectedTutorProfile.program,
                      selectedTutorProfile.academicYear,
                      selectedTutorProfile.university
                    ].filter(Boolean).join(' • ')}
                  </span>
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

              {selectedTutorProfile.gradeLevels && selectedTutorProfile.gradeLevels.length > 0 && (
                <div className="tutor-profile-item">
                  <span className="tutor-profile-label">Grade Levels</span>
                  <div className="tutor-subjects-list">
                    {selectedTutorProfile.gradeLevels.map((grade, index) => (
                      <span key={index} className="subject-tag">
                        {grade}
                      </span>
                    ))}
                  </div>
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