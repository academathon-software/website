-- Re-add pronouns (was dropped in V23 but is now actually used on profile views)
-- and add student_grade so students can declare which grade they're learning at.
-- Both are nullable so existing users aren't blocked; new signups will require them at the API layer.

ALTER TABLE users ADD COLUMN IF NOT EXISTS pronouns VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_grade VARCHAR(50);
