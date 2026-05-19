package com.academathon.service;

import com.academathon.config.BookingTimingProperties;
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
    private final BookingTimingProperties timing;

    public BookingCleanupService(BookingRepository bookingRepository,
                                 EmailService emailService,
                                 BookingTimingProperties timing) {
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.timing = timing;
    }

    /**
     * Scheduled job that runs every 15 minutes to auto-decline pending bookings
     * the tutor failed to respond to by their deadline (lesson - tutorResponseBeforeLessonHours).
     * No card is charged on auto-decline.
     */
    @Scheduled(cron = "0 */15 * * * *", zone = "America/New_York")
    @Transactional
    public void autoDeclinePendingBookings() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
        long tutorResponseBeforeHours = timing.getTutorResponseBeforeLessonHours();

        List<Booking> pendingBookings = bookingRepository.findByStatus(BookingStatus.PENDING);

        int declinedCount = 0;

        for (Booking booking : pendingBookings) {
            if (booking.getTutorResponseDeadline() != null &&
                now.isAfter(booking.getTutorResponseDeadline())) {

                booking.setStatus(BookingStatus.REJECTED);
                booking.setRejectionReason(
                    "Auto-declined: Tutor did not respond by " + tutorResponseBeforeHours +
                    " hour(s) before the lesson"
                );
                bookingRepository.save(booking);
                declinedCount++;

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
        long tutorResponseBeforeHours = timing.getTutorResponseBeforeLessonHours();

        // Email to student
        String studentSubject = "Booking Request Declined - No Response";
        String studentBody = String.format(
            "Hello %s,\n\n" +
            "Your booking request with %s was automatically declined because the tutor did not " +
            "respond by %d hour(s) before the lesson start time.\n\n" +
            "Booking Details:\n" +
            "- Subject: %s\n" +
            "- Requested Date & Time: %s\n\n" +
            "Your card was not charged. You can try booking another tutor or pick a different time.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getStudent().getUsername(),
            booking.getTutor().getDisplayName(),
            tutorResponseBeforeHours,
            booking.getSubject(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT)
        );
        emailService.sendEmail(studentEmail, studentSubject, studentBody);

        // Email to tutor
        String tutorSubject = "Booking Request Expired";
        String tutorBody = String.format(
            "Hello %s,\n\n" +
            "A booking request from student %s expired because it was not responded to by " +
            "%d hour(s) before the lesson start.\n\n" +
            "Booking Details:\n" +
            "- Subject: %s\n" +
            "- Requested Date & Time: %s\n\n" +
            "Please respond to booking requests promptly to avoid disappointing students.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            booking.getTutor().getDisplayName(),
            booking.getStudent().getUsername(),
            tutorResponseBeforeHours,
            booking.getSubject(),
            booking.getStartTime().format(EMAIL_DATE_FORMAT)
        );
        emailService.sendEmail(tutorEmail, tutorSubject, tutorBody);
    }

    /**
     * Scheduled job that runs every 15 minutes to auto-decline reschedule requests
     * where the tutor did not respond by lesson - rescheduleResponseBeforeLessonHours.
     * The original (already-paid) lesson time stays in place.
     */
    @Scheduled(cron = "0 */15 * * * *", zone = "America/New_York")
    @Transactional
    public void autoDeclineRescheduleRequests() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));

        List<Booking> rescheduleBookings = bookingRepository
            .findByStatusAndHasRescheduleRequest(BookingStatus.SCHEDULED, true);

        int declinedCount = 0;

        for (Booking booking : rescheduleBookings) {
            if (booking.getRescheduleResponseDeadline() != null &&
                now.isAfter(booking.getRescheduleResponseDeadline())) {

                LocalDateTime requestedStart = booking.getRequestedStartTime();
                LocalDateTime requestedEnd = booking.getRequestedEndTime();

                // Keep original time - auto-decline reschedule
                booking.setHasRescheduleRequest(false);
                booking.setRequestedStartTime(null);
                booking.setRequestedEndTime(null);
                booking.setOriginalStartTime(null);
                booking.setOriginalEndTime(null);
                booking.setRescheduleRequestTime(null);
                booking.setRescheduleResponseDeadline(null);
                bookingRepository.save(booking);
                declinedCount++;

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
            "Your reschedule request with %s expired because the tutor did not respond in time.\n\n" +
            "Your original lesson stays as scheduled:\n" +
            "- Subject: %s\n" +
            "- Date & Time: %s\n\n" +
            "Requested time (expired): %s\n\n" +
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
            "A reschedule request from student %s expired because it was not responded to in time.\n\n" +
            "The original lesson time has been kept:\n" +
            "- Subject: %s\n" +
            "- Date & Time: %s\n\n" +
            "Requested time (expired): %s\n\n" +
            "Please respond to reschedule requests promptly.\n\n" +
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
