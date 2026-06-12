package com.academathon.controller;

import com.academathon.model.Booking;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.service.PaymentService;
import com.academathon.service.WalletService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final PaymentService paymentService;
    private final BookingRepository bookingRepository;
    private final WalletService walletService;

    public PaymentController(PaymentService paymentService,
                             BookingRepository bookingRepository,
                             WalletService walletService) {
        this.paymentService = paymentService;
        this.bookingRepository = bookingRepository;
        this.walletService = walletService;
    }

    /**
     * Look up the price for a given grade level. The frontend uses this to display the
     * amount on the SetupIntent step so the student knows what they're authorizing.
     * GET /api/payments/quote?gradeLevel=...
     */
    @GetMapping("/quote")
    public ResponseEntity<?> getQuote(@RequestParam(required = false) String gradeLevel) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            return ResponseEntity.ok(paymentService.getQuote(gradeLevel));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a Stripe SetupIntent so the student can save a card at booking time.
     * The card is then auto-charged off-session when the tutor confirms.
     * POST /api/payments/setup-intent
     */
    @PostMapping("/setup-intent")
    public ResponseEntity<?> createSetupIntent() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User currentUser = (User) authentication.getPrincipal();
            Map<String, Object> setupIntent = paymentService.createSetupIntent(currentUser.getId());
            return ResponseEntity.ok(setupIntent);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a payment intent for a booking (legacy manual flow).
     * Kept for backward compatibility; the new workflow auto-charges the saved card
     * at tutor-confirm time and does not call this endpoint.
     * POST /api/payments/create-intent
     */
    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Long> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Long bookingId = request.get("bookingId");
            if (bookingId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Booking ID is required"));
            }

            User currentUser = (User) authentication.getPrincipal();
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (!booking.getStudent().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only pay for your own bookings"));
            }

            Map<String, Object> paymentIntent = paymentService.createPaymentIntent(bookingId);
            return ResponseEntity.ok(paymentIntent);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get payment details for a booking
     * GET /api/payments/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentDetails(@PathVariable Long bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User currentUser = (User) authentication.getPrincipal();
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            boolean isStudent = booking.getStudent().getId().equals(currentUser.getId());
            boolean isTutor = booking.getTutor().getUser().getId().equals(currentUser.getId());
            boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
            if (!isStudent && !isTutor && !isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Map<String, Object> details = paymentService.getPaymentDetails(bookingId);
            return ResponseEntity.ok(details);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Confirm payment success (called after Stripe confirms on frontend)
     * POST /api/payments/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String paymentIntentId = request.get("paymentIntentId");
            if (paymentIntentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment intent ID is required"));
            }

            paymentService.handlePaymentSuccess(paymentIntentId);
            return ResponseEntity.ok(Map.of("message", "Payment confirmed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Stripe webhook endpoint for payment events
     * POST /api/payments/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, 
                                                @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            // Invalid signature
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (paymentIntent != null) {
                    try {
                        // Check metadata to decide which handler to call.
                        // Wallet top-ups set type=wallet_topup; booking payments don't set type at all.
                        String intentType = paymentIntent.getMetadata().get("type");
                        if ("wallet_topup".equals(intentType)) {
                            // Credit the student's wallet balance.
                            // Use getAmountReceived() (Stripe's confirmed charge in cents) rather than
                            // metadata so the credited amount always matches what was actually charged.
                            String userIdStr = paymentIntent.getMetadata().get("userId");
                            if (userIdStr != null && paymentIntent.getAmountReceived() != null) {
                                double actualAmount = paymentIntent.getAmountReceived() / 100.0;
                                walletService.creditWallet(
                                    Long.parseLong(userIdStr),
                                    actualAmount,
                                    paymentIntent.getId()
                                );
                            }
                        } else {
                            // Standard booking payment
                            paymentService.handlePaymentSuccess(paymentIntent.getId());
                        }
                    } catch (Exception e) {
                        System.err.println("Error handling payment_intent.succeeded: " + e.getMessage());
                    }
                }
                break;

            case "payment_intent.payment_failed":
                PaymentIntent failedIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (failedIntent != null) {
                    try {
                        String reason = failedIntent.getLastPaymentError() != null 
                            ? failedIntent.getLastPaymentError().getMessage() 
                            : "Unknown error";
                        paymentService.handlePaymentFailure(failedIntent.getId(), reason);
                    } catch (Exception e) {
                        System.err.println("Error handling payment failure: " + e.getMessage());
                    }
                }
                break;

            default:
                System.out.println("Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok("Success");
    }

    /**
     * Refund a payment (admin or in case of cancellation)
     * POST /api/payments/refund/{bookingId}
     */
    @PostMapping("/refund/{bookingId}")
    public ResponseEntity<?> refundPayment(@PathVariable Long bookingId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User currentUser = (User) authentication.getPrincipal();
            if (currentUser.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required for refunds"));
            }

            paymentService.refundPayment(bookingId);
            return ResponseEntity.ok(Map.of("message", "Payment refunded successfully"));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}


