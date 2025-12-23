package com.academathon.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class UserStatisticsDTO {
    private Long totalUsers;
    private Long totalStudents;
    private Long totalTutors;
    private Long totalAdmins;
    private Long activeUsers;
    private Long inactiveUsers;
    private Map<String, Long> usersByMonth;
    private Double monthlyGrowthRate;
    private LocalDateTime oldestUserDate;
    private LocalDateTime newestUserDate;
    
    public UserStatisticsDTO() {}
    
    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    
    public Long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }
    
    public Long getTotalTutors() { return totalTutors; }
    public void setTotalTutors(Long totalTutors) { this.totalTutors = totalTutors; }
    
    public Long getTotalAdmins() { return totalAdmins; }
    public void setTotalAdmins(Long totalAdmins) { this.totalAdmins = totalAdmins; }
    
    public Long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
    
    public Long getInactiveUsers() { return inactiveUsers; }
    public void setInactiveUsers(Long inactiveUsers) { this.inactiveUsers = inactiveUsers; }
    
    public Map<String, Long> getUsersByMonth() { return usersByMonth; }
    public void setUsersByMonth(Map<String, Long> usersByMonth) { this.usersByMonth = usersByMonth; }
    
    public Double getMonthlyGrowthRate() { return monthlyGrowthRate; }
    public void setMonthlyGrowthRate(Double monthlyGrowthRate) { this.monthlyGrowthRate = monthlyGrowthRate; }
    
    public LocalDateTime getOldestUserDate() { return oldestUserDate; }
    public void setOldestUserDate(LocalDateTime oldestUserDate) { this.oldestUserDate = oldestUserDate; }
    
    public LocalDateTime getNewestUserDate() { return newestUserDate; }
    public void setNewestUserDate(LocalDateTime newestUserDate) { this.newestUserDate = newestUserDate; }
}

