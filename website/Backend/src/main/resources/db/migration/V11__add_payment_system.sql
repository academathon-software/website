-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- Add new booking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'PENDING';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create payments table for tracking payment history
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
