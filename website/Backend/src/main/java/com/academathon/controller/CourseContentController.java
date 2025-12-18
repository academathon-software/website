package com.academathon.controller;

import com.academathon.dto.CourseContentDTO;
import com.academathon.dto.UpdateCourseContentRequest;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.service.CourseContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/course-content")
public class CourseContentController {
    
    private final CourseContentService courseContentService;
    private final TutorProfileRepository tutorProfileRepository;
    
    public CourseContentController(CourseContentService courseContentService,
                                  TutorProfileRepository tutorProfileRepository) {
        this.courseContentService = courseContentService;
        this.tutorProfileRepository = tutorProfileRepository;
    }
    
    /**
     * GET /api/course-content?subjectName={name}
     * Get course content for current tutor and subject
     */
    @GetMapping
    public ResponseEntity<?> getCourseContent(@RequestParam String subjectName) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            CourseContentDTO content = courseContentService.getCourseContent(tutorProfileId, subjectName);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/course-content
     * Update course content for current tutor
     */
    @PutMapping
    public ResponseEntity<?> updateCourseContent(@RequestBody UpdateCourseContentRequest request) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            CourseContentDTO content = courseContentService.updateCourseContent(tutorProfileId, request);
            return ResponseEntity.ok(content);
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
            throw new RuntimeException("Only tutors can manage course content");
        }
        
        TutorProfile tutorProfile = tutorProfileRepository.findByUser(currentUser)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        return tutorProfile.getId();
    }
}




