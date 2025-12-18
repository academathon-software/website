package com.academathon.responses;

public class LoginResponse {
    private String token;
    private Long expiresIn;
    private String role;
    private Long userId;
    private String username;

    public LoginResponse(String token, long expiresIn, String role, Long userId, String username){
        this.token = token;
        this.expiresIn = expiresIn;
        this.role = role;
        this.userId = userId;
        this.username = username;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    // Setters
    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
