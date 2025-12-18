-- Add new booking statuses and payment tracking

-- First, modify the bookings table to add new columns
ALTER TABLE bookings 
ADD COLUMN payment_intent_id VARCHAR(255),
ADD COLUMN payment_status ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
ADD COLUMN amount DECIMAL(10,2),
ADD COLUMN rejection_reason TEXT;

-- Modify the status enum to include new statuses
-- Note: MySQL doesn't support direct ALTER for ENUM, so we need to modify the column
ALTER TABLE bookings 
MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PAID', 'SCHEDULED', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING';

-- Create payments table for tracking payment history
CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_payment_intent (stripe_payment_intent_id)
);

-- Create index for efficient querying
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_payments_status ON payments(status);


