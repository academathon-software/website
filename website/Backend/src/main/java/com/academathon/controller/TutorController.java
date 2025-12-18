package com.academathon.controller;

import com.academathon.dto.SubjectDTO;
import com.academathon.dto.TutorProfileDTO;
import com.academathon.dto.UserDTO;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.TutorProfileRepository;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.academathon.dto.TutorProfileCreateDTO;
import com.academathon.dto.TutorProfileUpdateDTO;
import com.academathon.model.Subject;
import com.academathon.model.User.Role;
import com.academathon.repository.SubjectRepository;
import com.academathon.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorProfileRepository tutorRepo;

    private final UserRepository userRepo;
    private final SubjectRepository subjectRepo;
    private final PasswordEncoder passwordEncoder;

    public TutorController(TutorProfileRepository tutorRepo,
                            UserRepository userRepo,
                            SubjectRepository subjectRepo,
                            PasswordEncoder passwordEncoder) {
        this.tutorRepo = tutorRepo;
        this.userRepo = userRepo;
        this.subjectRepo = subjectRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /api/tutors
     * Search tutors with optional filters: subject, name, minRate, maxRate
     */
    @GetMapping
    public ResponseEntity<?> searchTutors(
            @RequestParam(name = "subject", required = false) String subjectName,
            @RequestParam(name = "name", required = false) String tutorName,
            @RequestParam(name = "minRate", required = false) BigDecimal minRate,
            @RequestParam(name = "maxRate", required = false) BigDecimal maxRate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "createdAt") String sort,
            @RequestParam(name = "direction", defaultValue = "desc") String direction
    ) {
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, 
                direction.equals("desc") ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC,
                sort
            );

            Page<TutorProfile> tutorPage;

            // Apply filters based on provided parameters
            if (subjectName != null && !subjectName.isBlank()) {
                // Search for tutors teaching this subject (case-insensitive)
                tutorPage = tutorRepo.findBySubjects_NameIgnoreCase(subjectName, pageable);
            } else if (tutorName != null && !tutorName.isBlank()) {
                tutorPage = tutorRepo.findByDisplayNameContainingIgnoreCase(tutorName, pageable);
            } else if (minRate != null || maxRate != null) {
                BigDecimal min = minRate != null ? minRate : BigDecimal.ZERO;
                BigDecimal max = maxRate != null ? maxRate : new BigDecimal("999999");
                tutorPage = tutorRepo.findByHourlyRateBetween(min, max, pageable);
            } else {
                tutorPage = tutorRepo.findAll(pageable);
            }

            List<TutorProfileDTO> tutors = tutorPage
                .map(this::toDTO)
                .getContent();

            // Create response with pagination info
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("tutors", tutors);
            response.put("currentPage", tutorPage.getNumber());
            response.put("totalPages", tutorPage.getTotalPages());
            response.put("totalElements", tutorPage.getTotalElements());
            response.put("hasNext", tutorPage.hasNext());
            response.put("hasPrevious", tutorPage.hasPrevious());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to search tutors: " + e.getMessage());
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> createTutor(
            @RequestBody @Valid TutorProfileCreateDTO dto
    ) {
        try {
            // Check if email already exists
            if (userRepo.findByEmail(dto.email()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("Email already exists");
            }

            // Check if username already exists
            if (userRepo.findByUsername(dto.displayName()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("Display name already exists");
            }

            // 1) Create & save the User
            User user = new User(
                    dto.displayName(),
                    dto.email(),
                    passwordEncoder.encode(dto.password()),
                    Role.TUTOR
            );
            user = userRepo.save(user);

            // 2) Fetch or create each Subject
            List<String> names = (List<String>) dto.subjects();
            List<Subject> subjects = names.stream()
                .<Subject>map(name -> subjectRepo.findByName(name)
                    .orElseGet(() -> subjectRepo.save(new Subject(name))))
                .toList();
            
            // 3) Build & save the TutorProfile
            TutorProfile tp = new TutorProfile();
            tp.setUser(user);
            tp.setDisplayName(dto.displayName());
            tp.setBio(dto.bio());
            tp.setHourlyRate(dto.hourlyRate());
            tp.setSubjects(subjects);
            tp = tutorRepo.save(tp);

            // 4) Return mapped DTO
            return ResponseEntity.ok(toDTO(tp));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to create tutor profile: " + e.getMessage());
        }
    }

    /**
     * GET /api/tutors/{id}
     * Get tutor profile by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorById(@PathVariable Long id) {
        try {
            Optional<TutorProfile> tutorOpt = tutorRepo.findById(id);
            if (tutorOpt.isPresent()) {
                return ResponseEntity.ok(toDTO(tutorOpt.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to retrieve tutor profile: " + e.getMessage());
        }
    }

    /**
     * PUT /api/tutors/{id}
     * Update tutor profile
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTutorProfile(
            @PathVariable Long id,
            @RequestBody @Valid TutorProfileUpdateDTO dto
    ) {
        try {
            Optional<TutorProfile> tutorOpt = tutorRepo.findById(id);
            if (!tutorOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            TutorProfile tutor = tutorOpt.get();
            User user = tutor.getUser();

            // Check if current user owns this profile
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();
            if (!user.getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update your own profile");
            }

            // Update basic profile info
            if (dto.displayName() != null) {
                tutor.setDisplayName(dto.displayName());
                user.setUsername(dto.displayName());
            }
            if (dto.bio() != null) {
                tutor.setBio(dto.bio());
            }
            if (dto.hourlyRate() != null) {
                tutor.setHourlyRate(dto.hourlyRate());
            }

            // Update subjects if provided
            if (dto.subjects() != null && !dto.subjects().isEmpty()) {
                List<Subject> subjects = dto.subjects().stream()
                    .map(name -> subjectRepo.findByName(name)
                        .orElseGet(() -> subjectRepo.save(new Subject(name))))
                    .toList();
                tutor.setSubjects(subjects);
            }

            tutor = tutorRepo.save(tutor);
            userRepo.save(user);

            return ResponseEntity.ok(toDTO(tutor));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to update tutor profile: " + e.getMessage());
        }
    }

    /**
     * GET /api/tutors/me
     * Get current user's tutor profile
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();
            
            Optional<TutorProfile> tutorOpt = tutorRepo.findByUser(currentUser);
            if (tutorOpt.isPresent()) {
                return ResponseEntity.ok(toDTO(tutorOpt.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to retrieve profile: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/tutors/{id}
     * Delete tutor profile
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTutorProfile(@PathVariable Long id) {
        try {
            Optional<TutorProfile> tutorOpt = tutorRepo.findById(id);
            if (!tutorOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            TutorProfile tutor = tutorOpt.get();
            User user = tutor.getUser();

            // Check if current user owns this profile
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) auth.getPrincipal();
            if (!user.getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own profile");
            }

            tutorRepo.delete(tutor);
            userRepo.delete(user);

            return ResponseEntity.ok("Tutor profile deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to delete tutor profile: " + e.getMessage());
        }
    }

    private TutorProfileDTO toDTO(TutorProfile tp) {
        User u = tp.getUser();
        UserDTO userDto = new UserDTO(
            u.getId(),
            u.getEmail(),
            u.getRole().name(),
            u.getProfilePictureUrl(),
            u.getCreatedAt(),
            u.getUpdatedAt()
        );

        List<SubjectDTO> subjectDTOs = tp.getSubjects().stream()
            .map(s -> new SubjectDTO(s.getId(), s.getName()))
            .sorted(Comparator.comparing(SubjectDTO::name))
            .toList();

        return new TutorProfileDTO(
            tp.getId(),
            userDto,
            tp.getDisplayName(),
            tp.getBio(),
            tp.getHourlyRate(),
            tp.getCreatedAt(),
            tp.getUpdatedAt(),
            subjectDTOs
        );
    }
}