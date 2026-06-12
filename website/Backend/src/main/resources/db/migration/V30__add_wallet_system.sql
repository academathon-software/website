-- Student wallet system: opt-in balance that lessons are deducted from when the
-- tutor confirms, with auto-reload from a saved card when the balance drops low.

-- 1) Wallet (one-to-one with users)
CREATE TABLE IF NOT EXISTS wallets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
  auto_reload_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_reload_threshold DECIMAL(10,2),
  auto_reload_amount DECIMAL(10,2),
  default_payment_method_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2) Wallet transaction ledger (audit trail for every balance change)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  wallet_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  booking_id BIGINT,
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'SUCCEEDED',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- Dedupe wallet credits by Stripe intent id (idempotent webhook/confirm handling).
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_intent
  ON wallet_transactions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- 3) Record which payment source a booking will use (CARD default keeps existing flow)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_source VARCHAR(50) NOT NULL DEFAULT 'CARD';

-- Keep updated_at fresh on wallets (reuses function defined in V1)
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
