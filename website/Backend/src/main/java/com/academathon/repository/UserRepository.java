package com.academathon.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.academathon.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByVerificationCode(String verificationCode);
    List<User> findByRole(User.Role role);
    Optional<User> findByEmailAndRole(String email, User.Role role);

    /**
     * Fetches a user row with a pessimistic write lock (SELECT ... FOR UPDATE).
     * Use this instead of findById() inside any @Transactional method that
     * modifies wallet_balance, to prevent race conditions when two requests
     * (e.g. a webhook retry + a booking confirmation) run simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithLock(@Param("id") Long id);
}