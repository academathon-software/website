package com.academathon.controller;

import com.academathon.dto.*;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.service.AvailabilityService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {
    
    private final AvailabilityService availabilityService;
    private final TutorProfileRepository tutorProfileRepository;
    
    public AvailabilityController(AvailabilityService availabilityService,
                                 TutorProfileRepository tutorProfileRepository) {
        this.availabilityService = availabilityService;
        this.tutorProfileRepository = tutorProfileRepository;
    }
    
    /**
     * Get tutor's recurring availability schedule
     * GET /api/availability/{tutorId}
     */
    @GetMapping("/{tutorId}")
    public ResponseEntity<?> getSchedule(@PathVariable Long tutorId) {
        try {
            List<AvailabilityScheduleDTO> schedule = availabilityService.getSchedule(tutorId);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get available booking slots for a tutor
     * GET /api/availability/{tutorId}/slots?start=2024-01-01&end=2024-01-31&duration=60
     */
    @GetMapping("/{tutorId}/slots")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable Long tutorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "60") Integer duration) {
        try {
            List<AvailableSlotDTO> slots = availabilityService.getAvailableSlots(
                tutorId, start, end, duration
            );
            return ResponseEntity.ok(slots);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Set/update recurring availability schedule (tutor only)
     * POST /api/availability/schedule
     */
    @PostMapping("/schedule")
    public ResponseEntity<?> setSchedule(@RequestBody @Valid SetAvailabilityScheduleRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Get tutor profile ID from current user
            Long tutorProfileId = getTutorProfileId(currentUser);
            
            List<AvailabilityScheduleDTO> schedule = availabilityService.setRecurringSchedule(
                tutorProfileId, request
            );
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all availability exceptions for current tutor
     * GET /api/availability/exceptions
     */
    @GetMapping("/exceptions")
    public ResponseEntity<?> getExceptions() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            Long tutorProfileId = getTutorProfileId(currentUser);
            
            List<AvailabilityExceptionDTO> exceptions = availabilityService.getExceptions(tutorProfileId);
            return ResponseEntity.ok(exceptions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get exceptions for a specific tutor (public endpoint)
     * GET /api/availability/{tutorId}/exceptions
     */
    @GetMapping("/{tutorId}/exceptions")
    public ResponseEntity<?> getTutorExceptions(@PathVariable Long tutorId) {
        try {
            List<AvailabilityExceptionDTO> exceptions = availabilityService.getExceptions(tutorId);
            return ResponseEntity.ok(exceptions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Add an availability exception (tutor only)
     * POST /api/availability/exception
     */
    @PostMapping("/exception")
    public ResponseEntity<?> addException(@RequestBody @Valid AddAvailabilityExceptionRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            Long tutorProfileId = getTutorProfileId(currentUser);
            
            AvailabilityExceptionDTO exception = availabilityService.addException(
                tutorProfileId, request
            );
            return ResponseEntity.ok(exception);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Remove an availability exception (tutor only)
     * DELETE /api/availability/exception/{exceptionId}
     */
    @DeleteMapping("/exception/{exceptionId}")
    public ResponseEntity<?> removeException(@PathVariable Long exceptionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            Long tutorProfileId = getTutorProfileId(currentUser);
            
            availabilityService.removeException(exceptionId, tutorProfileId);
            return ResponseEntity.ok(Map.of("message", "Exception removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Helper method to get tutor profile ID from current user
     */
    private Long getTutorProfileId(User user) {
        if (user.getRole() != User.Role.TUTOR) {
            throw new RuntimeException("Only tutors can manage availability");
        }
        
        TutorProfile tutorProfile = tutorProfileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        return tutorProfile.getId();
    }
}

