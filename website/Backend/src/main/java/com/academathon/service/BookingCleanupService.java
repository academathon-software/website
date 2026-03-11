package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.Booking.BookingStatus;
import com.academathon.repository.BookingRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingCleanupService {

    private static final DateTimeFormatter EMAIL_DATE_FORMAT = 
        DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    public BookingCleanupService(BookingRepository bookingRepository, EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
    }

    /**
     * Scheduled job that runs every hour to check for unpaid bookings
     * Auto-cancels bookings that are CONFIRMED (awaiting payment) and start in less than 24 hours
     * Uses America/New_York (EST/EDT) timezone
     */
    @Scheduled(cron = "0 0 * * * *", zone = "America/New_York") // Run at the top of every hour in EST/EDT
    @Transactional
    public void cancelUnpaidBookings() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        LocalDateTime twentyFourHoursFromNow = now.plusHours(24);

        // Find all CONFIRMED bookings (awaiting payment) that start within 24 hours
        List<Booking> confirmedBookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED);

        int cancelledCount = 0;
        
        for (Booking booking : confirmedBookings) {
            // Check if booking starts within 24 hours
            if (booking.getStartTime().isBefore(twentyFourHoursFromNow) && 
                booking.getStartTime().isAfter(now)) {
                
                // Cancel the booking
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setRejectionReason("Auto-cancelled: Payment not received within 24 hours of lesson start time");
                bookingRepository.save(booking);
                
                cancelledCount++;

                // Send notification emails
                try {
                    sendCancellationEmail(booking);
                } catch (Exception e) {
                    System.err.println("Error sending cancellation email for booking " + 
                                     booking.getId() + ": " + e.getMessage());
                }
            }
        }

        if (cancelledCount > 0) {
            System.out.println("Auto-cancelled " + cancelledCount + 
                             " unpaid bookings starting within 24 hours");
        }
    }

    /**
     * Send cancellation notification emails to both student and tutor
     */
    private void sendCancellationEmail(Booking booking) {
        String studentEmail = booking.getStudent().getEmail();
        String tutorEmail = booking.getTutor().getUser().getEmail();
        
        // Email to student
        String studentSubject = "Booking Cancelled - Payment Not Received";
        String studentBody = String.format(
            "Hello %s,\n\n" +
            "Your booking with %s scheduled for %s has been automatically cancelled " +
            "because payment was not received within 24 hours of the lesson start time.\n\n" +
            "If you still wish to book a lesson with this tutor, please create a new booking " +
            "and complete the payment promptly after tutor confirmation.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getStudent().getUsername(),
            booking.getTutor().getDisplayName(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT)
        );
        
        emailService.sendEmail(studentEmail, studentSubject, studentBody);
        
        // Email to tutor
        String tutorSubject = "Booking Cancelled - Payment Not Received";
        String tutorBody = String.format(
            "Hello %s,\n\n" +
            "The booking with student %s scheduled for %s has been automatically cancelled " +
            "because payment was not received within 24 hours of the lesson start time.\n\n" +
            "Your availability has been restored for this time slot.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getTutor().getDisplayName(),
            booking.getStudent().getUsername(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT)
        );
        
        emailService.sendEmail(tutorEmail, tutorSubject, tutorBody);
    }
    
    /**
     * Scheduled job that runs every 15 minutes to check for pending bookings
     * Auto-declines bookings where tutor did not respond within 24 hours
     * Uses America/New_York (EST/EDT) timezone
     */
    @Scheduled(cron = "0 */15 * * * *", zone = "America/New_York") // Run every 15 minutes
    @Transactional
    public void autoDeclinePendingBookings() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        
        // Find PENDING bookings where tutor response deadline has passed
        List<Booking> pendingBookings = bookingRepository.findByStatus(BookingStatus.PENDING);
        
        int declinedCount = 0;
        
        for (Booking booking : pendingBookings) {
            if (booking.getTutorResponseDeadline() != null && 
                now.isAfter(booking.getTutorResponseDeadline())) {
                
                // Auto-decline the booking
                booking.setStatus(BookingStatus.REJECTED);
                booking.setRejectionReason("Auto-declined: Tutor did not respond within 24 hours");
                bookingRepository.save(booking);
                
                declinedCount++;

                // Send notification emails
                try {
                    sendTutorTimeoutEmail(booking);
                } catch (Exception e) {
                    System.err.println("Error sending tutor timeout email for booking " + 
                                     booking.getId() + ": " + e.getMessage());
                }
            }
        }

        if (declinedCount > 0) {
            System.out.println("Auto-declined " + declinedCount + 
                             " pending bookings due to tutor timeout");
        }
    }

    /**
     * Send timeout notification emails to both student and tutor
     */
    private void sendTutorTimeoutEmail(Booking booking) {
        String studentEmail = booking.getStudent().getEmail();
        String tutorEmail = booking.getTutor().getUser().getEmail();
        
        // Email to student
        String studentSubject = "Booking Request Declined - No Response";
        String studentBody = String.format(
            "Hello %s,\n\n" +
            "Unfortunately, your booking request with %s has been automatically declined " +
            "because the tutor did not respond within 24 hours.\n\n" +
            "Booking Details:\n" +
            "- Subject: %s\n" +
            "- Requested Date & Time: %s\n\n" +
            "You can try booking with another tutor or contact this tutor directly " +
            "to arrange a lesson.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getStudent().getUsername(),
            booking.getTutor().getDisplayName(),
            booking.getSubject(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT)
        );
        
        emailService.sendEmail(studentEmail, studentSubject, studentBody);
        
        // Email to tutor
        String tutorSubject = "Booking Request Expired";
        String tutorBody = String.format(
            "Hello %s,\n\n" +
            "A booking request from student %s has expired because it was not " +
            "responded to within 24 hours.\n\n" +
            "Booking Details:\n" +
            "- Subject: %s\n" +
            "- Requested Date & Time: %s\n\n" +
            "Please remember to respond to booking requests promptly to avoid " +
            "disappointing students.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getTutor().getDisplayName(),
            booking.getStudent().getUsername(),
            booking.getSubject(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT)
        );
        
        emailService.sendEmail(tutorEmail, tutorSubject, tutorBody);
    }
    
    /**
     * Scheduled job that runs every 15 minutes to check for reschedule requests
     * Auto-declines reschedule requests where tutor did not respond by deadline
     * Keeps the original booking time
     * Uses America/New_York (EST/EDT) timezone
     */
    @Scheduled(cron = "0 */15 * * * *", zone = "America/New_York") // Run every 15 minutes
    @Transactional
    public void autoDeclineRescheduleRequests() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        
        // Find bookings with pending reschedule requests
        List<Booking> rescheduleBookings = bookingRepository
            .findByStatusAndHasRescheduleRequest(BookingStatus.SCHEDULED, true);
        
        int declinedCount = 0;
        
        for (Booking booking : rescheduleBookings) {
            if (booking.getRescheduleResponseDeadline() != null && 
                now.isAfter(booking.getRescheduleResponseDeadline())) {
                
                // Store requested times for email notification
                LocalDateTime requestedStart = booking.getRequestedStartTime();
                LocalDateTime requestedEnd = booking.getRequestedEndTime();
                
                // Keep original time - auto-decline reschedule
                // Original times are already in startTime/endTime, just clear reschedule fields
                booking.setHasRescheduleRequest(false);
                booking.setRequestedStartTime(null);
                booking.setRequestedEndTime(null);
                booking.setOriginalStartTime(null);
                booking.setOriginalEndTime(null);
                booking.setRescheduleRequestTime(null);
                booking.setRescheduleResponseDeadline(null);
                bookingRepository.save(booking);
                
                declinedCount++;

                // Send notification emails
                try {
                    sendRescheduleTimeoutEmail(booking, requestedStart, requestedEnd);
                } catch (Exception e) {
                    System.err.println("Error sending reschedule timeout email for booking " + 
                                     booking.getId() + ": " + e.getMessage());
                }
            }
        }

        if (declinedCount > 0) {
            System.out.println("Auto-declined " + declinedCount + 
                             " reschedule requests due to tutor timeout");
        }
    }

    /**
     * Send reschedule timeout notification emails to both student and tutor
     */
    private void sendRescheduleTimeoutEmail(Booking booking, LocalDateTime requestedStart, LocalDateTime requestedEnd) {
        String studentEmail = booking.getStudent().getEmail();
        String tutorEmail = booking.getTutor().getUser().getEmail();
        
        // Email to student
        String studentSubject = "Reschedule Request Expired - Original Time Kept";
        String studentBody = String.format(
            "Hello %s,\n\n" +
            "Your reschedule request with %s has expired because the tutor " +
            "did not respond by the deadline.\n\n" +
            "Your original lesson time has been kept:\n" +
            "- Subject: %s\n" +
            "- Date & Time: %s\n\n" +
            "Requested time (expired): %s\n\n" +
            "The original lesson remains scheduled. If you still need to reschedule, " +
            "please contact the tutor directly.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getStudent().getUsername(),
            booking.getTutor().getDisplayName(),
            booking.getSubject(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT),
            requestedStart.format(EMAIL_DATE_FORMAT)
        );
        
        emailService.sendEmail(studentEmail, studentSubject, studentBody);
        
        // Email to tutor
        String tutorSubject = "Reschedule Request Expired";
        String tutorBody = String.format(
            "Hello %s,\n\n" +
            "A reschedule request from student %s has expired because it was not " +
            "responded to by the deadline.\n\n" +
            "The original lesson time has been kept:\n" +
            "- Subject: %s\n" +
            "- Date & Time: %s\n\n" +
            "Requested time (expired): %s\n\n" +
            "Please remember to respond to reschedule requests promptly.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getTutor().getDisplayName(),
            booking.getStudent().getUsername(),
            booking.getSubject(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT),
            requestedStart.format(EMAIL_DATE_FORMAT)
        );
        
        emailService.sendEmail(tutorEmail, tutorSubject, tutorBody);
    }
}


