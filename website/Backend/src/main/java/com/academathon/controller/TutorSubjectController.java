package com.academathon.controller;

import com.academathon.dto.AddSubjectRequest;
import com.academathon.dto.TutorSubjectDTO;
import com.academathon.dto.UpdateSubjectStatusRequest;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.service.TutorSubjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutors/me/subjects")
public class TutorSubjectController {
    
    private final TutorSubjectService tutorSubjectService;
    private final TutorProfileRepository tutorProfileRepository;
    
    public TutorSubjectController(TutorSubjectService tutorSubjectService,
                                  TutorProfileRepository tutorProfileRepository) {
        this.tutorSubjectService = tutorSubjectService;
        this.tutorProfileRepository = tutorProfileRepository;
    }
    
    /**
     * GET /api/tutors/me/subjects
     * Get all subjects for current tutor with status
     */
    @GetMapping
    public ResponseEntity<?> getMySubjects(@RequestParam(required = false) String status) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            
            List<TutorSubjectDTO> subjects;
            if (status != null && !status.isEmpty()) {
                subjects = tutorSubjectService.getTutorSubjectsByStatus(tutorProfileId, status);
            } else {
                subjects = tutorSubjectService.getTutorSubjects(tutorProfileId);
            }
            
            return ResponseEntity.ok(subjects);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * POST /api/tutors/me/subjects
     * Add a subject to tutor's teaching list
     */
    @PostMapping
    public ResponseEntity<?> addSubject(@RequestBody @Valid AddSubjectRequest request) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            
            TutorSubjectDTO subject = tutorSubjectService.addSubject(
                tutorProfileId,
                request.getSubjectName(),
                request.getStatus()
            );
            
            return ResponseEntity.ok(subject);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/tutors/me/subjects/{subjectId}
     * Update subject status (move to past or current)
     */
    @PutMapping("/{subjectId}")
    public ResponseEntity<?> updateSubjectStatus(
            @PathVariable Long subjectId,
            @RequestBody @Valid UpdateSubjectStatusRequest request) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            
            TutorSubjectDTO subject = tutorSubjectService.updateSubjectStatus(
                tutorProfileId,
                subjectId,
                request.getStatus()
            );
            
            return ResponseEntity.ok(subject);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/tutors/me/subjects/{subjectId}
     * Remove a subject from tutor's teaching list
     */
    @DeleteMapping("/{subjectId}")
    public ResponseEntity<?> removeSubject(@PathVariable Long subjectId) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            
            tutorSubjectService.removeSubject(tutorProfileId, subjectId);
            
            return ResponseEntity.ok(Map.of("message", "Subject removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Helper method to get current tutor's profile ID
     */
    private Long getCurrentTutorProfileId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        if (currentUser.getRole() != User.Role.TUTOR) {
            throw new RuntimeException("Only tutors can manage subjects");
        }
        
        TutorProfile tutorProfile = tutorProfileRepository.findByUser(currentUser)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        return tutorProfile.getId();
    }
}




