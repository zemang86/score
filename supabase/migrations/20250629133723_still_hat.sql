/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile during sign-up
    - This enables the sign-up process to create user profiles in the users table

  The policy ensures that users can only insert a row where the id matches their authenticated user ID (auth.uid()).
*/

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);