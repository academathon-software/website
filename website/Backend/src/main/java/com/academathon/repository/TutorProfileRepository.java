package com.academathon.repository;


import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {
    // Search by subject name (exact match)
    Page<TutorProfile> findBySubjects_Name(String subjectName, Pageable pageable);
    
    // Search by subject name (case-insensitive)
    Page<TutorProfile> findBySubjects_NameIgnoreCase(String subjectName, Pageable pageable);
    
    // Search by subject name for currently teaching subjects only
    // Note: This returns all tutors with the subject; filtering by status happens in service layer
    @Query("SELECT DISTINCT t FROM TutorProfile t JOIN t.subjects s WHERE LOWER(s.name) = LOWER(:subjectName)")
    Page<TutorProfile> findByCurrentlyTeachingSubject(@Param("subjectName") String subjectName, Pageable pageable);
    
    // Find tutor profile by user
    Optional<TutorProfile> findByUser(User user);
    
    // Find tutor profile by user ID
    Optional<TutorProfile> findByUserId(Long userId);
    
    // Find tutor profiles by display name (for search)
    Page<TutorProfile> findByDisplayNameContainingIgnoreCase(String displayName, Pageable pageable);
    
    // Find tutor profiles by hourly rate range
    Page<TutorProfile> findByHourlyRateBetween(BigDecimal minRate, BigDecimal maxRate, Pageable pageable);
}