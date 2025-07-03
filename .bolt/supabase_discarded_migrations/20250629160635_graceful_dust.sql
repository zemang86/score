/*
  # Separate Admin Table Migration

  1. New Tables
    - `admins`
      - `id` (uuid, primary key, references users.id)
      - `created_at` (timestamp)

  2. Changes
    - Remove `role` column from `users` table
    - Migrate existing admin users to new `admins` table
    - Update all RLS policies to use the new admin table structure

  3. Security
    - Enable RLS on `admins` table
    - Update policies to check admin status via `admins` table
    - Maintain existing security model but with cleaner separation
*/

-- Create the admins table first
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

-- Drop all policies that depend on the role column FIRST
DROP POLICY IF EXISTS "Users can read profiles based on role" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;

-- Now we can safely remove the role column and its constraint
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

-- Recreate all the policies with the new admin table structure

-- Users table policies
CREATE POLICY "Users can read profiles based on role"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid())
    OR
    (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  );

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

-- Questions table policy
CREATE POLICY "Admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Admins table policies
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

CREATE POLICY "Users can check admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create helpful functions for admin management
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE id = user_id);
$$;

CREATE OR REPLACE FUNCTION make_user_admin(user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO admins (id) VALUES (user_id) ON CONFLICT (id) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION remove_user_admin(user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM admins WHERE id = user_id;
$$;