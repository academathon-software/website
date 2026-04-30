-- Drop unused user/tutor profile fields that are not surfaced anywhere on the platform.
-- These were collected during signup but never displayed, edited, or filtered on.

ALTER TABLE users DROP COLUMN IF EXISTS pronouns;
ALTER TABLE users DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE tutor_profiles DROP COLUMN IF EXISTS school_email;
