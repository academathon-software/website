-- Add status tracking to tutor_subjects

ALTER TABLE tutor_subjects 
  ADD COLUMN status ENUM('CURRENTLY_TEACHING', 'PAST') NOT NULL DEFAULT 'CURRENTLY_TEACHING',
  ADD COLUMN added_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN removed_date DATETIME NULL;

-- Set all existing subjects to currently teaching (default already handles this)
-- No additional data migration needed




