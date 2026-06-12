package com.academathon.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academathon.config.BookingTimingProperties;
import com.academathon.dto.BookingRequestDTO;
import com.academathon.dto.BookingResponseDTO;
import com.academathon.model.Booking;
import com.academathon.model.Booking.BookingStatus;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.repository.UserRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final DateTimeFormatter EMAIL_DATE_FORMAT = 
        DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
    
    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;
    private final EmailService emailService;
    private final BookingTimingProperties timing;
    private final PaymentService paymentService;
    private final WalletService walletService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    public BookingService(BookingRepository bookingRepository, 
                         TutorProfileRepository tutorProfileRepository,
                         UserRepository userRepository,
                         AvailabilityService availabilityService,
                         EmailService emailService,
                         BookingTimingProperties timing,
                         PaymentService paymentService,
                         WalletService walletService) {
        this.bookingRepository = bookingRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.userRepository = userRepository;
        this.availabilityService = availabilityService;
        this.emailService = emailService;
        this.timing = timing;
        this.paymentService = paymentService;
        this.walletService = walletService;
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
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        
        if (request.getStartTime().isBefore(now)) {
            throw new RuntimeException("Cannot book a lesson in the past");
        }
        
        // Validate minimum advance booking window (configured in application.properties)
        LocalDateTime minimumBookingTime = now.plusHours(timing.getMinimumAdvanceHours());
        if (request.getStartTime().isBefore(minimumBookingTime)) {
            throw new RuntimeException(
                "Bookings must be made at least " + timing.getMinimumAdvanceHours() + " hours in advance"
            );
        }
        
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Resolve how this lesson will be paid for. WALLET bookings deduct from the
        // student's balance at confirm time and don't require a saved card up front.
        Booking.PaymentSource paymentSource = Booking.PaymentSource.CARD;
        if (request.getPaymentSource() != null && request.getPaymentSource().equalsIgnoreCase("WALLET")) {
            paymentSource = Booking.PaymentSource.WALLET;
        }

        // CARD bookings require a saved payment method - we auto-charge when the tutor confirms.
        // WALLET bookings skip this; no money moves until the tutor confirms.
        if (paymentSource == Booking.PaymentSource.CARD
                && (request.getPaymentMethodId() == null || request.getPaymentMethodId().isBlank())) {
            throw new RuntimeException("A saved payment method is required to book a lesson");
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
        booking.setStatus(BookingStatus.PENDING);
        booking.setSubject(request.getNotes()); // Store the subject from notes field
        booking.setGradeLevel(request.getGradeLevel());
        booking.setPaymentMethodId(request.getPaymentMethodId());
        booking.setPaymentSource(paymentSource);
        
        // Tutor must respond at least N hours before the lesson; if that deadline
        // is already in the past (shouldn't happen given the 5h advance rule) we
        // fall back to "now" to avoid an instantly-stale booking.
        LocalDateTime tutorDeadline = request.getStartTime()
                .minusHours(timing.getTutorResponseBeforeLessonHours());
        if (tutorDeadline.isBefore(now)) {
            tutorDeadline = now;
        }
        booking.setTutorResponseDeadline(tutorDeadline);
        
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
                "Please respond by %s (at least %d hour(s) before the lesson).\n" +
                "Accepting this booking will automatically charge the student's saved card.\n" +
                "If you do not respond by the deadline the booking is auto-declined and the student is not charged.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                tutor.getDisplayName(),
                student.getUsername(),
                booking.getSubject(),
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
                java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes(),
                booking.getTutorResponseDeadline().format(EMAIL_DATE_FORMAT),
                timing.getTutorResponseBeforeLessonHours()
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
     * Cancel a booking.
     *
     * - PENDING: anyone (student/tutor) can cancel, no payment was captured so no refund.
     * - SCHEDULED: must be cancelled before lesson - cancellationBeforeLessonHours.
     *   The captured payment is refunded via Stripe.
     * - CANCELLED / COMPLETED: terminal, cannot be cancelled again.
     */
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getStudent().getId().equals(userId) && 
            !booking.getTutor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }

        // Enforce the no-changes cutoff for SCHEDULED (paid) bookings.
        if (booking.getStatus() == BookingStatus.SCHEDULED) {
            LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
            LocalDateTime cutoff = booking.getStartTime()
                    .minusHours(timing.getCancellationBeforeLessonHours());
            if (!now.isBefore(cutoff)) {
                throw new RuntimeException(
                    "Cancellation is no longer available. Bookings cannot be cancelled within " +
                    timing.getCancellationBeforeLessonHours() + " hour(s) of lesson start."
                );
            }

            // Refund the captured payment back to its original source.
            try {
                if (booking.getPaymentSource() == Booking.PaymentSource.WALLET) {
                    walletService.refundToWallet(booking);
                } else {
                    paymentService.refundPayment(bookingId);
                }
            } catch (Exception e) {
                System.err.println("Failed to refund payment for booking " + bookingId + ": " + e.getMessage());
                throw new RuntimeException("Could not process refund: " + e.getMessage(), e);
            }
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);

        boolean cancelledByStudent = booking.getStudent().getId().equals(userId);
        boolean refunded = booking.getPaymentStatus() == Booking.PaymentStatus.REFUNDED;

        // Notify the other party
        try {
            String recipientEmail = cancelledByStudent
                    ? booking.getTutor().getUser().getEmail()
                    : booking.getStudent().getEmail();
            String recipientName = cancelledByStudent
                    ? booking.getTutor().getDisplayName()
                    : booking.getStudent().getUsername();
            String otherPartyName = cancelledByStudent
                    ? booking.getStudent().getUsername()
                    : booking.getTutor().getDisplayName();
            String refundLine = refunded
                    ? "The payment has been refunded to the student.\n"
                    : "No payment was captured for this booking.\n";
            String subject = "Booking Cancelled - Academathon";
            String body = String.format(
                "Hello %s,\n\n" +
                "%s cancelled the booking originally scheduled for %s.\n" +
                "%s\n" +
                "Best regards,\nAcademathon Team",
                recipientName,
                otherPartyName,
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
                refundLine
            );
            emailService.sendEmail(recipientEmail, subject, body);
        } catch (Exception ignored) { /* best-effort */ }

        // Send the student a cancellation + refund confirmation when they initiated it.
        if (cancelledByStudent) {
            try {
                String refundLine = refunded
                        ? String.format(
                            "A full refund of $%.2f has been issued to your original payment method.\n" +
                            "Refunds typically take 5-10 business days to appear on your statement.\n",
                            booking.getAmount() != null ? booking.getAmount() : 0.0)
                        : "No payment had been captured for this booking, so there is nothing to refund.\n";
                String subject = "Your Lesson Cancellation is Confirmed - Academathon";
                String body = String.format(
                    "Hello %s,\n\n" +
                    "This confirms that you cancelled your lesson. Here are the details:\n\n" +
                    "Lesson Details:\n" +
                    "- Tutor: %s\n" +
                    "- Subject: %s\n" +
                    "- Date & Time: %s\n\n" +
                    "%s\n" +
                    "We hope to see you book again soon.\n\n" +
                    "Best regards,\n" +
                    "Academathon Team",
                    booking.getStudent().getUsername(),
                    booking.getTutor().getDisplayName(),
                    booking.getSubject(),
                    booking.getStartTime().format(EMAIL_DATE_FORMAT),
                    refundLine
                );
                emailService.sendEmail(booking.getStudent().getEmail(), subject, body);
            } catch (Exception ignored) { /* best-effort */ }
        }

        return new BookingResponseDTO(updatedBooking);
    }
    
    /**
     * Refund a booking's captured payment to its original source (wallet or card).
     * Used by the admin refund endpoint; does not change the booking status.
     */
    @Transactional
    public void refundBookingPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        try {
            if (booking.getPaymentSource() == Booking.PaymentSource.WALLET) {
                walletService.refundToWallet(booking);
                bookingRepository.save(booking);
            } else {
                paymentService.refundPayment(bookingId);
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Could not process refund: " + e.getMessage(), e);
        }
    }

    /**
     * Confirm a booking (tutor confirms a pending booking).
     *
     * New workflow: confirmation auto-charges the student's saved card. On success the
     * booking goes straight to SCHEDULED. On charge failure the booking stays PENDING
     * and a RuntimeException is thrown so the tutor sees the error.
     */
    @Transactional
    public BookingResponseDTO confirmBooking(Long bookingId, Long tutorUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getTutor().getUser().getId().equals(tutorUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }

        // Enforce tutor-response cutoff: at least N hours before the lesson.
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        LocalDateTime cutoff = booking.getStartTime()
                .minusHours(timing.getTutorResponseBeforeLessonHours());
        if (now.isAfter(cutoff)) {
            throw new RuntimeException(
                "The response window has closed. Bookings must be confirmed at least " +
                timing.getTutorResponseBeforeLessonHours() + " hour(s) before the lesson."
            );
        }
        
        // Collect payment before transitioning. WALLET bookings deduct from the
        // student's balance (with auto-reload-then-card fallback); CARD bookings charge
        // the saved card off-session. On failure the booking stays PENDING (no status
        // change) and the exception bubbles up.
        try {
            if (booking.getPaymentSource() == Booking.PaymentSource.WALLET) {
                walletService.deductForBooking(booking);
            } else {
                paymentService.chargeBookingOffSession(booking);
            }
        } catch (RuntimeException chargeError) {
            // Send the student a note asking them to update their payment method.
            try {
                String studentEmail = booking.getStudent().getEmail();
                String subject = "Action required: payment method declined - Academathon";
                String body = String.format(
                    "Hello %s,\n\n" +
                    "Your tutor %s tried to confirm your booking for %s, but your saved card was declined.\n" +
                    "Please update your payment method or re-book to keep the lesson.\n\n" +
                    "Reason: %s\n\n" +
                    "Best regards,\n" +
                    "Academathon Team",
                    booking.getStudent().getUsername(),
                    booking.getTutor().getDisplayName(),
                    booking.getStartTime().format(EMAIL_DATE_FORMAT),
                    chargeError.getMessage()
                );
                emailService.sendEmail(studentEmail, subject, body);
            } catch (Exception ignored) { /* best-effort */ }
            throw chargeError;
        }

        // Payment captured - go straight to SCHEDULED (skip CONFIRMED).
        booking.setStatus(BookingStatus.SCHEDULED);
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Notify the student
        try {
            String studentEmail = booking.getStudent().getEmail();
            String subject = "Lesson Confirmed - Payment Captured - Academathon";
            long rescheduleCutoffHours = timing.getRescheduleRequestBeforeLessonHours();
            long cancelCutoffHours = timing.getCancellationBeforeLessonHours();
            String body = String.format(
                "Hello %s,\n\n" +
                "%s has confirmed your booking. Your saved card has been charged $%.2f.\n\n" +
                "Lesson Details:\n" +
                "- Tutor: %s\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n" +
                "- Duration: %d minutes\n\n" +
                "You can request a reschedule until %d hour(s) before the lesson,\n" +
                "or cancel for a full refund until %d hour(s) before the lesson.\n" +
                "After that, no changes can be made and the lesson is non-refundable.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getAmount() != null ? booking.getAmount() : 0.0,
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
                Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes(),
                rescheduleCutoffHours,
                cancelCutoffHours
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
                "Unfortunately, %s has declined your booking request. Your card was not charged.\n\n" +
                "Booking Details:\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n\n" +
                "Reason: %s\n\n" +
                "Feel free to book another tutor or pick a different time.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
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
     * Request a reschedule for a booking (student requests reschedule).
     *
     * Only SCHEDULED (paid) bookings are eligible. The student window closes
     * rescheduleRequestBeforeLessonHours before the original lesson; the tutor must
     * then accept/reject by rescheduleResponseBeforeLessonHours.
     */
    @Transactional
    public BookingResponseDTO requestReschedule(Long bookingId, Long studentId, 
                                                 LocalDateTime newStartTime, LocalDateTime newEndTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Only SCHEDULED bookings can be rescheduled - PENDING bookings must be
        // cancelled and re-booked since the tutor hasn't agreed to a time yet.
        if (booking.getStatus() != BookingStatus.SCHEDULED) {
            throw new RuntimeException("Only scheduled lessons can be rescheduled");
        }
        
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        
        if (newStartTime.isBefore(now)) {
            throw new RuntimeException("Cannot reschedule to a time in the past");
        }
        
        // The new time must satisfy the same advance booking rule.
        LocalDateTime minimumNewTime = now.plusHours(timing.getMinimumAdvanceHours());
        if (newStartTime.isBefore(minimumNewTime)) {
            throw new RuntimeException(
                "The new lesson time must be at least " + timing.getMinimumAdvanceHours() + " hours in advance"
            );
        }
        
        if (newEndTime.isBefore(newStartTime)) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // Student must request the reschedule at least N hours before the original lesson.
        LocalDateTime studentRequestCutoff = booking.getStartTime()
                .minusHours(timing.getRescheduleRequestBeforeLessonHours());
        if (!now.isBefore(studentRequestCutoff)) {
            throw new RuntimeException(
                "Reschedule requests must be submitted at least " +
                timing.getRescheduleRequestBeforeLessonHours() + " hour(s) before the lesson."
            );
        }
        
        // Tutor must accept/reject by lesson - rescheduleResponseBeforeLessonHours. Compute
        // based on the EARLIER of original and requested times so an earlier requested time
        // tightens the deadline.
        LocalDateTime originalStartTime = booking.getStartTime();
        LocalDateTime earliestTime = originalStartTime.isBefore(newStartTime) 
            ? originalStartTime 
            : newStartTime;
        LocalDateTime rescheduleResponseDeadline = earliestTime
                .minusHours(timing.getRescheduleResponseBeforeLessonHours());
        
        // Validate that tutor will have at least some time to respond
        if (now.isAfter(rescheduleResponseDeadline)) {
            throw new RuntimeException(
                "Cannot request this reschedule - tutor response deadline has already passed. " +
                "Please contact the tutor directly."
            );
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
        
        // Set reschedule tracking timestamps
        booking.setRescheduleRequestTime(now);
        booking.setRescheduleResponseDeadline(rescheduleResponseDeadline);
        
        // IMPORTANT: Keep original times - do NOT update startTime/endTime
        // Original booking stays in place unless tutor accepts
        
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
                "Please respond by %s.\n" +
                "If you decline or don't respond by the deadline, the original lesson time will be kept as scheduled.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getTutor().getDisplayName(),
                booking.getStudent().getUsername(),
                booking.getSubject(),
                booking.getOriginalStartTime().format(EMAIL_DATE_FORMAT),
                booking.getOriginalEndTime().format(EMAIL_DATE_FORMAT),
                newStartTime.format(EMAIL_DATE_FORMAT),
                newEndTime.format(EMAIL_DATE_FORMAT),
                Duration.between(newStartTime, newEndTime).toMinutes(),
                rescheduleResponseDeadline.format(EMAIL_DATE_FORMAT)
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
        
        // Accept the reschedule: update to the requested times
        booking.setStartTime(booking.getRequestedStartTime());
        booking.setEndTime(booking.getRequestedEndTime());
        
        // Clear all reschedule tracking fields
        booking.setHasRescheduleRequest(false);
        booking.setOriginalStartTime(null);
        booking.setOriginalEndTime(null);
        booking.setRequestedStartTime(null);
        booking.setRequestedEndTime(null);
        booking.setRescheduleRequestTime(null);
        booking.setRescheduleResponseDeadline(null);
        
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
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
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
        LocalDateTime rejectedStartTime = booking.getRequestedStartTime();
        LocalDateTime rejectedEndTime = booking.getRequestedEndTime();
        
        // Original booking times are already in place (we never changed them)
        // Just clear all reschedule tracking fields
        booking.setHasRescheduleRequest(false);
        booking.setOriginalStartTime(null);
        booking.setOriginalEndTime(null);
        booking.setRequestedStartTime(null);
        booking.setRequestedEndTime(null);
        booking.setRescheduleRequestTime(null);
        booking.setRescheduleResponseDeadline(null);
        
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
                "Your lesson stays at the original time. You can submit a new reschedule request (up to " +
                timing.getRescheduleRequestBeforeLessonHours() + " hour(s) before the lesson) or cancel for a refund " +
                "(up to " + timing.getCancellationBeforeLessonHours() + " hour(s) before the lesson).\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
                booking.getEndTime().format(EMAIL_DATE_FORMAT),
                rejectedStartTime.format(EMAIL_DATE_FORMAT),
                rejectedEndTime.format(EMAIL_DATE_FORMAT),
                reason != null ? reason : "No reason provided"
            );
            emailService.sendEmail(studentEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send reschedule rejection email: " + e.getMessage());
        }
        
        return new BookingResponseDTO(updatedBooking);
    }
}

