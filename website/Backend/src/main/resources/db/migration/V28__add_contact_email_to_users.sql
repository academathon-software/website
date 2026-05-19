-- contact_email was present in the User entity but never added via migration.
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
