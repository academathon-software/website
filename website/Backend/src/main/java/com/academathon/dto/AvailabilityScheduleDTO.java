package com.academathon.dto;

import java.time.LocalTime;

public record AvailabilityScheduleDTO(
    Long id,
    Long tutorProfileId,
    Integer dayOfWeek,
    LocalTime startTime,
    LocalTime endTime,
    Boolean isActive
) {}




