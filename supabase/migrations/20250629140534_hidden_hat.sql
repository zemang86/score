/*
  # Fix Authentication and Role Check Issues

  1. Security Updates
    - Fix RLS policies for proper user access
    - Ensure users can read their own profile data
    - Add proper error handling for role checks

  2. Policy Updates
    - Simplify user profile read policy
    - Fix user profile update policy
    - Add admin-specific policies if needed

  3. Function Updates
    - Improve role check functions
    - Add better error handling
*/

-- First, let's make sure all existing users have the role column set
UPDATE public.users 
SET role = 'parent' 
WHERE role IS NULL;

-- Drop and recreate the RLS policies with better logic
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Allow users to read their own profile (including role)
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow users to update their own profile but not their role
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Create a simpler, more reliable role check function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = user_id LIMIT 1),
    'parent'::text
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Update the is_admin function to use the new role function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.get_user_role(user_id) = 'admin';
$$;

-- Ensure the constraint allows both roles
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('parent', 'admin'));

-- Add an index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_id_role ON public.users(id, role);