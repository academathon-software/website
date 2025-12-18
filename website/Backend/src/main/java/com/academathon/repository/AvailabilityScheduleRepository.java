package com.academathon.repository;

import com.academathon.model.AvailabilitySchedule;
import com.academathon.model.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvailabilityScheduleRepository extends JpaRepository<AvailabilitySchedule, Long> {
    
    // Find all active schedules for a tutor
    List<AvailabilitySchedule> findByTutorProfileAndIsActiveTrue(TutorProfile tutorProfile);
    
    // Find all schedules for a tutor (including inactive)
    List<AvailabilitySchedule> findByTutorProfile(TutorProfile tutorProfile);
    
    // Find schedules by tutor ID
    @Query("SELECT a FROM AvailabilitySchedule a WHERE a.tutorProfile.id = :tutorProfileId AND a.isActive = true")
    List<AvailabilitySchedule> findActiveByTutorProfileId(@Param("tutorProfileId") Long tutorProfileId);
    
    // Find schedules for a specific day of week
    @Query("SELECT a FROM AvailabilitySchedule a WHERE a.tutorProfile.id = :tutorProfileId AND a.dayOfWeek = :dayOfWeek AND a.isActive = true")
    List<AvailabilitySchedule> findByTutorProfileIdAndDayOfWeek(
        @Param("tutorProfileId") Long tutorProfileId,
        @Param("dayOfWeek") Integer dayOfWeek
    );
    
    // Delete all schedules for a tutor
    void deleteByTutorProfile(TutorProfile tutorProfile);
}




