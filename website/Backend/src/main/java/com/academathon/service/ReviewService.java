package com.academathon.service;

import com.academathon.model.Booking;
import com.academathon.model.Review;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.ReviewRepository;
import com.academathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public Review leaveReview(Long bookingId, Long reviewerId, Integer rating, String comment) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Can only leave feedback for completed lessons");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Review> existing = reviewRepository.findByBookingIdAndReviewerId(bookingId, reviewerId);
        if (existing.isPresent()) {
            throw new RuntimeException("You have already left feedback for this lesson");
        }

        boolean isTutor = reviewer.getRole() == User.Role.TUTOR;

        if (isTutor && rating != null) {
            throw new RuntimeException("Tutors cannot leave star ratings");
        }

        if (!isTutor && (rating == null || rating < 1 || rating > 5)) {
            throw new RuntimeException("Students must provide a rating between 1 and 5");
        }

        Review review = new Review(booking, reviewer, rating, comment);
        return reviewRepository.save(review);
    }

    public boolean hasReviewed(Long bookingId, Long reviewerId) {
        return reviewRepository.findByBookingIdAndReviewerId(bookingId, reviewerId).isPresent();
    }

    public List<Review> getBookingReviews(Long bookingId) {
        return reviewRepository.findByBookingId(bookingId);
    }

    public Double getTutorAverageRating(Long tutorUserId) {
        return reviewRepository.getAverageRatingForTutor(tutorUserId);
    }

    public Optional<Review> getFeedbackReceived(Long bookingId, Long userId) {
        return reviewRepository.findFeedbackReceivedForBooking(bookingId, userId);
    }
}
