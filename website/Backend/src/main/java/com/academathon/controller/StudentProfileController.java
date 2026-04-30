package com.academathon.controller;

import com.academathon.dto.UserDTO;
import com.academathon.model.User;
import com.academathon.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentProfileController {

    private final UserRepository userRepository;

    public StudentProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/students/me
     * Get current student's profile
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();
            
            if (currentUser.getRole() != User.Role.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. This endpoint is for students only.");
            }
            
            UserDTO userDTO = new UserDTO(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getRole().name(),
                currentUser.getProfilePictureUrl(),
                currentUser.getPronouns(),
                currentUser.getCreatedAt(),
                currentUser.getUpdatedAt()
            );
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to retrieve profile: " + e.getMessage());
        }
    }

    /**
     * PUT /api/students/me
     * Update student profile
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody @Valid StudentProfileUpdateDTO dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();
            
            if (currentUser.getRole() != User.Role.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. This endpoint is for students only.");
            }

            // Update username if provided and not already taken
            if (dto.username() != null && !dto.username().isBlank()) {
                Optional<User> existingUser = userRepository.findByUsername(dto.username());
                if (existingUser.isPresent() && !existingUser.get().getId().equals(currentUser.getId())) {
                    return ResponseEntity.badRequest()
                        .body("Username already taken");
                }
                currentUser.setUsername(dto.username());
            }

            currentUser = userRepository.save(currentUser);

            UserDTO userDTO = new UserDTO(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getRole().name(),
                currentUser.getProfilePictureUrl(),
                currentUser.getPronouns(),
                currentUser.getCreatedAt(),
                currentUser.getUpdatedAt()
            );
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to update profile: " + e.getMessage());
        }
    }

    /**
     * GET /api/students
     * Get all students (admin only)
     */
    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();
            
            if (currentUser.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            List<User> students = userRepository.findByRole(User.Role.STUDENT);
            List<UserDTO> studentDTOs = students.stream()
                .map(student -> new UserDTO(
                    student.getId(),
                    student.getEmail(),
                    student.getRole().name(),
                    student.getProfilePictureUrl(),
                    student.getPronouns(),
                    student.getCreatedAt(),
                    student.getUpdatedAt()
                ))
                .toList();
            
            return ResponseEntity.ok(studentDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to retrieve students: " + e.getMessage());
        }
    }

    // DTO for request body
    public record StudentProfileUpdateDTO(
        @jakarta.validation.constraints.Size(min = 2, max = 100, message = "Username must be between 2 and 100 characters")
        String username
    ) {}
}

