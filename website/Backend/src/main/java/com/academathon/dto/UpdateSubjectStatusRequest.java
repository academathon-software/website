package com.academathon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateSubjectStatusRequest {
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "CURRENTLY_TEACHING|PAST", message = "Status must be either CURRENTLY_TEACHING or PAST")
    private String status;
    
    public UpdateSubjectStatusRequest() {}
    
    public UpdateSubjectStatusRequest(String status) {
        this.status = status;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}




