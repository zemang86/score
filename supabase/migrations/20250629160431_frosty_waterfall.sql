/*
  # Separate Admin Table Migration

  1. New Tables
    - `admins`
      - `id` (uuid, primary key, references users.id)
      - `created_at` (timestamp)

  2. Schema Changes
    - Remove `role` column from `users` table
    - Remove `users_role_check` constraint
    - Migrate existing admin users to new `admins` table

  3. Security
    - Enable RLS on `admins` table
    - Update all existing policies to use admin table lookup
    - Add policies for admin table management

  4. Data Migration
    - Move existing admin users to new table
    - Preserve all existing data
*/

-- Create the admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Migrate existing admin users from users to admins table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    INSERT INTO admins (id)
    SELECT id FROM users WHERE role = 'admin'
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Remove the role column and constraint from users table
DO $$
BEGIN
  -- Drop constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_check' AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;

  -- Drop column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users DROP COLUMN role;
  END IF;
END $$;

-- Update RLS policies for users table
-- Drop existing policies that reference the 'role' column
DROP POLICY IF EXISTS "Users can read profiles based on role" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate "Users can read profiles based on role" policy
CREATE POLICY "Users can read profiles based on role"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid())
    OR
    (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  );

-- Recreate "Users can update own profile" policy
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    (id = auth.uid())
    AND (subscription_plan = (SELECT users_1.subscription_plan FROM users users_1 WHERE users_1.id = auth.uid()))
    AND (max_students = (SELECT users_1.max_students FROM users users_1 WHERE users_1.id = auth.uid()))
    AND (daily_exam_limit = (SELECT users_1.daily_exam_limit FROM users users_1 WHERE users_1.id = auth.uid()))
  );

-- Update RLS policy for questions table
-- Drop existing policy that references the 'role' column
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;

-- Recreate "Admins can insert questions" policy
CREATE POLICY "Admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Add RLS policies for the new admins table
-- Allow admins to manage the admins table
CREATE POLICY "Admins can manage admins table"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Allow users to check if they are admin (read-only)
CREATE POLICY "Users can check admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());