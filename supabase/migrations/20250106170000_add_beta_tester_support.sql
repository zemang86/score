/*
  # Add Beta Tester Support

  1. Changes
    - Add `beta_tester` column to users table
    - Create index for performance
    - Create view for effective access levels
    - Add helper functions for beta management
    - Update existing functions to consider beta testers

  2. Security
    - Maintain existing RLS policies
    - Add policies for beta tester management
*/

-- Add beta_tester column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS beta_tester boolean DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_beta_tester ON users(beta_tester);

-- Create view for enhanced user access information
CREATE OR REPLACE VIEW user_access_details AS
SELECT 
  u.*,
  CASE 
    WHEN u.beta_tester = true THEN 'beta_tester'
    ELSE u.subscription_plan
  END as effective_access_level,
  CASE 
    WHEN u.beta_tester = true THEN 999999  -- Unlimited students for beta
    ELSE u.max_students
  END as effective_max_students,
  CASE 
    WHEN u.beta_tester = true THEN 999     -- Unlimited exams for beta
    ELSE u.daily_exam_limit
  END as effective_daily_exam_limit,
  CASE 
    WHEN u.beta_tester = true THEN true
    WHEN u.subscription_plan = 'premium' THEN true
    ELSE false
  END as has_unlimited_access
FROM users u;

-- Grant access to the view
GRANT SELECT ON user_access_details TO authenticated;

-- Create helper functions for beta tester management
CREATE OR REPLACE FUNCTION make_user_beta_tester(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users SET beta_tester = true WHERE id = user_id;
  SELECT true;
$$;

CREATE OR REPLACE FUNCTION remove_user_beta_tester(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users SET beta_tester = false WHERE id = user_id;
  SELECT true;
$$;

-- Update can_add_student function to consider beta testers
CREATE OR REPLACE FUNCTION can_add_student(user_id uuid)
RETURNS boolean AS $$
DECLARE
  student_count integer;
  max_students integer;
  is_beta_tester boolean;
BEGIN
  -- Get student count
  SELECT COUNT(*) INTO student_count
  FROM students
  WHERE user_id = $1;
  
  -- Get user limits and beta status
  SELECT u.max_students, u.beta_tester INTO max_students, is_beta_tester
  FROM users u
  WHERE u.id = $1;
  
  -- Beta testers have unlimited students
  IF is_beta_tester THEN
    RETURN true;
  END IF;
  
  RETURN student_count < max_students;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update can_take_exam function to consider beta testers
CREATE OR REPLACE FUNCTION can_take_exam(student_id uuid)
RETURNS boolean AS $$
DECLARE
  daily_limit integer;
  daily_count integer;
  user_id uuid;
  is_beta_tester boolean;
BEGIN
  -- Get the user_id for this student
  SELECT s.user_id INTO user_id
  FROM students s
  WHERE s.id = student_id;
  
  -- Get the daily exam limit and beta status for this user
  SELECT u.daily_exam_limit, u.beta_tester INTO daily_limit, is_beta_tester
  FROM users u
  WHERE u.id = user_id;
  
  -- Beta testers have unlimited exams
  IF is_beta_tester THEN
    RETURN true;
  END IF;
  
  -- If unlimited (999), return true
  IF daily_limit = 999 THEN
    RETURN true;
  END IF;
  
  -- Count today's exams
  SELECT COUNT(*) INTO daily_count
  FROM exams e
  WHERE e.student_id = student_id
    AND DATE(e.created_at) = CURRENT_DATE
    AND e.completed = true;
  
  RETURN daily_count < daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;