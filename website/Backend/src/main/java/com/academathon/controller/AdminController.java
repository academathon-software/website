package com.academathon.controller;

import com.academathon.dto.AdminUserDTO;
import com.academathon.dto.BookingResponseDTO;
import com.academathon.dto.BookingStatisticsDTO;
import com.academathon.dto.PlatformStatisticsDTO;
import com.academathon.dto.UserStatisticsDTO;
import com.academathon.model.Booking;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.UserRepository;
import com.academathon.service.AdminStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminController {
    
    @Autowired
    private AdminStatisticsService adminStatisticsService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @GetMapping("/statistics")
    public ResponseEntity<PlatformStatisticsDTO> getPlatformStatistics() {
        PlatformStatisticsDTO statistics = adminStatisticsService.getPlatformStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/users")
    public ResponseEntity<UserStatisticsDTO> getUserStatistics() {
        UserStatisticsDTO statistics = adminStatisticsService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/bookings")
    public ResponseEntity<BookingStatisticsDTO> getBookingStatistics() {
        BookingStatisticsDTO statistics = adminStatisticsService.getBookingStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String search) {
        
        List<User> users = userRepository.findAll();
        
        // Apply filters
        if (role != null && !role.isEmpty()) {
            User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
            users = users.stream()
                .filter(u -> u.getRole() == roleEnum)
                .collect(Collectors.toList());
        }
        
        if (enabled != null) {
            users = users.stream()
                .filter(u -> u.isEnabled() == enabled)
                .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            users = users.stream()
                .filter(u -> u.getEmail().toLowerCase().contains(searchLower) ||
                           u.getUsername().toLowerCase().contains(searchLower))
                .collect(Collectors.toList());
        }
        
        // Convert to DTOs
        List<AdminUserDTO> userDTOs = users.stream()
            .map(this::convertToAdminUserDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(userDTOs);
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDTO> getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        AdminUserDTO userDTO = convertToAdminUserDTO(user);
        return ResponseEntity.ok(userDTO);
    }
    
    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Boolean enabled = request.get("enabled");
        if (enabled != null) {
            user.setEnabled(enabled);
            userRepository.save(user);
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User status updated successfully");
        response.put("status", enabled ? "active" : "inactive");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long tutorId) {
        
        List<Booking> bookings = bookingRepository.findAll();
        
        // Apply filters
        if (status != null && !status.isEmpty()) {
            Booking.BookingStatus statusEnum = Booking.BookingStatus.valueOf(status.toUpperCase());
            bookings = bookings.stream()
                .filter(b -> b.getStatus() == statusEnum)
                .collect(Collectors.toList());
        }
        
        if (studentId != null) {
            bookings = bookings.stream()
                .filter(b -> b.getStudent().getId().equals(studentId))
                .collect(Collectors.toList());
        }
        
        if (tutorId != null) {
            bookings = bookings.stream()
                .filter(b -> b.getTutor().getId().equals(tutorId))
                .collect(Collectors.toList());
        }
        
        // Sort by most recent first
        bookings.sort((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()));
        
        // Convert to DTOs
        List<BookingResponseDTO> bookingDTOs = bookings.stream()
            .map(this::convertToBookingResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingDTOs);
    }
    
    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingDetails(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        BookingResponseDTO bookingDTO = convertToBookingResponseDTO(booking);
        return ResponseEntity.ok(bookingDTO);
    }
    
    // Helper methods to convert entities to DTOs
    private AdminUserDTO convertToAdminUserDTO(User user) {
        // Count bookings for this user
        Long totalBookings = 0L;
        Long completedBookings = 0L;
        
        if (user.getRole() == User.Role.STUDENT) {
            List<Booking> userBookings = bookingRepository.findByStudentId(user.getId());
            totalBookings = (long) userBookings.size();
            completedBookings = userBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .count();
        } else if (user.getRole() == User.Role.TUTOR) {
            List<Booking> userBookings = bookingRepository.findByTutorUserId(user.getId());
            totalBookings = (long) userBookings.size();
            completedBookings = userBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .count();
        }
        
        return new AdminUserDTO(
            user.getId(),
            user.getEmail(),
            user.getDisplayUsername(),
            user.getRole().name(),
            user.isEnabled(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            totalBookings,
            completedBookings,
            user.getProfilePictureUrl(),
            user.getBio()
        );
    }
    
    private BookingResponseDTO convertToBookingResponseDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setStudentId(booking.getStudent().getId());
        dto.setStudentName(booking.getStudent().getUsername());
        dto.setStudentUserId(booking.getStudent().getId());
        dto.setTutorProfileId(booking.getTutor().getId());
        dto.setTutorName(booking.getTutor().getUser().getUsername());
        dto.setTutorUserId(booking.getTutor().getUser().getId());
        dto.setSubject(booking.getSubject());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus().toString());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        dto.setHourlyRate(booking.getTutor().getHourlyRate());
        dto.setHasRescheduleRequest(booking.getHasRescheduleRequest());
        dto.setOriginalStartTime(booking.getOriginalStartTime());
        dto.setOriginalEndTime(booking.getOriginalEndTime());
        dto.setRequestedStartTime(booking.getRequestedStartTime());
        dto.setRequestedEndTime(booking.getRequestedEndTime());
        dto.setTutorResponseDeadline(booking.getTutorResponseDeadline());
        dto.setRescheduleRequestTime(booking.getRescheduleRequestTime());
        dto.setRescheduleResponseDeadline(booking.getRescheduleResponseDeadline());
        return dto;
    }
}

