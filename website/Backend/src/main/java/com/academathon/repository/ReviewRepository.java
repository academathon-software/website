package com.academathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.academathon.model.Review;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBookingIdAndReviewerId(Long bookingId, Long reviewerId);

    List<Review> findByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.booking.tutor.user.id = :tutorUserId AND r.rating IS NOT NULL")
    Double getAverageRatingForTutor(@Param("tutorUserId") Long tutorUserId);

    @Query("SELECT r FROM Review r WHERE r.booking.tutor.user.id = :tutorUserId AND r.rating IS NOT NULL ORDER BY r.createdAt DESC")
    List<Review> findTutorReviews(@Param("tutorUserId") Long tutorUserId);

    @Query("SELECT r FROM Review r WHERE r.booking.id = :bookingId AND r.reviewer.id <> :userId")
    Optional<Review> findFeedbackReceivedForBooking(@Param("bookingId") Long bookingId, @Param("userId") Long userId);
}
