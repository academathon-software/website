package com.academathon.controller;

import com.academathon.dto.SubjectDTO;
import com.academathon.model.Subject;
import com.academathon.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    public SubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    /**
     * GET /api/subjects
     * Get all available subjects
     */
    @GetMapping
    public ResponseEntity<?> getAllSubjects() {
        try {
            List<Subject> subjects = subjectRepository.findAll();
            List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(subject -> new SubjectDTO(subject.getId(), subject.getName()))
                .sorted((s1, s2) -> s1.name().compareToIgnoreCase(s2.name()))
                .toList();
            
            return ResponseEntity.ok(subjectDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to retrieve subjects: " + e.getMessage());
        }
    }

    /**
     * GET /api/subjects/{id}
     * Get subject by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubjectById(@PathVariable Long id) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(id);
            if (subjectOpt.isPresent()) {
                Subject subject = subjectOpt.get();
                return ResponseEntity.ok(new SubjectDTO(subject.getId(), subject.getName()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to retrieve subject: " + e.getMessage());
        }
    }

    /**
     * POST /api/subjects
     * Create a new subject
     */
    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody @Valid SubjectCreateDTO dto) {
        try {
            // Check if subject already exists
            Optional<Subject> existingSubject = subjectRepository.findByName(dto.name());
            if (existingSubject.isPresent()) {
                return ResponseEntity.badRequest()
                    .body("Subject already exists");
            }

            Subject subject = new Subject(dto.name());
            subject = subjectRepository.save(subject);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SubjectDTO(subject.getId(), subject.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to create subject: " + e.getMessage());
        }
    }

    /**
     * PUT /api/subjects/{id}
     * Update subject name
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(
            @PathVariable Long id, 
            @RequestBody @Valid SubjectUpdateDTO dto) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(id);
            if (!subjectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Check if new name already exists
            Optional<Subject> existingSubject = subjectRepository.findByName(dto.name());
            if (existingSubject.isPresent() && !existingSubject.get().getId().equals(id)) {
                return ResponseEntity.badRequest()
                    .body("Subject name already exists");
            }

            Subject subject = subjectOpt.get();
            subject.setName(dto.name());
            subject = subjectRepository.save(subject);
            
            return ResponseEntity.ok(new SubjectDTO(subject.getId(), subject.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to update subject: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/subjects/{id}
     * Delete subject
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        try {
            Optional<Subject> subjectOpt = subjectRepository.findById(id);
            if (!subjectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            subjectRepository.delete(subjectOpt.get());
            return ResponseEntity.ok("Subject deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to delete subject: " + e.getMessage());
        }
    }

    // DTOs for request bodies
    public record SubjectCreateDTO(
        @jakarta.validation.constraints.NotBlank(message = "Subject name is required")
        @jakarta.validation.constraints.Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
        String name
    ) {}

    public record SubjectUpdateDTO(
        @jakarta.validation.constraints.NotBlank(message = "Subject name is required")
        @jakarta.validation.constraints.Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
        String name
    ) {}
}

