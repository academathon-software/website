package com.academathon.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class AddAvailabilityExceptionRequest {
    
    @NotNull
    private LocalDate exceptionDate;
    
    @NotNull
    private LocalTime startTime;
    
    @NotNull
    private LocalTime endTime;
    
    @NotNull
    private String type; // AVAILABLE or BLOCKED
    
    private String reason;
    
    public AddAvailabilityExceptionRequest() {}
    
    public AddAvailabilityExceptionRequest(LocalDate exceptionDate, LocalTime startTime, 
                                          LocalTime endTime, String type, String reason) {
        this.exceptionDate = exceptionDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.reason = reason;
    }
    
    // Getters and Setters
    public LocalDate getExceptionDate() {
        return exceptionDate;
    }
    
    public void setExceptionDate(LocalDate exceptionDate) {
        this.exceptionDate = exceptionDate;
    }
    
    public LocalTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}




