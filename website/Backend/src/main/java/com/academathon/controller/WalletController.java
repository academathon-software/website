package com.academathon.controller;

import com.academathon.dto.WalletDTO;
import com.academathon.dto.WalletTransactionDTO;
import com.academathon.model.User;
import com.academathon.service.PaymentService;
import com.academathon.service.WalletService;
import com.stripe.exception.StripeException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;
    private final PaymentService paymentService;

    public WalletController(WalletService walletService, PaymentService paymentService) {
        this.walletService = walletService;
        this.paymentService = paymentService;
    }

    private User requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }

    /** Wallet balance + auto-reload settings. GET /api/wallet */
    @GetMapping
    public ResponseEntity<?> getWallet() {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            return ResponseEntity.ok(new WalletDTO(walletService.getWallet(user.getId())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Wallet transaction history. GET /api/wallet/transactions */
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions() {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            // Ensure a wallet exists so first-time users get an empty list rather than an error.
            walletService.getWallet(user.getId());
            List<WalletTransactionDTO> txs = walletService.getTransactions(user.getId()).stream()
                    .map(WalletTransactionDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(txs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Start a top-up; returns a Stripe clientSecret to confirm on the frontend. POST /api/wallet/topup */
    @PostMapping("/topup")
    public ResponseEntity<?> createTopUp(@RequestBody Map<String, Object> request) {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            BigDecimal amount = parseAmount(request.get("amount"));
            if (amount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "A valid amount is required"));
            }
            return ResponseEntity.ok(walletService.createTopUpIntent(user.getId(), amount));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Confirm a top-up succeeded (fallback to webhook). POST /api/wallet/topup/confirm */
    @PostMapping("/topup/confirm")
    public ResponseEntity<?> confirmTopUp(@RequestBody Map<String, String> request) {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String paymentIntentId = request.get("paymentIntentId");
            if (paymentIntentId == null || paymentIntentId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment intent ID is required"));
            }
            walletService.creditFromStripeIntentId(paymentIntentId);
            return ResponseEntity.ok(new WalletDTO(walletService.getWallet(user.getId())));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Update auto-reload settings. PUT /api/wallet/auto-reload */
    @PutMapping("/auto-reload")
    public ResponseEntity<?> updateAutoReload(@RequestBody Map<String, Object> request) {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            boolean enabled = Boolean.TRUE.equals(request.get("enabled"))
                    || "true".equalsIgnoreCase(String.valueOf(request.get("enabled")));
            BigDecimal threshold = parseAmount(request.get("threshold"));
            BigDecimal amount = parseAmount(request.get("amount"));
            return ResponseEntity.ok(new WalletDTO(
                    walletService.updateAutoReloadSettings(user.getId(), enabled, threshold, amount)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Create a SetupIntent so the student can save a card for top-ups/auto-reload.
     * POST /api/wallet/payment-method/setup-intent */
    @PostMapping("/payment-method/setup-intent")
    public ResponseEntity<?> createPaymentMethodSetupIntent() {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            return ResponseEntity.ok(paymentService.createSetupIntent(user.getId()));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Save the default card for top-ups/auto-reload. PUT /api/wallet/payment-method */
    @PutMapping("/payment-method")
    public ResponseEntity<?> setPaymentMethod(@RequestBody Map<String, String> request) {
        try {
            User user = requireUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String paymentMethodId = request.get("paymentMethodId");
            return ResponseEntity.ok(new WalletDTO(
                    walletService.setDefaultPaymentMethod(user.getId(), paymentMethodId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Parse a numeric amount that may arrive as a Number or String; null if missing/invalid. */
    private BigDecimal parseAmount(Object raw) {
        if (raw == null) return null;
        try {
            if (raw instanceof Number) {
                return BigDecimal.valueOf(((Number) raw).doubleValue());
            }
            String s = String.valueOf(raw).trim();
            if (s.isEmpty()) return null;
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
