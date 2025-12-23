package com.academathon.dto;

import java.util.Map;

public class BookingStatisticsDTO {
    private Long totalBookings;
    private Long completedBookings;
    private Long pendingBookings;
    private Long scheduledBookings;
    private Long cancelledBookings;
    private Long rejectedBookings;
    private Double completionRate;
    private Double cancellationRate;
    private Map<String, Long> bookingsByMonth;
    private Map<String, Long> bookingsBySubject;
    private Double averageBookingValue;
    private Double totalRevenue;
    
    public BookingStatisticsDTO() {}
    
    // Getters and Setters
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    
    public Long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Long completedBookings) { this.completedBookings = completedBookings; }
    
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    
    public Long getScheduledBookings() { return scheduledBookings; }
    public void setScheduledBookings(Long scheduledBookings) { this.scheduledBookings = scheduledBookings; }
    
    public Long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(Long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
    
    public Long getRejectedBookings() { return rejectedBookings; }
    public void setRejectedBookings(Long rejectedBookings) { this.rejectedBookings = rejectedBookings; }
    
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    
    public Double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }
    
    public Map<String, Long> getBookingsByMonth() { return bookingsByMonth; }
    public void setBookingsByMonth(Map<String, Long> bookingsByMonth) { this.bookingsByMonth = bookingsByMonth; }
    
    public Map<String, Long> getBookingsBySubject() { return bookingsBySubject; }
    public void setBookingsBySubject(Map<String, Long> bookingsBySubject) { this.bookingsBySubject = bookingsBySubject; }
    
    public Double getAverageBookingValue() { return averageBookingValue; }
    public void setAverageBookingValue(Double averageBookingValue) { this.averageBookingValue = averageBookingValue; }
    
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
}

