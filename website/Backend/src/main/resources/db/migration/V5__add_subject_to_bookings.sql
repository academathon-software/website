-- Add subject column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
