--create a migration to add roles to users table 
ALTER TABLE users
ADD COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user';