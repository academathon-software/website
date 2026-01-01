-- Create invitation status enum
CREATE TYPE invitation_status AS ENUM ('PENDING', 'USED', 'EXPIRED');

-- Create tutor_invitations table
CREATE TABLE IF NOT EXISTS tutor_invitations (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutor_inv_token ON tutor_invitations(token);
CREATE INDEX IF NOT EXISTS idx_tutor_inv_email ON tutor_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tutor_inv_status ON tutor_invitations(status);
