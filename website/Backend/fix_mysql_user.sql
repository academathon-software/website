-- Fix MySQL User for Academathon Application
-- Run this script as root user in MySQL

-- Drop the existing user if it exists
DROP USER IF EXISTS 'academathon'@'localhost';

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS academathon;

-- Create the user with password
CREATE USER 'academathon'@'localhost' IDENTIFIED BY 'academathonpass';

-- Grant all privileges on the academathon database
GRANT ALL PRIVILEGES ON academathon.* TO 'academathon'@'localhost';

-- Refresh privileges
FLUSH PRIVILEGES;

-- Verify the user was created
SELECT user, host FROM mysql.user WHERE user = 'academathon';

-- Show message
SELECT 'User academathon created successfully!' AS status;


