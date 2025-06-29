/*
  # Fix RLS Policies for Admin Access

  1. Policy Updates
    - Update `students` table policies to allow admin access to all student records
    - Update `exams` table policies to allow admin access to all exam records  
    - Update `attempts` table policies to allow admin access to all attempt records
    - Update `student_badges` table policies to allow admin access to all badge records
    - Update `notifications` table policies to allow admin access to all notification records

  2. Security
    - Maintain existing parent access restrictions
    - Add admin bypass clauses using direct admin table lookups
    - Prevent recursive RLS evaluation issues

  3. Performance
    - Use efficient EXISTS clauses for admin checks
    - Maintain indexes for optimal query performance
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

-- Ensure badges table has proper admin access for INSERT/UPDATE/DELETE
-- (SELECT policy already exists and is correct)
CREATE POLICY "Admins can manage badges"
  ON badges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Add indexes to improve admin lookup performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_admins_id ON admins(id);

-- Update the existing questions INSERT policy to be more explicit
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;

CREATE POLICY "Admins can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    -- Allow SELECT for all authenticated users (existing behavior)
    true
  )
  WITH CHECK (
    -- Only allow INSERT/UPDATE/DELETE for admins
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Separate the questions policies for clarity
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Questions are readable by authenticated users" ON questions;

-- Questions SELECT policy (all authenticated users can read)
CREATE POLICY "Questions are readable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Questions INSERT/UPDATE/DELETE policy (only admins)
CREATE POLICY "Admins can modify questions"
  ON questions
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );