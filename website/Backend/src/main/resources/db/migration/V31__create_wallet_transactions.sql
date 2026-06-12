-- Wallet transactions table.
-- Every time money moves in or out of a student's wallet we write a row here.
-- This gives parents a clear audit trail: "I loaded $100 on June 10, $25 was
-- used for a Math lesson on June 11, I have $75 left."
--
-- type values:
--   TOPUP     — parent loaded funds (Stripe charged their card)
--   DEDUCTION — a booking was paid from the wallet
--   REFUND    — a wallet-paid booking was cancelled, funds restored

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id                        BIGSERIAL PRIMARY KEY,
    user_id                   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                      VARCHAR(20) NOT NULL,
    amount                    DECIMAL(10,2) NOT NULL,
    -- booking_id is null for top-ups, populated for deductions and refunds
    booking_id                BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    -- stripe_payment_intent_id is only set for TOPUP rows (so we can reconcile with Stripe)
    stripe_payment_intent_id  VARCHAR(255),
    description               TEXT,
    created_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);
