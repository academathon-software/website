-- PostgreSQL custom ENUM types are incompatible with Hibernate's @Enumerated(EnumType.STRING)
-- which writes plain strings. Convert ALL enum columns to VARCHAR.

ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE bookings ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text;
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE tutor_subjects ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE tutor_invitations ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE availability_exceptions ALTER COLUMN type TYPE VARCHAR(50) USING type::text;
