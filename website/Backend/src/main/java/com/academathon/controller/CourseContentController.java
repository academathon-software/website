package com.academathon.controller;

import com.academathon.dto.CourseContentDTO;
import com.academathon.dto.UpdateCourseContentRequest;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.service.CourseContentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/course-content")
public class CourseContentController {

    private static final Logger log = LoggerFactory.getLogger(CourseContentController.class);
    
    private final CourseContentService courseContentService;
    private final TutorProfileRepository tutorProfileRepository;
    
    public CourseContentController(CourseContentService courseContentService,
                                  TutorProfileRepository tutorProfileRepository) {
        this.courseContentService = courseContentService;
        this.tutorProfileRepository = tutorProfileRepository;
    }
    
    @GetMapping
    public ResponseEntity<?> getCourseContent(@RequestParam String subjectName) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            CourseContentDTO content = courseContentService.getCourseContent(tutorProfileId, subjectName);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            log.error("Failed to get course content for subject '{}': {}", subjectName, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping
    public ResponseEntity<?> updateCourseContent(@RequestBody UpdateCourseContentRequest request) {
        try {
            Long tutorProfileId = getCurrentTutorProfileId();
            CourseContentDTO content = courseContentService.updateCourseContent(tutorProfileId, request);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            log.error("Failed to update course content: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    private Long getCurrentTutorProfileId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        
        if (!(principal instanceof User)) {
            throw new RuntimeException("Invalid authentication principal: " + principal.getClass().getName());
        }
        
        User currentUser = (User) principal;
        
        if (currentUser.getRole() != User.Role.TUTOR) {
            throw new RuntimeException("Only tutors can manage course content");
        }
        
        TutorProfile tutorProfile = tutorProfileRepository.findByUser(currentUser)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        return tutorProfile.getId();
    }
}




