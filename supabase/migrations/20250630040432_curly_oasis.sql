/*
  # Add role-based access control to users table

  1. Changes
    - Add role column to users table with default 'parent'
    - Add check constraint for valid roles (parent, admin)
    - Update RLS policies for role-based access
    - Create helper function to check admin status

  2. Security
    - Users can read their own profile including role
    - Users cannot change their own role (prevents privilege escalation)
    - Admin function for checking user permissions
*/

-- Add role column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role text DEFAULT 'parent' NOT NULL;
  END IF;
END $$;

-- Add check constraint for valid roles in a separate block
DO $$
BEGIN
  -- First verify the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    -- Check if constraint doesn't already exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_schema = 'public' AND constraint_name = 'users_role_check'
    ) THEN
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('parent', 'admin'));
    END IF;
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
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

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