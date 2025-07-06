/*
  # Fix User RLS Policy Recursion

  1. Changes
    - Drop problematic policy that causes recursion
    - Create separate policies for regular users and admins
    - Fix function calls to use auth.uid() instead of uid()
    
  2. Security
    - Regular users can only update their own profile and cannot change their role
    - Admins can update any user profile including role changes
*/

-- First, drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create a new policy for regular users to update their own profile
-- This policy explicitly prevents changing the role field
CREATE POLICY "Users can update own profile except role" 
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (
    -- Ensure role doesn't change
    role = (SELECT role FROM public.users WHERE id = auth.uid())
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
    WHERE admins.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
);

-- Add a comment to explain the fix
COMMENT ON TABLE public.users IS 'User profiles with fixed RLS policies to prevent recursion';