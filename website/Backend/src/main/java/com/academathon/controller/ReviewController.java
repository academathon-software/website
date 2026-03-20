package com.academathon.controller;

import com.academathon.model.Review;
import com.academathon.model.User;
import com.academathon.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> leaveReview(@RequestBody Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();

            Long bookingId = Long.valueOf(request.get("bookingId").toString());
            Integer rating = request.get("rating") != null ? Integer.valueOf(request.get("rating").toString()) : null;
            String comment = request.get("comment") != null ? request.get("comment").toString() : null;

            Review review = reviewService.leaveReview(bookingId, currentUser.getId(), rating, comment);

            return ResponseEntity.ok(Map.of(
                "id", review.getId(),
                "bookingId", bookingId,
                "rating", review.getRating() != null ? review.getRating() : "",
                "comment", review.getComment() != null ? review.getComment() : "",
                "message", "Feedback submitted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}/status")
    public ResponseEntity<?> getReviewStatus(@PathVariable Long bookingId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();

            boolean hasReviewed = reviewService.hasReviewed(bookingId, currentUser.getId());
            return ResponseEntity.ok(Map.of("hasReviewed", hasReviewed));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}/received")
    public ResponseEntity<?> getReceivedFeedback(@PathVariable Long bookingId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();

            java.util.Optional<Review> feedbackOpt = reviewService.getFeedbackReceived(bookingId, currentUser.getId());
            if (feedbackOpt.isPresent()) {
                Review review = feedbackOpt.get();
                return ResponseEntity.ok(Map.of(
                    "id", review.getId(),
                    "rating", review.getRating() != null ? review.getRating() : "",
                    "comment", review.getComment() != null ? review.getComment() : "",
                    "reviewerName", review.getReviewer().getDisplayUsername(),
                    "createdAt", review.getCreatedAt().toString(),
                    "hasFeedback", true
                ));
            }
            return ResponseEntity.ok(Map.of("hasFeedback", false));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/tutor/{tutorUserId}/rating")
    public ResponseEntity<?> getTutorRating(@PathVariable Long tutorUserId) {
        try {
            Double avg = reviewService.getTutorAverageRating(tutorUserId);
            return ResponseEntity.ok(Map.of("averageRating", avg != null ? avg : 0));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
