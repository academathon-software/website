package com.academathon.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.List;

public class SetAvailabilityScheduleRequest {
    
    @NotNull
    private List<ScheduleEntry> schedules;
    
    public static class ScheduleEntry {
        @NotNull
        @Min(0)
        @Max(6)
        private Integer dayOfWeek;
        
        @NotNull
        private LocalTime startTime;
        
        @NotNull
        private LocalTime endTime;
        
        private Boolean isActive = true;
        
        public ScheduleEntry() {}
        
        public ScheduleEntry(Integer dayOfWeek, LocalTime startTime, LocalTime endTime) {
            this.dayOfWeek = dayOfWeek;
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        // Getters and Setters
        public Integer getDayOfWeek() {
            return dayOfWeek;
        }
        
        public void setDayOfWeek(Integer dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
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
        
        public Boolean getIsActive() {
            return isActive;
        }
        
        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }
    }
    
    public SetAvailabilityScheduleRequest() {}
    
    public List<ScheduleEntry> getSchedules() {
        return schedules;
    }
    
    public void setSchedules(List<ScheduleEntry> schedules) {
        this.schedules = schedules;
    }
}




