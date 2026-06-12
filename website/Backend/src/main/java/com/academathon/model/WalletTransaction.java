package com.academathon.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A single money-movement event on a student's wallet.
 *
 * TOPUP     — parent loaded funds via Stripe
 * DEDUCTION — a booking was paid from the wallet
 * REFUND    — a wallet-paid booking was cancelled, funds restored
 */
@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The student whose wallet this transaction belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(nullable = false)
    private Double amount;

    // Only populated for DEDUCTION and REFUND rows
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Only populated for TOPUP rows — lets us reconcile with Stripe if needed
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionType {
        TOPUP,
        DEDUCTION,
        REFUND
    }

    public WalletTransaction() {}

    // Convenience constructor for top-ups
    public WalletTransaction(User user, Double amount, String stripePaymentIntentId, String description) {
        this.user = user;
        this.type = TransactionType.TOPUP;
        this.amount = amount;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.description = description;
    }

    // Convenience constructor for deductions and refunds
    public WalletTransaction(User user, TransactionType type, Double amount, Booking booking, String description) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.booking = booking;
        this.description = description;
    }

    // Getters and setters

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
