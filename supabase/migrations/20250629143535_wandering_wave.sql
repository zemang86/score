/*
  # Add Subscription Plans to Users

  1. New Columns
    - `subscription_plan` (text, default 'premium') - User's current plan
    - `max_students` (integer, default 3) - Maximum children allowed
    - `daily_exam_limit` (integer, default 999) - Daily exam limit (999 = unlimited)

  2. Updates
    - Add check constraint for valid subscription plans
    - Update existing users with default premium values
    - Add indexes for better performance

  3. Notes
    - All users get premium access initially as requested
    - Free plan limits: 1 child, 1 exam/day, easy level only
    - Premium plan: 3 children, unlimited exams, all levels
*/

-- Add subscription plan columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'premium' NOT NULL,
ADD COLUMN IF NOT EXISTS max_students integer DEFAULT 3 NOT NULL,
ADD COLUMN IF NOT EXISTS daily_exam_limit integer DEFAULT 999 NOT NULL;

-- Add check constraint for valid subscription plans
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_plan_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_plan_check 
CHECK (subscription_plan IN ('free', 'premium'));

-- Update existing users to have premium access
UPDATE public.users 
SET 
  subscription_plan = 'premium',
  max_students = 3,
  daily_exam_limit = 999
WHERE subscription_plan IS NULL OR subscription_plan = '';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON public.users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_subscription_details ON public.users(subscription_plan, max_students, daily_exam_limit);

-- Update RLS policies to include new columns in SELECT
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Update the UPDATE policy to prevent users from changing their subscription details
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    subscription_plan = (SELECT subscription_plan FROM public.users WHERE id = auth.uid()) AND
    max_students = (SELECT max_students FROM public.users WHERE id = auth.uid()) AND
    daily_exam_limit = (SELECT daily_exam_limit FROM public.users WHERE id = auth.uid())
  );