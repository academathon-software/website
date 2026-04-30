package com.academathon.dto;

import java.time.LocalDateTime;

public record UserDTO(
    Long id,
    String email,
    String role,
    String profilePictureUrl,
    String pronouns,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
