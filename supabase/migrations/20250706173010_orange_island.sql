/*
  # Fix User RLS Policy Recursion

  1. Changes
     - Drop the problematic UPDATE policy that causes infinite recursion
     - Create two separate UPDATE policies:
       - One for regular users to update their own profile (without changing role)
       - One for admins to update any user profile (including role changes)
     
  2. Security
     - Maintains proper access control
     - Prevents regular users from changing their role
     - Allows admins to manage all user accounts
     
  3. Bug Fix
     - Resolves "infinite recursion detected in policy for relation users" error
     - Eliminates circular dependency in policy checks
*/

-- First, drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create a new policy for regular users to update their own profile
-- This policy explicitly prevents changing the role field
CREATE POLICY "Users can update own profile except role" 
ON public.users
FOR UPDATE
TO authenticated
USING (uid() = id)
WITH CHECK (
  uid() = id AND 
  (
    -- Ensure role doesn't change
    role = (SELECT role FROM public.users WHERE id = uid())
  )
);

-- Create a policy for admins to update any user profile
CREATE POLICY "Admins can update any user profile" 
ON public.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = uid()
  )
);

-- Add a comment to explain the fix
COMMENT ON TABLE public.users IS 'User profiles with fixed RLS policies to prevent recursion';