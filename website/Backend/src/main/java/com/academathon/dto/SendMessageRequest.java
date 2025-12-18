package com.academathon.dto;

public class SendMessageRequest {
    private Long recipientId;
    private Long bookingId;
    private String content;

    public SendMessageRequest() {
    }

    public SendMessageRequest(Long recipientId, Long bookingId, String content) {
        this.recipientId = recipientId;
        this.bookingId = bookingId;
        this.content = content;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}










