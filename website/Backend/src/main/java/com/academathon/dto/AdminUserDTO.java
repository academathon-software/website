package com.academathon.dto;

import java.time.LocalDateTime;

public class AdminUserDTO {
    private Long userId;
    private String email;
    private String username;
    private String role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long totalBookings;
    private Long completedBookings;
    private String profilePictureUrl;
    private String bio;
    
    public AdminUserDTO() {}
    
    public AdminUserDTO(Long userId, String email, String username, String role, 
                       Boolean enabled, LocalDateTime createdAt, LocalDateTime updatedAt,
                       Long totalBookings, Long completedBookings, 
                       String profilePictureUrl, String bio) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.totalBookings = totalBookings;
        this.completedBookings = completedBookings;
        this.profilePictureUrl = profilePictureUrl;
        this.bio = bio;
    }
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    
    public Long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Long completedBookings) { this.completedBookings = completedBookings; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}

