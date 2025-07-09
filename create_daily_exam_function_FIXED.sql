-- DAILY EXAM COUNT FUNCTION - STEP BY STEP FIX
-- Follow these steps exactly in your Supabase SQL Editor

-- STEP 1: Create the function
-- Copy and paste ONLY this block, then click "Run"

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

-- STEP 2: Grant permissions (run this after step 1 succeeds)
-- Copy and paste ONLY this block, then click "Run"

GRANT EXECUTE ON FUNCTION get_daily_exam_count TO authenticated;

-- STEP 3: Test the function (optional)
-- Replace 'your-student-id-here' with a real student ID from your students table
-- Copy and paste ONLY this block, then click "Run"

-- SELECT get_daily_exam_count('your-student-id-here'::uuid);