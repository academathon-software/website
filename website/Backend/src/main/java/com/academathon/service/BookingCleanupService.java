package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.Booking.BookingStatus;
import com.academathon.repository.BookingRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class BookingCleanupService {

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
            booking.getStartTime()
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
            booking.getStartTime()
        );
        
        emailService.sendEmail(tutorEmail, tutorSubject, tutorBody);
    }
}


