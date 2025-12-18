package com.academathon.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public record TutorProfileDTO(
    Long id,
    UserDTO user,
    String displayName,
    String bio,
    BigDecimal hourlyRate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<SubjectDTO> subjects
) {}