-- Allow multiple reviews per booking (one from student, one from tutor)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_key;

-- Add reviewer_id to track who left the review
ALTER TABLE reviews ADD COLUMN reviewer_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

-- Make rating nullable (tutors leave text feedback only, no star rating)
ALTER TABLE reviews ALTER COLUMN rating DROP NOT NULL;

-- Unique constraint: one review per booking per reviewer
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_reviewer_unique UNIQUE (booking_id, reviewer_id);
