package com.academathon.dto;

import java.time.LocalDateTime;

public record TutorSubjectDTO(
    Long subjectId,
    String subjectName,
    String status,
    LocalDateTime addedDate,
    LocalDateTime removedDate
) {}




