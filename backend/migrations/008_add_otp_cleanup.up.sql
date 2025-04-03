-- -- Add index for efficient cleanup of expired OTPs
-- CREATE INDEX idx_otps_cleanup ON otps(expires_at) WHERE used = false;

-- -- Create a function to clean up expired OTPs
-- CREATE OR REPLACE FUNCTION cleanup_expired_otps() RETURNS void AS $$
-- BEGIN
--     DELETE FROM otps WHERE expires_at < NOW();
-- END;
-- $$ LANGUAGE plpgsql; 