package com.academathon.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "CAD";

    @Column(name = "auto_reload_enabled", nullable = false)
    private boolean autoReloadEnabled = false;

    @Column(name = "auto_reload_threshold")
    private BigDecimal autoReloadThreshold;

    @Column(name = "auto_reload_amount")
    private BigDecimal autoReloadAmount;

    @Column(name = "default_payment_method_id")
    private String defaultPaymentMethodId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Wallet() {
        // JPA requires a public no-args constructor
    }

    public Wallet(User user) {
        this.user = user;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public boolean isAutoReloadEnabled() {
        return autoReloadEnabled;
    }

    public void setAutoReloadEnabled(boolean autoReloadEnabled) {
        this.autoReloadEnabled = autoReloadEnabled;
    }

    public BigDecimal getAutoReloadThreshold() {
        return autoReloadThreshold;
    }

    public void setAutoReloadThreshold(BigDecimal autoReloadThreshold) {
        this.autoReloadThreshold = autoReloadThreshold;
    }

    public BigDecimal getAutoReloadAmount() {
        return autoReloadAmount;
    }

    public void setAutoReloadAmount(BigDecimal autoReloadAmount) {
        this.autoReloadAmount = autoReloadAmount;
    }

    public String getDefaultPaymentMethodId() {
        return defaultPaymentMethodId;
    }

    public void setDefaultPaymentMethodId(String defaultPaymentMethodId) {
        this.defaultPaymentMethodId = defaultPaymentMethodId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
