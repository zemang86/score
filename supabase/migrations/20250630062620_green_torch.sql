/*
  # Enable Global Leaderboard Access

  1. Policy Changes
    - Update students table to allow global read access for leaderboard
    - Update exams table to allow global read access for leaderboard
    - Maintain existing write restrictions for data privacy and security

  2. Security
    - All authenticated users can read all student names, levels, XP, and schools
    - All authenticated users can read all exam scores and completion data
    - Write operations (INSERT, UPDATE, DELETE) remain restricted to parents/admins
    - This enables a fun, competitive global leaderboard experience

  3. Privacy Note
    - Student names and performance data will be visible to all platform users
    - This creates a gamified, competitive learning environment
    - Parents should be aware their children's data is visible to other users
*/

-- Update students table policies for global leaderboard access
DROP POLICY IF EXISTS "Parents can manage own students" ON students;

-- Allow all authenticated users to read all student data (for leaderboard)
CREATE POLICY "All users can read student data for leaderboard"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

-- Restrict INSERT to parents for their own students or admins
CREATE POLICY "Parents can insert own students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Restrict UPDATE to parents for their own students or admins
CREATE POLICY "Parents can update own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Restrict DELETE to parents for their own students or admins
CREATE POLICY "Parents can delete own students"
  ON students
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update exams table policies for global leaderboard access
DROP POLICY IF EXISTS "Parents can manage exams for own students" ON exams;

-- Allow all authenticated users to read all exam data (for leaderboard)
CREATE POLICY "All users can read exam data for leaderboard"
  ON exams
  FOR SELECT
  TO authenticated
  USING (true);

-- Restrict INSERT to parents for their own students' exams or admins
CREATE POLICY "Parents can insert exams for own students"
  ON exams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Restrict UPDATE to parents for their own students' exams or admins
CREATE POLICY "Parents can update exams for own students"
  ON exams
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

-- Restrict DELETE to parents for their own students' exams or admins
CREATE POLICY "Parents can delete exams for own students"
  ON exams
  FOR DELETE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Add indexes to improve leaderboard query performance
CREATE INDEX IF NOT EXISTS idx_students_xp_desc ON students(xp DESC);
CREATE INDEX IF NOT EXISTS idx_students_level_xp ON students(level, xp DESC);
CREATE INDEX IF NOT EXISTS idx_exams_completed_score ON exams(completed, score DESC) WHERE completed = true;
CREATE INDEX IF NOT EXISTS idx_exams_student_completed ON exams(student_id, completed);

-- Create a view for leaderboard data to optimize queries
CREATE OR REPLACE VIEW leaderboard_data AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.level as student_level,
  s.school as student_school,
  s.xp as total_xp,
  COUNT(e.id) FILTER (WHERE e.completed = true) as total_exams,
  COALESCE(AVG(e.score) FILTER (WHERE e.completed = true AND e.score IS NOT NULL), 0)::integer as average_score,
  COALESCE(MAX(e.score) FILTER (WHERE e.completed = true), 0) as best_score,
  MAX(e.created_at) FILTER (WHERE e.completed = true) as last_exam_date
FROM students s
LEFT JOIN exams e ON s.id = e.student_id
GROUP BY s.id, s.name, s.level, s.school, s.xp;

-- Grant access to the leaderboard view
GRANT SELECT ON leaderboard_data TO authenticated;