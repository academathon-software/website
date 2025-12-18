package com.academathon.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.academathon.dto.BookingRequestDTO;
import com.academathon.dto.BookingResponseDTO;
import com.academathon.model.User;
import com.academathon.service.BookingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    private final BookingService bookingService;
    
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
    
    /**
     * Create a new booking
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            BookingResponseDTO booking = bookingService.createBooking(currentUser.getId(), request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all bookings for the current user
     * GET /api/bookings
     */
    @GetMapping
    public ResponseEntity<?> getUserBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            List<BookingResponseDTO> bookings = bookingService.getUserBookings(currentUser.getId());
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get upcoming bookings for the current user
     * GET /api/bookings/upcoming
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            List<BookingResponseDTO> bookings = bookingService.getUpcomingBookings(currentUser.getId());
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get past bookings for the current user
     * GET /api/bookings/past
     */
    @GetMapping("/past")
    public ResponseEntity<?> getPastBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            List<BookingResponseDTO> bookings = bookingService.getPastBookings(currentUser.getId());
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get bookings within a date range (for calendar view)
     * GET /api/bookings/range?start=2024-01-01T00:00:00&end=2024-01-31T23:59:59
     */
    @GetMapping("/range")
    public ResponseEntity<?> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            List<BookingResponseDTO> bookings = bookingService.getBookingsByDateRange(
                currentUser.getId(), start, end);
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get a specific booking by ID
     * GET /api/bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            BookingResponseDTO booking = bookingService.getBookingById(id, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Cancel a booking
     * PUT /api/bookings/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            BookingResponseDTO booking = bookingService.cancelBooking(id, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Confirm a booking (tutor only)
     * PUT /api/bookings/{id}/confirm
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            BookingResponseDTO booking = bookingService.confirmBooking(id, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Reject a booking (tutor only)
     * PUT /api/bookings/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            String reason = request.getOrDefault("reason", "No reason provided");
            BookingResponseDTO booking = bookingService.rejectBooking(id, currentUser.getId(), reason);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get pending bookings for the current tutor
     * GET /api/bookings/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            List<BookingResponseDTO> bookings = bookingService.getPendingBookingsForTutor(currentUser.getId());
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Mark a booking as completed
     * PUT /api/bookings/{id}/complete
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            BookingResponseDTO booking = bookingService.completeBooking(id, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Check if a tutor is available at a specific time
     * GET /api/bookings/check-availability?tutorId=1&start=...&end=...
     */
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam Long tutorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            boolean isAvailable = bookingService.isTutorAvailable(tutorId, start, end);
            return ResponseEntity.ok(Map.of("available", isAvailable));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Request a reschedule (student only)
     * PUT /api/bookings/{id}/reschedule
     */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> requestReschedule(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            LocalDateTime newStartTime = LocalDateTime.parse(request.get("startTime"));
            LocalDateTime newEndTime = LocalDateTime.parse(request.get("endTime"));
            
            BookingResponseDTO booking = bookingService.requestReschedule(id, currentUser.getId(), newStartTime, newEndTime);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Accept a reschedule request (tutor only)
     * PUT /api/bookings/{id}/reschedule/accept
     */
    @PutMapping("/{id}/reschedule/accept")
    public ResponseEntity<?> acceptReschedule(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            BookingResponseDTO booking = bookingService.acceptReschedule(id, currentUser.getId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Reject a reschedule request (tutor only)
     * PUT /api/bookings/{id}/reschedule/reject
     */
    @PutMapping("/{id}/reschedule/reject")
    public ResponseEntity<?> rejectReschedule(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            String reason = request.getOrDefault("reason", "No reason provided");
            BookingResponseDTO booking = bookingService.rejectReschedule(id, currentUser.getId(), reason);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
















