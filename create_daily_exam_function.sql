-- Create the missing get_daily_exam_count function
-- Copy and paste ONLY the sections below, one at a time

-- STEP 1: Create the function (copy and run this first)
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