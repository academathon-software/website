package com.academathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.academathon.model.WalletTransaction;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    boolean existsByStripePaymentIntentId(String stripePaymentIntentId);

    boolean existsByBookingIdAndType(Long bookingId, WalletTransaction.TransactionType type);
}
