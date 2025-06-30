/*
  # Fix RLS Policies for All Tables

  1. Security Updates
    - Update all table policies to support both parents and admins
    - Ensure proper access control for all operations
    - Add missing policies for complete CRUD operations

  2. Tables Updated
    - students: Parents can manage own students, admins can manage all
    - exams: Parents can manage exams for own students, admins can manage all
    - attempts: Parents can manage attempts for own students, admins can manage all
    - student_badges: Parents can manage badges for own students, admins can manage all
    - notifications: Parents can manage own notifications, admins can manage all
    - badges: All users can read, only admins can modify
    - questions: All users can read, only admins can modify
    - admins: Users can check own status, only admins can modify

  3. Performance
    - Add indexes for admin lookups
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

-- Update student_badges table policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Parents can view student badges for own students" ON student_badges;
DROP POLICY IF EXISTS "System can insert student badges" ON student_badges;
DROP POLICY IF EXISTS "Parents and admins can update student badges" ON student_badges;
DROP POLICY IF EXISTS "Parents and admins can delete student badges" ON student_badges;

-- Create new student_badges policies
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

-- Update badges table policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Badges are readable by authenticated users" ON badges;
DROP POLICY IF EXISTS "Admins can insert badges" ON badges;
DROP POLICY IF EXISTS "Admins can update badges" ON badges;
DROP POLICY IF EXISTS "Admins can delete badges" ON badges;

-- Create new badges policies
CREATE POLICY "Badges are readable by authenticated users"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

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

CREATE POLICY "Admins can delete badges"
  ON badges
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update questions table policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Questions are readable by authenticated users" ON questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;

-- Create new questions policies
CREATE POLICY "Questions are readable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

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

CREATE POLICY "Admins can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update admins table policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can check admin status" ON admins;
DROP POLICY IF EXISTS "Admins can insert admin records" ON admins;
DROP POLICY IF EXISTS "Admins can update admin records" ON admins;
DROP POLICY IF EXISTS "Admins can delete admin records" ON admins;

-- Create new admins policies
CREATE POLICY "Users can check admin status"
  ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

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

-- Add indexes to improve admin lookup performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_admins_id ON admins(id);