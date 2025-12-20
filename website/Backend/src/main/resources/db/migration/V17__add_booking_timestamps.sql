-- Add timestamp tracking fields for booking deadlines
-- V17: Add tutor response and reschedule response deadline tracking

ALTER TABLE bookings 
ADD COLUMN tutor_response_deadline DATETIME,
ADD COLUMN reschedule_request_time DATETIME,
ADD COLUMN reschedule_response_deadline DATETIME;

-- Create indexes for efficient querying of deadlines
CREATE INDEX idx_bookings_tutor_deadline ON bookings(tutor_response_deadline);
CREATE INDEX idx_bookings_reschedule_deadline ON bookings(reschedule_response_deadline);

