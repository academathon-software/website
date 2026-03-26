-- Clean up OID references left by Hibernate @Lob mapping.
-- The @Lob annotation stored Large Object OIDs (numeric strings) instead of
-- actual text content. Reset these to empty strings.
UPDATE course_content SET lesson_plan = '' WHERE lesson_plan ~ '^\d+$';
UPDATE course_content SET syllabus = '' WHERE syllabus ~ '^\d+$';
