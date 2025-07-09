-- Add state field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS state text;

-- Add index for state queries
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);