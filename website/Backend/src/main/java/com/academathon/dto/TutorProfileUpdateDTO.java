package com.academathon.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record TutorProfileUpdateDTO(
    @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters")
    String displayName,

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    String bio,

    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than 0")
    BigDecimal hourlyRate,

    List<String> subjects,

    List<String> gradeLevels
) {}
