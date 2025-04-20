ALTER TABLE users
ADD COLUMN sso_id VARCHAR(255),
ADD COLUMN sso_provider VARCHAR(255),
ADD UNIQUE (sso_id,sso_provider);
