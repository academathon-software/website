package com.academathon.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.academathon.model.WalletTransaction;

public class WalletTransactionDTO {
    private Long id;
    private String type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private Long bookingId;
    private String status;
    private String description;
    private LocalDateTime createdAt;

    public WalletTransactionDTO() {
    }

    public WalletTransactionDTO(WalletTransaction tx) {
        this.id = tx.getId();
        this.type = tx.getType() != null ? tx.getType().toString() : null;
        this.amount = tx.getAmount();
        this.balanceAfter = tx.getBalanceAfter();
        this.bookingId = tx.getBookingId();
        this.status = tx.getStatus() != null ? tx.getStatus().toString() : null;
        this.description = tx.getDescription();
        this.createdAt = tx.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public String getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
