/*
  # Update Users Table RLS Policy for Admin Access

  1. Policy Changes
    - Drop existing "Users can read own profile" policy
    - Create new policy that allows:
      - Regular users to read only their own profile
      - Admin users to read all user profiles
  
  2. Security
    - Maintains data privacy for regular users
    - Grants admin users necessary access for user management
    - Uses role-based access control
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create new policy that allows admins to read all users and regular users to read their own profile
CREATE POLICY "Users can read profiles based on role"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own profile
    id = auth.uid()
    OR
    -- Admin users can read all profiles
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );