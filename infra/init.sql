-- KMRL IntelliDocs - PostgreSQL Init Script
-- This runs once when the container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create the database (already created by Docker env vars, this is a safety check)
SELECT 'KMRL IntelliDocs database initialized' AS status;
