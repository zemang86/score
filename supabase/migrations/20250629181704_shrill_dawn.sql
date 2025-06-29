/*
  # Fix RLS Recursion in Admins Table

  1. Policy Changes
    - Drop the recursive "Admins can manage admins table" policy
    - Create separate, non-recursive policies for INSERT, UPDATE, DELETE operations
    - Use the is_admin() function which bypasses RLS due to SECURITY DEFINER

  2. Security
    - Maintain admin-only access to manage the admins table
    - Prevent infinite recursion by using the SECURITY DEFINER function
    - Keep the existing SELECT policy for users to check their own admin status
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can manage admins table" ON admins;

-- Create separate policies for each operation to avoid recursion
-- These policies use the is_admin() function which is SECURITY DEFINER and bypasses RLS

CREATE POLICY "Admins can insert admin records"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update admin records"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete admin records"
  ON admins
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- The existing SELECT policy "Users can check admin status" remains unchanged
-- as it only allows users to check their own admin status and doesn't cause recursion