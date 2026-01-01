-- Create table for storing course content (lesson plans and syllabi)
CREATE TABLE IF NOT EXISTS course_content (
    id BIGSERIAL PRIMARY KEY,
    tutor_profile_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    lesson_plan TEXT,
    syllabus TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE (tutor_profile_id, subject_id)
);

-- Create trigger for updated_at
CREATE TRIGGER update_course_content_updated_at BEFORE UPDATE ON course_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
