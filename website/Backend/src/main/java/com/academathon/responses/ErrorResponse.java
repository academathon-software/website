package com.academathon.responses;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class ErrorResponse {
    private String message;
    private String timestamp;
    
    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now(ZoneId.of("America/New_York")).toString();
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}



