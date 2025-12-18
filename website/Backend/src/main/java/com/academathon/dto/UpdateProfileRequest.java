package com.academathon.dto;

public class UpdateProfileRequest {
    private String username;
    private String email;
    private String bio;
    private String pronouns;
    private String contactEmail;
    private String contactPhone;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String username, String email, String bio, String pronouns, String contactEmail, String contactPhone) {
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.pronouns = pronouns;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPronouns() {
        return pronouns;
    }

    public void setPronouns(String pronouns) {
        this.pronouns = pronouns;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }
}

















