-- Create ENUM types for PostgreSQL
CREATE TYPE user_role AS ENUM ('STUDENT', 'TUTOR', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'PAID', 'SCHEDULED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- 1) Users (students + tutors + admins)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) Tutor profiles (one-to-one with users where role='TUTOR')
CREATE TABLE tutor_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  hourly_rate DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3) Subjects (e.g. Math, Physics, English)
CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 4) Join table: which tutor teaches which subjects
CREATE TABLE tutor_subjects (
  tutor_profile_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  PRIMARY KEY (tutor_profile_id, subject_id),
  FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 5) Bookings (a student books a tutor slot)
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  tutor_profile_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- 6) Reviews (students can review a completed booking)
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL UNIQUE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON tutor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
