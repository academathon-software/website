package com.academathon.dto;

public class PlatformStatisticsDTO {
    private Long totalUsers;
    private Long totalStudents;
    private Long totalTutors;
    private Long activeStudents;
    private Long activeTutors;
    private Long totalBookings;
    private Long completedBookings;
    private Long pendingBookings;
    private Long cancelledBookings;
    private Double totalRevenue;
    private Double averageBookingValue;
    private Double userGrowthRate;
    private Double bookingGrowthRate;
    
    public PlatformStatisticsDTO() {}
    
    public PlatformStatisticsDTO(Long totalUsers, Long totalStudents, Long totalTutors,
                                Long activeStudents, Long activeTutors, Long totalBookings,
                                Long completedBookings, Long pendingBookings, Long cancelledBookings,
                                Double totalRevenue, Double averageBookingValue,
                                Double userGrowthRate, Double bookingGrowthRate) {
        this.totalUsers = totalUsers;
        this.totalStudents = totalStudents;
        this.totalTutors = totalTutors;
        this.activeStudents = activeStudents;
        this.activeTutors = activeTutors;
        this.totalBookings = totalBookings;
        this.completedBookings = completedBookings;
        this.pendingBookings = pendingBookings;
        this.cancelledBookings = cancelledBookings;
        this.totalRevenue = totalRevenue;
        this.averageBookingValue = averageBookingValue;
        this.userGrowthRate = userGrowthRate;
        this.bookingGrowthRate = bookingGrowthRate;
    }
    
    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    
    public Long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }
    
    public Long getTotalTutors() { return totalTutors; }
    public void setTotalTutors(Long totalTutors) { this.totalTutors = totalTutors; }
    
    public Long getActiveStudents() { return activeStudents; }
    public void setActiveStudents(Long activeStudents) { this.activeStudents = activeStudents; }
    
    public Long getActiveTutors() { return activeTutors; }
    public void setActiveTutors(Long activeTutors) { this.activeTutors = activeTutors; }
    
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    
    public Long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Long completedBookings) { this.completedBookings = completedBookings; }
    
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    
    public Long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(Long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
    
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public Double getAverageBookingValue() { return averageBookingValue; }
    public void setAverageBookingValue(Double averageBookingValue) { this.averageBookingValue = averageBookingValue; }
    
    public Double getUserGrowthRate() { return userGrowthRate; }
    public void setUserGrowthRate(Double userGrowthRate) { this.userGrowthRate = userGrowthRate; }
    
    public Double getBookingGrowthRate() { return bookingGrowthRate; }
    public void setBookingGrowthRate(Double bookingGrowthRate) { this.bookingGrowthRate = bookingGrowthRate; }
}

