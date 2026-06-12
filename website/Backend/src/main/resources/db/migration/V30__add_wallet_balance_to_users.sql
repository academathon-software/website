-- Add wallet balance to users table.
-- Starts at 0.00 for every user. Only students will ever have a non-zero balance
-- but storing it on the users table keeps the schema simple — no join needed
-- when we check the balance at booking time.
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00;
