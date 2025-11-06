-- Enable required PostgreSQL extensions

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional databases for testing
CREATE DATABASE payment_db_test;
GRANT ALL PRIVILEGES ON DATABASE payment_db_test TO payment_user;
