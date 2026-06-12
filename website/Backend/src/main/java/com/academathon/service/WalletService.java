package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.User;
import com.academathon.model.Wallet;
import com.academathon.model.WalletTransaction;
import com.academathon.model.WalletTransaction.TransactionType;
import com.academathon.repository.UserRepository;
import com.academathon.repository.WalletRepository;
import com.academathon.repository.WalletTransactionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class WalletService {

    /** Outcome of attempting to pay for a booking from the wallet at tutor-confirm time. */
    public enum DeductResult { PAID_FROM_WALLET, PAID_FROM_CARD }

    private static final String DEFAULT_CURRENCY = "CAD";

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

    public WalletService(WalletRepository walletRepository,
                         WalletTransactionRepository walletTransactionRepository,
                         UserRepository userRepository,
                         PaymentService paymentService) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.userRepository = userRepository;
        this.paymentService = paymentService;
    }

    private static BigDecimal money(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    // ---------------------------------------------------------------------
    // Wallet lookup / creation
    // ---------------------------------------------------------------------

    @Transactional
    public Wallet getOrCreateWallet(User user) {
        Optional<Wallet> existing = walletRepository.findByUserId(user.getId());
        if (existing.isPresent()) {
            return existing.get();
        }
        // Race-safe create: ON CONFLICT DO NOTHING means a concurrent first-time
        // request can't trip the unique constraint. Re-read to get the row whether
        // this call or a parallel one inserted it.
        walletRepository.insertIfAbsent(user.getId());
        return walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Failed to create wallet"));
    }

    @Transactional
    public Wallet getWallet(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getOrCreateWallet(user);
    }

    public List<WalletTransaction> getTransactions(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    // ---------------------------------------------------------------------
    // Top-up (manual, on-session): create a PaymentIntent the frontend confirms.
    // The wallet is credited later via webhook / confirm endpoint, never here.
    // ---------------------------------------------------------------------

    @Transactional
    public java.util.Map<String, Object> createTopUpIntent(Long userId, BigDecimal amount) throws StripeException {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Top-up amount must be greater than zero");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        getOrCreateWallet(user);

        String customerId = paymentService.ensureStripeCustomer(user);
        long amountInCents = amount.setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).longValueExact();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("cad")
                .setCustomer(customerId)
                // Save the card so it can fund auto-reload later.
                .setSetupFutureUsage(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .putMetadata("type", "wallet_topup")
                .putMetadata("walletUserId", user.getId().toString())
                .setDescription("Academathon Wallet Top-up")
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        response.put("amount", amount);
        response.put("currency", DEFAULT_CURRENCY);
        return response;
    }

    /**
     * Credit a wallet from a succeeded Stripe top-up/auto-reload PaymentIntent.
     * Idempotent: a second call for the same intent id is a no-op. Called from the
     * webhook and from the manual confirm endpoint.
     */
    @Transactional
    public void creditFromStripeIntent(PaymentIntent intent) {
        if (intent == null) {
            return;
        }
        String type = intent.getMetadata() != null ? intent.getMetadata().get("type") : null;
        if (type == null || !(type.equals("wallet_topup") || type.equals("wallet_auto_reload"))) {
            return; // not a wallet intent
        }
        if (!"succeeded".equals(intent.getStatus())) {
            return;
        }
        if (walletTransactionRepository.existsByStripePaymentIntentId(intent.getId())) {
            return; // already credited
        }
        String walletUserId = intent.getMetadata().get("walletUserId");
        if (walletUserId == null) {
            return;
        }
        Long userId = Long.valueOf(walletUserId);
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user " + userId));

        BigDecimal amount = BigDecimal.valueOf(intent.getAmount())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        TransactionType txType = type.equals("wallet_auto_reload")
                ? TransactionType.AUTO_RELOAD
                : TransactionType.TOP_UP;

        credit(wallet, amount, txType, null, intent.getId(),
                txType == TransactionType.AUTO_RELOAD ? "Auto-reload" : "Wallet top-up");

        // Remember the card used for top-up so auto-reload can reuse it.
        if (intent.getPaymentMethod() != null
                && (wallet.getDefaultPaymentMethodId() == null || wallet.getDefaultPaymentMethodId().isBlank())) {
            wallet.setDefaultPaymentMethodId(intent.getPaymentMethod());
            walletRepository.save(wallet);
        }
    }

    /** Retrieve a PaymentIntent by id and credit the wallet if it succeeded. */
    @Transactional
    public void creditFromStripeIntentId(String paymentIntentId) throws StripeException {
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        creditFromStripeIntent(intent);
    }

    // ---------------------------------------------------------------------
    // Booking payment at tutor-confirm time
    // ---------------------------------------------------------------------

    /**
     * Pay for a booking from the student's wallet at tutor-confirm time. Implements
     * the auto-reload-then-card fallback. Mutates the booking's amount/paymentStatus
     * on wallet success; on the card path it delegates to the existing off-session
     * charge (which sets those fields itself). Throws when nothing can cover the lesson.
     */
    @Transactional
    public DeductResult deductForBooking(Booking booking) {
        // Idempotency: never deduct twice for the same booking.
        if (walletTransactionRepository.existsByBookingIdAndType(booking.getId(), TransactionType.LESSON_CHARGE)) {
            return DeductResult.PAID_FROM_WALLET;
        }

        User student = booking.getStudent();
        Wallet wallet = walletRepository.findByUserIdForUpdate(student.getId())
                .orElseThrow(() -> new RuntimeException("No wallet found for this student"));

        BigDecimal amount = money(paymentService.getLessonAmount(booking.getGradeLevel()));

        // 1) Balance too low: try auto-reload, but only if a single reload will fully cover
        //    the lesson (avoids topping up the wallet AND charging the card for the lesson).
        if (wallet.getBalance().compareTo(amount) < 0 && canAutoReloadCover(wallet, amount)) {
            try {
                autoReloadOffSession(wallet);
            } catch (RuntimeException reloadError) {
                System.err.println("Auto-reload to cover lesson failed for booking "
                        + booking.getId() + ": " + reloadError.getMessage());
                // fall through to card fallback below
            }
        }

        // 2) Sufficient balance now: deduct from wallet.
        if (wallet.getBalance().compareTo(amount) >= 0) {
            debit(wallet, amount, TransactionType.LESSON_CHARGE, booking.getId(), null,
                    "Lesson charge: " + (booking.getSubject() != null ? booking.getSubject() : "Tutoring session"));
            booking.setAmount(amount.doubleValue());
            booking.setPaymentStatus(Booking.PaymentStatus.SUCCEEDED);

            // Post-deduction safety: top up for next time if we dipped below the threshold.
            maybeAutoReload(wallet);
            return DeductResult.PAID_FROM_WALLET;
        }

        // 3) Fall back to charging the saved card for the full lesson (existing path).
        //    Throws on decline, leaving the booking PENDING.
        paymentService.chargeBookingOffSession(booking);
        return DeductResult.PAID_FROM_CARD;
    }

    private boolean canAutoReloadCover(Wallet wallet, BigDecimal lessonAmount) {
        if (!wallet.isAutoReloadEnabled()) return false;
        if (wallet.getDefaultPaymentMethodId() == null || wallet.getDefaultPaymentMethodId().isBlank()) return false;
        if (wallet.getAutoReloadAmount() == null || wallet.getAutoReloadAmount().compareTo(BigDecimal.ZERO) <= 0) return false;
        return wallet.getBalance().add(wallet.getAutoReloadAmount()).compareTo(lessonAmount) >= 0;
    }

    /**
     * If auto-reload is enabled and the balance dropped below the threshold, charge the
     * saved card off-session to top the wallet back up. Non-fatal: failures are logged.
     */
    private void maybeAutoReload(Wallet wallet) {
        if (!wallet.isAutoReloadEnabled()) return;
        if (wallet.getAutoReloadThreshold() == null) return;
        if (wallet.getBalance().compareTo(wallet.getAutoReloadThreshold()) >= 0) return;
        if (wallet.getDefaultPaymentMethodId() == null || wallet.getDefaultPaymentMethodId().isBlank()) return;
        if (wallet.getAutoReloadAmount() == null || wallet.getAutoReloadAmount().compareTo(BigDecimal.ZERO) <= 0) return;
        try {
            autoReloadOffSession(wallet);
        } catch (RuntimeException e) {
            System.err.println("Post-deduction auto-reload failed for wallet "
                    + wallet.getId() + ": " + e.getMessage());
        }
    }

    /**
     * Charge the wallet's saved card off-session for the configured reload amount and
     * credit the wallet. Throws a RuntimeException on decline so callers can fall back.
     */
    private void autoReloadOffSession(Wallet wallet) {
        BigDecimal reloadAmount = wallet.getAutoReloadAmount();
        long amountInCents = reloadAmount.setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).longValueExact();

        String customerId;
        try {
            customerId = paymentService.ensureStripeCustomer(wallet.getUser());
        } catch (StripeException e) {
            throw new RuntimeException("Could not resolve Stripe customer for auto-reload: " + e.getMessage(), e);
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("cad")
                .setCustomer(customerId)
                .setPaymentMethod(wallet.getDefaultPaymentMethodId())
                .setOffSession(true)
                .setConfirm(true)
                .putMetadata("type", "wallet_auto_reload")
                .putMetadata("walletUserId", wallet.getUser().getId().toString())
                .setDescription("Academathon Wallet Auto-reload")
                .build();

        PaymentIntent intent;
        try {
            intent = PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Auto-reload card was declined: " + e.getMessage(), e);
        }

        if (!"succeeded".equals(intent.getStatus())) {
            throw new RuntimeException("Auto-reload did not succeed (status=" + intent.getStatus() + ").");
        }

        // Credit in-code now; the webhook will be a no-op thanks to intent-id dedupe.
        if (!walletTransactionRepository.existsByStripePaymentIntentId(intent.getId())) {
            credit(wallet, reloadAmount, TransactionType.AUTO_RELOAD, null, intent.getId(), "Auto-reload");
        }
    }

    // ---------------------------------------------------------------------
    // Refunds (wallet-sourced bookings get credited back to the wallet)
    // ---------------------------------------------------------------------

    @Transactional
    public void refundToWallet(Booking booking) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(booking.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("No wallet found for this student"));
        double amount = booking.getAmount() != null
                ? booking.getAmount()
                : paymentService.getLessonAmount(booking.getGradeLevel());
        credit(wallet, money(amount), TransactionType.REFUND, booking.getId(), null,
                "Refund for cancelled lesson");
        booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
    }

    // ---------------------------------------------------------------------
    // Settings / payment method
    // ---------------------------------------------------------------------

    @Transactional
    public Wallet updateAutoReloadSettings(Long userId, boolean enabled,
                                           BigDecimal threshold, BigDecimal amount) {
        Wallet wallet = getWallet(userId);
        if (enabled) {
            if (threshold == null || threshold.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("A valid reload threshold is required");
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("A valid reload amount is required");
            }
            if (wallet.getDefaultPaymentMethodId() == null || wallet.getDefaultPaymentMethodId().isBlank()) {
                throw new RuntimeException("Save a card before enabling auto-reload");
            }
        }
        wallet.setAutoReloadEnabled(enabled);
        wallet.setAutoReloadThreshold(threshold);
        wallet.setAutoReloadAmount(amount);
        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet setDefaultPaymentMethod(Long userId, String paymentMethodId) {
        if (paymentMethodId == null || paymentMethodId.isBlank()) {
            throw new RuntimeException("Payment method id is required");
        }
        Wallet wallet = getWallet(userId);
        wallet.setDefaultPaymentMethodId(paymentMethodId);
        return walletRepository.save(wallet);
    }

    // ---------------------------------------------------------------------
    // Internal ledger helpers (callers already hold the wallet row lock)
    // ---------------------------------------------------------------------

    private void credit(Wallet wallet, BigDecimal amount, TransactionType type,
                        Long bookingId, String intentId, String description) {
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
        walletTransactionRepository.save(new WalletTransaction(
                wallet, type, amount, wallet.getBalance(), bookingId, intentId, description));
    }

    private void debit(Wallet wallet, BigDecimal amount, TransactionType type,
                       Long bookingId, String intentId, String description) {
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);
        walletTransactionRepository.save(new WalletTransaction(
                wallet, type, amount.negate(), wallet.getBalance(), bookingId, intentId, description));
    }
}
