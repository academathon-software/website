package com.academathon.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.academathon.model.User;
import com.academathon.service.UserService;
import com.academathon.service.S3Service;
import com.academathon.dto.UpdateProfileRequest;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RequestMapping("/users")
@RestController
public class UserController {
    private final UserService userService;
    private final S3Service s3Service;
    
    public UserController(UserService userService, S3Service s3Service) {
        this.userService = userService;
        this.s3Service = s3Service;
    }

    @GetMapping("/me")
    public ResponseEntity<User> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping("/")
    public ResponseEntity<List<User>> allUsers() {
        List <User> users = userService.allUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            // Return a safe subset of user data (not password hash, etc.)
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId());
            userProfile.put("userId", user.getId());
            userProfile.put("name", user.getDisplayUsername());
            userProfile.put("email", user.getEmail());
            userProfile.put("role", user.getRole());
            userProfile.put("profilePictureUrl", user.getProfilePictureUrl());
            userProfile.put("bio", user.getBio());
            userProfile.put("contactEmail", user.getContactEmail());
            userProfile.put("contactPhone", user.getContactPhone());
            return ResponseEntity.ok(userProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{email}")
    public ResponseEntity<String> deleteUserByEmail(@PathVariable String email) {
        try {
            userService.deleteUserByEmail(email);
            return ResponseEntity.ok("User with email " + email + " has been successfully deleted.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    @GetMapping("/check/{email}")
    public ResponseEntity<String> checkUserExists(@PathVariable String email) {
        try {
            boolean exists = userService.userExistsByEmail(email);
            if (exists) {
                return ResponseEntity.ok("User with email " + email + " EXISTS in database");
            } else {
                return ResponseEntity.ok("User with email " + email + " does NOT exist in database");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error checking user: " + e.getMessage());
        }
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Delete old profile picture if it exists
            String oldProfilePicture = currentUser.getProfilePictureUrl();
            if (oldProfilePicture != null && !oldProfilePicture.isEmpty()) {
                try {
                    s3Service.deleteProfilePicture(oldProfilePicture);
                } catch (Exception e) {
                    // Log error but continue with upload
                    System.err.println("Failed to delete old profile picture: " + e.getMessage());
                }
            }
            
            // Upload new profile picture
            String profilePictureUrl = s3Service.uploadProfilePicture(file, currentUser.getId());
            
            // Update user in database
            userService.updateProfilePictureUrl(currentUser.getId(), profilePictureUrl);
            
            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture uploaded successfully");
            response.put("profilePictureUrl", profilePictureUrl);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload profile picture: " + e.getMessage()));
        }
    }

    @DeleteMapping("/profile-picture")
    public ResponseEntity<?> deleteProfilePicture() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            String profilePictureUrl = currentUser.getProfilePictureUrl();
            if (profilePictureUrl == null || profilePictureUrl.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No profile picture to delete"));
            }
            
            // Delete from S3
            s3Service.deleteProfilePicture(profilePictureUrl);
            
            // Update user in database
            userService.updateProfilePictureUrl(currentUser.getId(), null);
            
            return ResponseEntity.ok(Map.of("message", "Profile picture deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete profile picture: " + e.getMessage()));
        }
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<?> getProfilePicture() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            String profilePictureUrl = currentUser.getProfilePictureUrl();
            
            Map<String, String> response = new HashMap<>();
            response.put("profilePictureUrl", profilePictureUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get profile picture: " + e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Update user profile
            User updatedUser = userService.updateUserProfile(currentUser.getId(), request);
            
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }
}