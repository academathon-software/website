-- Fix Flyway V18 failed migration issue
-- Run this in MySQL:
-- mysql -u root -p academathon < fix_flyway_v18.sql

USE academathon;

-- Delete the failed V18 migration record
DELETE FROM flyway_schema_history WHERE version = '18';

-- Verify the deletion
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;

