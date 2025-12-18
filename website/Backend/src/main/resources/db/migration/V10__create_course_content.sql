-- Create table for storing course content (lesson plans and syllabi)
CREATE TABLE course_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tutor_profile_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    lesson_plan TEXT,
    syllabus TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_profile_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tutor_subject (tutor_profile_id, subject_id)
);




