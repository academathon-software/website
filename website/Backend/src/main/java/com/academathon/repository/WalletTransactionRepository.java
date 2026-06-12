package com.academathon.repository;

import com.academathon.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // All transactions for a user, newest first — used for the transaction history page
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Look up a top-up by Stripe payment intent id — used in the webhook handler
    // to avoid crediting the same payment twice if Stripe retries the webhook
    Optional<WalletTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);
}
