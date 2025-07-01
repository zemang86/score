/*
  # Fix RLS Policies for Admin Access

  1. Policy Updates
    - Drop ALL existing policies first to avoid conflicts
    - Create new policies for each table that allow admin access
    - Ensure proper parent access restrictions remain in place

  2. Security
    - Maintain existing parent access restrictions
    - Add admin bypass clauses using direct admin table lookups
    - Prevent recursive RLS evaluation issues

  3. Performance
    - Use efficient EXISTS clauses for admin checks
    - Add indexes for optimal query performance
*/

-- Drop ALL existing policies for students table
DROP POLICY IF EXISTS "Parents can manage own students" ON students;
DROP POLICY IF EXISTS "Parents can insert own students" ON students;
DROP POLICY IF EXISTS "Parents can update own students" ON students;
DROP POLICY IF EXISTS "Parents can delete own students" ON students;
DROP POLICY IF EXISTS "All users can read student data for leaderboard" ON students;

-- Create new policy for students table
CREATE POLICY "Parents can manage own students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Drop ALL existing policies for exams table
DROP POLICY IF EXISTS "Parents can manage exams for own students" ON exams;
DROP POLICY IF EXISTS "Parents can insert exams for own students" ON exams;
DROP POLICY IF EXISTS "Parents can update exams for own students" ON exams;
DROP POLICY IF EXISTS "Parents can delete exams for own students" ON exams;
DROP POLICY IF EXISTS "All users can read exam data for leaderboard" ON exams;

-- Create new policy for exams table
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

-- Drop ALL existing policies for attempts table
DROP POLICY IF EXISTS "Parents can manage attempts for own students" ON attempts;

-- Create new policy for attempts table
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

-- Drop ALL existing policies for student_badges table
DROP POLICY IF EXISTS "Parents can view student badges for own students" ON student_badges;
DROP POLICY IF EXISTS "System can insert student badges" ON student_badges;
DROP POLICY IF EXISTS "Parents and admins can update student badges" ON student_badges;
DROP POLICY IF EXISTS "Parents and admins can delete student badges" ON student_badges;

-- Create new policies for student_badges table
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

-- Drop ALL existing policies for notifications table
DROP POLICY IF EXISTS "Parents can manage own notifications" ON notifications;

-- Create new policy for notifications table
CREATE POLICY "Parents can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Drop ALL existing policies for badges table
DROP POLICY IF EXISTS "Badges are readable by authenticated users" ON badges;
DROP POLICY IF EXISTS "Admins can insert badges" ON badges;
DROP POLICY IF EXISTS "Admins can update badges" ON badges;
DROP POLICY IF EXISTS "Admins can delete badges" ON badges;
DROP POLICY IF EXISTS "Admins can manage badges" ON badges;

-- Create new policies for badges table
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

-- Drop ALL existing policies for questions table
DROP POLICY IF EXISTS "Questions are readable by authenticated users" ON questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
DROP POLICY IF EXISTS "Admins can modify questions" ON questions;

-- Create new policies for questions table
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

-- Drop ALL existing policies for admins table
DROP POLICY IF EXISTS "Users can check admin status" ON admins;
DROP POLICY IF EXISTS "Admins can insert admin records" ON admins;
DROP POLICY IF EXISTS "Admins can update admin records" ON admins;
DROP POLICY IF EXISTS "Admins can delete admin records" ON admins;
DROP POLICY IF EXISTS "Admins can manage admins table" ON admins;

-- Create new policies for admins table
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