/*
  # Fix RLS policies for admin access

  1. Policy Updates
    - Update all table policies to allow admin access
    - Add admin bypass clauses to existing parent-only policies
    - Ensure admins can access all data across the platform

  2. Security
    - Maintain existing parent access restrictions
    - Add admin access without breaking existing functionality
    - Use efficient EXISTS clauses for admin checks

  3. Performance
    - Add indexes for admin lookups
    - Optimize policy conditions
*/

-- Update students table policies
DROP POLICY IF EXISTS "Parents can manage own students" ON students;

CREATE POLICY "Parents can manage own students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update exams table policies  
DROP POLICY IF EXISTS "Parents can manage exams for own students" ON exams;

CREATE POLICY "Parents can manage exams for own students"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update attempts table policies
DROP POLICY IF EXISTS "Parents can manage attempts for own students" ON attempts;

CREATE POLICY "Parents can manage attempts for own students"
  ON attempts
  FOR ALL
  TO authenticated
  USING (
    exam_id IN (
      SELECT e.id FROM exams e
      JOIN students s ON e.student_id = s.id
      WHERE s.user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update student_badges table policies
DROP POLICY IF EXISTS "Parents can view student badges for own students" ON student_badges;
DROP POLICY IF EXISTS "System can insert student badges" ON student_badges;

CREATE POLICY "Parents can view student badges for own students"
  ON student_badges
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "System can insert student badges"
  ON student_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Add missing UPDATE and DELETE policies for student_badges
CREATE POLICY "Parents and admins can update student badges"
  ON student_badges
  FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Parents and admins can delete student badges"
  ON student_badges
  FOR DELETE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update notifications table policies
DROP POLICY IF EXISTS "Parents can manage own notifications" ON notifications;

CREATE POLICY "Parents can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update badges table policies
DROP POLICY IF EXISTS "Badges are readable by authenticated users" ON badges;

-- Badges SELECT policy (all authenticated users can read)
CREATE POLICY "Badges are readable by authenticated users"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Badges INSERT policy (only admins)
CREATE POLICY "Admins can insert badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Badges UPDATE policy (only admins)
CREATE POLICY "Admins can update badges"
  ON badges
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Badges DELETE policy (only admins)
CREATE POLICY "Admins can delete badges"
  ON badges
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update questions table policies
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Questions are readable by authenticated users" ON questions;

-- Questions SELECT policy (all authenticated users can read)
CREATE POLICY "Questions are readable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Questions INSERT policy (only admins)
CREATE POLICY "Admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Questions UPDATE policy (only admins)
CREATE POLICY "Admins can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Questions DELETE policy (only admins)
CREATE POLICY "Admins can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update admins table policies to be more specific
DROP POLICY IF EXISTS "Admins can manage admins table" ON admins;
DROP POLICY IF EXISTS "Users can check admin status" ON admins;

-- Admins SELECT policy (users can check their own admin status)
CREATE POLICY "Users can check admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins INSERT policy (only existing admins can create new admins)
CREATE POLICY "Admins can insert admin records"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Admins UPDATE policy (only existing admins can update admin records)
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

-- Admins DELETE policy (only existing admins can delete admin records)
CREATE POLICY "Admins can delete admin records"
  ON admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Add indexes to improve admin lookup performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_admins_id ON admins(id);