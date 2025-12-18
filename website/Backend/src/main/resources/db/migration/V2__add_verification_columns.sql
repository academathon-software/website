-- Add verification columns to users table (with proper checks)
-- Check if verification_code column exists, if not add it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'academathon' 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'verification_code') = 0,
    'ALTER TABLE users ADD COLUMN verification_code VARCHAR(6)',
    'SELECT "verification_code column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if verification_expiration column exists, if not add it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'academathon' 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'verification_expiration') = 0,
    'ALTER TABLE users ADD COLUMN verification_expiration DATETIME',
    'SELECT "verification_expiration column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if enabled column exists, if not add it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'academathon' 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'enabled') = 0,
    'ALTER TABLE users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT "enabled column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;