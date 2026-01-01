-- Add timestamp tracking fields for booking deadlines
-- V17: Add tutor response and reschedule response deadline tracking

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tutor_response_deadline TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_request_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_response_deadline TIMESTAMP;

-- Add reschedule tracking fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS has_reschedule_request BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_start_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_end_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS requested_start_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS requested_end_time TIMESTAMP;

-- Create indexes for efficient querying of deadlines
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_deadline ON bookings(tutor_response_deadline);
CREATE INDEX IF NOT EXISTS idx_bookings_reschedule_deadline ON bookings(reschedule_response_deadline);
