package com.academathon.dto;

public class UpdateCourseContentRequest {
    private String subjectName;
    private String lessonPlan;
    private String syllabus;
    
    public UpdateCourseContentRequest() {}
    
    public UpdateCourseContentRequest(String subjectName, String lessonPlan, String syllabus) {
        this.subjectName = subjectName;
        this.lessonPlan = lessonPlan;
        this.syllabus = syllabus;
    }
    
    // Getters and Setters
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
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
}




