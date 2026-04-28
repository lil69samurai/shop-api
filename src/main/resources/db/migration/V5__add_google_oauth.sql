-- V5: Add google_id column for Google OAuth login
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;
ALTER TABLE users MODIFY password VARCHAR(255) NULL;
CREATE INDEX idx_users_google_id ON users(google_id);
