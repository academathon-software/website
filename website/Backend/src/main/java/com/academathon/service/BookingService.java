package com.academathon.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academathon.dto.BookingRequestDTO;
import com.academathon.dto.BookingResponseDTO;
import com.academathon.model.Booking;
import com.academathon.model.Booking.BookingStatus;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;
    private final EmailService emailService;
    
    public BookingService(BookingRepository bookingRepository, 
                         TutorProfileRepository tutorProfileRepository,
                         UserRepository userRepository,
                         AvailabilityService availabilityService,
                         EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.userRepository = userRepository;
        this.availabilityService = availabilityService;
        this.emailService = emailService;
    }
    
    /**
     * Create a new booking
     */
    @Transactional
    public BookingResponseDTO createBooking(Long studentId, BookingRequestDTO request) {
        // Validate student exists
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Validate tutor profile exists
        TutorProfile tutor = tutorProfileRepository.findById(request.getTutorProfileId())
                .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        // Validate booking time
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book a lesson in the past");
        }
        
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // Check if tutor is available based on their availability schedule
        boolean isAvailable = availabilityService.isAvailable(
            tutor.getId(),
            request.getStartTime(),
            request.getEndTime()
        );
        
        if (!isAvailable) {
            throw new RuntimeException("This time slot is not available for booking. Please choose from the tutor's available times.");
        }
        
        // Check for conflicting bookings with the tutor
        List<Booking> tutorConflicts = bookingRepository.findConflictingBookings(
            tutor.getId(), 
            request.getStartTime(), 
            request.getEndTime()
        );
        
        if (!tutorConflicts.isEmpty()) {
            throw new RuntimeException("This tutor is not available at this time");
        }
        
        // Check for conflicting bookings with the student
        List<Booking> studentConflicts = bookingRepository.findConflictingStudentBookings(
            studentId,
            request.getStartTime(),
            request.getEndTime()
        );
        
        if (!studentConflicts.isEmpty()) {
            throw new RuntimeException("You already have a lesson scheduled at this time");
        }
        
        // Create booking with PENDING status (awaiting tutor confirmation)
        Booking booking = new Booking();
        booking.setTutor(tutor);
        booking.setStudent(student);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(BookingStatus.PENDING); // Changed from CONFIRMED to PENDING
        booking.setSubject(request.getNotes()); // Store the subject from notes field
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send email notification to tutor
        try {
            String tutorEmail = tutor.getUser().getEmail();
            String subject = "New Booking Request - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "You have received a new booking request from %s.\n\n" +
                "Details:\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n" +
                "- Duration: %d minutes\n\n" +
                "Please log in to your dashboard to accept or decline this booking request.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                tutor.getDisplayName(),
                student.getUsername(),
                booking.getSubject(),
                booking.getStartTime(),
                java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes()
            );
            emailService.sendEmail(tutorEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send booking notification email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(savedBooking);
    }
    
    /**
     * Get all bookings for a user (student or tutor)
     */
    public List<BookingResponseDTO> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Booking> bookings;
        
        if (user.getRole() == User.Role.STUDENT) {
            bookings = bookingRepository.findByStudentId(userId);
        } else if (user.getRole() == User.Role.TUTOR) {
            // Find tutor profile for this user
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(userId)
                    .orElse(null);
            if (tutorProfile == null) {
                // Tutor has no profile yet, return empty list
                return List.of();
            }
            bookings = bookingRepository.findByTutorId(tutorProfile.getId());
        } else {
            throw new RuntimeException("Invalid user role");
        }
        
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming bookings for a user
     */
    public List<BookingResponseDTO> getUpcomingBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings;
        
        if (user.getRole() == User.Role.STUDENT) {
            bookings = bookingRepository.findUpcomingBookingsByStudent(userId, now);
        } else if (user.getRole() == User.Role.TUTOR) {
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(userId)
                    .orElse(null);
            if (tutorProfile == null) {
                // Tutor has no profile yet, return empty list
                return List.of();
            }
            bookings = bookingRepository.findUpcomingBookingsByTutor(tutorProfile.getId(), now);
        } else {
            throw new RuntimeException("Invalid user role");
        }
        
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get past bookings for a user
     */
    public List<BookingResponseDTO> getPastBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings;
        
        if (user.getRole() == User.Role.STUDENT) {
            bookings = bookingRepository.findPastBookingsByStudent(userId, now);
        } else if (user.getRole() == User.Role.TUTOR) {
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(userId)
                    .orElse(null);
            if (tutorProfile == null) {
                // Tutor has no profile yet, return empty list
                return List.of();
            }
            bookings = bookingRepository.findPastBookingsByTutor(tutorProfile.getId(), now);
        } else {
            throw new RuntimeException("Invalid user role");
        }
        
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get bookings within a date range for calendar view
     */
    public List<BookingResponseDTO> getBookingsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Booking> bookings = bookingRepository.findBookingsByUserAndDateRange(userId, startDate, endDate);
        
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a single booking by ID
     */
    public BookingResponseDTO getBookingById(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify user has access to this booking
        if (!booking.getStudent().getId().equals(userId) && 
            !booking.getTutor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        return new BookingResponseDTO(booking);
    }
    
    /**
     * Cancel a booking
     */
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify user has access to this booking
        if (!booking.getStudent().getId().equals(userId) && 
            !booking.getTutor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Check if booking can be cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }
        
        // Cancel the booking
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);
        
        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Confirm a booking (tutor confirms a pending booking)
     * After confirmation, student needs to pay
     */
    @Transactional
    public BookingResponseDTO confirmBooking(Long bookingId, Long tutorUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify this is the tutor
        if (!booking.getTutor().getUser().getId().equals(tutorUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }
        
        // Set status to CONFIRMED - awaiting payment from student
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Send email notification to student with payment reminder
        try {
            String studentEmail = booking.getStudent().getEmail();
            String subject = "Booking Confirmed - Payment Required - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "Great news! %s has confirmed your booking request.\n\n" +
                "Details:\n" +
                "- Tutor: %s\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n" +
                "- Duration: %d minutes\n\n" +
                "ACTION REQUIRED: Please complete the payment to finalize your lesson.\n" +
                "Log in to your dashboard to pay now.\n\n" +
                "Note: If payment is not received within 24 hours of the lesson start time, " +
                "the booking will be automatically cancelled.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime(),
                java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes()
            );
            emailService.sendEmail(studentEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Reject a booking (tutor rejects a pending booking)
     */
    @Transactional
    public BookingResponseDTO rejectBooking(Long bookingId, Long tutorUserId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify this is the tutor
        if (!booking.getTutor().getUser().getId().equals(tutorUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }
        
        // Set status to REJECTED and store reason
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Send email notification to student
        try {
            String studentEmail = booking.getStudent().getEmail();
            String subject = "Booking Request Declined - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "Unfortunately, %s has declined your booking request.\n\n" +
                "Booking Details:\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n\n" +
                "Reason: %s\n\n" +
                "Don't worry! You can book another lesson with a different tutor or choose a different time slot.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime(),
                reason != null ? reason : "No reason provided"
            );
            emailService.sendEmail(studentEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Mark a booking as completed
     */
    @Transactional
    public BookingResponseDTO completeBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify user has access to this booking
        if (!booking.getStudent().getId().equals(userId) && 
            !booking.getTutor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Only SCHEDULED bookings (paid and confirmed) can be marked as completed
        if (booking.getStatus() != BookingStatus.SCHEDULED) {
            throw new RuntimeException("Only scheduled bookings can be completed");
        }
        
        // Check if the booking end time has passed
        if (booking.getEndTime().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Cannot complete a booking that hasn't ended yet");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        Booking updatedBooking = bookingRepository.save(booking);
        
        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Get pending bookings for a tutor (awaiting confirmation)
     */
    public List<BookingResponseDTO> getPendingBookingsForTutor(Long tutorUserId) {
        TutorProfile tutorProfile = tutorProfileRepository.findByUserId(tutorUserId)
                .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        List<Booking> bookings = bookingRepository.findByTutorIdAndStatus(
            tutorProfile.getId(), 
            BookingStatus.PENDING
        );
        
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if a tutor is available at a specific time
     */
    public boolean isTutorAvailable(Long tutorProfileId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            tutorProfileId, 
            startTime, 
            endTime
        );
        
        return conflicts.isEmpty();
    }
    
    /**
     * Request a reschedule for a booking (student requests reschedule)
     */
    @Transactional
    public BookingResponseDTO requestReschedule(Long bookingId, Long studentId, 
                                                 LocalDateTime newStartTime, LocalDateTime newEndTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify this is the student's booking
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Can only reschedule PENDING or SCHEDULED bookings
        if (booking.getStatus() != BookingStatus.PENDING && 
            booking.getStatus() != BookingStatus.SCHEDULED) {
            throw new RuntimeException("This booking cannot be rescheduled");
        }
        
        // Validate new times
        if (newStartTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot reschedule to a time in the past");
        }
        
        if (newEndTime.isBefore(newStartTime)) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // Check if tutor is available at the new time
        boolean isAvailable = availabilityService.isAvailable(
            booking.getTutor().getId(),
            newStartTime,
            newEndTime
        );
        
        if (!isAvailable) {
            throw new RuntimeException("Tutor is not available at the requested time");
        }
        
        // Check for conflicting bookings with the tutor at the new time
        List<Booking> tutorConflicts = bookingRepository.findConflictingBookings(
            booking.getTutor().getId(), 
            newStartTime, 
            newEndTime
        );
        
        if (!tutorConflicts.isEmpty()) {
            throw new RuntimeException("Tutor has another booking at this time");
        }
        
        // Check for conflicting bookings with the student at the new time
        List<Booking> studentConflicts = bookingRepository.findConflictingStudentBookings(
            studentId,
            newStartTime,
            newEndTime
        );
        
        // Exclude current booking from conflict check
        studentConflicts = studentConflicts.stream()
            .filter(b -> !b.getId().equals(bookingId))
            .collect(Collectors.toList());
        
        if (!studentConflicts.isEmpty()) {
            throw new RuntimeException("You have another booking at this time");
        }
        
        // Store original times if not already stored
        if (booking.getOriginalStartTime() == null) {
            booking.setOriginalStartTime(booking.getStartTime());
            booking.setOriginalEndTime(booking.getEndTime());
        }
        
        // Store requested times and mark as having reschedule request
        booking.setRequestedStartTime(newStartTime);
        booking.setRequestedEndTime(newEndTime);
        booking.setHasRescheduleRequest(true);
        
        // Update current times to the requested times (will revert if rejected)
        booking.setStartTime(newStartTime);
        booking.setEndTime(newEndTime);
        
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Send email notification to tutor
        try {
            String tutorEmail = booking.getTutor().getUser().getEmail();
            String subject = "Reschedule Request - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "%s has requested to reschedule their lesson with you.\n\n" +
                "Original Details:\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s to %s\n\n" +
                "Requested New Details:\n" +
                "- Date & Time: %s to %s\n" +
                "- Duration: %d minutes\n\n" +
                "Please log in to your dashboard to accept or decline this reschedule request.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getTutor().getDisplayName(),
                booking.getStudent().getUsername(),
                booking.getSubject(),
                booking.getOriginalStartTime(),
                booking.getOriginalEndTime(),
                newStartTime,
                newEndTime,
                java.time.Duration.between(newStartTime, newEndTime).toMinutes()
            );
            emailService.sendEmail(tutorEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send reschedule request email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Accept a reschedule request (tutor accepts the reschedule)
     */
    @Transactional
    public BookingResponseDTO acceptReschedule(Long bookingId, Long tutorUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify this is the tutor
        if (!booking.getTutor().getUser().getId().equals(tutorUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        if (!booking.getHasRescheduleRequest()) {
            throw new RuntimeException("No pending reschedule request for this booking");
        }
        
        // Clear the reschedule request flag and original times
        booking.setHasRescheduleRequest(false);
        booking.setOriginalStartTime(null);
        booking.setOriginalEndTime(null);
        booking.setRequestedStartTime(null);
        booking.setRequestedEndTime(null);
        
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Send email notification to student
        try {
            String studentEmail = booking.getStudent().getEmail();
            String subject = "Reschedule Request Approved - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "Great news! %s has approved your reschedule request.\n\n" +
                "Updated Lesson Details:\n" +
                "- Subject: %s\n" +
                "- New Date & Time: %s\n" +
                "- Duration: %d minutes\n\n" +
                "Your lesson has been successfully rescheduled.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime(),
                java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes()
            );
            emailService.sendEmail(studentEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send reschedule approval email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Reject a reschedule request (tutor rejects the reschedule)
     * Reverts the booking to the original date/time
     */
    @Transactional
    public BookingResponseDTO rejectReschedule(Long bookingId, Long tutorUserId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify this is the tutor
        if (!booking.getTutor().getUser().getId().equals(tutorUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        if (!booking.getHasRescheduleRequest()) {
            throw new RuntimeException("No pending reschedule request for this booking");
        }
        
        // Store the rejected requested times for email
        LocalDateTime rejectedStartTime = booking.getStartTime();
        LocalDateTime rejectedEndTime = booking.getEndTime();
        
        // Revert to original times
        booking.setStartTime(booking.getOriginalStartTime());
        booking.setEndTime(booking.getOriginalEndTime());
        
        // Clear the reschedule request data
        booking.setHasRescheduleRequest(false);
        booking.setOriginalStartTime(null);
        booking.setOriginalEndTime(null);
        booking.setRequestedStartTime(null);
        booking.setRequestedEndTime(null);
        
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Send email notification to student
        try {
            String studentEmail = booking.getStudent().getEmail();
            String subject = "Reschedule Request Declined - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "Unfortunately, %s has declined your reschedule request.\n\n" +
                "Original Lesson Details:\n" +
                "- Subject: %s\n" +
                "- Original Date & Time: %s to %s\n\n" +
                "Requested Date & Time:\n" +
                "- %s to %s\n\n" +
                "Reason: %s\n\n" +
                "Your lesson remains scheduled at the original time. " +
                "If you need to reschedule, you can submit another reschedule request or cancel this booking.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime(),
                booking.getEndTime(),
                rejectedStartTime,
                rejectedEndTime,
                reason != null ? reason : "No reason provided"
            );
            emailService.sendEmail(studentEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send reschedule rejection email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(updatedBooking);
    }
}

