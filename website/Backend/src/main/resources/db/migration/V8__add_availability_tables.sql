-- Create exception type enum
CREATE TYPE exception_type AS ENUM ('AVAILABLE', 'BLOCKED');

-- 1) Availability Schedules - Weekly recurring patterns
CREATE TABLE IF NOT EXISTS availability_schedules (
  id BIGSERIAL PRIMARY KEY,
  tutor_profile_id BIGINT NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_avail_tutor_day ON availability_schedules(tutor_profile_id, day_of_week, is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_availability_schedules_updated_at BEFORE UPDATE ON availability_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2) Availability Exceptions - One-off additions or blocks
CREATE TABLE IF NOT EXISTS availability_exceptions (
  id BIGSERIAL PRIMARY KEY,
  tutor_profile_id BIGINT NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type exception_type NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_avail_exc_tutor_date ON availability_exceptions(tutor_profile_id, exception_date);

-- Create trigger for updated_at
CREATE TRIGGER update_availability_exceptions_updated_at BEFORE UPDATE ON availability_exceptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
