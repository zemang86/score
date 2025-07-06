/*
  # User Access Rework

  1. New Default Values
    - Update default values for subscription_plan, max_students, and daily_exam_limit
    - Add check constraints for subscription plans
  
  2. Security
    - Ensure RLS policies are properly configured
*/

-- Update default values for new users
ALTER TABLE users 
  ALTER COLUMN subscription_plan SET DEFAULT 'free',
  ALTER COLUMN max_students SET DEFAULT 1,
  ALTER COLUMN daily_exam_limit SET DEFAULT 3;

-- Add or update check constraint for subscription_plan
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_subscription_plan_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_subscription_plan_check;
  END IF;
END $$;

ALTER TABLE users
  ADD CONSTRAINT users_subscription_plan_check 
  CHECK (subscription_plan = ANY (ARRAY['free'::text, 'premium'::text]));

-- Create a function to track daily exam count
CREATE OR REPLACE FUNCTION get_daily_exam_count(student_id uuid, check_date date DEFAULT CURRENT_DATE)
RETURNS integer AS $$
DECLARE
  exam_count integer;
BEGIN
  SELECT COUNT(*) INTO exam_count
  FROM exams
  WHERE student_id = $1
    AND DATE(created_at) = check_date
    AND completed = true;
  
  RETURN exam_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for user subscription details
CREATE OR REPLACE VIEW user_subscription_details AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.subscription_plan,
  u.max_students,
  u.daily_exam_limit,
  COUNT(s.id) as current_student_count,
  CASE 
    WHEN u.subscription_plan = 'premium' AND COUNT(s.id) > u.max_students THEN true
    WHEN u.subscription_plan = 'free' AND COUNT(s.id) > 1 THEN true
    ELSE false
  END as exceeds_student_limit
FROM users u
LEFT JOIN students s ON u.id = s.user_id
GROUP BY u.id, u.email, u.full_name, u.subscription_plan, u.max_students, u.daily_exam_limit;

-- Create a function to check if a user can add more students
CREATE OR REPLACE FUNCTION can_add_student(user_id uuid)
RETURNS boolean AS $$
DECLARE
  student_count integer;
  max_students integer;
BEGIN
  SELECT COUNT(*) INTO student_count
  FROM students
  WHERE user_id = $1;
  
  SELECT u.max_students INTO max_students
  FROM users u
  WHERE u.id = $1;
  
  RETURN student_count < max_students;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a student can take more exams today
CREATE OR REPLACE FUNCTION can_take_exam(student_id uuid)
RETURNS boolean AS $$
DECLARE
  daily_limit integer;
  daily_count integer;
  user_id uuid;
BEGIN
  -- Get the user_id for this student
  SELECT s.user_id INTO user_id
  FROM students s
  WHERE s.id = student_id;
  
  -- Get the daily exam limit for this user
  SELECT u.daily_exam_limit INTO daily_limit
  FROM users u
  WHERE u.id = user_id;
  
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