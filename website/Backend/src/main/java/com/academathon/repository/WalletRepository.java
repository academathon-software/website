package com.academathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academathon.model.Wallet;

import jakarta.persistence.LockModeType;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(Long userId);

    /**
     * Pessimistic-write lock so concurrent confirms/top-ups serialize their
     * balance reads and writes (SELECT ... FOR UPDATE).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserIdForUpdate(@Param("userId") Long userId);

    /**
     * Race-safe wallet creation. Concurrent first-time requests (e.g. the wallet page
     * loading balance + transactions in parallel) can both find no wallet and try to
     * insert one; ON CONFLICT DO NOTHING relies on the unique index to make the loser
     * a no-op instead of throwing a duplicate-key error. All other columns use their
     * DB defaults (balance 0, currency CAD, auto_reload_enabled false, timestamps).
     */
    @Modifying
    @Query(value = "INSERT INTO wallets (user_id) VALUES (:userId) ON CONFLICT (user_id) DO NOTHING",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId);
}
