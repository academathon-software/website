package com.academathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.academathon.model.Booking;
import com.academathon.model.Booking.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Find all bookings for a student (using nested property)
    List<Booking> findByStudentId(Long studentId);
    
    // Find all bookings for a tutor profile
    List<Booking> findByTutorId(Long tutorId);
    
    // Find all bookings for a tutor by user ID
    @Query("SELECT b FROM Booking b WHERE b.tutor.user.id = :userId ORDER BY b.startTime DESC")
    List<Booking> findByTutorUserId(@Param("userId") Long userId);
    
    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);
    
    // Find bookings by tutor and status
    List<Booking> findByTutorIdAndStatus(Long tutorId, BookingStatus status);
    
    // Find upcoming bookings for a student
    @Query("SELECT b FROM Booking b WHERE b.student.id = :studentId AND b.startTime >= :now ORDER BY b.startTime ASC")
    List<Booking> findUpcomingBookingsByStudent(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);
    
    // Find upcoming bookings for a tutor
    @Query("SELECT b FROM Booking b WHERE b.tutor.id = :tutorId AND b.startTime >= :now ORDER BY b.startTime ASC")
    List<Booking> findUpcomingBookingsByTutor(@Param("tutorId") Long tutorId, @Param("now") LocalDateTime now);
    
    // Find past bookings for a student
    @Query("SELECT b FROM Booking b WHERE b.student.id = :studentId AND b.endTime < :now ORDER BY b.startTime DESC")
    List<Booking> findPastBookingsByStudent(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);
    
    // Find past bookings for a tutor
    @Query("SELECT b FROM Booking b WHERE b.tutor.id = :tutorId AND b.endTime < :now ORDER BY b.startTime DESC")
    List<Booking> findPastBookingsByTutor(@Param("tutorId") Long tutorId, @Param("now") LocalDateTime now);
    
    // Check for conflicting bookings for a tutor
    @Query("SELECT b FROM Booking b WHERE b.tutor.id = :tutorId " +
           "AND b.status != 'CANCELLED' " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("tutorId") Long tutorId, 
                                          @Param("startTime") LocalDateTime startTime, 
                                          @Param("endTime") LocalDateTime endTime);
    
    // Check for conflicting bookings for a student
    @Query("SELECT b FROM Booking b WHERE b.student.id = :studentId " +
           "AND b.status != 'CANCELLED' " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingStudentBookings(@Param("studentId") Long studentId, 
                                                  @Param("startTime") LocalDateTime startTime, 
                                                  @Param("endTime") LocalDateTime endTime);
    
    // Find bookings within a date range for a user (student or tutor)
    @Query("SELECT b FROM Booking b WHERE (b.student.id = :userId OR b.tutor.user.id = :userId) " +
           "AND b.startTime >= :startDate AND b.endTime <= :endDate " +
           "ORDER BY b.startTime ASC")
    List<Booking> findBookingsByUserAndDateRange(@Param("userId") Long userId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}