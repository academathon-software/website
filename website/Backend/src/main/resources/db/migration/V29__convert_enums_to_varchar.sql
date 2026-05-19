-- PostgreSQL custom ENUM types are incompatible with Hibernate's @Enumerated(EnumType.STRING)
-- which writes plain strings. Convert all enum columns to VARCHAR.

ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE bookings ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text;
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
