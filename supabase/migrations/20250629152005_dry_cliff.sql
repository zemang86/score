/*
  # Add INSERT policy for questions table

  1. Security Changes
    - Add RLS policy to allow admins to insert questions
    - Ensures only users with 'admin' role can add new questions to the database
    - Maintains data integrity by restricting question creation to authorized users

  This migration resolves the "new row violates row-level security policy" error
  by explicitly granting INSERT permissions to admin users.
*/

-- Create policy to allow admins to insert questions
CREATE POLICY "Admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );