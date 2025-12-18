package com.academathon.repository;

import com.academathon.model.AvailabilityException;
import com.academathon.model.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, Long> {
    
    // Find all exceptions for a tutor
    List<AvailabilityException> findByTutorProfile(TutorProfile tutorProfile);
    
    // Find exceptions by tutor ID
    @Query("SELECT e FROM AvailabilityException e WHERE e.tutorProfile.id = :tutorProfileId")
    List<AvailabilityException> findByTutorProfileId(@Param("tutorProfileId") Long tutorProfileId);
    
    // Find exceptions for a specific date
    @Query("SELECT e FROM AvailabilityException e WHERE e.tutorProfile.id = :tutorProfileId AND e.exceptionDate = :date")
    List<AvailabilityException> findByTutorProfileIdAndDate(
        @Param("tutorProfileId") Long tutorProfileId,
        @Param("date") LocalDate date
    );
    
    // Find exceptions within a date range
    @Query("SELECT e FROM AvailabilityException e WHERE e.tutorProfile.id = :tutorProfileId " +
           "AND e.exceptionDate BETWEEN :startDate AND :endDate")
    List<AvailabilityException> findByTutorProfileIdAndDateRange(
        @Param("tutorProfileId") Long tutorProfileId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Delete all exceptions for a tutor
    void deleteByTutorProfile(TutorProfile tutorProfile);
}




