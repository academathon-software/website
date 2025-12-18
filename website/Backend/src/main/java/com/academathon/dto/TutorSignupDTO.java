package com.academathon.dto;

import java.math.BigDecimal;
import java.util.List;

public record TutorSignupDTO(
    String token,
    String firstName,
    String lastName,
    String email,
    String password,
    String university,
    String program,
    String academicYear,
    String schoolEmail,
    List<String> gradeLevels,
    List<String> subjects,
    String bio,
    BigDecimal hourlyRate
) {}







