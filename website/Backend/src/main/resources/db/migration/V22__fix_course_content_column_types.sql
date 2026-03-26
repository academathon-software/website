-- Fix course_content columns that were changed from TEXT to OID
-- by Hibernate's ddl-auto=update when @Lob was present on the entity.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'course_content'
        AND column_name = 'lesson_plan'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE course_content ALTER COLUMN lesson_plan TYPE TEXT USING '';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'course_content'
        AND column_name = 'syllabus'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE course_content ALTER COLUMN syllabus TYPE TEXT USING '';
    END IF;
END
$$;

UPDATE course_content SET lesson_plan = '' WHERE lesson_plan ~ '^\d+$';
UPDATE course_content SET syllabus = '' WHERE syllabus ~ '^\d+$';
