package com.academathon.repository;

import com.academathon.model.TutorInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorInvitationRepository extends JpaRepository<TutorInvitation, Long> {
    Optional<TutorInvitation> findByToken(String token);
    Optional<TutorInvitation> findByEmail(String email);
    boolean existsByEmail(String email);
}







