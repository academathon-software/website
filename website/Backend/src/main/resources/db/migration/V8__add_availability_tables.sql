-- Tutor Availability System Tables

-- 1) Availability Schedules - Weekly recurring patterns
CREATE TABLE availability_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tutor_profile_id BIGINT NOT NULL,
  day_of_week TINYINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  INDEX idx_tutor_day (tutor_profile_id, day_of_week, is_active)
);

-- 2) Availability Exceptions - One-off additions or blocks
CREATE TABLE availability_exceptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tutor_profile_id BIGINT NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type ENUM('AVAILABLE', 'BLOCKED') NOT NULL,
  reason VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  INDEX idx_tutor_date (tutor_profile_id, exception_date)
);




