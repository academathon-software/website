package com.academathon.dto;

import java.time.LocalDateTime;

public class BookingRequestDTO {
    private Long tutorProfileId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private String gradeLevel;
    /**
     * Stripe payment method id collected via SetupIntent on the booking page.
     * The backend uses this to auto-charge the moment the tutor confirms.
     */
    private String paymentMethodId;

    public BookingRequestDTO() {
    }

    public BookingRequestDTO(Long tutorProfileId, LocalDateTime startTime, LocalDateTime endTime, String notes, String gradeLevel) {
        this.tutorProfileId = tutorProfileId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
        this.gradeLevel = gradeLevel;
    }

    public Long getTutorProfileId() {
        return tutorProfileId;
    }

    public void setTutorProfileId(Long tutorProfileId) {
        this.tutorProfileId = tutorProfileId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}

















