-- PostgreSQL Schema Migration Script for Urban Flood Nowcasting System
-- Creates ONLY the 'users' table as requested

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for optimized authentication lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
