/*
  # Add User Roles System

  1. Schema Changes
    - Add `role` column to `users` table with default value 'parent'
    - Add check constraint to ensure valid role values
    - Update RLS policies to handle role-based access

  2. Security
    - Only allow users to read their own role
    - Prevent users from updating their own role (admin-only operation)
    - Add policy for admin role verification

  3. Default Roles
    - 'parent': Default role for regular users
    - 'admin': Super admin role with full system access
*/

-- Add role column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role text DEFAULT 'parent' NOT NULL;
  END IF;
END $$;

-- Add check constraint for valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('parent', 'admin'));
  END IF;
END $$;

-- Update RLS policy to allow users to read their own role
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Prevent users from updating their own role (admin-only operation)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;