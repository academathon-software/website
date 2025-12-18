package com.academathon.dto;

import java.time.LocalDateTime;

public record AvailableSlotDTO(
    LocalDateTime startTime,
    LocalDateTime endTime,
    Integer durationMinutes
) {}
