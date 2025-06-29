/*
  # Fix RLS Recursion in Admins Table

  1. Policy Changes
    - Replace recursive `is_admin(auth.uid())` calls with direct table lookups
    - Use `EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())` instead
    - This breaks the recursive dependency that was causing infinite loops

  2. Security
    - Maintains the same security model
    - Prevents infinite recursion in RLS policy evaluation
    - Ensures only admins can manage the admins table
*/

-- Drop all existing policies on the admins table
DROP POLICY IF EXISTS "Admins can insert admin records" ON admins;
DROP POLICY IF EXISTS "Admins can update admin records" ON admins;
DROP POLICY IF EXISTS "Admins can delete admin records" ON admins;
DROP POLICY IF EXISTS "Users can check admin status" ON admins;

-- Create new policies that use direct table lookups instead of the is_admin() function
-- This prevents the recursive RLS evaluation that was causing timeouts

CREATE POLICY "Admins can insert admin records"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update admin records"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete admin records"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Allow users to check their own admin status (non-recursive)
CREATE POLICY "Users can check admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());