/*
  # Initial KitaScore Database Schema

  1. New Tables
    - `users` - Parent profiles linked to Supabase auth
    - `students` - Children profiles managed by parents
    - `questions` - Question bank for past year papers
    - `exams` - Exam sessions/attempts
    - `attempts` - Individual question answers within exams
    - `badges` - Badge definitions and requirements
    - `student_badges` - Badges earned by students
    - `notifications` - System notifications for parents

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure parents can only access their children's data
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Students table (children managed by parents)
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  school text NOT NULL,
  level text NOT NULL, -- Darjah 1-6, Tingkatan 1-5
  age integer NOT NULL,
  xp integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions table (past year exam questions)
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL,
  subject text NOT NULL, -- BM, BI, Maths, Science, Sejarah
  year text NOT NULL,
  type text NOT NULL CHECK (type IN ('MCQ', 'ShortAnswer', 'Subjective', 'Matching')),
  topic text,
  question_text text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb, -- Array of options for MCQ
  correct_answer text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Exams table (exam sessions)
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  mode text NOT NULL CHECK (mode IN ('Easy', 'Medium', 'Full')),
  subject text NOT NULL,
  question_ids jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of question IDs
  score integer,
  total_questions integer NOT NULL DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Attempts table (individual question answers)
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_given text NOT NULL,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Badges table (badge definitions)
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_type text NOT NULL, -- 'first_exam', 'streak', 'perfect_score', etc.
  condition_value integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Student badges table (badges earned by students)
CREATE TABLE IF NOT EXISTS student_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(student_id, badge_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'milestone'
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Parents can manage their own students
CREATE POLICY "Parents can manage own students"
  ON students
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Questions are readable by all authenticated users
CREATE POLICY "Questions are readable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Parents can manage exams for their students
CREATE POLICY "Parents can manage exams for own students"
  ON exams
  FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Parents can manage attempts for their students' exams
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
  );

-- Badges are readable by all authenticated users
CREATE POLICY "Badges are readable by authenticated users"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Parents can view badges earned by their students
CREATE POLICY "Parents can view student badges for own students"
  ON student_badges
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- System can insert student badges
CREATE POLICY "System can insert student badges"
  ON student_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Parents can manage their own notifications
CREATE POLICY "Parents can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default badges
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
  ('First Steps', 'Complete your first exam', '🎯', 'first_exam', 1),
  ('Streak Master', 'Complete 5 exams in a row', '🔥', 'streak', 5),
  ('Perfect Score', 'Get 100% on any exam', '⭐', 'perfect_score', 100),
  ('Dedicated Learner', 'Complete 10 exams', '📚', 'total_exams', 10),
  ('Subject Expert', 'Complete 5 exams in the same subject', '🏆', 'subject_mastery', 5);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_level_subject ON questions(level, subject);
CREATE INDEX IF NOT EXISTS idx_exams_student_id ON exams(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();