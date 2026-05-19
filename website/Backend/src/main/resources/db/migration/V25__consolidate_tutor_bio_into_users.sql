-- A tutor's bio used to live on tutor_profiles.bio (set during signup) AND
-- on users.bio (edited from the Profile page). Tutors editing their bio in
-- their profile updated only users.bio, so the booking modal kept showing the
-- stale signup-time bio from tutor_profiles.bio.
--
-- Consolidate to a single source of truth (users.bio): copy any non-empty
-- tutor_profiles.bio into users.bio when the user has none, then drop the
-- duplicate column.

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

UPDATE users u
SET bio = tp.bio
FROM tutor_profiles tp
WHERE u.id = tp.user_id
  AND (u.bio IS NULL OR u.bio = '')
  AND tp.bio IS NOT NULL
  AND tp.bio <> '';

ALTER TABLE tutor_profiles DROP COLUMN IF EXISTS bio;
