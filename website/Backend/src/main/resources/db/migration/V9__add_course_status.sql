-- Create course status enum
CREATE TYPE course_status AS ENUM ('CURRENTLY_TEACHING', 'PAST');

-- Add status tracking to tutor_subjects
ALTER TABLE tutor_subjects ADD COLUMN IF NOT EXISTS status course_status NOT NULL DEFAULT 'CURRENTLY_TEACHING';
ALTER TABLE tutor_subjects ADD COLUMN IF NOT EXISTS added_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tutor_subjects ADD COLUMN IF NOT EXISTS removed_date TIMESTAMP;
