package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.Payment;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.PaymentRepository;
import com.academathon.repository.UserRepository;
import com.academathon.service.WalletService;
import com.stripe.Stripe;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.SetupIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SetupIntentCreateParams;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private static final DateTimeFormatter EMAIL_DATE_FORMAT = 
        DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final WalletService walletService;

    @PersistenceContext
    private EntityManager entityManager;

    public PaymentService(PaymentRepository paymentRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository,
                         EmailService emailService,
                         WalletService walletService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.walletService = walletService;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /** Currency used for every charge. Single source of truth for both Stripe and DB records. */
    private static final String DEFAULT_CURRENCY = "CAD";

    /**
     * Compute the per-lesson price (CAD) from the booking's grade level. Used by
     * the off-session charge flow, getPaymentDetails, and the public quote endpoint
     * so pricing stays consistent across the app.
     */
    private double calculateAmount(String gradeLevel) {
        if (gradeLevel != null && (gradeLevel.contains("11") || gradeLevel.contains("12")
                || gradeLevel.contains("College") || gradeLevel.contains("Adult"))) {
            return 35.00;
        } else if (gradeLevel != null && (gradeLevel.contains("9") || gradeLevel.contains("10"))) {
            return 30.00;
        }
        return 25.00;
    }

    /**
     * Public price quote for a given grade level. Returned by GET /api/payments/quote
     * and consumed by the frontend so the SetupIntent step can disclose the amount
     * before the student saves their card.
     */
    public Map<String, Object> getQuote(String gradeLevel) {
        Map<String, Object> response = new HashMap<>();
        response.put("amount", calculateAmount(gradeLevel));
        response.put("currency", DEFAULT_CURRENCY);
        response.put("gradeLevel", gradeLevel);
        return response;
    }

    /**
     * Look up or create a Stripe Customer for the given user, persisting the id on the
     * User entity so subsequent SetupIntents/PaymentIntents reuse it.
     */
    @Transactional
    public String ensureStripeCustomer(User user) throws StripeException {
        if (user.getStripeCustomerId() != null && !user.getStripeCustomerId().isBlank()) {
            try {
                Customer.retrieve(user.getStripeCustomerId());
                return user.getStripeCustomerId();
            } catch (InvalidRequestException e) {
                // Stored customer ID belongs to a different Stripe account/mode
                // (e.g. after switching from test to live API keys) — create a fresh one.
                System.out.println("[Stripe] stored customer " + user.getStripeCustomerId()
                        + " not found, creating a new one for userId=" + user.getId());
            }
        }
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getDisplayUsername())
                .putMetadata("userId", user.getId().toString())
                .build();
        Customer customer = Customer.create(params);
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);
        return customer.getId();
    }

    /**
     * Create a Stripe SetupIntent so the student can save a card at booking time.
     * The card will later be charged off-session the moment the tutor confirms.
     */
    @Transactional
    public Map<String, Object> createSetupIntent(Long studentUserId) throws StripeException {
        User student = userRepository.findById(studentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String customerId = ensureStripeCustomer(student);

        SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                .setCustomer(customerId)
                .setUsage(SetupIntentCreateParams.Usage.OFF_SESSION)
                .addPaymentMethodType("card")
                .build();
        SetupIntent setupIntent = SetupIntent.create(params);

        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", setupIntent.getClientSecret());
        response.put("customerId", customerId);
        return response;
    }

    /**
     * Charge the student for a confirmed booking.
     *
     * Wallet-first logic:
     *   1. If the student's wallet balance covers the lesson price → deduct from
     *      wallet, no Stripe call, saves the $0.30 flat fee on every wallet booking.
     *   2. Otherwise → fall back to charging the saved card off-session via Stripe,
     *      exactly as before. Nothing breaks for students who never use the wallet.
     *
     * The user row is loaded with a pessimistic write lock so two simultaneous tutor
     * confirmations (e.g. two tabs) can't both read the same balance and double-spend.
     */
    @Transactional
    public void chargeBookingOffSession(Booking booking) {
        // Avoid double-charging if a successful payment already exists
        boolean hasSuccessfulPayment = paymentRepository.findByBookingId(booking.getId()).stream()
                .anyMatch(p -> p.getStatus() == Payment.PaymentStatus.SUCCEEDED);
        if (hasSuccessfulPayment) {
            return;
        }

        double amount = calculateAmount(booking.getGradeLevel());

        // --- WALLET PATH ---
        // Re-fetch the student with a write lock so balance reads are safe under concurrency
        User student = userRepository.findById(booking.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getWalletBalance() >= amount) {
            // Sufficient wallet balance — deduct and skip Stripe entirely
            walletService.deductForBooking(student, booking, amount);

            // Record a payment row so the rest of the system (emails, admin views) works normally
            // We use a synthetic id prefixed with "wallet_" since there's no Stripe intent
            String syntheticId = "wallet_" + booking.getId() + "_" + System.currentTimeMillis();
            Payment payment = new Payment(booking, syntheticId, amount, "CAD");
            payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
            payment.setPaymentSource(Payment.PaymentSource.WALLET);
            paymentRepository.save(payment);

            booking.setPaymentIntentId(syntheticId);
            booking.setPaymentStatus(Booking.PaymentStatus.SUCCEEDED);
            booking.setAmount(amount);
            bookingRepository.save(booking);
            return;
        }

        // --- CARD PATH (existing flow, unchanged) ---
        if (booking.getPaymentMethodId() == null || booking.getPaymentMethodId().isBlank()) {
            throw new RuntimeException("No saved payment method on this booking and wallet balance is insufficient");
        }

        long amountInCents = Math.round(amount * 100);
        String customerId;
        try {
            customerId = ensureStripeCustomer(booking.getStudent());
        } catch (StripeException e) {
            throw new RuntimeException("Could not resolve Stripe customer: " + e.getMessage(), e);
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("cad")
                .setCustomer(customerId)
                .setPaymentMethod(booking.getPaymentMethodId())
                .setOffSession(true)
                .setConfirm(true)
                .putMetadata("bookingId", booking.getId().toString())
                .putMetadata("studentId", booking.getStudent().getId().toString())
                .putMetadata("tutorId", booking.getTutor().getId().toString())
                .setDescription("Academathon Tutoring Session - " + booking.getSubject())
                .build();

        PaymentIntent paymentIntent;
        try {
            paymentIntent = PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Card was declined: " + e.getMessage(), e);
        }

        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new RuntimeException(
                "Payment did not succeed (status=" + paymentIntent.getStatus() + ")."
            );
        }

        Payment payment = new Payment(booking, paymentIntent.getId(), amount, "CAD");
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        payment.setPaymentSource(Payment.PaymentSource.CARD);
        paymentRepository.save(payment);

        booking.setPaymentIntentId(paymentIntent.getId());
        booking.setPaymentStatus(Booking.PaymentStatus.SUCCEEDED);
        booking.setAmount(amount);
        bookingRepository.save(booking);
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
        
        // Calculate amount based on grade level pricing (shared helper)
        double amount = calculateAmount(booking.getGradeLevel());
        TutorProfile tutor = booking.getTutor();
        
        // Stripe expects amount in cents
        long amountInCents = Math.round(amount * 100);

        // Create payment intent with Stripe
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("cad")
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
        Payment payment = new Payment(booking, paymentIntent.getId(), amount, "CAD");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        // Don't update booking here to avoid deadlock on retries
        // The booking will be updated when payment succeeds in handlePaymentSuccess()

        // Return client secret for frontend
        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("amount", amount);
        response.put("currency", "CAD");
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
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
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
                booking.getStartTime().format(EMAIL_DATE_FORMAT),
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

        double amount = calculateAmount(booking.getGradeLevel());
        TutorProfile tutor = booking.getTutor();

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
    /**
     * Returns true if the booking was paid via wallet rather than a card.
     * Used by BookingService to send the correct cancellation/refund email copy.
     */
    public boolean wasBookingPaidByWallet(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCEEDED
                          || p.getStatus() == Payment.PaymentStatus.REFUNDED)
                .anyMatch(p -> p.getPaymentSource() == Payment.PaymentSource.WALLET);
    }

    public void refundPayment(Long bookingId) throws StripeException {
        // Find all payments for this booking
        var payments = paymentRepository.findByBookingId(bookingId);

        // Find the successful payment
        Payment payment = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCEEDED)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No successful payment found for this booking"));

        Booking booking = payment.getBooking();

        // ── Wallet-paid booking: return funds to wallet, no Stripe call ────────
        // Wallet payments use a synthetic ID (e.g. "wallet_123_456") rather than
        // a real Stripe PaymentIntent, so we must never call PaymentIntent.retrieve()
        // on them. Instead we credit the student's wallet balance directly.
        if (payment.getPaymentSource() == Payment.PaymentSource.WALLET) {
            User student = booking.getStudent();
            double amount = payment.getAmount() != null ? payment.getAmount() : booking.getAmount();
            walletService.refundToWallet(student, booking, amount);

            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
            bookingRepository.save(booking);
            return;
        }

        // ── Card-paid booking: issue a real Stripe refund ─────────────────────
        PaymentIntent paymentIntent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());

        Map<String, Object> refundParams = new HashMap<>();
        refundParams.put("payment_intent", paymentIntent.getId());
        com.stripe.model.Refund.create(refundParams);

        // Update payment status
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Update booking
        booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        bookingRepository.save(booking);
    }
}

