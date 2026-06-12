-- Track how a booking was paid: via a saved card (CARD) or the wallet (WALLET).
-- This is needed so the refund logic knows which path to take:
--   CARD   → issue a Stripe refund
--   WALLET → just restore the balance in the DB, no Stripe call needed
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_source VARCHAR(10) NOT NULL DEFAULT 'CARD';
