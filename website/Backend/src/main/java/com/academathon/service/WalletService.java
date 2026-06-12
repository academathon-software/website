package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.User;
import com.academathon.model.WalletTransaction;
import com.academathon.repository.UserRepository;
import com.academathon.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WalletService {

    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletService(UserRepository userRepository,
                         WalletTransactionRepository walletTransactionRepository) {
        this.userRepository = userRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    /**
     * Returns the student's current wallet balance.
     * Called by GET /api/wallet/balance.
     */
    public Map<String, Object> getBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("balance", user.getWalletBalance());
        response.put("currency", "CAD");
        return response;
    }

    /**
     * Returns the full transaction history for a student, newest first.
     * Called by GET /api/wallet/transactions.
     */
    public List<Map<String, Object>> getTransactions(Long userId) {
        List<WalletTransaction> transactions =
                walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return transactions.stream().map(tx -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", tx.getId());
            map.put("type", tx.getType().name());
            map.put("amount", tx.getAmount());
            map.put("description", tx.getDescription());
            map.put("createdAt", tx.getCreatedAt());
            // Include booking info if this was a deduction or refund
            if (tx.getBooking() != null) {
                map.put("bookingId", tx.getBooking().getId());
                map.put("subject", tx.getBooking().getSubject());
                map.put("tutorName", tx.getBooking().getTutor().getDisplayName());
            }
            return map;
        }).toList();
    }

    /**
     * Credits the wallet after a Stripe top-up payment succeeds.
     * Called from the webhook handler when payment_intent.succeeded fires
     * and the intent has metadata.type = "wallet_topup".
     *
     * Uses a DB-level lock (pessimistic write) on the user row so two
     * simultaneous webhooks from Stripe can't double-credit the same payment.
     * Also checks if the stripe intent id was already processed (idempotency).
     */
    @Transactional
    public void creditWallet(Long userId, Double amount, String stripePaymentIntentId) {
        // Idempotency check — Stripe can retry webhooks. If we already processed
        // this payment intent, silently return rather than double-crediting.
        if (walletTransactionRepository.findByStripePaymentIntentId(stripePaymentIntentId).isPresent()) {
            return;
        }

        // Lock the user row so concurrent webhook retries queue up rather than racing
        User user = userRepository.findByIdWithLock(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);

        WalletTransaction transaction = new WalletTransaction(
                user,
                amount,
                stripePaymentIntentId,
                String.format("Wallet top-up of $%.2f CAD", amount)
        );
        walletTransactionRepository.save(transaction);
    }

    /**
     * Deducts the lesson price from the student's wallet when a booking is paid via wallet.
     * Called from PaymentService.chargeBookingOffSession() when the balance is sufficient.
     *
     * The caller (PaymentService) must already hold a lock on the user row
     * to prevent race conditions between simultaneous booking confirmations.
     */
    @Transactional
    public void deductForBooking(User student, Booking booking, Double amount) {
        student.setWalletBalance(student.getWalletBalance() - amount);
        userRepository.save(student);

        WalletTransaction transaction = new WalletTransaction(
                student,
                WalletTransaction.TransactionType.DEDUCTION,
                amount,
                booking,
                String.format("%s lesson with %s — paid from wallet",
                        booking.getSubject(),
                        booking.getTutor().getDisplayName())
        );
        walletTransactionRepository.save(transaction);
    }

    /**
     * Restores funds to the wallet when a wallet-paid booking is cancelled.
     * Called from BookingService when a WALLET-paid booking is cancelled.
     * No Stripe call needed — this is purely a DB operation.
     */
    @Transactional
    public void refundToWallet(User student, Booking booking, Double amount) {
        student.setWalletBalance(student.getWalletBalance() + amount);
        userRepository.save(student);

        WalletTransaction transaction = new WalletTransaction(
                student,
                WalletTransaction.TransactionType.REFUND,
                amount,
                booking,
                String.format("Refund for cancelled %s lesson with %s",
                        booking.getSubject(),
                        booking.getTutor().getDisplayName())
        );
        walletTransactionRepository.save(transaction);
    }
}
