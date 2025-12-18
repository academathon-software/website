package com.academathon.dto;

import jakarta.validation.constraints.NotBlank;

public class AddSubjectRequest {
    
    @NotBlank(message = "Subject name is required")
    private String subjectName;
    
    private String status = "CURRENTLY_TEACHING"; // Default to currently teaching
    
    public AddSubjectRequest() {}
    
    public AddSubjectRequest(String subjectName, String status) {
        this.subjectName = subjectName;
        this.status = status;
    }
    
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}




