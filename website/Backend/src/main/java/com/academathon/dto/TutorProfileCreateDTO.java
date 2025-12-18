package com.academathon.dto;

import java.math.BigDecimal;
import java.util.List;

public record TutorProfileCreateDTO(
  String email,
  String password,
  String displayName,
  String bio,
  BigDecimal hourlyRate,
  List<String> subjects    // ← parameterized
) { }