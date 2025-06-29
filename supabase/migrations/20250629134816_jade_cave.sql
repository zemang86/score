/*
  # Add user roles for admin access control

  1. New Columns
    - `role` (text, default 'parent') - User role for access control

  2. Security
    - Add check constraint for valid roles ('parent', 'admin')
    - Update RLS policies to handle role-based access
    - Create admin check function
    - Prevent users from changing their own roles

  3. Functions
    - `is_admin()` function to check if user has admin role
*/

-- Add role column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'parent' NOT NULL;

-- Add check constraint for valid roles (drop first if exists)
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('parent', 'admin'));

-- Update RLS policy to allow users to read their own profile including role
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Prevent users from updating their own role (admin-only operation)
-- Users can update their profile but not change their role
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.users WHERE id = user_id),
    false
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Create a more convenient function that uses current user
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_admin(auth.uid());
$$;

-- Grant execute permission on the convenience function
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;