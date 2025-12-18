package com.academathon.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilityExceptionDTO(
    Long id,
    Long tutorProfileId,
    LocalDate exceptionDate,
    LocalTime startTime,
    LocalTime endTime,
    String type,
    String reason
) {}




