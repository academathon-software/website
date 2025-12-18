package com.academathon.dto;

import java.time.LocalDateTime;

public class CourseContentDTO {
    private Long id;
    private String subjectName;
    private Long subjectId;
    private String lessonPlan;
    private String syllabus;
    private LocalDateTime updatedAt;
    
    public CourseContentDTO() {}
    
    public CourseContentDTO(Long id, String subjectName, Long subjectId, String lessonPlan, String syllabus, LocalDateTime updatedAt) {
        this.id = id;
        this.subjectName = subjectName;
        this.subjectId = subjectId;
        this.lessonPlan = lessonPlan;
        this.syllabus = syllabus;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    
    public Long getSubjectId() {
        return subjectId;
    }
    
    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }
    
    public String getLessonPlan() {
        return lessonPlan;
    }
    
    public void setLessonPlan(String lessonPlan) {
        this.lessonPlan = lessonPlan;
    }
    
    public String getSyllabus() {
        return syllabus;
    }
    
    public void setSyllabus(String syllabus) {
        this.syllabus = syllabus;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}




