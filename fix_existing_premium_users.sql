-- Fix existing users who were incorrectly created as premium
-- This script identifies and converts non-paying premium users to free accounts

-- First, let's identify users who have premium accounts but no active Stripe subscriptions
-- These are likely the users created with incorrect defaults

BEGIN;

-- Create a backup of the current state (optional but recommended)
CREATE TABLE IF NOT EXISTS users_backup_before_fix AS 
SELECT * FROM users WHERE subscription_plan = 'premium';

-- Update users to free plan if they:
-- 1. Have premium subscription plan
-- 2. Don't have an active Stripe subscription
-- 3. Are not beta testers
-- 4. Are not admins
UPDATE users 
SET 
  subscription_plan = 'free',
  max_students = 1,
  daily_exam_limit = 3
WHERE 
  subscription_plan = 'premium' 
  AND beta_tester = false
  AND id NOT IN (
    -- Exclude users with active Stripe subscriptions
    SELECT DISTINCT u.id 
    FROM users u
    JOIN stripe_user_subscriptions sus ON u.id = sus.user_id
    WHERE sus.subscription_status = 'active'
  )
  AND id NOT IN (
    -- Exclude admin users
    SELECT id FROM admins
  );

-- Log the changes made
INSERT INTO user_migration_log (migration_name, users_affected, migration_date)
SELECT 
  'fix_premium_defaults' as migration_name,
  COUNT(*) as users_affected,
  NOW() as migration_date
FROM users_backup_before_fix ubf
LEFT JOIN users u ON ubf.id = u.id
WHERE ubf.subscription_plan = 'premium' 
  AND u.subscription_plan = 'free';

COMMIT;

-- Verification query to check the results
-- SELECT 
--   'After Fix' as status,
--   subscription_plan,
--   COUNT(*) as user_count,
--   AVG(daily_exam_limit) as avg_daily_limit
-- FROM users 
-- GROUP BY subscription_plan
-- ORDER BY subscription_plan;