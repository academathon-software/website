-- Create tutor_invitations table
CREATE TABLE IF NOT EXISTS tutor_invitations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('PENDING','USED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME NULL,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_status (status)
);
