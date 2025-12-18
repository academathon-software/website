package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.Payment;
import com.academathon.model.TutorProfile;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    
    @PersistenceContext
    private EntityManager entityManager;

    public PaymentService(PaymentRepository paymentRepository, 
                         BookingRepository bookingRepository,
                         EmailService emailService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Create a payment intent for a booking
     */
    @Transactional
    public Map<String, Object> createPaymentIntent(Long bookingId) throws StripeException {
        // Get the booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking is in CONFIRMED status (awaiting payment)
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking must be confirmed by tutor before payment");
        }

        // Check if a successful payment already exists
        var existingPayments = paymentRepository.findByBookingId(bookingId);
        
        // Check if any of the payments are successful
        boolean hasSuccessfulPayment = existingPayments.stream()
            .anyMatch(p -> p.getStatus() == Payment.PaymentStatus.SUCCEEDED);
        
        if (hasSuccessfulPayment) {
            throw new RuntimeException("Payment already completed for this booking");
        }
        
        // Calculate amount based on tutor's hourly rate and lesson duration
        TutorProfile tutor = booking.getTutor();
        Duration duration = Duration.between(booking.getStartTime(), booking.getEndTime());
        double hours = duration.toMinutes() / 60.0;
        double amount = tutor.getHourlyRate().doubleValue() * hours;
        
        // Stripe expects amount in cents
        long amountInCents = Math.round(amount * 100);

        // Create payment intent with Stripe
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .putMetadata("bookingId", bookingId.toString())
                .putMetadata("studentId", booking.getStudent().getId().toString())
                .putMetadata("tutorId", tutor.getId().toString())
                .setDescription("Academathon Tutoring Session - " + booking.getSubject())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Create payment record in database
        Payment payment = new Payment(booking, paymentIntent.getId(), amount, "USD");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        // Don't update booking here to avoid deadlock on retries
        // The booking will be updated when payment succeeds in handlePaymentSuccess()

        // Return client secret for frontend
        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("amount", amount);
        response.put("currency", "USD");
        response.put("bookingId", bookingId);

        return response;
    }

    /**
     * Handle successful payment (called from webhook or confirmation)
     */
    @Transactional
    public void handlePaymentSuccess(String paymentIntentId) {
        // Find payment record
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Update payment status
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        paymentRepository.save(payment);

        // Update booking status and payment info
        Booking booking = payment.getBooking();
        booking.setPaymentStatus(Booking.PaymentStatus.SUCCEEDED);
        booking.setStatus(Booking.BookingStatus.SCHEDULED);
        booking.setPaymentIntentId(payment.getStripePaymentIntentId());
        booking.setAmount(payment.getAmount());
        bookingRepository.save(booking);
        
        // Send email notifications to both student and tutor
        try {
            // Email to student
            String studentEmail = booking.getStudent().getEmail();
            String studentSubject = "Payment Successful - Lesson Confirmed - Academathon";
            String studentBody = String.format(
                "Hello %s,\n\n" +
                "Your payment has been received successfully! Your lesson with %s is now confirmed.\n\n" +
                "Lesson Details:\n" +
                "- Tutor: %s\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n" +
                "- Amount Paid: $%.2f\n\n" +
                "We look forward to your lesson!\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getStudent().getUsername(),
                booking.getTutor().getDisplayName(),
                booking.getTutor().getDisplayName(),
                booking.getSubject(),
                booking.getStartTime(),
                booking.getAmount()
            );
            emailService.sendEmail(studentEmail, studentSubject, studentBody);
            
            // Email to tutor
            String tutorEmail = booking.getTutor().getUser().getEmail();
            String tutorSubject = "Booking Payment Received - Lesson Confirmed - Academathon";
            String tutorBody = String.format(
                "Hello %s,\n\n" +
                "The student %s has completed payment for your lesson. The booking is now confirmed.\n\n" +
                "Lesson Details:\n" +
                "- Student: %s\n" +
                "- Subject: %s\n" +
                "- Date & Time: %s\n" +
                "- Payment: $%.2f\n\n" +
                "Please be prepared for your lesson at the scheduled time.\n\n" +
                "Best regards,\n" +
                "Academathon Team",
                booking.getTutor().getDisplayName(),
                booking.getStudent().getUsername(),
                booking.getStudent().getUsername(),
                booking.getSubject(),
                booking.getStartTime(),
                booking.getAmount()
            );
            emailService.sendEmail(tutorEmail, tutorSubject, tutorBody);
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation emails: " + e.getMessage());
        }
    }

    /**
     * Handle failed payment
     */
    @Transactional
    public void handlePaymentFailure(String paymentIntentId, String reason) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
        // Keep booking in CONFIRMED status so student can try again
        bookingRepository.save(booking);
    }

    /**
     * Get payment details for a booking
     */
    public Map<String, Object> getPaymentDetails(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Calculate amount based on tutor's hourly rate
        TutorProfile tutor = booking.getTutor();
        Duration duration = Duration.between(booking.getStartTime(), booking.getEndTime());
        double hours = duration.toMinutes() / 60.0;
        double amount = tutor.getHourlyRate().doubleValue() * hours;

        Map<String, Object> details = new HashMap<>();
        details.put("bookingId", bookingId);
        details.put("amount", amount);
        details.put("status", booking.getPaymentStatus());
        details.put("tutorName", tutor.getDisplayName());
        details.put("subject", booking.getSubject());
        details.put("startTime", booking.getStartTime());
        details.put("endTime", booking.getEndTime());

        return details;
    }

    /**
     * Refund a payment (if needed)
     */
    @Transactional
    public void refundPayment(Long bookingId) throws StripeException {
        // Find all payments for this booking
        var payments = paymentRepository.findByBookingId(bookingId);
        
        // Find the successful payment
        Payment payment = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCEEDED)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No successful payment found for this booking"));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCEEDED) {
            throw new RuntimeException("Can only refund successful payments");
        }

        // Create refund with Stripe
        PaymentIntent paymentIntent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());
        
        Map<String, Object> refundParams = new HashMap<>();
        refundParams.put("payment_intent", paymentIntent.getId());
        com.stripe.model.Refund.create(refundParams);

        // Update payment status
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Update booking
        Booking booking = payment.getBooking();
        booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        bookingRepository.save(booking);
    }
}

