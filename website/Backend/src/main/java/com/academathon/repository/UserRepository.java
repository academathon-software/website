package com.academathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academathon.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByVerificationCode(String verificationCode);
    List<User> findByRole(User.Role role);
}