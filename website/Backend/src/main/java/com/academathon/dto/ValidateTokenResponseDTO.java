package com.academathon.dto;

public record ValidateTokenResponseDTO(
    boolean valid,
    String email,
    String message
) {}







