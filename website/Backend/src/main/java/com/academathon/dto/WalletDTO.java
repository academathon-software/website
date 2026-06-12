package com.academathon.dto;

import java.math.BigDecimal;

import com.academathon.model.Wallet;

public class WalletDTO {
    private BigDecimal balance;
    private String currency;
    private boolean autoReloadEnabled;
    private BigDecimal autoReloadThreshold;
    private BigDecimal autoReloadAmount;
    private boolean hasPaymentMethod;

    public WalletDTO() {
    }

    public WalletDTO(Wallet wallet) {
        this.balance = wallet.getBalance();
        this.currency = wallet.getCurrency();
        this.autoReloadEnabled = wallet.isAutoReloadEnabled();
        this.autoReloadThreshold = wallet.getAutoReloadThreshold();
        this.autoReloadAmount = wallet.getAutoReloadAmount();
        this.hasPaymentMethod = wallet.getDefaultPaymentMethodId() != null
                && !wallet.getDefaultPaymentMethodId().isBlank();
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

    public boolean isHasPaymentMethod() {
        return hasPaymentMethod;
    }

    public void setHasPaymentMethod(boolean hasPaymentMethod) {
        this.hasPaymentMethod = hasPaymentMethod;
    }
}
