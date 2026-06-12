package com.academathon.controller;

import com.academathon.model.User;
import com.academathon.service.PaymentService;
import com.academathon.service.WalletService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;
    private final PaymentService paymentService;

    public WalletController(WalletService walletService, PaymentService paymentService) {
        this.walletService = walletService;
        this.paymentService = paymentService;
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return (User) auth.getPrincipal();
    }

    // ─── Endpoints ───────────────────────────────────────────────────────────

    /**
     * GET /api/wallet/balance
     * Returns { balance: 75.00, currency: "CAD" }
     * The frontend uses this to display the balance on the wallet page and
     * in the booking popup so students know whether their wallet covers the lesson.
     */
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance() {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (!user.getRole().name().equals("STUDENT")) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        try {
            return ResponseEntity.ok(walletService.getBalance(user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/wallet/transactions
     * Returns the full transaction history for the current student, newest first.
     * Each entry includes type (TOPUP/DEDUCTION/REFUND), amount, description,
     * and booking details where applicable.
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions() {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (!user.getRole().name().equals("STUDENT")) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        try {
            return ResponseEntity.ok(walletService.getTransactions(user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/wallet/topup/intent
     * Body: { amount: 100 }
     *
     * Creates a Stripe PaymentIntent for the requested top-up amount and returns
     * the clientSecret so the frontend can render Stripe Elements and collect payment.
     *
     * We embed userId and type=wallet_topup in the Stripe metadata so the webhook
     * handler knows which user to credit when the payment succeeds.
     */
    @PostMapping("/topup/intent")
    public ResponseEntity<?> createTopupIntent(@RequestBody Map<String, Object> request) {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (!user.getRole().name().equals("STUDENT")) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));

        Object amountObj = request.get("amount");
        if (amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
        }

        double amount;
        try {
            amount = Double.parseDouble(amountObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));
        }

        // Minimum $5 CAD — prevents micro-transactions that cost more in fees than they're worth
        // Maximum $500 CAD per transaction — prevents accidental or malicious oversized top-ups
        if (amount < 5.00) {
            return ResponseEntity.badRequest().body(Map.of("error", "Minimum top-up is $5.00 CAD"));
        }
        if (amount > 500.00) {
            return ResponseEntity.badRequest().body(Map.of("error", "Maximum top-up is $500.00 CAD per transaction"));
        }

        try {
            // Ensure the user has a Stripe Customer so the card is attached to their profile
            String customerId = paymentService.ensureStripeCustomer(user);
            long amountInCents = Math.round(amount * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("cad")
                    .setCustomer(customerId)
                    .setDescription("Academathon wallet top-up")
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build()
                    )
                    // These metadata fields are read by the webhook handler
                    // to know which user to credit and that this is a wallet top-up
                    .putMetadata("type", "wallet_topup")
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("amount", String.valueOf(amount))
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return ResponseEntity.ok(Map.of(
                "clientSecret", intent.getClientSecret(),
                "amount", amount,
                "currency", "CAD"
            ));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
