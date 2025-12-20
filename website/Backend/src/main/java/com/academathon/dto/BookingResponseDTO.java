package com.academathon.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.academathon.model.Booking;

public class BookingResponseDTO {
    private Long id;
    private Long tutorProfileId;
    private Long tutorUserId;
    private String tutorName;
    private String tutorProfilePictureUrl;
    private Long studentId;
    private Long studentUserId;
    private String studentName;
    private String studentProfilePictureUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String paymentStatus;
    private String subject;
    private BigDecimal hourlyRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean hasRescheduleRequest;
    private LocalDateTime originalStartTime;
    private LocalDateTime originalEndTime;
    private LocalDateTime requestedStartTime;
    private LocalDateTime requestedEndTime;
    private LocalDateTime tutorResponseDeadline;
    private LocalDateTime rescheduleRequestTime;
    private LocalDateTime rescheduleResponseDeadline;

    public BookingResponseDTO() {
    }

    public BookingResponseDTO(Booking booking) {
        this.id = booking.getId();
        this.tutorProfileId = booking.getTutor().getId();
        this.tutorUserId = booking.getTutor().getUser().getId();
        this.tutorName = booking.getTutor().getDisplayName();
        this.tutorProfilePictureUrl = booking.getTutor().getUser().getProfilePictureUrl();
        this.studentId = booking.getStudent().getId();
        this.studentUserId = booking.getStudent().getId();
        this.studentName = booking.getStudent().getDisplayUsername();
        this.studentProfilePictureUrl = booking.getStudent().getProfilePictureUrl();
        this.startTime = booking.getStartTime();
        this.endTime = booking.getEndTime();
        this.status = booking.getStatus().toString();
        this.paymentStatus = booking.getPaymentStatus() != null ? booking.getPaymentStatus().toString() : "PENDING";
        this.subject = booking.getSubject();
        this.hourlyRate = booking.getTutor().getHourlyRate();
        this.createdAt = booking.getCreatedAt();
        this.updatedAt = booking.getUpdatedAt();
        this.hasRescheduleRequest = booking.getHasRescheduleRequest();
        this.originalStartTime = booking.getOriginalStartTime();
        this.originalEndTime = booking.getOriginalEndTime();
        this.requestedStartTime = booking.getRequestedStartTime();
        this.requestedEndTime = booking.getRequestedEndTime();
        this.tutorResponseDeadline = booking.getTutorResponseDeadline();
        this.rescheduleRequestTime = booking.getRescheduleRequestTime();
        this.rescheduleResponseDeadline = booking.getRescheduleResponseDeadline();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTutorProfileId() {
        return tutorProfileId;
    }

    public void setTutorProfileId(Long tutorProfileId) {
        this.tutorProfileId = tutorProfileId;
    }

    public Long getTutorUserId() {
        return tutorUserId;
    }

    public void setTutorUserId(Long tutorUserId) {
        this.tutorUserId = tutorUserId;
    }

    public String getTutorName() {
        return tutorName;
    }

    public void setTutorName(String tutorName) {
        this.tutorName = tutorName;
    }

    public String getTutorProfilePictureUrl() {
        return tutorProfilePictureUrl;
    }

    public void setTutorProfilePictureUrl(String tutorProfilePictureUrl) {
        this.tutorProfilePictureUrl = tutorProfilePictureUrl;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getStudentUserId() {
        return studentUserId;
    }

    public void setStudentUserId(Long studentUserId) {
        this.studentUserId = studentUserId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentProfilePictureUrl() {
        return studentProfilePictureUrl;
    }

    public void setStudentProfilePictureUrl(String studentProfilePictureUrl) {
        this.studentProfilePictureUrl = studentProfilePictureUrl;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getHasRescheduleRequest() {
        return hasRescheduleRequest;
    }

    public void setHasRescheduleRequest(Boolean hasRescheduleRequest) {
        this.hasRescheduleRequest = hasRescheduleRequest;
    }

    public LocalDateTime getOriginalStartTime() {
        return originalStartTime;
    }

    public void setOriginalStartTime(LocalDateTime originalStartTime) {
        this.originalStartTime = originalStartTime;
    }

    public LocalDateTime getOriginalEndTime() {
        return originalEndTime;
    }

    public void setOriginalEndTime(LocalDateTime originalEndTime) {
        this.originalEndTime = originalEndTime;
    }

    public LocalDateTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public void setRequestedStartTime(LocalDateTime requestedStartTime) {
        this.requestedStartTime = requestedStartTime;
    }

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(LocalDateTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
    }

    public LocalDateTime getTutorResponseDeadline() {
        return tutorResponseDeadline;
    }

    public void setTutorResponseDeadline(LocalDateTime tutorResponseDeadline) {
        this.tutorResponseDeadline = tutorResponseDeadline;
    }

    public LocalDateTime getRescheduleRequestTime() {
        return rescheduleRequestTime;
    }

    public void setRescheduleRequestTime(LocalDateTime rescheduleRequestTime) {
        this.rescheduleRequestTime = rescheduleRequestTime;
    }

    public LocalDateTime getRescheduleResponseDeadline() {
        return rescheduleResponseDeadline;
    }

    public void setRescheduleResponseDeadline(LocalDateTime rescheduleResponseDeadline) {
        this.rescheduleResponseDeadline = rescheduleResponseDeadline;
    }
}










