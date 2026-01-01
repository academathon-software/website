-- Add new fields to tutor_profiles table
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS university VARCHAR(255);
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS program VARCHAR(255);
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS academic_year VARCHAR(100);
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS school_email VARCHAR(255);
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS grade_levels TEXT;
