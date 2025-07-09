-- Create the missing get_daily_exam_count function
-- Run this in your Supabase SQL editor to fix the 400 error

CREATE OR REPLACE FUNCTION get_daily_exam_count(student_id uuid, check_date date DEFAULT CURRENT_DATE)
RETURNS integer AS $$
DECLARE
  exam_count integer;
BEGIN
  SELECT COUNT(*) INTO exam_count
  FROM exams
  WHERE exams.student_id = $1
    AND DATE(exams.created_at) = check_date
    AND exams.completed = true;
  
  RETURN exam_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function (replace with a real student ID)
-- SELECT get_daily_exam_count('your-student-id-here');

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_daily_exam_count(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_exam_count(uuid) TO authenticated;