package com.academathon.dto;

import java.time.LocalDateTime;

public class BookingRequestDTO {
    private Long tutorProfileId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;

    public BookingRequestDTO() {
    }

    public BookingRequestDTO(Long tutorProfileId, LocalDateTime startTime, LocalDateTime endTime, String notes) {
        this.tutorProfileId = tutorProfileId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
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
}

















