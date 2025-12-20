-- Connect to your database first: mysql -u root -p academathon
-- Then run these commands:

USE academathon;

-- Add columns if they don't exist (ignore errors if they already exist)
ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE messages ADD COLUMN edited_at DATETIME;

-- Create index if it doesn't exist
CREATE INDEX idx_messages_edited ON messages(is_edited);

-- Clean up Flyway history - remove the failed migration record
DELETE FROM flyway_schema_history WHERE version = '18';

-- Verify the table structure
DESCRIBE messages;

-- Verify Flyway history
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;

