-- SIMPLE DAILY EXAM FUNCTION FIX
-- Run each block separately in Supabase SQL Editor

-- FIRST: Check if you have the exams table
SELECT COUNT(*) as total_exams FROM exams;

-- SECOND: Create the function (run this block)
CREATE OR REPLACE FUNCTION get_daily_exam_count(input_student_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM exams
    WHERE student_id = input_student_id
      AND DATE(created_at) = CURRENT_DATE
      AND completed = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- THIRD: Grant permissions (run this block)
GRANT EXECUTE ON FUNCTION get_daily_exam_count(uuid) TO authenticated;

-- FOURTH: Test with a real student ID (replace the UUID)
-- First get a student ID:
SELECT id, name FROM students LIMIT 1;

-- Then test the function (replace the UUID below with one from above):
-- SELECT get_daily_exam_count('replace-with-real-student-id');