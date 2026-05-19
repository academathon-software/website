-- Workflow v2: store the Stripe payment method id captured at booking time so we can
-- auto-charge the moment the tutor confirms.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method_id VARCHAR(255);

-- Store the student's Stripe customer id once, reused across bookings.
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
